/**
 * BrushBuddy Backend Server
 * Express server with Gemini AI integration
 * Payment gateway integration (PayPal & Apple IAP)
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// Initialize Gemini AI
let genAI = null
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

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
