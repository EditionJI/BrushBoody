<template>
  <div class="home-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <!-- Background Image - Changes based on current slide -->
      <img :src="currentBackgroundImage" alt="Home" class="full-screen-image" />

      <!-- Streak Days Banner - Only for users with brushing records -->
      <div v-if="showStreakBanner" class="streak-banner">
        <span class="streak-count">{{ streakCount }} days</span>
        <span class="streak-message">in a row</span>
      </div>

      <!-- Public Badge - Fixed at top left -->
      <img src="/images/首页/绘本已公开.png" alt="Public" class="public-badge" />

      <!-- Story card interaction area -->
      <div
        class="story-card-area"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="handleCardClick"
      ></div>

      <!-- Toast Message - Fixed above bottom nav -->
      <img src="/images/首页/提示信息.png" alt="Toast" class="toast-message" />

      <!-- Create Button - Always visible -->
      <img
        v-if="!isPaidUser"
        :src="hasCreatedStory ? '/images/首页/创建过，开始刷牙.png' : '/images/首页/L.png'"
        alt="Create"
        class="create-button"
        @click="handleBlueButtonClick"
      />

      <!-- First-time Guide Overlay -->
      <Transition name="guide-fade">
        <div v-if="showGuide" class="guide-overlay" @click="dismissGuide">
          <div class="guide-content" @click="dismissGuide">
            <!-- Swipe hint animation -->
            <div class="swipe-hint">
              <div class="hand-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4C24 4 24 4 24 4C24 4 24 4 24 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <path d="M24 8L24 40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/>
                  </path>
                  <circle cx="24" cy="44" r="3" fill="white" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <div class="swipe-arrows">
                <div class="arrow up">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 24L16 8M16 8L10 14M16 8L22 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                </div>
                <div class="arrow down">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 8L16 24M16 24L10 18M16 24L22 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.75s"/>
                    </path>
                  </svg>
                </div>
              </div>
              <p class="guide-text">Swipe up or down to switch stories</p>
              <p class="guide-hint">Tap anywhere to close</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { useAudioStore } from "../../stores/audio";
import { getDeviceProperties } from "@/composables/usePosthog";
import posthog from "posthog-js";

const router = useRouter();
const userStore = useUserStore();
const audioStore = useAudioStore();

const wrapperRef = ref<HTMLElement | null>(null);
const currentSlide = ref(0);
const disableTransition = ref(false);

// Guide overlay state
const showGuide = ref(false);
const GUIDE_STORAGE_KEY = 'hasSeenHomeGuide';

// Total stories count from API
const totalStories = computed(() => userStore.totalFeedCount || 0);

// Get current story from feed
const currentStory = computed(() => {
  if (totalStories.value === 0) return null;
  const actualIndex = ((currentSlide.value % totalStories.value) + totalStories.value) % totalStories.value;
  return userStore.feedItems[actualIndex] || null;
});

// Current background image (use cover image from API)
const currentBackgroundImage = computed(() => {
  return currentStory.value?.cover_image_url || "/images/首页/背景.png";
});

const streakCount = computed(() => userStore.streakCount);
const isPaidUser = computed(() => userStore.isPaidUser);
const hasCreatedStory = computed(() => userStore.hasCreatedStory);

// Check if user has brushing records (old user)
const hasBrushingRecords = computed(() => userStore.brushingRecords.length > 0);

// Show streak banner for users with brushing records
const showStreakBanner = computed(() => hasBrushingRecords.value && streakCount.value > 0);

// Preload cover images for smooth sliding
const preloadCoverImages = () => {
  for (let i = 0; i < userStore.feedItems.length; i++) {
    const img = new Image();
    img.src = userStore.feedItems[i].cover_image_url;
  }
};

// Navigation - Blue button click
const handleBlueButtonClick = () => {
  // Unlock audio before navigating to brushing page
  audioStore.unlockAudio();

  if (hasCreatedStory.value && currentStory.value) {
    router.push({
      path: "/brushing",
      query: {
        source: "home",
        taskId: currentStory.value.task_id,
        userName: currentStory.value.child_name,
        isOtherStory: !currentStory.value.is_own
      },
    });
  } else {
    router.push("/create");
  }
};

// Card click - Navigate to brushing page
const handleCardClick = () => {
  if (isSwipe.value) return;

  // Unlock audio before navigating to brushing page
  audioStore.unlockAudio();

  const total = totalStories.value;
  const actualIndex = ((currentSlide.value % total) + total) % total;
  const story = userStore.feedItems[actualIndex];
  if (!story) return;

  router.push({
    path: "/brushing",
    query: {
      source: "home",
      taskId: story.task_id,
      userName: story.child_name,
      isOtherStory: !story.is_own
    },
  });
};

// Guide overlay - dismiss on click or swipe
const dismissGuide = () => {
  showGuide.value = false;
  localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
};

