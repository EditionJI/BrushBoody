import request from "@/utils/request";
/**
 * Backend API Service
 * Connects to the Node.js backend for AI generation
 */

// Types from backend/src/server.js
export interface GenerateCharacterRequest {
  img_url: string; // base64 string
  child_name: string;
  age: number;
  theme: string;
  gender: string; // '男' | '女'
}

export interface GenerateCharacterResponse {
  imageUrl: string;
}

export interface GenerateStoryRequest {
  characterName: string;
  childAge: number;
  theme: string;
  preferences?: string;
}

export interface StoryResponse {
  title: string;
  content: string;
  sections: string[];
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
  success: boolean;
  img_url?: string;
  error?: string;
}

/**
 * Login/Register request (combined)
 */
export interface LoginOrRegisterRequest {
  email: string;
  password: string;
}

/**
 * Login/Register response
 */
export interface LoginOrRegisterResponse {
  success: boolean;
  action?: 'login' | 'register'; // 'login' if user existed, 'register' if new user
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user?: {
      id: string;
      email: string;
      subscriptionStatus: 'free' | 'paid';
    }
  };
  error?: string;
}

/**
 * Login or Register (combined endpoint)
 * Backend automatically detects if email exists and logs in or registers
 */
export async function loginOrRegister(request: LoginOrRegisterRequest): Promise<LoginOrRegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login-or-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: LoginOrRegisterResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Login/Register failed:", error);
    throw error;
  }
}

/**
 * Logout request
 */
export interface LogoutRequest {
  refreshToken: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean;
  error?: string;
}

/**
 * Logout endpoint
 */
export async function logout(refreshToken: string): Promise<LogoutResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: LogoutResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

/**
 * Compose story request
 */
export interface ComposeRequest {
  child_name: string;
  gender: string; // '男' | '女'
  age?: number;
  theme: string; // '森林冒险' | '太空冒险' | '海洋探险' | '超级英雄'
  img_url: string;
}

/**
 * Compose story response
 */
export interface ComposeResponse {
  success: boolean;
  message?: string;
  story_id?: string;
  data?: {
    child_name: string;
    gender: string;
    age?: number;
    theme: string;
    img_url: string;
    status: string;
  };
  error?: string;
}

/**
 * Upload photo to backend (uploads to OSS and returns URL)
 * Uses multipart/form-data to upload the file directly
 */

// 登录方法
export function uploadPhoto(data: { flie: File }) {
  return request<string>({
    url: "/upload",
    method: "POST",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
/**
 * Compose/generate a storybook
 */
export async function composeStory(data: ComposeRequest) {
  return request<ComposeResponse>({
    url: "/compose",
    method: "POST",
    data,
  });
}

/**
 * Generate a cartoon character via Backend
 */
export async function generateCharacter(data: GenerateCharacterRequest) {
  return request<string>({
    url: "/video/tasks",
    method: "POST",
    data,
  });
}

/**
 * Generate a brushing story via Backend
 */
export async function generateStory(data: GenerateStoryRequest) {
  return request<StoryResponse>({
    url: "/stories/generate-story",
    method: "POST",
    data,
  });
}
