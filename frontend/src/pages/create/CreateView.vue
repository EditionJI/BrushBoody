<template>
  <div class="create-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <!-- ========== STEP 1: Upload Info (New Design) ========== -->
      <div v-if="currentStep === 1" class="step-1">
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

        <!-- Top Navigation (54px) -->
        <div class="top-nav">
          <img src="/images/创建页/返回.png" alt="Back" class="back-button" @click="goBack" />
          <img src="/images/创建页/Create a story.png" alt="Create a story" class="title-image" />
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
          <!-- Upload Section -->
          <div class="upload-section">
            <div class="upload-labels">
              <img src="/images/创建页/上传.png" alt="Upload your kid's photo" class="upload-label" />
            </div>
            <div class="upload-area" @click="triggerUpload">
              <div v-if="!uploadedPhoto" class="upload-placeholder">
                <div class="plus-icon"></div>
              </div>
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

        <!-- Home Indicator -->
        <div class="home-indicator"></div>
      </div>

      <!-- ========== STEP 2: Select Theme (Keep SVG for now) ========== -->
      <div v-if="currentStep === 2" class="step-2">
        <object
          data="/SVG/create-new-2.svg"
          type="image/svg+xml"
          class="full-screen-svg step-new-2-svg"
          @load="onNewStep2SvgLoad"
        ></object>
      </div>

      <!-- ========== STEP 3: AI Preview (New Design) ========== -->
      <div v-if="currentStep === 3" class="step-3">
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

        <!-- Top Navigation (54px) -->
        <div class="top-nav">
          <img src="/images/创建页/创建页第3步-返回.png" alt="Back" class="back-button" @click="goToPreviewBack" />
          <img src="/images/创建页/Create a story.png" alt="Create a story" class="title-image" />
        </div>

        <!-- Preview Image Area - Full Screen -->
        <div class="preview-image-container">
          <img v-if="resImgUrl" :src="resImgUrl" alt="Preview" class="preview-image" />
          <img v-else src="/images/首页/背景.png" alt="Placeholder" class="preview-placeholder" />
          <!-- <img src="/images/创建页/Mask group.png" alt="Mask" class="preview-mask" /> -->
        </div>

        <!-- Input Section PNG (Question + Two Buttons) -->
        <img src="/images/创建页/输入框1.png" alt="Input section" class="input-section-png" />

        <!-- Clickable overlays for buttons -->
        <div class="create-button-overlay" @click="handleConfirm"></div>
        <div class="regenerate-button-overlay" @click="handleRegenerateCover"></div>

        <!-- Public Toggle (主按钮) - Separate element with text and toggle -->
        <div class="public-toggle-main">
          <span class="public-toggle-label">Public: Others can read this book.</span>
          <div class="public-toggle-switch" :class="{ active: isPublic }" @click="togglePublic">
            <div class="public-toggle-knob"></div>
          </div>
        </div>

        <!-- Home Indicator -->
        <div class="home-indicator"></div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { uploadPhoto } from "@/api/upload";
import { createTask, getTaskStatus, generateCover, confirmTask } from "@/api/video";
import type { TaskStatus, TaskStatusResponse } from "@/api/video";
import { useUserStore } from "../../stores/user";
import { pollUntilTrue } from "@/utils";

const router = useRouter();
const userStore = useUserStore();

const wrapperRef = ref<HTMLElement | null>(null);

// State
const isLoading = ref(false);
const loadingMessage = ref("Creating magic...");
const currentStep = ref(1);
const fileInput = ref<HTMLInputElement | null>(null);
const nicknameInputRef = ref<HTMLInputElement | null>(null);

