﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="create-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <!-- ========== STEP 1: Upload Info (New Design) ========== -->
      <div v-if="currentStep === 1" class="step-1">
        <!-- Main Content Area -->
        <div class="main-content">
          <!-- Upload Section -->
          <div class="upload-section">
            <div class="upload-labels">
              <img src="/images/创建页/上传.png" alt="Upload your kid's photo" class="upload-label" />
            </div>
            <div class="upload-area" @click="triggerUpload">
              <div v-if="!uploadedPhoto" class="upload-placeholder"></div>
              <img v-else :src="uploadedPhoto" alt="Uploaded photo" class="uploaded-photo" />
            </div>
            <!-- Delete button for uploaded photo - outside upload-area to avoid clipping -->
            <div v-if="uploadedPhoto" class="delete-button" @click.stop="deletePhoto">
              <span class="delete-x">×</span>
            </div>
          </div>

          <!-- Nickname Input -->
          <div class="input-group">
            <img src="/images/创建页/Your-kids-nickname.png" alt="Nickname" class="input-label" />
            <div class="input-box" @click="focusNickname">
              <input
                ref="nicknameInputRef"
                v-model="nickname"
                type="text"
                placeholder="e.g. Leo"
                class="text-input"
                @blur="saveData"
              />
            </div>
          </div>

          <!-- Gender Select -->
          <div class="input-group">
            <img src="/images/创建页/Gender.png" alt="Gender" class="input-label" />
            <div class="select-box" @click="toggleGenderDropdown">
              <span class="select-text">{{ getGenderLabel(childGender) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <!-- Gender Dropdown -->
            <div v-if="showGenderDropdown" class="dropdown-menu">
              <div v-for="(label, key) in genderOptions" :key="key" class="dropdown-item" @click="selectGender(key)">
                {{ label }}
              </div>
            </div>
          </div>

          <!-- Age Select -->
          <div class="input-group">
            <img src="/images/创建页/Age.png" alt="Age" class="input-label" />
            <div class="select-box" @click="toggleAgeDropdown">
              <span class="select-text">{{ getAgeLabel(childAge) }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <!-- Age Dropdown -->
            <div v-if="showAgeDropdown" class="dropdown-menu dropdown-menu-age">
              <div v-for="age in ageOptions" :key="age" class="dropdown-item" @click="selectAge(age)">
                {{ getAgeLabel(age) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Next Step Button -->
        <img src="/images/创建页/L.png" alt="Next Step" class="next-button" @click="handleNextStep1" />
      </div>

      <!-- ========== STEP 2: Select Theme (PNG + CSS) ========== -->
      <div v-if="currentStep === 2" class="step-2-container">
        <!-- Theme scroll area -->
        <div class="theme-scroll-area">
          <div class="theme-options">
            <div
              v-for="theme in THEMES"
              :key="theme.id"
              class="theme-option"
              :class="{ 'selected': selectedTheme === theme.id }"
              role="button"
              tabindex="0"
              :aria-pressed="selectedTheme === theme.id"
              :aria-label="'Select ' + theme.name + ' theme'"
              @click="selectTheme(theme.id)"
              @keydown.enter="selectTheme(theme.id)"
            >
              <img
                :src="theme.image"
                :alt="theme.name"
                class="theme-image"
                @error="(e) => handleImageError(e, theme.id)"
                @load="loadedImages[theme.id] = true"
              />
              <span class="theme-name">{{ theme.name }}</span>
              <!-- Selected marker -->
              <div v-if="selectedTheme === theme.id" class="selected-marker">
                <svg class="checkmark" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="10" fill="#1484FF"/>
                  <path d="M6 10l3 3 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Next button (fixed bottom) -->
        <div class="next-button-area">
          <img
            src="/images/创建页/next23.png"
            alt="Next"
            class="next-button"
            @click="handleNextStep2"
          />
        </div>
      </div>

      <!-- ========== STEP 3: AI Preview (New Design) ========== -->
      <div v-if="currentStep === 3" class="step-3">
        <!-- Preview Image Area - Full Screen -->
        <img v-if="resImgUrl" :src="resImgUrl" alt="Preview" class="preview-background-image" />
        <img v-else src="/images/首页/背景.png" alt="Placeholder" class="preview-background-image" />

        <!-- Controls Container - Flexbox 自适应布局 -->
        <div class="step-3-controls">
          <!-- Public Toggle (主按钮) -->
          <div class="public-toggle-main">
            <span class="public-toggle-label">Public: Others can read this book.</span>
            <div class="public-toggle-switch" :class="{ active: isPublic }" @click="togglePublic">
              <div class="public-toggle-knob"></div>
            </div>
          </div>

          <!-- Input Section with Button Overlays - 包装容器 -->
          <div class="input-section-wrapper">
            <!-- Input Section PNG (Question + Two Buttons) - 作为背景视觉元素 -->
            <img src="/images/创建页/输入框1.png" alt="Input section" class="input-section-png" />

            <!-- Button Overlays - 绝对定位在输入框PNG上方 -->
            <div class="button-overlays">
              <!-- Create Button Overlay - 上方蓝色按钮：创建绘本 -->
              <div
                class="create-button-overlay"
                role="button"
                aria-label="Create story"
                tabindex="0"
                @click.stop="handleConfirmCoverAndGenerateVideo"
                @touchend.stop.prevent="handleCreateStory"
                @keydown.enter.prevent="handleCreateStory"
                :style="{ background: debugMode ? 'rgba(0, 0, 255, 0.3)' : 'transparent', border: debugMode ? '2px solid blue' : 'none' }"
              >
                <div v-if="debugMode" class="debug-label">📘 创建绘本 (Create)</div>
              </div>

              <!-- Regenerate Button Overlay - 下方白色按钮：重建封面 -->
              <div
                class="regenerate-button-overlay"
                role="button"
                aria-label="Regenerate cover"
                tabindex="0"
                @click.stop="handleRegenerateCover"
                @touchend.stop.prevent="handleRegenerateCover"
                @keydown.enter.prevent="handleRegenerateCover"
                :style="{ background: debugMode ? 'rgba(0, 255, 0, 0.3)' : 'transparent', border: debugMode ? '2px solid green' : 'none' }"
              >
                <div v-if="debugMode" class="debug-label">🟢 重建封面</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <transition name="fade">
        <div v-if="showToast" class="toast-notification">
          {{ toastMessage }}
        </div>
      </transition>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>

      <!-- Hidden file input -->
      <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { uploadPhoto } from "@/api/upload";
import { createTask, getTaskStatus, generateCover, confirmTask } from "@/api/video";
import type { TaskStatus, TaskStatusResponse } from "@/api/video";
import { useUserStore } from "../../stores/user";
import { pollUntilTrue } from "@/utils";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const wrapperRef = ref<HTMLElement | null>(null);

// State
const isLoading = ref(false);
const loadingMessage = ref("Creating magic...");
const currentStep = ref(1);
const fileInput = ref<HTMLInputElement | null>(null);
const nicknameInputRef = ref<HTMLInputElement | null>(null);

// SVG document reference (for Step 3 only)
let previewSvgDoc: Document | null = null;

// Form data
const uploadedPhoto = ref<string | null>(null); // Local base64 for preview
const uploadedPhotoFile = ref<File | null>(null); // Original file for upload
const uploadedPhotoUrl = ref<string | null>(null); // OSS URL after upload

const task_id = ref<string | null>(null);
const task_status = ref<TaskStatus | null>(null);
const resImgUrl = ref<string | null>(null);
const nickname = ref("");
const childGender = ref<"male" | "female" | "prefer_not_to_say">("male");
const childAge = ref(3);
const selectedTheme = ref<number | null>(null);
const isPublic = ref(false);

// Debug mode for button visualization
const debugMode = ref(false);

// Image loading states for Step 2
const loadedImages = ref<Record<number, boolean>>({});

// Dropdown states
const showGenderDropdown = ref(false);
const showAgeDropdown = ref(false);

// Options
const genderOptions = {
  male: "Boy",
  female: "Girl",
  prefer_not_to_say: "Prefer not to say",
};
const ageOptions = Array.from({ length: 12 }, (_, i) => i + 1);

// Theme interface and data (single source of truth)
interface Theme {
  id: number;
  name: string;
  nameCn: string;
  image: string;
}

const THEMES: readonly Theme[] = [
  { id: 1, name: 'Super Hero', nameCn: '超级英雄', image: '/images/创建页/superhero.png' },
  { id: 2, name: 'Magic Kingdom', nameCn: '魔法王国', image: '/images/创建页/magic kingdom.png' },
  { id: 3, name: 'Jungle Safari', nameCn: '森林探险', image: '/images/创建页/jungle safari.png' },
  { id: 4, name: 'Space Explorer', nameCn: '太空探险', image: '/images/创建页/space explorer.png' },
] as const;

// User stats
const userStoryCount = ref(0);
const dailyRegenCount = ref(0);

// Toast
const showToast = ref(false);
const toastMessage = ref("");

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

const validateStep1 = () => {
  if (!uploadedPhoto.value) {
    triggerToast("Please upload your child's photo");
    return false;
  }
  if (!nickname.value.trim()) {
    triggerToast("Please enter your child's nickname");
    return false;
  }
  if (!childGender.value) {
    triggerToast("Please select your child's gender");
    return false;
  }
  if (!childAge.value) {
    triggerToast("Please select your child's age");
    return false;
  }
  return true;
};

const handleNextStep1 = async () => {
  if (validateStep1()) {
    // Upload photo to OSS before proceeding to step 2
    if (uploadedPhotoFile.value) {
      try {
        isLoading.value = true;
        loadingMessage.value = "Uploading photo...";
        const response = await uploadPhoto({ file: uploadedPhotoFile.value });
        uploadedPhotoUrl.value = response.url;
        console.log("✅ Photo uploaded to OSS:", response.url);
        goToStep(2);
      } catch (error) {
        console.error("❌ Photo upload failed:", error);
        triggerToast("Photo upload failed, please try again");
      } finally {
        isLoading.value = false;
      }
    } else {
      goToStep(2);
    }
  }
};

// Check if user is new or existing
const isNewUser = computed(() => {
  const stories = JSON.parse(localStorage.getItem("stories") || "[]");
  return stories.length === 0;
});

// DEBUG: 添加一个全局测试函数，可以在控制台调用测试按钮点击
(window as any).testCreateButton = () => {
  console.log('🧪 [TEST] ========== 手动调用创建绘本功能 ==========');
  handleCreateStory();
};

(window as any).testRegenerateButton = () => {
  console.log('🧪 [TEST] ========== 手动调用重建封面功能 ==========');
  handleRegenerateCover();
};

// Test: Verify the regenerate button click event is properly wired
(window as any).testRegenerateButtonClick = () => {
  console.log('🧪 [TEST] ========== 测试重建封面按钮点击事件 ==========');
  const btn = document.querySelector('.regenerate-button-overlay');
  console.log('🧪 [TEST] 按钮元素:', btn);
  if (btn) {
    console.log('🧪 [TEST] 按钮存在，触发点击事件');
    // 创建并分发一个点击事件
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    btn.dispatchEvent(clickEvent);
    console.log('🧪 [TEST] 点击事件已触发');
  } else {
    console.error('❌ [TEST] 按钮元素不存在');
  }
};

// Test: Verify the create button click event is properly wired
(window as any).testCreateButtonClick = () => {
  console.log('🧪 [TEST] ========== 测试创建绘本按钮点击事件 ==========');
  const btn = document.querySelector('.create-button-overlay');
  console.log('🧪 [TEST] 按钮元素:', btn);
  if (btn) {
    console.log('🧪 [TEST] 按钮存在，触发点击事件');
    // 创建并分发一个点击事件
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    btn.dispatchEvent(clickEvent);
    console.log('🧪 [TEST] 点击事件已触发');
  } else {
    console.error('❌ [TEST] 按钮元素不存在');
  }
};

(window as any).getButtonPositions = () => {
  const createBtn = document.querySelector('.create-button-overlay');
  const regenBtn = document.querySelector('.regenerate-button-overlay');
  const inputPng = document.querySelector('.input-section-png');
  const wrapper = document.querySelector('.input-section-wrapper');

  const result = {
    timestamp: new Date().toISOString(),
    wrapper: wrapper ? {
      exists: true,
      rect: wrapper.getBoundingClientRect(),
      description: '包装容器（定位基准）'
    } : { exists: false },
    createButton: createBtn ? {
      exists: true,
      rect: createBtn.getBoundingClientRect(),
      zIndex: window.getComputedStyle(createBtn).zIndex,
      pointerEvents: window.getComputedStyle(createBtn).pointerEvents,
      description: '📘 上方按钮 - 创建绘本 (handleCreateStory)',
      expectedLog: '应该看到 📘 [创建绘本] 日志'
    } : { exists: false },
    regenerateButton: regenBtn ? {
      exists: true,
      rect: regenBtn.getBoundingClientRect(),
      zIndex: window.getComputedStyle(regenBtn).zIndex,
      pointerEvents: window.getComputedStyle(regenBtn).pointerEvents,
      description: '🟢 下方按钮 - 重建封面 (handleRegenerateCover)',
      expectedLog: '应该看到 🟢 [重建封面] 日志'
    } : { exists: false },
    inputPng: inputPng ? {
      exists: true,
      rect: inputPng.getBoundingClientRect(),
    } : { exists: false },
  };

  console.table(result);
  console.log('📊 [DEBUG] 按钮位置信息：');
  if (result.wrapper.exists) {
    console.log(`  📦 Wrapper容器: top=${Math.round(result.wrapper.rect.top)}, bottom=${Math.round(result.wrapper.rect.bottom)}, height=${Math.round(result.wrapper.rect.height)}`);
  }
  console.log(`  📘 创建绘本按钮（上方）: top=${Math.round(result.createButton.rect?.top)}, bottom=${Math.round(result.createButton.rect?.bottom)}`);
  console.log(`  🟢 重建封面按钮（下方）: top=${Math.round(result.regenerateButton.rect?.top)}, bottom=${Math.round(result.regenerateButton.rect?.bottom)}`);
  console.log('');
  console.log('💡 [提示] 在控制台输入以下命令来测试：');
  console.log('  window.testCreateButton()        - 直接测试创建绘本功能');
  console.log('  window.testCreateButtonClick()   - 模拟点击创建绘本按钮');
  console.log('  window.testRegenerateButton()    - 直接测试重建封面功能');
  console.log('  window.testRegenerateButtonClick() - 模拟点击重建封面按钮');
  console.log('  window.debugButtons = true        - 开启调试模式（显示按钮区域）');
  console.log('  window.getButtonPositions()      - 获取按钮位置信息');
  console.log('');
  console.log('🎨 [提示] 调试模式颜色：');
  console.log('  🔵 蓝色边框 = 创建绘本按钮（上方）');
  console.log('  🟢 绿色边框 = 重建封面按钮（下方）');

  return result;
};

// 添加快捷命令：在控制台输入 'debug' 可以快速查看所有调试信息
(window as any).debug = () => {
  console.log('🐛 [DEBUG] ========== BrushBuddy H5 调试工具 ==========');
  console.log('');
  console.log('📋 可用命令：');
  console.log('  📘 window.testCreateButton()        - 直接测试创建绘本功能');
  console.log('  📘 window.testCreateButtonClick()   - 模拟点击创建绘本按钮');
  console.log('  🟢 window.testRegenerateButton()    - 直接测试重建封面功能');
  console.log('  🟢 window.testRegenerateButtonClick() - 模拟点击重建封面按钮');
  console.log('  📊 window.getButtonPositions()      - 获取按钮位置信息');
  console.log('  🎨 window.debugButtons = true       - 开启调试模式（显示按钮区域）');
  console.log('');
  console.log('📊 当前状态：');
  console.log('  task_id:', task_id.value);
  console.log('  isLoading:', isLoading.value);
  console.log('  userStoryCount:', userStoryCount.value);
  console.log('  dailyRegenCount:', dailyRegenCount.value);
  console.log('  checkDailyRegenLimit():', checkDailyRegenLimit());
  console.log('');
  console.log('🎨 按钮功能：');
  console.log('  📘 上方按钮（蓝色边框）= 创建绘本 → 应看到 📘 [创建绘本] 日志');
  console.log('  🟢 下方按钮（绿色边框）= 重建封面 → 应看到 🟢 [重建封面] 日志');
  console.log('  ==========================================');
};

// Helper functions
const getGenderLabel = (gender: string) => {
  return genderOptions[gender as keyof typeof genderOptions] || "Unknown";
};

const getAgeLabel = (age: number) => {
  return age === 1 ? "1 year old" : `${age} years old`;
};

const focusNickname = () => {
  nextTick(() => {
    nicknameInputRef.value?.focus();
  });
};

const toggleGenderDropdown = () => {
  showGenderDropdown.value = !showGenderDropdown.value;
  showAgeDropdown.value = false;
};

const toggleAgeDropdown = () => {
  showAgeDropdown.value = !showAgeDropdown.value;
  showGenderDropdown.value = false;
};

const selectGender = (key: string) => {
  childGender.value = key as any;
  showGenderDropdown.value = false;
  saveData();
};

const selectAge = (age: number) => {
  childAge.value = age;
  showAgeDropdown.value = false;
  saveData();
};

// Close dropdowns when clicking outside
const handleGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".input-group")) {
    showGenderDropdown.value = false;
    showAgeDropdown.value = false;
  }
};



onMounted(() => {
  // Load user stats
  userStoryCount.value = parseInt(localStorage.getItem("userStoryCount") || "0");
  checkDailyRegenLimit();

  // Load saved data (excluding photo)
  const savedData = localStorage.getItem("createStoryData");

  if (savedData) {
    const data = JSON.parse(savedData);
    nickname.value = data.nickname || "";
    // Force default to "male" if saved value is "prefer_not_to_say"
    childGender.value = (data.childGender && data.childGender !== "prefer_not_to_say") ? data.childGender : "male";
    childAge.value = data.childAge || "";
    selectedTheme.value = data.selectedTheme || null;
    isPublic.value = data.isPublic || false;
  }

  // Set initial step from route query, default to 1
  const currentStepQuery = route.query.step as string;
  currentStep.value = currentStepQuery ? parseInt(currentStepQuery) : 1;

  // Only update route if step is not already set correctly
  if (!currentStepQuery || currentStepQuery !== '1') {
    router.replace({ query: { step: '1' } });
  }

  // Add global click listener for closing dropdowns
  document.addEventListener("click", handleGlobalClick);

  // DEBUG: 初始化时输出按钮信息
  nextTick(() => {
    const createBtn = document.querySelector('.create-button-overlay');
    const regenBtn = document.querySelector('.regenerate-button-overlay');
    console.log('🔍 [INIT] Step 3 按钮元素检查:', {
      createButton: createBtn ? '✅ 存在' : '❌ 不存在',
      regenerateButton: regenBtn ? '✅ 存在' : '❌ 不存在',
    });

    if (createBtn && regenBtn) {
      const createRect = createBtn.getBoundingClientRect();
      const regenRect = regenBtn.getBoundingClientRect();
      console.log('📐 [INIT] 按钮位置:', {
        createButton: {
          top: Math.round(createRect.top),
          bottom: Math.round(createRect.bottom),
          height: Math.round(createRect.height),
          description: '📘 上方按钮 - 创建绘本 (handleCreateStory)'
        },
        regenerateButton: {
          top: Math.round(regenRect.top),
          bottom: Math.round(regenRect.bottom),
          height: Math.round(regenRect.height),
          description: '🟢 下方按钮 - 重建封面 (handleRegenerateCover)'
        }
      });
      console.log('');
      console.log('💡 [提示] 在控制台输入 debug() 查看所有调试命令');
      console.log('🎨 [提示] 设置 window.debugButtons = true 可显示按钮区域');

      // 添加额外的事件监听器用于调试
      if (process.env.NODE_ENV === 'development') {
        createBtn.addEventListener('click', () => {
          console.log('📘 [EVENT] 创建绘本按钮点击事件被触发');
        }, true); // 使用捕获阶段

        regenBtn.addEventListener('click', () => {
          console.log('🟢 [EVENT] 重建封面按钮点击事件被触发');
        }, true); // 使用捕获阶段

        // 添加触摸事件监听器
        regenBtn.addEventListener('touchend', (e) => {
          console.log('🟢 [EVENT] 重建封面按钮 touchend 事件被触发', e);
        }, true);

        createBtn.addEventListener('touchend', (e) => {
          console.log('📘 [EVENT] 创建绘本按钮 touchend 事件被触发', e);
        }, true);

        console.log('✅ [INIT] 已添加按钮事件监听器（开发模式）');
      }
    }
  });
});

// Watch for route query changes to sync step
watch(() => route.query.step, (newStep, oldStep) => {
  // Skip if step hasn't changed
  if (newStep === oldStep) return;

  if (newStep && typeof newStep === 'string') {
    const stepNum = parseInt(newStep);
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 3) {
      // Use nextTick to avoid recursive updates
      nextTick(() => {
        currentStep.value = stepNum;
      });
    }
  }
}, { immediate: false });

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick);
});

