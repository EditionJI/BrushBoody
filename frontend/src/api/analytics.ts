import request from "@/utils/request";
import { getToken } from "@/utils/storage";

// ==================== Types ====================

/**
 * 视频播放埋点请求参数
 */
export interface VideoPlayAnalyticsParams {
  video_url: string;
  play_start_time: string; // ISO 8601 格式
  play_end_time?: string;  // ISO 8601 格式（可选）
  from_home_page: boolean;
}

/**
 * 视频播放埋点响应
 */
export interface VideoPlayAnalyticsResponse {
  success: boolean;
  message?: string;
}

// ==================== API Functions ====================

/**
 * 记录视频播放埋点（普通请求）
 * POST /api/v1/analytics/video-play
 */
export async function recordVideoPlayAnalytics(
  params: VideoPlayAnalyticsParams
): Promise<VideoPlayAnalyticsResponse> {
  return request({
    url: "/analytics/video-play",
    method: "POST",
    data: params,
  });
}

/**
 * 记录视频播放埋点（使用 fetch + keepalive，用于页面关闭时）
 * keepalive 确保请求在页面关闭后仍能发送
 */
export function recordVideoPlayBeacon(params: VideoPlayAnalyticsParams): void {
  const token = getToken();

  fetch("/api/v1/analytics/video-play", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
    keepalive: true, // 页面关闭时也能发送
  }).catch((error) => {
    // 埋点失败不影响主流程
    console.error("[Analytics] Beacon request failed:", error);
  });
}

/**
 * 便捷方法：上报视频播放埋点
 * @param videoUrl 视频地址
 * @param playStartTime 开始时间（ISO 8601）
 * @param playEndTime 结束时间（ISO 8601，可选）
 * @param fromHomePage 是否从首页点击
 * @param useBeacon 是否使用 beacon 方式（页面关闭时用 true）
 */
export function recordVideoPlay(
  videoUrl: string,
  playStartTime: string,
  playEndTime: string | undefined,
  fromHomePage: boolean,
  useBeacon: boolean = false
): void {
  const params: VideoPlayAnalyticsParams = {
    video_url: videoUrl,
    play_start_time: playStartTime,
    from_home_page: fromHomePage,
  };

  // 添加结束时间（如果有）
  if (playEndTime) {
    params.play_end_time = playEndTime;
  }

  try {
    if (useBeacon) {
      // 页面关闭时使用 beacon
      recordVideoPlayBeacon(params);
      console.log(`[Analytics] Video play recorded (beacon, from_home_page: ${fromHomePage}):`, videoUrl);
    } else {
      // 正常退出使用普通请求
      recordVideoPlayAnalytics(params);
      console.log(`[Analytics] Video play recorded (from_home_page: ${fromHomePage}):`, videoUrl);
    }
  } catch (error) {
    // 埋点失败不影响主流程
    console.error("[Analytics] Failed to record video play:", error);
  }
}
