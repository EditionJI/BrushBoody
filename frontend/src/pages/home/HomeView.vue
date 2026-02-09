<template>
  <div class="home-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <!-- Background Image - Changes based on current slide (3 backgrounds) -->
      <img :src="currentBackgroundImage" alt="Home" class="full-screen-image" @load="onBgImageLoad" />

      <!-- Streak Days Banner - Only for users with brushing records, hidden when video plays -->
      <div v-if="showStreakBanner && !shouldPlayVideo" class="streak-banner">
        <span class="streak-count">{{ streakCount }} 天</span>
        <span class="streak-message">连续刷牙</span>
      </div>

      <!-- Public Badge - Fixed at top left, hidden when video plays -->
      <img v-if="!shouldPlayVideo" src="/images/首页/绘本已公开.png" alt="Public" class="public-badge" />

      <!-- Video Screen Interaction Area - Full background size for video playback -->
      <div
        class="story-card-area"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="handleVideoClick"
      >
        <!-- Video player (shown when shouldPlayVideo is true) -->
        <video
          v-if="shouldPlayVideo && currentVideoUrl"
          ref="videoPlayer"
          :src="currentVideoUrl"
          class="story-video"
          loop
          playsinline
          @click.prevent
        ></video>

        <!-- Pause button - shown when video is paused -->
        <img v-if="shouldPlayVideo && isVideoPaused" src="/images/首页/Vector.png" alt="Pause" class="pause-button" />
      </div>

      <!-- Toast Message - Fixed above bottom nav, hidden when video plays -->
      <img v-if="!shouldPlayVideo" src="/images/首页/提示信息.png" alt="Toast" class="toast-message" />

      <!-- Create Button - Always visible, different image based on whether user has created a story -->
      <img
        v-if="!isPaidUser"
        :src="hasCreatedStory ? '/images/首页/创建过，开始刷牙.png' : '/images/首页/L.png'"
        alt="Create"
        class="create-button"
        @click="handleBlueButtonClick"
      />

      <!-- Bottom Navigation - Fixed at bottom -->
      <div class="bottom-nav">
        <img src="/images/HOME.png" alt="Home" class="nav-icon home" @click="goToHome" />
        <img src="/images/CREATE.png" alt="Create" class="nav-icon create" @click="goToCreate" />
        <img src="/images/STORY.png" alt="Stories" class="nav-icon stories" @click="goToStories" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";

const router = useRouter();
const userStore = useUserStore();

const wrapperRef = ref<HTMLElement | null>(null);
const currentSlide = ref(0);
const disableTransition = ref(false);

// Auto-play video state
const shouldPlayVideo = ref(false);
const autoPlayTimer = ref<number | null>(null);
const videoPlayer = ref<HTMLVideoElement | null>(null);
const hasUserInteracted = ref(false);

// Video pause state
const isVideoPaused = ref(false);

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

// Get current video URL from API
const currentVideoUrl = computed(() => {
  return currentStory.value?.video_url || "";
});

// Check if current story is from other user
const isOtherStory = computed(() => {
  return currentStory.value ? !currentStory.value.is_own : false;
});

// Track already preloaded videos to avoid duplicate loading
const preloadedVideos = ref<Set<string>>(new Set());

// Preload cover images for smooth sliding - preload ALL images for circular navigation
const preloadCoverImages = () => {
  // Preload all cover images to ensure smooth circular navigation
  for (let i = 0; i < userStore.feedItems.length; i++) {
    const img = new Image();
    img.src = userStore.feedItems[i].cover_image_url;
  }
};

// Preload videos around current position (前后各2个, 共5个)
const preloadVideosAround = (centerIndex: number) => {
  const total = totalStories.value;
  if (total === 0) return;

  // Preload range: [center-2, center-1, center, center+1, center+2]
  const preloadRange = [-2, -1, 0, 1, 2];

  preloadRange.forEach(offset => {
    // Handle circular navigation
    let index = ((centerIndex + offset) % total + total) % total;
    const story = userStore.feedItems[index];

    if (story && story.video_url && !preloadedVideos.value.has(story.video_url)) {
      // Create video element to preload
      const video = document.createElement('video');
      video.preload = 'metadata'; // Only preload metadata, not full video
      video.src = story.video_url;

      // Mark as preloaded
      preloadedVideos.value.add(story.video_url);

      console.log(`Preloading video for story ${index}:`, story.video_url);
    }
  });
};

// Navigation
const goToHome = () => {
  const total = totalStories.value;
  disableTransition.value = true;
  currentSlide.value = total;
  setTimeout(() => {
    disableTransition.value = false;
  }, 50);
};

const goToCreate = () => {
  // Always go to create page (for bottom nav)
  router.push("/create");
};

const handleBlueButtonClick = () => {
  // If user has created stories, play the current story
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
    // Otherwise go to create page
    router.push("/create");
  }
};

const goToStories = () => {
  router.push("/stories");
};

