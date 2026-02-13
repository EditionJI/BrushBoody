import request from "@/utils/request";

// ==================== Types ====================

/**
 * Upload photo request
 */
export interface UploadPhotoRequest {
  file: File;
}

/**
 * Upload photo response
 */
export interface UploadPhotoResponse {
  url: string;
  object_key?: string;
  filename: string;
}

// ==================== API Functions ====================

/**
 * Upload photo to backend (uploads to OSS and returns URL)
 * POST /api/v1/upload
 * Uses multipart/form-data to upload the file
 * Uses longer timeout (60s) for slow mobile connections
 */
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
    timeout: 60000, // 60 seconds for slow mobile connections
  });
}
