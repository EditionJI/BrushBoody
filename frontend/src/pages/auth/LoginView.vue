<template>
  <div class="auth-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <!-- Status Bar (54px) -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="levels">
          <div class="wifi"></div>
          <div class="cellular"></div>
          <div class="battery">
            <div class="capacity"></div>
          </div>
        </div>
      </div>

      <!-- Top Navigation -->
      <div class="top-nav">
        <img src="/images/创建页/返回.png" alt="Back" class="back-button" @click="goBack" />
      </div>

      <!-- Content -->
      <div class="content">
        <h1 class="title">{{ pageTitle }}</h1>

        <!-- Email Input -->
        <div class="input-group">
          <label class="input-label">Email</label>
          <div class="input-box">
            <input
              ref="emailInputRef"
              v-model="email"
              type="email"
              placeholder=" "
              class="text-input"
              @keyup.enter="focusPassword"
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="input-group">
          <label class="input-label">Password</label>
          <div class="input-box password-box">
            <input
              ref="passwordInputRef"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder=" "
              class="text-input"
              @keyup.enter="handleSubmit"
              autocomplete="current-password"
            />
            <span class="toggle-password" @click="togglePassword">
              {{ showPassword ? "👁️" : "👁️‍🗨️" }}
            </span>
          </div>
          <p class="password-hint">At least 6 characters</p>
        </div>

        <!-- Continue Button -->
        <div class="continue-button" @click="handleSubmit">Continue</div>
      </div>

      <!-- Home Indicator -->
      <div class="home-indicator"></div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Toast Notification -->
      <transition name="fade">
        <div v-if="showToast" class="toast-notification">
          {{ toastMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { loginOrRegister } from "@/api/login";

const router = useRouter();

// State
const isLoading = ref(false);
const loadingMessage = ref("Creating magic...");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const pageTitle = ref("Sign Up");
const showToast = ref(false);
const toastMessage = ref("");

const emailInputRef = ref<HTMLInputElement | null>(null);
const passwordInputRef = ref<HTMLInputElement | null>(null);

const goBack = () => {
  router.push("/onboarding");
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const focusPassword = () => {
  passwordInputRef.value?.focus();
};

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const validateForm = () => {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    triggerToast("Please enter a valid email address");
    return false;
  }

  // Password validation
  if (!password.value || password.value.length < 6) {
    triggerToast("Password must be at least 6 characters");
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  loadingMessage.value = "Processing...";

  try {
    const response = await loginOrRegister({
      email: email.value,
      password: password.value,
    });

    if (response.success) {
      // Save auth data to localStorage
      localStorage.setItem(
        "auth_tokens",
        JSON.stringify({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        }),
      );
      localStorage.setItem("user_email", email.value);

      // Update page title based on login/register action
      if (response.action === "register") {
        triggerToast("Account created successfully!");
        pageTitle.value = "Welcome back!";
      }

      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      triggerToast(response.error || "Authentication failed");
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    triggerToast(error.message || "Network error. Please check your connection");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  emailInputRef.value?.focus();
});
</script>

<style scoped>
.auth-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: 390px;
  height: 844px;
  overflow: hidden;
  background: #ffffff;
}

/* Status Bar */
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 390px;
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 10;
}

.time {
  font-family: "PingFang SC";
  font-weight: 600;
  font-size: 17px;
  color: #000000;
}

.levels {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wifi {
  width: 17px;
  height: 12px;
  background: #000000;
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}

.cellular {
  width: 19px;
  height: 12px;
  background: #000000;
  clip-path: polygon(0 0, 20% 0, 20% 40%, 40% 40%, 40% 0, 60% 0, 60% 60%, 80% 60%, 80% 0, 100% 0, 100% 100%, 0 100%);
}

.battery {
  position: relative;
  width: 25px;
  height: 12px;
  border: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 4px;
}

.battery::after {
  content: "";
  position: absolute;
  right: -2px;
  top: 3px;
  width: 1.33px;
  height: 6px;
  background: #000000;
  border-radius: 0 2px 2px 0;
}

.capacity {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 21px;
  height: 8px;
  background: #000000;
  border-radius: 2px;
}

/* Top Navigation */
.top-nav {
  position: absolute;
  top: 54px;
  left: 0;
  width: 390px;
  height: 54px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  cursor: pointer;
  z-index: 11;
}

/* Content */
.content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 343px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  font-family: "PingFang SC";
  font-weight: 600;
  font-size: 28px;
  color: #101010;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-family: "PingFang SC";
  font-weight: 500;
  font-size: 14px;
  color: #3a4750;
}

.input-box {
  width: 343px;
  height: 54px;
  background: #ffffff;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.password-box {
  position: relative;
}

.text-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: #333;
}

.text-input::placeholder {
  color: #8e8e9d;
}

.toggle-password {
  cursor: pointer;
  font-size: 20px;
  user-select: none;
}

.password-hint {
  font-family: "PingFang SC";
  font-size: 12px;
  color: #8e8e9d;
  margin: 0;
  padding-left: 4px;
}

.continue-button {
  width: 343px;
  height: 54px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "PingFang SC";
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
}

.continue-button:active {
  transform: translateY(0);
}

/* Home Indicator */
.home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 139px;
  height: 5px;
  background: #000000;
  border-radius: 100px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 3000;
  text-align: center;
  max-width: 80%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
