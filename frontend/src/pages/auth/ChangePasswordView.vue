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
        <h1 class="title">Change Password</h1>

        <!-- Old Password Input -->
        <div class="input-group">
          <label class="input-label">Old Password</label>
          <div class="input-box password-box">
            <input
              ref="oldPasswordInputRef"
              v-model="oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              placeholder=" "
              class="text-input"
              @keyup.enter="focusNewPassword"
              autocomplete="current-password"
            />
            <span class="toggle-password" @click="showOldPassword = !showOldPassword">
              {{ showOldPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
        </div>

        <!-- New Password Input -->
        <div class="input-group">
          <label class="input-label">New Password</label>
          <div class="input-box password-box">
            <input
              ref="newPasswordInputRef"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder=" "
              class="text-input"
              @keyup.enter="focusConfirmPassword"
              autocomplete="new-password"
            />
            <span class="toggle-password" @click="showNewPassword = !showNewPassword">
              {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="input-group">
          <label class="input-label">Confirm New Password</label>
          <div class="input-box password-box">
            <input
              ref="confirmPasswordInputRef"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder=" "
              class="text-input"
              @keyup.enter="handleSubmit"
              autocomplete="new-password"
            />
            <span class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
          <p class="password-hint">At least 6 characters</p>
        </div>

        <!-- Update Button -->
        <div class="continue-button" @click="handleSubmit">
          Update Password
        </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const isLoading = ref(false)
const loadingMessage = ref('Updating password...')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const oldPasswordInputRef = ref<HTMLInputElement | null>(null)
const newPasswordInputRef = ref<HTMLInputElement | null>(null)
const confirmPasswordInputRef = ref<HTMLInputElement | null>(null)

const goBack = () => {
  router.push('/parents')
}

const focusNewPassword = () => {
  newPasswordInputRef.value?.focus()
}

const focusConfirmPassword = () => {
  confirmPasswordInputRef.value?.focus()
}

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const validateForm = () => {
  if (!oldPassword.value) {
    triggerToast('Please enter your old password')
    return false
  }

  if (!newPassword.value || newPassword.value.length < 6) {
    triggerToast('New password must be at least 6 characters')
    return false
  }

  if (newPassword.value !== confirmPassword.value) {
    triggerToast('New passwords do not match')
    return false
  }

  if (oldPassword.value === newPassword.value) {
    triggerToast('New password must be different from old password')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Updating password...'

  try {
    const userEmail = localStorage.getItem('user_email') || ''

    const response = await fetch('http://127.0.0.1:3000/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      }),
    })

    const data = await response.json()

    if (data.success) {
      triggerToast('Password changed successfully!')
      setTimeout(() => {
        router.push('/parents')
      }, 1500)
    } else {
      triggerToast(data.error || 'Password change failed')
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    triggerToast(error.message || 'Network error. Please check your connection')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  oldPasswordInputRef.value?.focus()
})
</script>

<style scoped>
.auth-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: 390px;
  height: 844px;
  overflow: hidden;
  background: #FFFFFF;
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
  font-family: 'PingFang SC';
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
  content: '';
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
  gap: 20px;
}

.title {
  font-family: 'PingFang SC';
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
  font-family: 'PingFang SC';
  font-weight: 500;
  font-size: 14px;
  color: #3A4750;
}

.input-box {
  width: 343px;
  height: 54px;
  background: #FFFFFF;
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
  color: #8E8E9D;
}

.toggle-password {
  cursor: pointer;
  font-size: 20px;
  user-select: none;
}

.password-hint {
  font-family: 'PingFang SC';
  font-size: 12px;
  color: #8E8E9D;
  margin: 0;
  padding-left: 4px;
}

.continue-button {
  width: 343px;
  height: 54px;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'PingFang SC';
  font-weight: 600;
  font-size: 16px;
  color: #FFFFFF;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
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
  border-top: 5px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
