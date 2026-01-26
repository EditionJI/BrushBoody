/**
 * Backend API Service
 * Connects to the Node.js backend for AI generation
 */

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
