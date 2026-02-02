/**
 * Backend API Service
 * Connects to the Node.js backend for AI generation
 */

const API_BASE_URL = 'http://127.0.0.1:3000'

// Types from backend/src/server.js
export interface GenerateCharacterRequest {
  photo: string // base64 string
  childName: string
  childAge: number
  theme: string
}

export interface GenerateCharacterResponse {
  imageUrl: string
}

export interface GenerateStoryRequest {
  characterName: string
  childAge: number
  theme: string
  preferences?: string
}

export interface StoryResponse {
  title: string
  content: string
  sections: string[]
}

/**
 * Upload photo request
 * Note: Now using FormData with multipart/form-data instead of JSON
 * Form field name: 'photo' (File object)
 */

/**
 * Upload photo response
 */
export interface UploadPhotoResponse {
  success: boolean
  img_url?: string
  error?: string
}

/**
 * Compose story request
 */
export interface ComposeRequest {
  child_name: string
  gender: string // '男' | '女'
  age?: number
  theme: string // '森林冒险' | '太空冒险' | '海洋探险' | '超级英雄'
  img_url: string
}

/**
 * Compose story response
 */
export interface ComposeResponse {
  success: boolean
  message?: string
  story_id?: string
  data?: {
    child_name: string
    gender: string
    age?: number
    theme: string
    img_url: string
    status: string
  }
  error?: string
}

/**
 * Upload photo to backend (uploads to OSS and returns URL)
 * Uses multipart/form-data to upload the file directly
 */
export async function uploadPhoto(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await fetch(`${API_BASE_URL}/api/upload-photo`, {
      method: 'POST',
      body: formData  // Don't set Content-Type header, let browser set it with boundary
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: UploadPhotoResponse = await response.json()

    if (!data.success || !data.img_url) {
      throw new Error(data.error || 'Upload failed')
    }

    return data.img_url
  } catch (error) {
    console.error('Photo upload failed:', error)
    throw error
  }
}

/**
 * Compose/generate a storybook
 */
export async function composeStory(request: ComposeRequest): Promise<ComposeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: ComposeResponse = await response.json()
    return data
  } catch (error) {
    console.error('Compose story failed:', error)
    throw error
  }
}

/**
 * Generate a cartoon character via Backend
 */
export async function generateCharacter(request: GenerateCharacterRequest): Promise<string> {
  try {
    const response = await fetch('/api/stories/generate-character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: GenerateCharacterResponse = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error('Character generation failed:', error)
    throw error
  }
}

/**
 * Generate a brushing story via Backend
 */
export async function generateStory(request: GenerateStoryRequest): Promise<StoryResponse> {
  try {
    const response = await fetch('/api/stories/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: StoryResponse = await response.json()
    return data
  } catch (error) {
    console.error('Story generation failed:', error)
    throw error
  }
}