const goBack = () => {
  if (currentStep.value > 1) {
    if (isNewUser.value) {
      currentStep.value--;
    } else {
      if (currentStep.value === 2) {
        currentStep.value = 1;
      }
    }
  } else {
    if (window.history.state && window.history.state.back) {
      router.back();
    } else {
      router.push("/");
    }
  }
};

const goToPreviewBack = () => {
  currentStep.value = 2;
};

const goToStep = (step: number) => {
  // Check if we're already on this step to avoid unnecessary route updates
  const currentStepQuery = route.query.step as string;
  if (currentStepQuery === step.toString()) {
    // Already on this step, just update currentStep directly
    currentStep.value = step;
    saveData();
    return;
  }

  // Update route query - watch will sync currentStep automatically
  router.replace({
    query: { step: step.toString() }
  });
  saveData();
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image size cannot exceed 5MB");
      return;
    }

    // Save the original file for upload
    uploadedPhotoFile.value = file;

    const reader = new FileReader();

    reader.onload = (e) => {
      uploadedPhoto.value = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  }
};

const deletePhoto = () => {
  uploadedPhoto.value = null;
  uploadedPhotoFile.value = null;
};

const selectTheme = (themeId: number) => {
  selectedTheme.value = themeId;
};

// Watch for theme changes to persist data
watch(selectedTheme, () => {
  saveData();
});