// Story card click handler
const handleSlideClick = (index: number) => {
  const story = userStore.feedItems[index];
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

// Video click handler - toggle play/pause
const handleVideoClick = () => {
  // If it's a swipe, don't handle click
  if (isSwipe.value) {
    return;
  }

  // If video is not playing yet, navigate to brushing page
  if (!shouldPlayVideo.value) {
    const total = totalStories.value;
    const actualIndex = ((currentSlide.value % total) + total) % total;
    handleSlideClick(actualIndex);
    return;
  }

  // Toggle video play/pause
  if (videoPlayer.value) {
    if (isVideoPaused.value) {
      // Resume video
      videoPlayer.value.play();
      isVideoPaused.value = false;
    } else {
      // Pause video
      videoPlayer.value.pause();
      isVideoPaused.value = true;
    }
  }
};

// Background image load handler
const onBgImageLoad = () => {
  // Image loaded successfully, start auto-play timer
  startAutoPlayTimer();
};

// Start 1.5-second auto-play timer
const startAutoPlayTimer = () => {
  // Clear any existing timer
  stopAutoPlayTimer();

  // Start new 1.5-second timer
  autoPlayTimer.value = window.setTimeout(() => {
    shouldPlayVideo.value = true;
    isVideoPaused.value = false;
    // Auto play video when it's ready
    nextTick(() => {
      if (videoPlayer.value) {
        // Try to play with sound, if user has interacted
        // Otherwise it will fail silently and user needs to click
        videoPlayer.value.play().catch((err) => {
          console.log("Auto-play failed (expected if no user interaction yet):", err);
          // If auto-play fails, video is still loaded and will play when user clicks
        });
      }
    });
  }, 1500);
};

// Stop auto-play timer
const stopAutoPlayTimer = () => {
  if (autoPlayTimer.value !== null) {
    clearTimeout(autoPlayTimer.value);
    autoPlayTimer.value = null;
  }
  shouldPlayVideo.value = false;
  isVideoPaused.value = false;

  // Pause video if playing
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
};

// Reset timer on user interaction
const resetAutoPlayTimer = () => {
  stopAutoPlayTimer();
  startAutoPlayTimer();
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

  // Mark that user has interacted with the page
  if (!hasUserInteracted.value) {
    hasUserInteracted.value = true;
    console.log("User interacted, future videos can play with sound");
  }
};

const handleTouchMove = (e: TouchEvent) => {
  // Prevent default to avoid page scrolling
  e.preventDefault();

  const currentY = e.touches[0].clientY;
  const currentX = e.touches[0].clientX;
  const deltaY = Math.abs(currentY - touchStartY.value);
  const deltaX = Math.abs(currentX - touchStartX.value);

  // If vertical movement is more than 5px, mark as moved
  if (deltaY > 5 || deltaX > 5) {
    hasMoved.value = true;
  }

  // If vertical movement is more than 20px, mark as potential swipe
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

  // Distinguish between tap and swipe
  const SWIPE_THRESHOLD = 40;
  const TAP_MAX_DURATION = 300;

  if (absDiffY > SWIPE_THRESHOLD && absDiffY > absDiffX && touchDuration < 1000) {
    // Vertical swipe - change slide with circular navigation (always smooth)
    if (diffY > 0) {
      // Swipe up - next slide
      currentSlide.value++;
    } else if (diffY < 0) {
      // Swipe down - previous slide
      currentSlide.value--;
    }

    // Reset position when we go too far (after animation completes)
    // This keeps currentSlide in a reasonable range
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

  // Reset swipe state after a delay to prevent click from firing
  if (isSwipe.value) {
    // Keep isSwipe true for a bit to prevent click
    setTimeout(() => {
      isSwipe.value = false;
      hasMoved.value = false;
    }, 200);
  } else {
    // Immediately reset if no swipe
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

  // Initialize to middle position for smooth circular navigation
  const total = totalStories.value;
  currentSlide.value = total > 0 ? total : 0;

  // Initial video preload around the first story
  if (total > 0) {
    preloadVideosAround(0);
  }

  // Start auto-play timer manually (don't rely only on image load)
  if (total > 0) {
    startAutoPlayTimer();
  }
});

onUnmounted(() => {
  // Cleanup timers
  stopAutoPlayTimer();
});

// Watch for slide changes to reset timer
watch(currentSlide, () => {
  resetAutoPlayTimer();
  // Preload videos around the new position
  const currentIndex = ((currentSlide.value % totalStories.value) + totalStories.value) % totalStories.value;
  preloadVideosAround(currentIndex);
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
  height: 756px;
  position: absolute;
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
  position: absolute;
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
  position: absolute;
  left: 0;
  top: 66px;
  width: 209px;
  height: 23px;
  z-index: 10;
  pointer-events: none;
}

/* Story card click area - Match background image size */
.story-card-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 756px;
  z-index: 5;
  cursor: pointer;
  overflow: hidden;
}

.story-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* Pause button - Centered on video */
.pause-button {
  position: absolute;
  left: calc(50% - 56px / 2);
  top: calc(50% - 56px / 2);
  width: 56px;
  height: 56px;
  z-index: 6;
  pointer-events: none;
}

/* Toast Message - Above bottom nav */
.toast-message {
  position: absolute;
  left: calc(50% - 295px / 2 - 18.5px);
  top: 638px;
  width: 295px;
  height: 38px;
  z-index: 10;
  pointer-events: none;
}

/* Create Button - Blue L button */
.create-button {
  position: absolute;
  left: calc(50% - 342px / 2);
  top: 688px;
  width: 342px;
  height: 56px;
  z-index: 10;
  cursor: pointer;
}

/* Bottom Navigation - 3个图标 */
.bottom-nav {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 88px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 10;
  background: transparent;
}

.nav-icon {
  width: 80px;
  height: 60px;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;
  pointer-events: auto;
}

.nav-icon:active {
  opacity: 0.7;
}
</style>
