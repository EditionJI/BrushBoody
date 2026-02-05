import request from "@/utils/request";

// ==================== Types ====================

/**
 * Feed item (shared story)
 */
export interface FeedItem {
  task_id: string;
  child_name: string;
  theme: string;
  cover_image_url: string;
  video_url: string;
  username?: string;
  shared_at: string;
  created_at: string;
}

/**
 * Feed item with ownership flag (for home page)
 */
export interface FeedItemWithOwn extends FeedItem {
  is_shared: boolean;
  is_own: boolean;
  username?: string;
}

/**
 * Get global feed params
 */
export interface GetGlobalFeedParams {
  limit?: number;
  offset?: number;
}

// ==================== API Functions ====================

/**
 * Get global feed (all public shared stories)
 * GET /api/feed
 * No authentication required
 */
export function getGlobalFeed(params?: GetGlobalFeedParams) {
  return request<FeedItem[]>({
    url: "/feed",
    method: "GET",
    params,
  });
}

/**
 * Get user-specific feed
 * GET /api/feed/{user_id}
 * No authentication required
 */
export function getUserFeed(userId: string) {
  return request<FeedItem[]>({
    url: `/feed/${userId}`,
    method: "GET",
  });
}

/**
 * Share a task to feed
 * POST /api/feed/share/{task_id}
 * Authentication required
 */
export function shareTask(taskId: string) {
  return request<FeedItem>({
    url: `/feed/share/${taskId}`,
    method: "POST",
  });
}

/**
 * Unshare a task from feed
 * POST /api/feed/unshare/{task_id}
 * Authentication required
 */
export function unshareTask(taskId: string) {
  return request<void>({
    url: `/feed/unshare/${taskId}`,
    method: "POST",
  });
}

/**
 * Get global mixed feed for home page
 * Returns: user's own videos (all) + other users' public videos
 * GET /api/v1/feed/global
 * Authentication required
 */
export function getGlobalFeedForHome(params?: GetGlobalFeedParams) {
  return request<FeedItemWithOwn[]>({
    url: "/feed/global",
    method: "GET",
    params,
  });
}

/**
 * Get user's own videos
 * Returns: current user's all completed videos (regardless of sharing status)
 * GET /api/v1/feed/mine
 * Authentication required
 */
export function getMyFeed(params?: GetGlobalFeedParams) {
  return request<FeedItemWithOwn[]>({
    url: "/feed/mine",
    method: "GET",
    params,
  });
}