// SVG document references (for Step 2 & 3)
let newStep2SvgDoc: Document | null = null;
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
    triggerToast("请上传宝宝的照片");
    return false;
  }
  if (!nickname.value.trim()) {
    triggerToast("请输入宝宝的昵称");
    return false;
  }
  if (!childGender.value) {
    triggerToast("请选择宝宝的性别");
    return false;
  }
  if (!childAge.value) {
    triggerToast("请选择宝宝的年龄");
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

// ========== SVG INTERACTIONS - Step 2 (Theme Selection) ==========
const onNewStep2SvgLoad = () => {
  console.log("=== create-new-2.svg loaded ===");

  const objectEl = document.querySelector(".step-new-2-svg") as HTMLObjectElement;
  if (!objectEl) {
    console.error("SVG object element not found for create-new-2");
    return;
  }

  newStep2SvgDoc = objectEl.contentDocument;
  if (!newStep2SvgDoc) {
    console.error("Cannot access SVG document for create-new-2");
    return;
  }

  console.log("SVG loaded, setting up interactions for theme selection...");

  const svgRoot = newStep2SvgDoc.querySelector("svg");
  if (!svgRoot) {
    console.error("SVG root not found");
    return;
  }

  // 1. 返回按钮
  const backButton = newStep2SvgDoc.getElementById("back-button");
  if (backButton) {
    console.log("✅ Found back-button");
    backButton.style.cursor = "pointer";
    backButton.style.pointerEvents = "auto";
    backButton.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("🔙 Back button clicked (step 2)");
      goToStep(1);
    });
  }

  // 2. 主题选项
  for (let i = 1; i <= 4; i++) {
    const themeOption = newStep2SvgDoc.getElementById(`theme-option-${i}`) as SVGRectElement;
    if (themeOption) {
      console.log(`✅ Found theme-option-${i}`);
      themeOption.style.cursor = "pointer";
      themeOption.style.pointerEvents = "auto";

      themeOption.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log(`🎨 Theme ${i} clicked`);
        selectTheme(i);
        updateThemeSelection(newStep2SvgDoc, svgRoot, i);
      });

      if (selectedTheme.value === i) {
        updateThemeSelection(newStep2SvgDoc, svgRoot, i);
      }
    }
  }

  watch(selectedTheme, (newTheme) => {
    if (newStep2SvgDoc && svgRoot) {
      updateThemeSelection(newStep2SvgDoc, svgRoot, newTheme);
    }
  });

  // 3. Next 按钮
  const allRects = newStep2SvgDoc.querySelectorAll("rect");
  allRects.forEach((rect) => {
    const x = parseFloat(rect.getAttribute("x") || "0");
    const y = parseFloat(rect.getAttribute("y") || "0");
    const width = parseFloat(rect.getAttribute("width") || "0");
    const height = parseFloat(rect.getAttribute("height") || "0");

    if (Math.abs(x - 28) < 1 && Math.abs(y - 752) < 2 && width >= 340 && width <= 343 && height >= 47 && height <= 49) {
      rect.style.cursor = "pointer";
      rect.style.pointerEvents = "auto";
      rect.addEventListener("click", async (e) => {
        e.stopPropagation();
        console.log("➡️ Next button clicked (step 2)");

        if (!selectedTheme.value) {
          triggerToast("请选择一个主题");
          return;
        }

        // todo
        await createVideoTasksAPI();
        goToStep(3);
        await pollUntilTrue_getTaskStatusAPI();  // This now also updates resImgUrl
      });
      console.log("✅ Added click to next button rect");
    }
  });

  console.log("create-new-2.svg interactions setup complete");
};

const updateThemeSelection = (svgDoc: Document, svgRoot: SVGSVGElement, selectedId: number) => {
  for (let i = 1; i <= 4; i++) {
    const oldRadio = svgDoc.getElementById(`theme-radio-${i}`);
    oldRadio?.remove();
  }

  const themeOption = svgDoc.getElementById(`theme-option-${selectedId}`) as SVGRectElement;
  if (!themeOption) return;

  const x = parseFloat(themeOption.getAttribute("x") || "0");
  const y = parseFloat(themeOption.getAttribute("y") || "0");
  const width = parseFloat(themeOption.getAttribute("width") || "0");

  const radioGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  radioGroup.setAttribute("id", `theme-radio-${selectedId}`);

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", (x + width - 30).toString());
  circle.setAttribute("cy", (y + 34).toString());
  circle.setAttribute("r", "10");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke", "#4A90E2");
  circle.setAttribute("stroke-width", "3");

  const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  innerCircle.setAttribute("cx", (x + width - 30).toString());
  innerCircle.setAttribute("cy", (y + 34).toString());
  innerCircle.setAttribute("r", "5");
  innerCircle.setAttribute("fill", "#4A90E2");

  radioGroup.appendChild(circle);
  radioGroup.appendChild(innerCircle);
  svgRoot.appendChild(radioGroup);
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

  // Set initial step
  currentStep.value = 1;

  // Add global click listener for closing dropdowns
  document.addEventListener("click", handleGlobalClick);
});

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
  currentStep.value = step;
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
      triggerToast("图片大小不能超过5MB");
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
  const themes = ["Space Adventure", "Jungle Safari", "Ocean Explorer", "Superhero"];
  return themes[id - 1] || "Space Adventure";
};

