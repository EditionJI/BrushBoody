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
 */
export function uploadPhoto(data: UploadPhotoRequest) {
  const formData = new FormData();
  formData.append("file", data.file);

  // Use request utility to go through Vercel proxy
  // Vercel rewrites support multipart/form-data
  return request<UploadPhotoResponse>({
    url: "/upload",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