// DEBUG: 可以在控制台设置 window.debugButtons = true 来显示按钮区域
(window as any).debugButtons = false;
// DEBUG: 也可以设置 window.debugMode = true 来显示按钮标签
(window as any).debugMode = false;
watch(() => (window as any).debugButtons, (newValue) => {
  debugMode.value = newValue;
  console.log('🎨 [DEBUG] 调试模式:', newValue ? '开启' : '关闭');
});

// Handle theme image load errors
const handleImageError = (e: Event, themeId: number) => {
  console.error(`Failed to load theme image for theme ${themeId}:`, e);
  // You could add a fallback image here
};

// Step 2 Next button handler
const handleNextStep2 = async () => {
  if (!selectedTheme.value) {
    triggerToast("Please select a theme");
    return;
  }
  await createVideoTasksAPI();
  goToStep(3);
  await pollUntilTrue_getTaskStatusAPI();
};

const saveData = () => {
  const data = {
    nickname: nickname.value,
    childGender: childGender.value,
    childAge: childAge.value,
    selectedTheme: selectedTheme.value,
    isPublic: isPublic.value,
  };
  localStorage.setItem("createStoryData", JSON.stringify(data));
};

const togglePublic = () => {
  isPublic.value = !isPublic.value;
  saveData();
};

