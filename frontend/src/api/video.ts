import request from "@/utils/request";

// ==================== Types ====================

/**
 * Task status enum
 */
export type TaskStatus =
  | "pending"
  | "story_generating"
  | "story_generated"
  | "cover_generating"
  | "cover_ready"
  | "awaiting_confirmation"
  | "video_generating"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Create task request
 */
export interface CreateTaskRequest {
  img_url: string;
  child_name: string;
  age: number;
  theme: string;
  gender: string; // 'male' | 'female' | 'prefer_not_to_say'
}

/**
 * Create task response
 */
export interface CreateTaskResponse {
  task_id: string;
  status: TaskStatus;
  message: string;
}

/**
 * Task status response
 */
export interface TaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  progress: number;
  video_url?: string;
  cover_image_url?: string;
  story_content?: any;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  cover_generation_count: number;
}

/**
 * Generate cover request
 */
export interface GenerateCoverRequest {
  task_id: string;
  regenerate: boolean;
}

/**
 * Generate cover response
 */
export interface GenerateCoverResponse {
  task_id: string;
  status: TaskStatus;
  cover_image_url: string;
  message: string;
}

/**
 * Confirm task request
 */
export interface ConfirmTaskRequest {
  task_id: string;
  confirm: boolean;
  is_shared?: boolean;  // 是否公开分享（默认 false，不公开）
}

/**
 * Confirm task response
 */
export interface ConfirmTaskResponse {
  task_id: string;
  status: TaskStatus;
  cover_image_url: string;
  message: string;
  estimated_seconds?: number;
}

// ==================== API Functions ====================

/**
 * Create a new video task
 * POST /api/v1/video/tasks
 */
export function createTask(data: CreateTaskRequest) {
  return request<CreateTaskResponse>({
    url: "/video/tasks",
    method: "POST",
    data,
  });
}

/**
 * Query task status by task_id
 * GET /api/v1/video/tasks/{task_id}
 */
export function getTaskStatus(taskId: string) {
  return request<TaskStatusResponse>({
    url: `/video/tasks/${taskId}`,
    method: "GET",
  });
}

/**
 * Generate or regenerate cover image
 * POST /api/v1/video/tasks/{task_id}/cover
 */
export function generateCover(data: GenerateCoverRequest) {
  return request<GenerateCoverResponse>({
    url: `/video/tasks/${data.task_id}/cover`,
    method: "POST",
    data: { regenerate: data.regenerate },
  });
}

/**
 * Confirm or cancel cover (triggers video generation)
 * POST /api/v1/video/tasks/{task_id}/confirm
 */
export function confirmTask(data: ConfirmTaskRequest) {
  return request<ConfirmTaskResponse>({
    url: `/video/tasks/${data.task_id}/confirm`,
    method: "POST",
    data: {
      confirm: data.confirm,
      is_shared: data.is_shared ?? false,  // 默认不公开分享
    },
  });
}

/**
 * Delete a task
 * DELETE /api/v1/video/tasks/{task_id}
 * Authentication required
 */
export function deleteTask(taskId: string) {
  return request<void>({
    url: `/video/tasks/${taskId}`,
    method: "DELETE",
  });
}
