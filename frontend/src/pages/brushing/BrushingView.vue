<template>
  <div class="brushing-container">
    <div class="mobile-wrapper">
      <!-- Video Player Area - Full Screen -->
      <div class="video-player-area" @click="enableSound">
        <video
          v-if="videoUrl"
          ref="videoPlayer"
          :src="videoUrl"
          class="story-video"
          playsinline
          muted
          @ended="onVideoEnded"
        ></video>

        <!-- Loading state -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Generating video, please wait...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="!videoUrl && !isLoading" class="error-state">
          <p>Video generation failed</p>
        </div>
      </div>

      <!-- Top Area -->
      <!-- Yellow banner (only for shared stories) -->
      <div v-if="isOtherStory" class="top-banner">
        <span class="banner-text">Shared with parental permission</span>
      </div>

      <!-- Close button -->
      <button class="close-button" @click="goBack(false)">
        <img src="/images/播放器页/x-close.png" alt="close" class="close-icon" />
      </button>

      <!-- Brushing Guide Card (shown during video playback) -->
      <div v-if="!isCompleted && videoUrl" class="guide-card">
        <img src="/images/播放器页/刷牙指导.png" alt="brushing guide" class="guide-image" />
      </div>

      <!-- Completion Screen -->
      <div v-if="isCompleted" class="completion-screen">
        <div class="reward-card">
          <img src="/images/播放器页/奖励.png" alt="reward" class="reward-image" />
        </div>
        <button class="tap-it-button" @click="onTapIt">
          <img src="/images/播放器页/Tap it.png" alt="Tap it" class="tap-it-image" />
        </button>
      </div>

      <!-- Bottom hint text -->
      <div v-if="!isCompleted && videoUrl" class="bottom-hint">
        <p class="hint-text">
          Wow-wow {{ userName || 'Friend' }}! You're a brushing champion! Look! A rainbow space rock in your rocket! Tap it, see what's the surprise~
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTaskStatus } from '@/api/video'

const router = useRouter()
const route = useRoute()

const videoPlayer = ref<HTMLVideoElement | null>(null)
const isLoading = ref(true)
const taskId = ref(route.query.taskId as string | null)
const videoUrl = ref<string | null>(null)
const isCompleted = ref(false)

// Source tracking: home | create | stories_square | shared
const source = ref((route.query.source as string) || 'home')
const isOtherStory = ref(route.query.isOtherStory === 'true')

// User name (should come from user store or route param)
const userName = ref((route.query.userName as string) || '')

// Poll for video generation
const pollForVideo = async () => {
  if (!taskId.value) {
    isLoading.value = false
    return
  }

  console.log('开始轮询视频生成, task_id:', taskId.value)

  // Poll for up to 10 minutes (600 seconds)
  const maxAttempts = 120 // 120 * 5 seconds = 10 minutes
  const interval = 5000 // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await getTaskStatus(taskId.value)
      console.log(`轮询 ${i + 1}: status = ${response.status}, video_url = ${response.video_url || 'null'}`)

      if (response.status === 'completed' && response.video_url) {
        videoUrl.value = response.video_url
        isLoading.value = false
        console.log('视频生成成功:', videoUrl.value)
        nextTick(() => {
          autoPlayVideo()
        })
        return
      }

      if (response.status === 'failed') {
        isLoading.value = false
        console.error('视频生成失败:', response.error_message)
        return
      }

    } catch (error) {
      console.error('轮询出错:', error)
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  // Timeout
  isLoading.value = false
  console.warn('视频生成超时')
}

// Auto-play video
const autoPlayVideo = () => {
  if (videoPlayer.value && videoUrl.value) {
    videoPlayer.value.play().then(() => {
      console.log('视频自动播放成功')
    }).catch(err => {
      console.log('Auto-play failed, user needs to interact:', err)
    })
  }
}

// Enable sound on user interaction
const enableSound = () => {
  if (videoPlayer.value) {
    videoPlayer.value.muted = false
    console.log('Sound enabled')
  }
}

// Video ended handler - show completion screen
const onVideoEnded = () => {
  isCompleted.value = true
  console.log('Video playback ended')
}

// Go back to previous page
// completed: whether the brushing was completed (true) or exited early (false)
const goBack = (completed: boolean) => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }

  // If from create page, always go back to home
  if (source.value === 'create') {
    router.push({ name: 'home' })
    return
  }

  // If exited early, just go back without recording
  if (!completed) {
    router.back()
    return
  }

  // TODO: Call API to record completion + increment streak
  console.log('Recording brushing completion for user:', userName.value)

  // Navigate based on source
  switch (source.value) {
    case 'home':
    case 'shared':
      router.push({ name: 'home' })
      break
    case 'stories_square':
      router.push({ name: 'stories' })
      break
    default:
      router.back()
  }
}

// Tap it button handler
const onTapIt = () => {
  console.log('Tap it clicked - recording completion')
  goBack(true)
}

onMounted(() => {
  pollForVideo()
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
})
</script>

<style scoped>
.brushing-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: #000;
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
  background: #000;
}

/* Video Player Area - Full Screen */
.video-player-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background: #000;
  overflow: hidden;
}

.story-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

/* Loading state */
.loading-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  gap: 20px;
  z-index: 100;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error state */
.error-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  gap: 20px;
  z-index: 100;
}

.retry-button {
  padding: 12px 30px;
  background: rgba(255, 107, 107, 0.9);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: rgba(255, 107, 107, 1);
  transform: scale(1.05);
}

/* Top Area */
/* Yellow banner */
.top-banner {
  position: absolute;
  top: 66px;
  left: 0;
  display: flex;
  align-items: center;
  padding: 4px 12px;
  gap: 6px;
  width: 209px;
  height: 23px;
  background: linear-gradient(90deg, rgba(255, 251, 239, 0.3) -15.31%, #FFE27C 108.61%);
  border-radius: 0px 12px 12px 0px;
  z-index: 50;
}

.banner-text {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #222222;
}

/* Close button */
.close-button {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: 16px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  padding: 0;
  transition: opacity 0.2s ease;
}

.close-button:active {
  opacity: 0.7;
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* Brushing Guide Card */
.guide-card {
  position: absolute;
  top: calc(50% - 110px/2 - 268px);
  left: 16px;
  width: 134px;
  height: 110px;
  z-index: 30;
}

.guide-image {
  width: 134px;
  height: 110px;
  object-fit: contain;
}

/* Completion Screen */
.completion-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 40;
}

.reward-card {
  position: absolute;
  top: 309px;
  left: 25px;
  width: 341px;
  height: 220px;
  background: #FFFFFF;
  border-radius: 24px;
  overflow: hidden;
}

.reward-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tap-it-button {
  position: absolute;
  top: 551px;
  left: calc(50% - 140px/2 - 6px);
  width: 140px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.tap-it-image {
  width: 140px;
  height: 44px;
}

/* Bottom hint text */
.bottom-hint {
  position: absolute;
  top: 710px;
  left: calc(50% - 363px/2 - 0.5px);
  width: 363px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  z-index: 30;
}

.hint-text {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #FFFFFF;
  text-align: center;
}
</style>