const getThemeName = (id: number) => {
  return THEMES.find(t => t.id === id)?.name || '';
};

// Theme mapping for Chinese API
const getThemeNameChinese = (id: number) => {
  return THEMES.find(t => t.id === id)?.nameCn || '';
};

// Gender mapping for Chinese API
const getGenderChinese = (gender: string) => {
  const mapping = {
    male: "男",
    female: "女",
    prefer_not_to_say: "保密",
  };
  return mapping[gender as keyof typeof mapping] || "保密";
};

const handleConfirmCoverAndGenerateVideo = async () => {
  console.log('📘 [创建绘本] ========== 开始创建绘本故事 ==========');
  console.log('📘 [创建绘本] 功能: 确认封面并生成视频');
  console.log('📘 [创建绘本] 当前状态:');
  console.log('  - task_id:', task_id.value);
  console.log('  - userStoryCount:', userStoryCount.value);
  console.log('  - isPublic:', isPublic.value);
  console.log('  - isLoading:', isLoading.value);
  console.log('  - nickname:', nickname.value);
  console.log('  - selectedTheme:', selectedTheme.value);

  if (userStoryCount.value >= 100) {
    console.log('📘 [创建绘本] 用户已生成100+个故事，跳转到支付页面');
    router.push("/payment");
    return;
  }

  // Check if task exists - if not, guide user back to step 2
  if (!task_id.value) {
    console.log('❌ [创建绘本] task_id 不存在，引导用户返回第二步');
    triggerToast("请先返回第二步生成封面");
    currentStep.value = 2;
    router.push({ query: { step: '2' } });
    return;
  }

  console.log('✅ [创建绘本] task_id 有效，开始确认任务并生成视频...');
  isLoading.value = true;
  loadingMessage.value = "Magic is happening ✨\nYour story will be ready soon...";

  try {
    console.log('📘 [创建绘本] 调用 confirmTask API...');
    // Confirm the cover and trigger video generation
    await confirmTask({
      task_id: task_id.value,
      confirm: true,
      is_shared: isPublic.value,
    });
    console.log('✅ [创建绘本] 封面已确认');

    console.log('📘 [创建绘本] 开始轮询视频生成状态...');
    // Wait for video generation to complete before navigating
    await pollForVideoGeneration();

    console.log('✅ [创建绘本] 视频生成完成');
    userStoryCount.value++;
    localStorage.setItem("userStoryCount", userStoryCount.value.toString());

    console.log('📘 [创建绘本] 保存故事到 store...');
    userStore.addStory({
      title: `${nickname.value || "Hero"}'s ${getThemeName(selectedTheme.value || 2)} Story`,
      characterName: nickname.value || "Hero",
      coverImage: resImgUrl.value || uploadedPhotoUrl.value,
      theme: getThemeName(selectedTheme.value || 2),
      isPublic: isPublic.value,
    });

    console.log('📘 [创建绘本] 导航到视频播放页面...');
    // Navigate to video player with task_id only after video is ready
    router.push({
      path: "/brushing",
      query: {
        taskId: task_id.value,
        source: "create",
        userName: nickname.value || ""
      }
    });
  } catch (error: any) {
    console.error('❌ [创建绘本] 创建失败:', error);

    // Handle 409 Conflict - task may already be confirmed/processed
    if (error.response?.status === 409) {
      console.log('⚠️ [创建绘本] 任务已被处理 (409)，检查任务状态...');
      try {
        // Check task status first
        const status = await getTaskStatus(task_id.value);
        console.log('📋 [创建绘本] 任务状态:', status);

        if (status.status === 'completed' && status.video_url) {
          // Video is ready, proceed
          console.log('✅ [创建绘本] 视频已就绪，继续导航');
          userStoryCount.value++;
          localStorage.setItem("userStoryCount", userStoryCount.value.toString());
          userStore.addStory({
            title: `${nickname.value || "Hero"}'s ${getThemeName(selectedTheme.value || 2)} Story`,
            characterName: nickname.value || "Hero",
            coverImage: resImgUrl.value || uploadedPhotoUrl.value,
            theme: getThemeName(selectedTheme.value || 2),
            isPublic: isPublic.value,
          });
          router.push({
            path: "/brushing",
            query: {
              taskId: task_id.value,
              source: "create",
              userName: nickname.value || ""
            }
          });
          return;
        } else if (status.status === 'video_generating' || status.status === 'processing' || status.status === 'pending' || status.status === 'awaiting_confirmation') {
          // Task still processing - poll for completion
          console.log('⏳ [创建绘本] 任务仍在处理中，继续轮询...');
          triggerToast("视频生成中，请稍候...");
          try {
            await pollForVideoGeneration();
            console.log('✅ [创建绘本] 轮询完成，视频已就绪');
            userStoryCount.value++;
            localStorage.setItem("userStoryCount", userStoryCount.value.toString());
            userStore.addStory({
              title: `${nickname.value || "Hero"}'s ${getThemeName(selectedTheme.value || 2)} Story`,
              characterName: nickname.value || "Hero",
              coverImage: resImgUrl.value || uploadedPhotoUrl.value,
              theme: getThemeName(selectedTheme.value || 2),
              isPublic: isPublic.value,
            });
            router.push({
              path: "/brushing",
              query: {
                taskId: task_id.value,
                source: "create",
                userName: nickname.value || ""
              }
            });
            return;
          } catch (pollError: any) {
            console.error('❌ [创建绘本] 轮询失败:', pollError);
            // Keep task_id so user can retry
            triggerToast("视频生成中，请稍后再试");
            isLoading.value = false;
            return;
          }
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          // Task failed or cancelled - need new task
          console.log('❌ [创建绘本] 任务失败或取消，状态:', status.status);
          task_id.value = '';
          triggerToast("任务失败，请重新生成绘本");
          isLoading.value = false;
          return;
        } else {
          // Unknown status - might be recoverable, keep task_id
          console.log('⚠️ [创建绘本] 未知状态:', status.status + '，保留 task_id');
          triggerToast("任务处理中，请稍后再试");
          isLoading.value = false;
          return;
        }
      } catch (pollError: any) {
        console.error('❌ [创建绘本] 获取任务状态失败:', pollError);
        // Keep task_id - might be a temporary issue
        triggerToast("请稍后再试");
        isLoading.value = false;
        return;
      }
    }

    // Handle other errors
    let errorMessage = "创建失败，请重试";
    let shouldClearTaskId = false;

    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((e: any) => e.msg).join(', ');
      }
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
      // Check if it's a timeout error - don't clear task_id
      if (error.message.includes('超时') || error.message.includes('timeout')) {
        shouldClearTaskId = false;
        console.log('⏰ 超时错误，保留 task_id 供稍后重试');
      } else if (error.message.includes('失败') || error.message.includes('failed')) {
        // Task failed - clear task_id
        shouldClearTaskId = true;
      }
    }

    // Only clear task_id for permanent failures
    if (shouldClearTaskId) {
      task_id.value = '';
      console.log('🗑️ 清除 task_id，需要重新创建任务');
    } else {
      console.log('✅ 保留 task_id，用户可以稍后重试');
    }

    triggerToast(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// Alias for handleCreateStory to match the event handler names
const handleCreateStory = handleConfirmCoverAndGenerateVideo;

// Poll for video generation completion
const pollForVideoGeneration = async () => {
  console.log("开始轮询视频生成, task_id:", task_id.value);

  const maxAttempts = 60; // 60 * 5 seconds = 5 minutes
  const interval = 5000; // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await getTaskStatus(task_id.value!);
      console.log(`轮询 ${i + 1}: status = ${response.status}, video_url = ${response.video_url || 'null'}`);

      if (response.status === 'completed' && response.video_url) {
        console.log('视频生成成功:', response.video_url);
        return;
      }

      if (response.status === 'failed' || response.status === 'cancelled') {
        throw new Error(response.error_message || '视频生成失败');
      }

      // For processing states, continue polling
      // video_generating, processing, pending, awaiting_confirmation

    } catch (error: any) {
      console.error(`轮询 ${i + 1} 出错:`, error?.message || error);

      // Only throw on fatal errors that won't recover
      if (error?.response?.status === 404) {
        // Task not found - fatal
        throw error;
      }
      // For timeout/network errors, continue polling
      // For 409, continue polling (task might still be processing)
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Timeout - but task might still be processing in background
  // Don't throw error, just log and let user retry later
  console.warn('⏰ 轮询超时，但任务可能仍在后台处理');
  throw new Error('视频生成超时，请稍后再试');
};

const checkDailyRegenLimit = (): boolean => {
  // TEMPORARY: Always return true for testing
  console.log('🟢 [DEBUG] checkDailyRegenLimit() - BYPASSING DAILY LIMIT FOR TESTING');
  return true;

  /* Original code - will restore after testing
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("regenDate");
  const savedCount = localStorage.getItem("dailyRegenCount");

  if (savedDate === today) {
    dailyRegenCount.value = parseInt(savedCount || "0");
  } else {
    dailyRegenCount.value = 0;
    localStorage.setItem("regenDate", today);
    localStorage.setItem("dailyRegenCount", "0");
  }

  return dailyRegenCount.value < 100;  // Increased to 100 for testing
  */
};

const handleRegenerateCover = async () => {
  console.log('🟢 [重建封面] ========== 开始重新生成封面 ==========');
  console.log('🟢 [重建封面] 功能: 重新生成封面图片');
  console.log('🟢 [重建封面] 当前状态:');
  console.log('  - task_id:', task_id.value);
  console.log('  - dailyRegenCount:', dailyRegenCount.value);
  console.log('  - isLoading:', isLoading.value);
  console.log('  - 当前时间:', new Date().toISOString());
  console.log('🟢 [重建封面] 检查是否可以重建...');

  try {
    // Check daily limit
    if (!checkDailyRegenLimit()) {
      console.log('❌ [重建封面] 超过每日重建限制');
      triggerToast("Daily regeneration limit reached. Try again tomorrow!");
      return;
    }

    console.log('✅ [重建封面] 每日限制检查通过，开始重建封面...');
    console.log('🟢 [重建封面] 调用 updatePreviewImage(true)...');

    await updatePreviewImage(true);

    console.log('✅ [重建封面] updatePreviewImage(true) 调用成功');
    dailyRegenCount.value++;
    localStorage.setItem("dailyRegenCount", dailyRegenCount.value.toString());
    localStorage.setItem("regenDate", new Date().toDateString());

    console.log('✅ [重建封面] 重建封面成功完成！');
    console.log('🟢 [重建封面] ========== 重建封面流程结束 ==========');
  } catch (error: any) {
    console.error('❌ [重建封面] 重建失败:', error);
    console.error('❌ [重建封面] 错误详情:');
    console.error('  - 错误类型:', error?.constructor?.name);
    console.error('  - 错误消息:', error?.message);
    console.error('  - 错误堆栈:', error?.stack);

    // Extract error message from API response
    let errorMessage = "重建失败，请重新尝试";
    if (error?.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((e: any) => e.msg).join(', ');
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    triggerToast(errorMessage);
  }
};

const createVideoTasksAPI = async () => {
  try {
    isLoading.value = true;
    loadingMessage.value = "Creating task...";
    loadingMessage.value = "Saving form...";
    const obj = {
      img_url: uploadedPhotoUrl.value,
      child_name: nickname.value,
      age: childAge.value,
      theme: getThemeNameChinese(selectedTheme.value),
      gender: getGenderChinese(childGender.value), // 中文 "男" | "女"
    };
    console.log("创建任务，参数:", obj);
    const response = await createTask(obj);
    console.log("创建任务成功，响应:", response);
    task_id.value = response.task_id;  // video API returns unwrapped data
    console.log("设置 task_id:", task_id.value);
  } catch (e) {
    console.log("创建任务失败:", e);
    throw e;
  } finally {
    isLoading.value = false;
  }
};

// 轮询获取任务状态
const storySuccessMap = ["story_generated"];  // Story generation done
const coverSuccessMap = ["cover_ready", "completed"];  // Cover generation done
const errorMap = ["failed", "cancelled"];
const getStatusMessage = (status: string) => {
  const messages: Record<string, string> = {
    "story_generating": "Creating story...",
    "story_generated": "Story created, generating cover...",
    "cover_generating": "Generating cover...",
    "cover_ready": "Cover ready",
    "awaiting_confirmation": "Awaiting cover confirmation...",
    "video_generating": "Creating video...",
    "completed": "Completed",
  };
  return messages[status] || "Processing...";
};
const getTaskStatusAPI = async (targetSuccessMap: string[]) => {
  console.log(`轮询第: 调用 getTaskStatus, task_id: ${task_id.value}`);
  const response = await getTaskStatus(task_id.value!);
  console.log(`轮询第: 响应 status: ${response.status}, cover_image_url: ${response.cover_image_url}`);
  const status = response.status;  // video API returns unwrapped data
  task_status.value = status;
  // Update loading message based on status
  loadingMessage.value = getStatusMessage(status);
  if (targetSuccessMap.includes(status)) {
    return { status: "success", data: response };
  }
  if (errorMap.includes(status)) {
    return { status: "error", data: response };
  }
  return { status: "pending", data: response };
};
const pollUntilTrue_getTaskStatusAPI = async () => {
  try {
    isLoading.value = true;
    loadingMessage.value = "Processing...";
    console.log("开始轮询任务状态, task_id:", task_id.value);

    // Phase 1: Poll until story is generated
    console.log("阶段1: 轮询故事生成...");
    const storyResult = await pollUntilTrue<TaskStatusResponse>(
      () => getTaskStatusAPI(storySuccessMap),
      3000,
      999
    );
    console.log("故事生成完成，触发封面生成");

    // Phase 2: Trigger cover generation
    console.log("阶段2: 触发封面生成API...");
    const coverResponse = await generateCover({ task_id: task_id.value!, regenerate: false });
    console.log("封面生成API响应:", coverResponse);

    // Phase 3: Poll until cover is ready
    console.log("阶段3: 轮询封面生成...");
    const coverResult = await pollUntilTrue<TaskStatusResponse>(
      () => getTaskStatusAPI(coverSuccessMap),
      3000,
      999
    );
    console.log("封面生成完成，结果:", coverResult);

    // Extract cover_image_url from the successful response
    if (coverResult.cover_image_url) {
      resImgUrl.value = coverResult.cover_image_url;
      console.log("设置封面图片URL:", coverResult.cover_image_url);
    } else {
      console.warn("轮询成功但未找到 cover_image_url，结果:", coverResult);
    }
  } catch (e) {
    console.log("轮询发生错误:", e);

    // Get the final task status to show the actual error message
    try {
      const finalStatus = await getTaskStatus(task_id.value!);
      const errorMsg = finalStatus.error_message || e?.message || "Task timed out, please try again";
      console.log("Task failed, error:", errorMsg);
      triggerToast(`Generation failed: ${errorMsg}`);
    } catch {
      triggerToast("Task timed out, please try again");
    }
    throw e;
  } finally {
    isLoading.value = false;
  }
};

const updatePreviewImage = async (regenerate = false) => {
  try {
    isLoading.value = true;

    // Check current task status before regenerating
    if (regenerate) {
      const currentStatus = await getTaskStatus(task_id.value!);
      console.log("Current task status before regenerate:", currentStatus.status);

      // Only allow regeneration from specific states
      const validRegenStates = ["cover_ready", "awaiting_confirmation"];
      if (!validRegenStates.includes(currentStatus.status)) {
        triggerToast(`Cannot regenerate cover, current status: ${currentStatus.status}`);
        return;
      }
    }

    loadingMessage.value = regenerate ? "Regenerating cover..." : "Generating cover...";
    const obj = {
      regenerate,
      task_id: task_id.value,
    };

    const response = await generateCover(obj);
    console.log("generateCover response:", response);

    // If regenerating, we need to poll for the new cover to be ready
    if (regenerate) {
      console.log("Starting to poll for regenerated cover...");
      loadingMessage.value = "Generating new cover...";

      const coverResult = await pollUntilTrue<TaskStatusResponse>(
        () => getTaskStatusAPI(coverSuccessMap),
        3000,
        999
      );

      if (coverResult.cover_image_url) {
        resImgUrl.value = coverResult.cover_image_url;
        console.log("Regenerated cover ready:", coverResult.cover_image_url);
      } else {
        throw new Error("封面生成完成但未获取到URL");
      }
    } else {
      // For initial cover generation, use the response directly
      resImgUrl.value = response.cover_image_url;
    }
  } catch (e: any) {
    console.error("updatePreviewImage error:", e);

    // Extract error message
    let errorMessage = "Generation failed, please try again";
    if (e?.response?.data?.detail) {
      if (typeof e.response.data.detail === 'string') {
        errorMessage = e.response.data.detail;
      } else if (Array.isArray(e.response.data.detail)) {
        errorMessage = e.response.data.detail.map((err: any) => err.msg).join(', ');
      }
    } else if (e?.message) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }

    triggerToast(errorMessage);
    throw e;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.create-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  max-width: 390px;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== STEP 1 STYLES ========== */
.step-1 {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Main Content - adjusted for global nav */
.main-content {
  position: absolute;
  left: 24px;
  top: 70px;
  width: 343px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Upload Section */
.upload-section {
  position: relative;
  width: 342px;
  height: 135px;
}

.upload-label {
  display: block;
}

.upload-area {
  position: absolute;
  width: 80px;
  height: 80px;
  left: 0;
  top: 47px;
  background: transparent;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  width: 28px;
  height: 28px;
  position: relative;
  opacity: 0.8;
}

.plus-icon::before,
.plus-icon::after {
  content: "";
  position: absolute;
  background: #101010;
  border-radius: 2px;
}

.plus-icon::before {
  width: 2px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.plus-icon::after {
  width: 100%;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
}

.uploaded-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: 43px;
  left: 68px;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.delete-x {
  font-size: 18px;
  color: #ff6b6b;
  font-weight: bold;
  line-height: 1;
}

/* Input Groups */
.input-group {
  position: relative;
  width: 343px;
}

.input-label {
  display: block;
  margin-bottom: 10px;
}

.input-box,
.select-box {
  width: 343px;
  height: 54px;
  background: #ffffff;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: text;
}

.select-box {
  cursor: pointer;
  justify-content: space-between;
}

.text-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.text-input::placeholder {
  color: #8e8e9d;
}

.select-text {
  font-size: 14px;
  color: #333;
}

.select-arrow {
  font-size: 12px;
  color: #3a4750;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 343px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.dropdown-menu-age {
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

/* Next Button */
.next-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  width: 342px;
  height: 48px;
  cursor: pointer;
  z-index: 10;
}

/* ========== STEP 2 STYLES (PNG + CSS) ========== */
.step-2-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

/* Theme scroll area */
.theme-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 24px 0 24px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.theme-scroll-area::-webkit-scrollbar {
  display: none;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.theme-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 68px;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.theme-option.selected {
  border: 1px solid #1484FF;
  box-shadow: 0 0 0 1px #1484FF;
}

.theme-option:active {
  transform: scale(0.98);
  background: #F8F8F8;
}

.theme-image {
  width: 44px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

.theme-name {
  flex: 1;
  font-family: 'PingFang SC';
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  white-space: nowrap;
}

.selected-marker {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Skeleton loader for theme images */
.skeleton-loader {
  width: 44px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Next button area (fixed bottom) */
.next-button-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
  background: linear-gradient(to top, #FFFFFF 80%, transparent);
  z-index: 10;
}

/* ========== STEP 3 STYLES (SVG) - DEPRECATED ========== */
.full-screen-svg {
  width: 390px;
  height: 844px;
  flex-shrink: 0;
}

.step-new-2-svg,
.step-preview-svg {
  width: 390px;
  height: 844px;
  display: block;
}

/* ========== COMMON ========== */
.hidden {
  display: none;
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

.loading-content p {
  white-space: pre-line;
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

/* ========== STEP 3 STYLES (Preview - Flexbox 自适应布局) ========== */
.step-3 {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Preview Background Image - 作为背景，不占据flex空间 */
.preview-background-image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  pointer-events: none;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Step 3 Controls Container - 占据剩余空间并让内容自然推到底部 */
.step-3-controls {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 16px 24px max(40px, env(safe-area-inset-bottom, 40px)) 24px;
  box-sizing: border-box;
  flex-shrink: 0;
  z-index: 5;
  gap: 12px;
  pointer-events: none;
}

.step-3-controls > * {
  pointer-events: auto;
}

/* Input Section Wrapper - 包装输入框PNG和按钮overlay */
.input-section-wrapper {
  position: relative;
  width: 342px;
  height: 188px;
  flex-shrink: 0;
}

/* Input Section PNG - 作为最底层的视觉元素 */
.input-section-png {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: block;
  z-index: 1;
}

/* Button Overlays Container - 包含两个可点击按钮区域，使用absolute定位相对于wrapper */
.button-overlays {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* Regenerate Button Overlay - 下方白色按钮：重建封面 */
.regenerate-button-overlay {
  position: absolute;
  width: 280px;
  height: 44px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 11;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
}

.regenerate-button-overlay:hover {
  opacity: 0.9;
}

/* Create Button Overlay - 上方蓝色按钮：创建绘本 */
.create-button-overlay {
  position: absolute;
  width: 280px;
  height: 44px;
  cursor: pointer;
  pointer-events: auto;
  z-index: 11;
  bottom: 36%;
  left: 50%;
  transform: translateX(-50%);
}

.create-button-overlay:hover {
  opacity: 0.9;
}

/* Debug Label - 在调试模式下显示按钮功能 */
.debug-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #000;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1002;
}

/* Public Toggle - 在控制区顶部 */
.public-toggle-main {
  position: relative;
  width: 342px;
  height: 52px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 1.27226px 15.2672px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  gap: 23px;
  box-sizing: border-box;
  z-index: 10;
  flex-shrink: 0;
}

/* Public Toggle Label */
.public-toggle-label {
  flex: none;
  order: 0;
  width: 228px;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #222222;
  align-self: center;
}

/* Public Toggle Switch - 默认灰色，激活时蓝色 */
.public-toggle-switch {
  position: relative;
  flex: none;
  order: 1;
  width: 51px;
  height: 28px;
  background: #b4b4b4;
  border-radius: 100px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.public-toggle-switch.active {
  background: #1484ff;
}

/* Public Toggle Knob - 未激活在左边，激活滑到右边 */
.public-toggle-knob {
  position: absolute;
  width: 24px;
  height: 24px;
  left: 2px;
  top: calc(50% - 24px / 2);
  background: #ffffff;
  border-radius: 100px;
  transition: left 0.3s ease;
}

.public-toggle-switch.active .public-toggle-knob {
  left: 27px;
}

/* ========== RESPONSIVE DESIGN ========== */

/* Extra small devices - 压缩间距 */
@media (max-height: 700px) {
  .step-3-controls {
    padding-top: 8px;
    padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
  }

  .public-toggle-main {
    margin-bottom: 4px;
  }
}

/* iPhone SE and similar small screens (667px) */
@media (max-height: 667px) {
  .step-3-controls {
    padding-top: 4px;
    padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
  }

  .public-toggle-main {
    margin-bottom: 2px;
    height: 48px;
    padding: 8px 16px;
  }

  .public-toggle-label {
    font-size: 13px;
    width: 200px;
    height: 18px;
  }

  .public-toggle-switch {
    width: 44px;
    height: 24px;
  }

  .public-toggle-knob {
    width: 20px;
    height: 20px;
    top: calc(50% - 20px / 2);
  }

  .public-toggle-switch.active .public-toggle-knob {
    left: 22px;
  }
}

/* Landscape orientation - 提示旋转 */
@media (orientation: landscape) and (max-height: 500px) {
  .step-3::before {
    content: "Please rotate your device to portrait mode";
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    z-index: 100;
  }
}
</style>