// Theme mapping for Chinese API
const getThemeNameChinese = (id: number) => {
  const themes = ["太空冒险", "森林冒险", "海洋探险", "超级英雄"];
  return themes[id - 1] || "森林冒险";
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

const handleConfirm = async () => {
  if (userStoryCount.value >= 100) {
    console.log("User has generated 100+ stories, redirecting to payment");
    router.push("/payment");
    return;
  }

  // Check if task exists and is ready to confirm
  if (!task_id.value) {
    triggerToast("请先创建绘本任务");
    return;
  }

  isLoading.value = true;
  loadingMessage.value = "Magic is happening ✨\nYour story will be ready soon...";

  try {
    // Confirm the cover and trigger video generation
    const response = await confirmTask({
      task_id: task_id.value,
      confirm: true,
      is_shared: isPublic.value,
    });

    console.log("✅ 封面已确认:", response);

    // Wait for video generation to complete before navigating
    await pollForVideoGeneration();

    userStoryCount.value++;
    localStorage.setItem("userStoryCount", userStoryCount.value.toString());

    userStore.addStory({
      title: `${nickname.value || "Hero"}'s ${getThemeName(selectedTheme.value || 2)} Story`,
      characterName: nickname.value || "Hero",
      coverImage: resImgUrl.value || uploadedPhotoUrl.value,
      theme: getThemeName(selectedTheme.value || 2),
      isPublic: isPublic.value,
    });

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
    console.error("确认失败:", error);

    // Extract error message from response
    let errorMessage = "确认失败，请重新尝试";
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
    }

    triggerToast(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

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

      if (response.status === 'failed') {
        throw new Error(response.error_message || '视频生成失败');
      }

    } catch (error: any) {
      console.error(`轮询 ${i + 1} 出错:`, error?.message || error);

      // Only throw on fatal errors, continue polling on timeout/network errors
      if (error?.response?.status === 409 || error?.response?.status === 404) {
        // Fatal errors: task not found or conflict
        throw error;
      }
      // Continue polling for timeout/network errors
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('视频生成超时');
};

const checkDailyRegenLimit = (): boolean => {
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
};

const handleRegenerateCover = async () => {
  if (!checkDailyRegenLimit()) {
    triggerToast("今日重新生成次数已用完，明天再试");
    return;
  }

  await updatePreviewImage(true);
  dailyRegenCount.value++;
  localStorage.setItem("dailyRegenCount", dailyRegenCount.value.toString());
  localStorage.setItem("regenDate", new Date().toDateString());
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
    "story_generating": "正在生成故事...",
    "story_generated": "故事已生成，正在生成封面...",
    "cover_generating": "正在生成封面...",
    "cover_ready": "封面已就绪",
    "awaiting_confirmation": "等待确认封面...",
    "video_generating": "正在生成视频...",
    "completed": "已完成",
  };
  return messages[status] || "处理中...";
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
      const errorMsg = finalStatus.error_message || e?.message || "任务状态超时，请重新尝试";
      console.log("任务失败，错误信息:", errorMsg);
      triggerToast(`生成失败: ${errorMsg}`);
    } catch {
      triggerToast("任务状态超时，请重新尝试");
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
        triggerToast(`无法重新生成封面，当前状态: ${currentStatus.status}`);
        return;
      }
    }

    loadingMessage.value = regenerate ? "正在重新生成封面..." : "正在生成封面...";
    const obj = {
      regenerate,
      task_id: task_id.value,
    };

    const response = await generateCover(obj);
    console.log("generateCover response:", response);

    // If regenerating, we need to poll for the new cover to be ready
    if (regenerate) {
      console.log("Starting to poll for regenerated cover...");
      loadingMessage.value = "正在生成新封面...";

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
    let errorMessage = "生成失败，请重新尝试";
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
  max-height: 844px;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background: #ffffff;
}

/* ========== STEP 1 STYLES ========== */
.step-1 {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Status Bar */
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 390px;
  width: 100%;
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
  max-width: 390px;
  width: 100%;
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

.title-image {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 28px;
  width: auto;
}

/* Main Content */
.main-content {
  position: absolute;
  left: 24px;
  top: 124px;
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
  top: 55px;
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
  top: 748px;
  width: 342px;
  height: 48px;
  cursor: pointer;
  z-index: 10;
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

/* ========== STEP 2 & 3 STYLES (Keep SVG) ========== */
.full-screen-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.step-new-2-svg,
.step-preview-svg {
  max-width: 390px;
  width: 100%;
  height: 836px;
  left: 0;
  top: 4px;
  position: absolute;
  object-fit: contain;
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

/* ========== STEP 3 STYLES (Preview - New Design) ========== */
.step-3 {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Preview Image Container - Full Screen (390px × 844px) */
.preview-image-container {
  position: absolute;
  left: 0;
  top: 0;
  max-width: 390px;
  width: 100%;
  max-height: 844px;
  height: calc(var(--vh, 1vh) * 100);
  background: #eaf6ff;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.preview-image,
.preview-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Input Section PNG (Question + Two Buttons) - New CSS specs */
.input-section-png {
  position: absolute;
  width: 342px;
  height: 188px;
  left: calc(50% - 342px / 2);
  top: 611px;
  display: block;
  object-fit: contain;
}

/* Create Button Overlay (Clickable Area) - Adjusted for new position */
.create-button-overlay {
  position: absolute;
  left: calc(50% - 342px / 2);
  top: 665px;
  width: 302px;
  height: 48px;
  cursor: pointer;
  z-index: 20;
}

/* Regenerate Button Overlay (Clickable Area) - Adjusted for new position */
.regenerate-button-overlay {
  position: absolute;
  left: calc(50% - 342px / 2);
  top: 731px;
  width: 302px;
  height: 48px;
  cursor: pointer;
  z-index: 20;
}

/* Public Toggle Main (主按钮) - New CSS from 创建页3.css */
.public-toggle-main {
  position: absolute;
  width: 342px;
  height: 52px;
  left: calc(50% - 342px / 2);
  bottom: 241px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 1.27226px 15.2672px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  gap: 23px;
  box-sizing: border-box;
}

/* Public Toggle Label */
.public-toggle-label {
  flex: none;
  order: 0;
  width: 228px;
  height: 20px;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #222222;
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
</style>
