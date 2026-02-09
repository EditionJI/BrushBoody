import request from "@/utils/request";
import axios from "axios";

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

// Direct upload to backend (bypass Vercel proxy for multipart/form-data)
// Vercel rewrites don't support file uploads properly
const UPLOAD_API_BASE = import.meta.env.VITE_APP_UPLOAD_API || "https://163.177.65.65:8082/api/v1";

// ==================== API Functions ====================

/**
 * Upload photo to backend (uploads to OSS and returns URL)
 * POST /api/v1/upload
 * Uses multipart/form-data to upload the file directly
 */
export function uploadPhoto(data: UploadPhotoRequest) {
  const formData = new FormData();
  formData.append("file", data.file);

  // Use axios directly for upload to bypass Vercel proxy
  // Vercel rewrites don't support multipart/form-data properly
  return axios.post(`${UPLOAD_API_BASE}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // Include auth token if exists
      ...(localStorage.getItem("auth_token") ? {
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
      } : {})
    },
  }).then(res => res.data);
}