// Touch and swipe handling with circular navigation
const isSwipe = ref(false);
const hasMoved = ref(false);
const touchStartY = ref(0);
const touchStartTime = ref(0);
const touchStartX = ref(0);

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartX.value = e.touches[0].clientX;
  touchStartTime.value = Date.now();
  isSwipe.value = false;
  hasMoved.value = false;
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();

  const currentY = e.touches[0].clientY;
  const currentX = e.touches[0].clientX;
  const deltaY = Math.abs(currentY - touchStartY.value);
  const deltaX = Math.abs(currentX - touchStartX.value);

  if (deltaY > 5 || deltaX > 5) {
    hasMoved.value = true;
  }

  if (deltaY > 20) {
    isSwipe.value = true;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchDuration = Date.now() - touchStartTime.value;
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const diffY = touchStartY.value - touchEndY;
  const diffX = touchStartX.value - touchEndX;
  const absDiffY = Math.abs(diffY);
  const absDiffX = Math.abs(diffX);

  const SWIPE_THRESHOLD = 40;

  // If guide is showing, dismiss it on any swipe
  if (showGuide.value && absDiffY > 30) {
    dismissGuide();
  }

  if (absDiffY > SWIPE_THRESHOLD && absDiffY > absDiffX && touchDuration < 1000) {
    if (diffY > 0) {
      currentSlide.value++;
    } else if (diffY < 0) {
      currentSlide.value--;
    }

    setTimeout(() => {
      const total = totalStories.value;
      if (currentSlide.value >= total * 2) {
        disableTransition.value = true;
        currentSlide.value = currentSlide.value - total;
        setTimeout(() => {
          disableTransition.value = false;
        }, 50);
      } else if (currentSlide.value < -total) {
        disableTransition.value = true;
        currentSlide.value = currentSlide.value + total;
        setTimeout(() => {
          disableTransition.value = false;
        }, 50);
      }
    }, 350);
  }

  if (isSwipe.value) {
    setTimeout(() => {
      isSwipe.value = false;
      hasMoved.value = false;
    }, 200);
  } else {
    hasMoved.value = false;
  }
};

onMounted(async () => {
  // Load fresh user data
  userStore.loadUserData();

  // Load feed from API
  await userStore.loadFeed();

  // Preload cover images for smooth sliding
  preloadCoverImages();

  // 埋点：home_page_viewed
  posthog.capture('home_page_viewed', {
    ...getDeviceProperties()
  })

  // Initialize to middle position for smooth circular navigation
  const total = totalStories.value;
  currentSlide.value = total > 0 ? total : 0;

  // Check if user has seen the guide
  const hasSeenGuide = localStorage.getItem(GUIDE_STORAGE_KEY);
  if (!hasSeenGuide && total > 0) {
    // Show guide after a short delay
    setTimeout(() => {
      showGuide.value = true;
    }, 500);
  }
});
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: #d9d9d9;
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
}

/* Full screen background image */
.full-screen-image {
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  object-fit: cover;
  background: #f0f0f0;
  transition: opacity 0.3s ease;
}

/* Streak Banner - for users with brushing records */
.streak-banner {
  position: fixed;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 7%;
  z-index: 10;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(255, 165, 0, 0.3);
  pointer-events: none;
}

.streak-count {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.streak-message {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* Public Badge - Top left yellow label */
.public-badge {
  position: fixed;
  left: 0;
  top: 66px;
  width: 209px;
  height: 23px;
  z-index: 10;
  pointer-events: none;
}

/* Story card click area */
.story-card-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  z-index: 5;
  cursor: pointer;
  overflow: hidden;
}

/* Toast Message - Above bottom nav */
.toast-message {
  position: fixed;
  left: calc(50% - 295px / 2 - 18.5px);
  bottom: calc(145px + env(safe-area-inset-bottom, 0px));
  width: 295px;
  height: 38px;
  z-index: 10;
  pointer-events: none;
}

/* Create Button - Blue L button */
.create-button {
  position: fixed;
  left: calc(50% - 342px / 2);
  bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  width: 342px;
  height: 56px;
  z-index: 10;
  cursor: pointer;
}

/* Guide Overlay Styles */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.guide-content {
  text-align: center;
  color: white;
}

.swipe-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hand-icon {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.swipe-arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.arrow {
  opacity: 0.8;
}

.arrow.up {
  animation: fadeUp 1.5s ease-in-out infinite;
}

.arrow.down {
  animation: fadeDown 1.5s ease-in-out infinite;
  animation-delay: 0.75s;
}

@keyframes fadeUp {
  0%, 100% { opacity: 0.3; transform: translateY(5px); }
  50% { opacity: 1; transform: translateY(-5px); }
}

@keyframes fadeDown {
  0%, 100% { opacity: 0.3; transform: translateY(-5px); }
  50% { opacity: 1; transform: translateY(5px); }
}

.guide-text {
  font-size: 20px;
  font-weight: 600;
  margin-top: 30px;
  letter-spacing: 2px;
}

.guide-hint {
  font-size: 14px;
  opacity: 0.6;
  margin-top: 10px;
}

/* Guide transition */
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}
</style>
