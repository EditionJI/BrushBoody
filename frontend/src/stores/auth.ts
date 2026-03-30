import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserInfo } from "@/api/auth";
import * as authApi from "@/api/auth";
import { getToken, setToken, removeToken, clearAuthData } from "@/utils/storage";
import posthog from "posthog-js";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // ==================== State ====================
    const accessToken = ref<string | null>(getToken());
    const userInfo = ref<UserInfo | null>(null);

    // Load userInfo from localStorage if exists
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo);
      } catch (e) {
        console.error("Failed to parse userInfo from localStorage:", e);
      }
    }

    // ==================== Computed ====================
    const isLoggedIn = computed(() => !!accessToken.value);
    const isPaidUser = computed(() => userInfo.value?.subscription_type === "premium");

    // ==================== Actions ====================

    /**
     * Set token and save to localStorage
     */
    const setAccessToken = (token: string) => {
      accessToken.value = token;
      setToken(token);
    };

    /**
     * Clear token and userInfo
     */
    const clearAuth = () => {
      accessToken.value = null;
      userInfo.value = null;
      clearAuthData();
    };

    /**
     * Save userInfo to localStorage
     */
    const saveUserInfo = () => {
      if (userInfo.value) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
      }
    };

    /**
     * Register a new user
     */
    const register = async (username: string, email: string, password: string) => {
      const response = await authApi.register({ username, email, password });
      setAccessToken(response.data.access_token);
      userInfo.value = response.data.user;
      saveUserInfo();
      // Identify user in PostHog
      posthog.identify(response.data.user.id.toString(), {
        email: response.data.user.email,
        username: response.data.user.username,
      });
      return response;
    };

    /**
     * Login with username or email
     */
    const login = async (username: string, password: string) => {
      const response = await authApi.login({ username, password });
      setAccessToken(response.data.access_token);
      userInfo.value = response.data.user;
      saveUserInfo();
      // Identify user in PostHog
      posthog.identify(response.data.user.id.toString(), {
        email: response.data.user.email,
        username: response.data.user.username,
      });
      return response;
    };

    /**
     * Logout and clear auth data
     */
    const logout = async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        // Reset PostHog user identification
        posthog.reset();
        clearAuth();
      }
    };

    /**
     * Load current user info from server
     */
    const loadUserInfo = async () => {
      const response = await authApi.getUserInfo();
      userInfo.value = response.data;
      saveUserInfo();
      // Identify user in PostHog
      posthog.identify(response.data.id.toString(), {
        email: response.data.email,
        username: response.data.username,
      });
      return response;
    };

    /**
     * Update user information
     */
    const updateUser = async (data: { email?: string; password?: string; subscription_type?: string; share_enabled?: boolean }) => {
      const response = await authApi.updateUser(data);
      userInfo.value = response.data;
      saveUserInfo();
      return response;
    };

    /**
     * Change password
     */
    const changePassword = async (oldPassword: string, newPassword: string) => {
      const response = await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      return response;
    };

    /**
     * Update subscription type (for analytics)
     */
    const updateSubscription = async (subscriptionType: "free" | "premium", reason?: string) => {
      const response = await authApi.updateSubscription({ subscription_type: subscriptionType, reason });
      // Update local userInfo if response contains updated user info
      if (userInfo.value) {
        userInfo.value.subscription_type = subscriptionType;
        saveUserInfo();
      }
      return response;
    };

    /**
     * Initialize auth state (check if token exists, load user info)
     */
    const initializeAuth = async () => {
      if (accessToken.value && !userInfo.value) {
        try {
          await loadUserInfo();
        } catch (error) {
          console.error("Failed to load user info:", error);
          clearAuth();
        }
      }
    };

    // ==================== Return ====================
    return {
      // State
      accessToken,
      userInfo,

      // Computed
      isLoggedIn,
      isPaidUser,

      // Actions
      setAccessToken,
      clearAuth,
      register,
      login,
      logout,
      loadUserInfo,
      updateUser,
      changePassword,
      updateSubscription,
      initializeAuth,
    };
  },
  {
    // Persist state to localStorage
    persist: true,
  }
);
