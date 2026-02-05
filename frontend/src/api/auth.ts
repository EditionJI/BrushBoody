import request from "@/utils/request";

// ==================== Types ====================

/**
 * User information from backend
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_type?: "free" | "premium";
  share_enabled?: boolean;
}

/**
 * Register request
 */
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

/**
 * Login request (supports username or email)
 */
export interface LoginRequest {
  username: string; // Can be username or email
  password: string;
}

/**
 * Auth response (register/login)
 */
export interface AuthResponse {
  user: UserInfo;
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  email?: string;
  password?: string;
  subscription_type?: "free" | "premium";
  share_enabled?: boolean;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Subscription request
 */
export interface SubscriptionRequest {
  subscription_type: "free" | "premium";
  reason?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponseType<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== API Functions ====================

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export function register(data: RegisterRequest) {
  return request<AuthResponse>({
    url: "/auth/register",
    method: "POST",
    data,
  });
}

/**
 * Login with username or email
 * POST /api/v1/auth/login
 */
export function login(data: LoginRequest) {
  return request<AuthResponse>({
    url: "/auth/login",
    method: "POST",
    data,
  });
}

/**
 * Logout current user
 * POST /api/v1/auth/logout
 */
export function logout() {
  return request<void>({
    url: "/auth/logout",
    method: "POST",
  });
}

/**
 * Get current user information
 * GET /api/v1/auth/me
 */
export function getUserInfo() {
  return request<UserInfo>({
    url: "/auth/me",
    method: "GET",
  });
}

/**
 * Update user information
 * PUT /api/v1/auth/me
 */
export function updateUser(data: UpdateUserRequest) {
  return request<UserInfo>({
    url: "/auth/me",
    method: "PUT",
    data,
  });
}

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export function changePassword(data: ChangePasswordRequest) {
  return request<void>({
    url: "/auth/change-password",
    method: "POST",
    data,
  });
}

/**
 * Update subscription type (for analytics)
 * POST /api/v1/auth/subscription
 */
export function updateSubscription(data: SubscriptionRequest) {
  return request<{ subscription_type: string; reason: string }>({
    url: "/auth/subscription",
    method: "POST",
    data,
  });
}
