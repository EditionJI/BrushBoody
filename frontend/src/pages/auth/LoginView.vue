<template>
  <div class="login-container">
    <div class="mobile-wrapper">
      <!-- Title -->
      <div class="title-section">
        <h1 class="title">Welcome</h1>
        <p class="subtitle">{{ isLoginMode ? "Sign in to continue" : "Create your account" }}</p>
      </div>

      <!-- Form -->
      <div class="form-section">
        <div class="input-group">
          <label class="input-label">{{ isLoginMode ? "Username or Email" : "Username" }}</label>
          <input
            v-model="formData.username"
            type="text"
            class="text-input"
            :placeholder="isLoginMode ? 'Enter username or email' : 'Enter username'"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div v-if="!isLoginMode" class="input-group">
          <label class="input-label">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="text-input"
            placeholder="Enter your email"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Password</label>
          <input
            v-model="formData.password"
            type="password"
            class="text-input"
            placeholder="Enter password"
            show-password
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- Submit Button -->
        <button class="submit-button" @click="handleSubmit" :disabled="isLoading">
          {{ isLoading ? "Processing..." : isLoginMode ? "Sign In" : "Sign Up" }}
        </button>

        <!-- Toggle Mode -->
        <div class="toggle-mode">
          <span class="toggle-text">
            {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
          </span>
          <span class="toggle-link" @click="toggleMode">
            {{ isLoginMode ? "Sign Up" : "Sign In" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// Form state
const isLoginMode = ref(true);
const isLoading = ref(false);

const formData = reactive({
  username: "",
  email: "",
  password: "",
});

// Toast state
const toast = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "error",
});

const showToast = (message: string, type: "success" | "error" = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  // Clear form when toggling
  formData.username = "";
  formData.email = "";
  formData.password = "";
};

const validateForm = (): boolean => {
  if (!formData.username.trim()) {
    showToast("Please enter username", "error");
    return false;
  }

  if (!isLoginMode.value && formData.username.length < 3) {
    showToast("Username must be at least 3 characters", "error");
    return false;
  }

  if (!isLoginMode.value && !formData.email.trim()) {
    showToast("Please enter email", "error");
    return false;
  }

  if (!isLoginMode.value && !formData.email.includes("@")) {
    showToast("Please enter a valid email", "error");
    return false;
  }

  if (!formData.password.trim()) {
    showToast("Please enter password", "error");
    return false;
  }

  if (formData.password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    if (isLoginMode.value) {
      // Login
      await authStore.login(formData.username, formData.password);
      showToast("Login successful!", "success");
    } else {
      // Register
      await authStore.register(formData.username, formData.email, formData.password);
      showToast("Account created successfully!", "success");
    }

    // Redirect to home after successful login/register
    setTimeout(() => {
      router.push("/");
    }, 500);
  } catch (error: any) {
    console.error("Auth error:", error);

    // Extract error message from various possible formats
    let errorMsg = "Authentication failed";

    // Map backend Chinese error messages to English
    const errorMessageMap: Record<string, string> = {
      "用户名或邮箱已被注册": "Username or email already registered",
      "邮箱已被注册": "Email already registered",
      "用户名已被注册": "Username already taken",
      "用户不存在": "User not found",
      "密码错误": "Incorrect password",
      "登录失败": "Login failed",
    };

    if (error?.response?.data?.detail) {
      // Pydantic validation error format: { detail: [{ msg: "...", loc: ["body", "field"] }] }
      const detail = error.response.data.detail;
      if (Array.isArray(detail) && detail[0]?.msg) {
        // Get field name from location (e.g., ["body", "username"] -> "username")
        const field = detail[0].loc?.[1] || "field";
        const msg = detail[0].msg;
        // Map Chinese validation messages to English
        const mappedMsg = errorMessageMap[msg] || msg;
        errorMsg = `${field}: ${mappedMsg}`;
      } else if (typeof detail === "string") {
        errorMsg = errorMessageMap[detail] || detail;
      }
    } else if (error?.response?.data?.message) {
      // Backend returned { message: "..." }
      errorMsg = errorMessageMap[error.response.data.message] || error.response.data.message;
    } else if (error?.response?.data?.msg) {
      // Backend returned { msg: "..." }
      errorMsg = errorMessageMap[error.response.data.msg] || error.response.data.msg;
    } else if (error?.message) {
      // Fallback to axios error message
      errorMsg = error.message;
    }

    showToast(errorMsg, "error");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  max-width: 390px;
  width: 100%;
  max-height: 844px;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

/* Title Section */
.title-section {
  padding: 40px 24px 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

/* Form Section */
.form-section {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.text-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #4a90e2;
}

/* Submit Button */
.submit-button {
  width: 100%;
  height: 48px;
  margin-top: 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #357abd;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Toggle Mode */
.toggle-mode {
  text-align: center;
  margin-top: 24px;
}

.toggle-text {
  font-size: 14px;
  color: #666;
}

.toggle-link {
  font-size: 14px;
  color: #4a90e2;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
}

.toggle-link:hover {
  text-decoration: underline;
}

/* Toast */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  max-width: 80%;
  text-align: center;
}

.toast-success {
  background: rgba(0, 200, 83, 0.95);
  color: white;
}

.toast-error {
  background: rgba(244, 67, 54, 0.95);
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
