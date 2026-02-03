/**
 * BrushBuddy Backend Server
 * Express server with Gemini AI integration
 * Payment gateway integration (PayPal & Apple IAP)
 * Alibaba Cloud OSS integration for uploadPhotoToOSS uploads
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const OSS = require('ali-oss')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const app = express()
const PORT = process.env.PORT || 3000

// Configure multer for memory storage (files stored as Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// Initialize Gemini AI
let genAI = null
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Initialize OSS client
let ossClient = null
if (process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET) {
  ossClient = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET_NAME
  })
  console.log('✅ OSS client initialized')
} else {
  console.log('⚠️  OSS configuration missing')
}

// =============================================================================
// Authentication Routes (Login/Register/Logout/Change Password)
// =============================================================================

const crypto = require('crypto')

// In-memory user storage (DEMO ONLY - replace with database in production)
const users = new Map()
const refreshTokens = new Map() // Store refresh tokens: token -> userId

/**
 * Hash password using SHA256 (DEMO - use bcrypt in production)
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Generate access and refresh tokens
 */
function generateTokens(userId) {
  const accessToken = crypto.randomBytes(32).toString('hex')
  const refreshToken = crypto.randomBytes(32).toString('hex')
  const accessTokenExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  const refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

  // Store refresh token
  refreshTokens.set(refreshToken, {
    userId,
    expiresAt: refreshTokenExpires
  })

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpires
  }
}

/**
 * Verify refresh token and return userId
 */
function verifyRefreshToken(refreshToken) {
  const tokenData = refreshTokens.get(refreshToken)
  if (!tokenData) return null

  // Check if expired
  if (Date.now() > tokenData.expiresAt) {
    refreshTokens.delete(refreshToken)
    return null
  }

  return tokenData.userId
}

/**
 * POST /api/auth/login-or-register
 * Combined login/register endpoint
 * Auto-detects if email exists and returns appropriate action
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "action": "login" | "register",
 *   "data": {
 *     "accessToken": "...",
 *     "refreshToken": "...",
 *     "expiresIn": 1234567890,
 *     "user": {
 *       "id": "...",
 *       "email": "user@example.com",
 *       "subscriptionStatus": "free"
 *     }
 *   }
 * }
 */
app.post('/api/auth/login-or-register', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      })
    }

    const passwordHash = hashPassword(password)

    // Check if user exists
    let user = users.get(email)

    if (user) {
      // Login: verify password
      if (user.passwordHash !== passwordHash) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        })
      }

      // Generate tokens
      const tokens = generateTokens(user.id)

      return res.json({
        success: true,
        action: 'login',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          user: {
            id: user.id,
            email: user.email,
            subscriptionStatus: user.subscriptionStatus || 'free'
          }
        }
      })
    } else {
      // Register: create new user
      const newUser = {
        id: uuidv4(),
        email,
        passwordHash,
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString()
      }

      users.set(email, newUser)
      console.log(`✅ New user registered: ${email}`)

      // Generate tokens
      const tokens = generateTokens(newUser.id)

      return res.json({
        success: true,
        action: 'register',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          user: {
            id: newUser.id,
            email: newUser.email,
            subscriptionStatus: newUser.subscriptionStatus
          }
        }
      })
    }
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/auth/logout
 * Logout user by invalidating refresh token
 *
 * Request body:
 * {
 *   "refreshToken": "..."
 * }
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      })
    }

    // Remove refresh token
    refreshTokens.delete(refreshToken)

    res.json({
      success: true
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/auth/change-password
 * Change user password
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "oldPassword": "oldpass123",
 *   "newPassword": "newpass123"
 * }
 */
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body

    // Validate input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, old password, and new password are required'
      })
    }

    // Password validation (minimum 6 characters)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      })
    }

    // Find user
    const user = users.get(email)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Verify old password
    const oldPasswordHash = hashPassword(oldPassword)
    if (user.passwordHash !== oldPasswordHash) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect old password'
      })
    }

    // Update password
    user.passwordHash = hashPassword(newPassword)
    users.set(email, user)

    console.log(`✅ Password changed for: ${email}`)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!genAI,
    apiKeyPresent: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    timestamp: new Date().toISOString()
  })
})

// Test endpoint
app.get('/test-env', (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    apiKeyFirstChars: process.env.GEMINI_API_KEY?.substring(0, 10) || 'N/A',
    genAI: !!genAI,
    genAIType: typeof genAI
  })
})

// =============================================================================
// Upload Routes (OSS Photo Upload)
// =============================================================================

