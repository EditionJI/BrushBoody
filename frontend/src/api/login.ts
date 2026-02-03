import request from "@/utils/request";

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
  action?: "login" | "register"; // 'login' if user existed, 'register' if new user
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user?: {
      id: string;
      email: string;
      subscriptionStatus: "free" | "paid";
    };
  };
  error?: string;
}

/**
 * Login or Register (combined endpoint)
 * Backend automatically detects if email exists and logs in or registers
 */
export async function loginOrRegister(data: LoginOrRegisterRequest) {
  return request<LoginOrRegisterResponse>({
    url: "/auth/login-or-register",
    method: "POST",
    data,
  });
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
export async function logout(data: string) {
  return request<LogoutResponse>({
    url: "auth/logout",
    method: "POST",
    data,
  });
}
