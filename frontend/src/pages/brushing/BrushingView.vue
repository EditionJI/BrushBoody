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
      <!-- Yellow banner - Hidden (disabled) -->

      <!-- Close button -->
      <button class="close-button" @click="goBack(false)">
        <img src="/images/播放器页/x-close.png" alt="close" class="close-icon" />
      </button>

      <!-- Completion Screen -->
      <div v-if="isCompleted" class="completion-screen">
        <div class="reward-card">
          <img src="/images/播放器页/奖励.png" alt="reward" class="reward-image" />
        </div>
        <button class="tap-it-button" @click="onTapIt">
          <img src="/images/播放器页/Tap it.png" alt="Tap it" class="tap-it-image" />
        </button>
        <!-- Bottom hint text - only show on completion screen -->
        <div class="bottom-hint">
          <p class="hint-text">
            Wow-wow {{ userName || 'Friend' }}! You're a brushing champion! Look! A rainbow space rock in your rocket! Tap it, see what's the surprise~
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTaskStatus } from '@/api/video'
import { recordVideoPlay } from '@/api/analytics'
import { useUserStore } from '../../stores/user'
import { useAudioStore } from '../../stores/audio'
import { getDeviceProperties } from '@/composables/usePosthog'
import posthog from 'posthog-js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const audioStore = useAudioStore()

const videoPlayer = ref<HTMLVideoElement | null>(null)
const isLoading = ref(true)
const taskId = ref(route.query.taskId as string | null)
const videoUrl = ref<string | null>(null)
const isCompleted = ref(false)

// 视频播放埋点 - 记录开始时间和视频时长
const playStartTime = ref<string | null>(null)
const videoDurationSeconds = ref<number>(0)

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
        // 记录视频播放开始时间
        playStartTime.value = new Date().toISOString()
        console.log('视频生成成功:', videoUrl.value, '开始时间:', playStartTime.value)
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
    // If audio was unlocked from home page, enable sound
    if (audioStore.isAudioUnlocked) {
      videoPlayer.value.muted = false
      console.log('Audio unlocked from home page, playing with sound')
    }

    videoPlayer.value.play().then(() => {
      console.log('视频自动播放成功')
      // 视频开始播放时记录视频时长
      videoDurationSeconds.value = videoPlayer.value?.duration || 0
      console.log('视频时长记录:', videoDurationSeconds.value, '秒')

      // 埋点：brushing_started
      posthog.capture('brushing_started', {
        ...getDeviceProperties(),
        storybook_id: taskId.value,
        source: source.value,
        user_name: userName.value,
        start_time: playStartTime.value
      })
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

  // Record brushing completion
  const today = new Date().toISOString().split('T')[0]
  userStore.addBrushingRecord({
    storyId: taskId.value || 'unknown',
    source: source.value as 'home' | 'create' | 'stories_square' | 'shared',
    completed: true,
    duration: 120, // 2 minutes in seconds
    date: today,
    brushedAt: new Date().toISOString()
  })

  console.log('Brushing recorded, streak:', userStore.streakCount)
  goBack(true)
}

onMounted(() => {
  pollForVideo()
})

onUnmounted(() => {
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }

  // 页面关闭时上报埋点（使用 keepalive 确保页面关闭后仍能发送）
  if (videoUrl.value && playStartTime.value) {
    const fromHomePage = source.value === 'home' || source.value === 'shared'
    const endTime = new Date().toISOString()
    const videoDuration = videoDurationSeconds.value || videoPlayer.value?.duration || 0
    const startTimestamp = new Date(playStartTime.value).getTime()
    const endTimestamp = Date.now()
    const watchedSeconds = (endTimestamp - startTimestamp) / 1000
    const watchedPercent = videoDuration > 0 ? Math.round((watchedSeconds / videoDuration) * 100) : 0

    recordVideoPlay(
      videoUrl.value,
      playStartTime.value,
      endTime,
      fromHomePage,
      true
    )

    // 埋点：brushing_completed
    posthog.capture('brushing_completed', {
      ...getDeviceProperties(),
      storybook_id: taskId.value,
      source: source.value,
      start_time: playStartTime.value,
      end_time: endTime,
      video_duration_seconds: videoDuration,
      watched_seconds: Math.round(watchedSeconds),
      watched_percent: Math.min(watchedPercent, 100)
    })
    console.log('页面关闭，上报埋点结束时间:', endTime)
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
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background: #000;
}

/* Video Player Area - Full Screen Immersive */
.video-player-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-video {
  /* Base: 9:16 aspect ratio container */
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

/* For taller screens (modern phones): scale video to fit better */
@media (min-aspect-ratio: 9/19) {
  .story-video {
    object-fit: cover;
  }
}

/* For standard 16:9 or 9:16 screens: show full video */
@media (max-aspect-ratio: 9/17) {
  .story-video {
    object-fit: contain;
  }
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
  position: fixed;
  top: calc(66px + env(safe-area-inset-top, 0px));
  left: 0;
  display: flex;
  align-items: center;
  padding: min(4px, 1vw) min(12px, 3vw);
  gap: min(6px, 1.5vw);
  width: min(209px, 55vw);
  height: min(23px, 6vw);
  background: linear-gradient(90deg, rgba(255, 251, 239, 0.3) -15.31%, #FFE27C 108.61%);
  border-radius: 0 min(12px, 3vw) min(12px, 3vw) 0;
  z-index: 50;
}

.banner-text {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: clamp(10px, 2.5vw, 12px);
  line-height: 1.3;
  color: #222222;
}

/* Close button */
.close-button {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: min(16px, 4vw);
  width: min(28px, 7vw);
  height: min(28px, 7vw);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
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
  width: min(16px, 4vw);
  height: min(16px, 4vw);
}

/* Completion Screen - Full Screen */
.completion-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.reward-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(341px, 90vw);
  aspect-ratio: 341 / 220;
  background: #FFFFFF;
  border-radius: min(24px, 6vw);
  overflow: hidden;
}

.reward-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tap-it-button {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
  width: min(140px, 36vw);
  aspect-ratio: 140 / 44;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.tap-it-image {
  width: 100%;
  height: 100%;
}

/* Bottom hint text - inside completion screen */
.bottom-hint {
  position: absolute;
  bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: min(363px, 90vw);
  padding: min(12px, 3vw) min(16px, 4vw);
  background: rgba(0, 0, 0, 0.5);
  border-radius: min(12px, 3vw);
  z-index: 30;
}

.hint-text {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: clamp(12px, 3vw, 13px);
  line-height: 1.3;
  color: #FFFFFF;
  text-align: center;
  margin: 0;
}
</style>
