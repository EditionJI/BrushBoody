import request from "@/utils/request";
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
 * 确认封面（触发视频生成）
 */
export type VideoTasksConfirmRequest = {
  task_id: string;
  confirmed: boolean;
};
export type VideoTasksConfirmResponse = {
  task_id: string;
  status: TaskStatus;
  cover_image_url: string;
  message: string;
};
export async function videoTasksConfirm(data: VideoTasksConfirmRequest) {
  return request<VideoTasksConfirmResponse>({
    url: `video/tasks/${data.task_id}/confirm`,
    method: "POST",
    data,
  });
}
