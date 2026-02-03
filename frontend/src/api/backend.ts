import request from "@/utils/request";
/**
 * Backend API Service
 * Connects to the Node.js backend for AI generation
 */

// Types from backend/src/server.js

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
export type UploadPhotoRequest = {
  file: File;
};
export type UploadPhotoResponse = {
  url: string;
  object_key?: string;
  filename: string;
};
export function uploadPhoto(data: UploadPhotoRequest) {
  const formData = new FormData();
  formData.append("file", data.file);

  return request<UploadPhotoResponse>({
    url: "/upload",
    method: "POST",
    data: formData,
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
 * 创建任务
 */

export type CreateTaskRequest = {
  img_url: string; // base64 string
  child_name: string;
  age: number;
  theme: string;
  gender: string; // '男' | '女'
};
export type CreateTaskResponse = {
  task_id: string;
  status: TaskStatus;
  message: string;
};
export async function createVideoTasks(data: CreateTaskRequest) {
  return request<CreateTaskResponse>({
    url: "/video/tasks",
    method: "POST",
    data,
  });
}

/**
 * 轮询查询任务状态
 */
export type TaskStatus = "pending" | "cover_ready" | "completed" | "failed" | "cancelled" | "cover_generating";
type QueryTaskStatusRequest = {
  task_id: string;
};
export type QueryTaskStatusResponse = {
  status: TaskStatus;
  message: string;
};
export async function queryVideoTasksStatus(data: QueryTaskStatusRequest) {
  return request<QueryTaskStatusResponse>({
    url: `video/tasks/${data.task_id}`,
  });
}

/**
 * 生成封面图
 */
export type GenerateCoverRequest = {
  task_id: string;
  regenerate: boolean;
};
export type GenerateCoverResponse = {
  task_id: string;
  status: TaskStatus;
  cover_image_url: string;
  message: string;
};
export async function generateCover(data: GenerateCoverRequest) {
  return request<GenerateCoverResponse>({
    url: `video/tasks/${data.task_id}/cover`,
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