/**
 * Upload photo to Alibaba Cloud OSS
 * @param {Buffer} buffer - Image buffer
 * @param {string} extension - File extension (default: .jpg)
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadPhotoToOSS(buffer, extension = '.jpg') {
  try {
    if (!ossClient) {
      throw new Error('OSS client not initialized')
    }

    // Generate unique filename
    const filename = `${uuidv4()}${extension}`
    const ossKey = `images/${filename}`

    // Upload to OSS
    const result = await ossClient.put(ossKey, buffer)
    console.log(`✅ Photo uploaded to OSS: ${ossKey}`)

    // Return public URL
    const publicUrl = `https://${process.env.OSS_BUCKET_NAME}.${process.env.OSS_ENDPOINT}/${ossKey}`
    return publicUrl

  } catch (error) {
    console.error('❌ OSS upload error:', error)
    throw error
  }
}

/**
 * POST /api/upload-photo
 * Upload photo to OSS and return public URL
 *
 * Request (multipart/form-data):
 *   photo: File (image file)
 *
 * Response:
 * {
 *   "success": true,
 *   "img_url": "https://zhouw-tts.oss-cn-beijing.aliyuncs.com/images/xxx.jpg"
 * }
 */
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Missing photo file'
      })
    }

    // Determine file extension from mimetype
    let extension = '.jpg'
    const mime = req.file.mimetype
    if (mime === 'image/jpeg') extension = '.jpg'
    else if (mime === 'image/png') extension = '.png'
    else if (mime === 'image/webp') extension = '.webp'
    else if (mime === 'image/gif') extension = '.gif'

    // Upload to OSS (req.file.buffer contains the file data)
    const publicUrl = await uploadPhotoToOSS(req.file.buffer, extension)

    res.json({
      success: true,
      img_url: publicUrl
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/compose
 * Main API for generating a storybook
 * Receives child info and photo URL, generates story
 *
 * Request body:
 * {
 *   "child_name": "Leo",
 *   "gender": "男",
 *   "age": 5,
 *   "theme": "森林冒险",
 *   "img_url": "https://oss-url/photo.jpg"
 * }
 */
app.post('/api/compose', async (req, res) => {
  try {
    const { child_name, gender, age, theme, img_url } = req.body

    console.log('📝 Received compose request:', { child_name, gender, age, theme, img_url })

    // Validate required fields
    if (!child_name || !img_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: child_name, img_url'
      })
    }

    // For now, return a mock response
    // TODO: Integrate with actual story generation API
    res.json({
      success: true,
      message: 'Story generation started',
      story_id: uuidv4(),
      data: {
        child_name,
        gender,
        age: age || 5,
        theme,
        img_url,
        status: 'processing'
      }
    })

  } catch (error) {
    console.error('Compose error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =============================================================================
// Story Routes
// =============================================================================

/**
 * POST /api/stories/generate-character
 * Generate cartoon character from child's photo using Gemini
 */
app.post('/api/stories/generate-character', async (req, res) => {
  try {
    const { photo, childName, childAge, theme } = req.body

    if (!genAI) {
      return res.status(500).json({ error: 'Gemini API not configured' })
    }

    if (!photo || !childName || !childAge) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const prompt = `
      Create a friendly, colorful cartoon character for a children's brushing storybook.

      Child's Name: ${childName}
      Age: ${childAge} years old
      Theme: ${theme || 'Space Adventure'}

      Based on the reference photo, create a cartoon version that:
      - Is kid-friendly, warm and inviting
      - Uses bright, cheerful colors
      - Looks like the child but in cartoon form
      - Is suitable for ages 2-5
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: photo.split(',')[1],
          mimeType: 'image/jpeg'
        }
      }
    ])

    if (result.response.candidates && result.response.candidates[0]) {
      const content = result.response.candidates[0].content.parts[0]

      if (content.inlineData) {
        const imageData = `data:${content.inlineData.mimeType};base64,${content.inlineData.data}`
        return res.json({ imageUrl: imageData })
      }
    }

    res.status(500).json({ error: 'Failed to generate character' })

  } catch (error) {
    console.error('Character generation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/stories/generate-story
 * Generate brushing story using Gemini
 */
app.post('/api/stories/generate-story', async (req, res) => {
  try {
    const { characterName, childAge, theme, preferences } = req.body

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('[ERROR] GEMINI_API_KEY not set')
      return res.status(500).json({ error: 'Gemini API key not configured' })
    }

    if (!genAI) {
      console.error('[ERROR] genAI is null, reinitializing...')
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    }

    if (!characterName || !childAge) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const prompt = `
      Create a 2-minute brushing story for an American preschool child.

      Main Character: ${characterName}
      Age: ${childAge} years old
      Theme: ${theme || 'Space Adventure'}
      ${preferences ? `Child's Interests: ${preferences}` : ''}

      Requirements:
      - Simple language suitable for ages 2-5
      - Encourage proper brushing habits
      - Make it fun and engaging
      - American cultural context
      - Divide into 4 sections (each 30 seconds):
        1. Getting ready to brush (0:00-0:30)
        2. Top teeth brushing (0:30-1:00)
        3. Bottom teeth brushing (1:00-1:30)
        4. Finishing and celebration (1:30-2:00)
      - Each section should be 2-3 sentences

      Return in this exact JSON format:
      {
        "title": "Story title here",
        "content": "Full story text here",
        "sections": ["Section 1", "Section 2", "Section 3", "Section 4"]
      }
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const result = await model.generateContent(prompt)
    const response = await result.response.text()

    // Parse JSON response
    try {
      const storyData = JSON.parse(response)
      res.json(storyData)
    } catch {
      // If not JSON, create structure
      res.json({
        title: `${characterName}'s ${theme || 'Adventure'}`,
        content: response,
        sections: response.split(/\n\n+/).slice(0, 4)
      })
    }

  } catch (error) {
    console.error('Story generation error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/stories
 * Get user's stories
 */
app.get('/api/stories', (req, res) => {
  // TODO: Implement with database
  res.json({ stories: [] })
})

/**
 * POST /api/stories
 * Save a story
 */
app.post('/api/stories', (req, res) => {
  // TODO: Implement with database
  const { title, characterImage, storyContent, privacy } = req.body
  res.json({
    id: Date.now(),
    message: 'Story saved (mock)'
  })
})

// =============================================================================
// Brushing Routes
// =============================================================================

/**
 * POST /api/brushing/start
 * Start a brushing session
 */
app.post('/api/brushing/start', (req, res) => {
  const { storyId } = req.body
  res.json({
    sessionId: Date.now(),
    startTime: new Date().toISOString()
  })
})

/**
 * POST /api/brushing/complete
 * Complete a brushing session
 */
app.post('/api/brushing/complete', (req, res) => {
  const { sessionId, duration, zonesCompleted } = req.body
  res.json({
    success: true,
    endTime: new Date().toISOString()
  })
})

/**
 * GET /api/brushing/history
 * Get brushing history
 */
app.get('/api/brushing/history', (req, res) => {
  // TODO: Implement with database
  res.json({ records: [] })
})

// =============================================================================
// Payment Routes (PayPal & Apple IAP)
// =============================================================================

/**
 * POST /api/payments/paypal/create
 * Create a PayPal payment
 * Reserved for future integration
 */
app.post('/api/payments/paypal/create', (req, res) => {
  // TODO: Integrate PayPal payment creation
  res.json({
    status: 'reserved',
    message: 'PayPal integration not yet implemented',
    paymentId: null
  })
})

/**
 * POST /api/payments/paypal/execute
 * Execute a PayPal payment
 * Reserved for future integration
 */
app.post('/api/payments/paypal/execute', (req, res) => {
  // TODO: Integrate PayPal payment execution
  res.json({
    status: 'reserved',
    message: 'PayPal execution not yet implemented'
  })
})

/**
 * POST /api/payments/apple-iap/verify
 * Verify Apple In-App Purchase receipt
 * Reserved for future integration
 */
app.post('/api/payments/apple-iap/verify', (req, res) => {
  const { receiptData } = req.body

  // TODO: Integrate Apple IAP receipt verification
  res.json({
    status: 'reserved',
    message: 'Apple IAP verification not yet implemented',
    valid: false
  })
})

/**
 * GET /api/payments/subscriptions
 * Get user's subscription status
 */
app.get('/api/payments/subscriptions', (req, res) => {
  // TODO: Implement with database
  res.json({
    hasSubscription: false,
    plan: null
  })
})

// =============================================================================
// Analytics Routes (Parents Dashboard)
// =============================================================================

/**
 * GET /api/analytics/summary
 * Get brushing summary for parents dashboard
 */
app.get('/api/analytics/summary', (req, res) => {
  // TODO: Implement with database
  res.json({
    totalSessions: 0,
    averageDuration: 0,
    currentStreak: 0,
    longestStreak: 0
  })
})

/**
 * GET /api/analytics/heatmap
 * Get brushing activity heatmap data
 */
app.get('/api/analytics/heatmap', (req, res) => {
  // TODO: Implement with database
  res.json({ data: [] })
})

// =============================================================================
// Start Server
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║                                                       ║
║   🦷 BrushBuddy Backend Server                        ║
║                                                       ║
║   🌐 Local:   http://localhost:${PORT}                    ║
║   🌐 Network: http://0.0.0.0:${PORT}                     ║
║                                                       ║
║   ✅ Gemini AI: ${genAI ? 'Connected' : 'Not configured'}              ║
║   💳 Payments: Reserved (PayPal + Apple IAP)         ║
║                                                       ║
╚═════════════════════════════════════════════════════════╝
  `)
})
