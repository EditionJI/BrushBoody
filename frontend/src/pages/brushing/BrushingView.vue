<template>
  <div class="brushing-container">
    <!-- Status Bar -->
    <div class="status-bar">
      <span class="time">{{ currentTime }}</span>
      <div class="status-icons">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2C4.69 2 2 4.69 2 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm0 1v10h8V3H4z"/>
        </svg>
      </div>
    </div>

    <!-- Timer Display -->
    <div class="timer-section">
      <div class="timer-circle">
        <svg class="timer-svg" viewBox="0 0 200 200">
          <circle
            class="timer-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#E2E8F0"
            stroke-width="8"
          />
          <circle
            class="timer-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            stroke-width="8"
            :stroke-dasharray="progressCircumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div class="timer-text">
          <span class="time-display">{{ formattedTime }}</span>
          <span class="time-label">minutes</span>
        </div>
      </div>
    </div>

    <!-- Current Zone Display -->
    <div class="zone-section">
      <div class="zone-card" :style="{ borderColor: currentZone.color }">
        <div class="zone-icon" :style="{ background: currentZone.color }">
          <span class="zone-emoji">{{ currentZone.emoji }}</span>
        </div>
        <div class="zone-info">
          <h3 class="zone-title">{{ currentZone.label }}</h3>
          <p class="zone-instruction">{{ currentZone.instruction }}</p>
        </div>
      </div>
    </div>

    <!-- Character Animation -->
    <div class="character-section">
      <img :src="characterImage" alt="Character" class="character-image" />
      <div class="speech-bubble">
        <p>{{ encouragementMessage }}</p>
      </div>
    </div>

    <!-- Play/Pause Button -->
    <div class="controls">
      <button @click="togglePlayPause" class="play-pause-button" :class="{ paused: isPaused }">
        <svg v-if="!isPaused" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>

    <!-- Completion State -->
    <div v-if="isCompleted" class="completion-overlay">
      <div class="completion-content">
        <div class="celebration-animation">🎉</div>
        <h2>Great Job!</h2>
        <p>You brushed for 2 minutes!</p>
        <button @click="goHome" class="home-button">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

// State
const totalTime = 120 // 2 minutes in seconds
const currentTimeLeft = ref(totalTime)
const isPaused = ref(false)
const isCompleted = ref(false)
const currentTime = ref('')

// Computed Character Image
const characterImage = computed(() => {
  if (userStore.latestStory && userStore.latestStory.coverImage) {
    return userStore.latestStory.coverImage
  }
  return '/images/character-brushing.png'
})

// Brushing zones - 每30秒切换
const baseZones = [
  {
    timeRange: [0, 30],
    label: 'Top Left Teeth',
    instruction: 'Brush the top left teeth in circles',
    emoji: '↖️',
    color: '#FF6B6B'
  },
  {
    timeRange: [30, 60],
    label: 'Top Right Teeth',
    instruction: 'Now the top right teeth!',
    emoji: '↗️',
    color: '#4ECDC4'
  },
  {
    timeRange: [60, 90],
    label: 'Bottom Left Teeth',
    instruction: 'Let\'s do the bottom left teeth',
    emoji: '↙️',
    color: '#45B7D1'
  },
  {
    timeRange: [90, 120],
    label: 'Bottom Right Teeth',
    instruction: 'Finally, the bottom right teeth!',
    emoji: '↘️',
    color: '#96CEB4'
  }
]

const zones = computed(() => {
  const story = userStore.latestStory
  // @ts-ignore - sections might exist on the story object
  if (story && story.sections && Array.isArray(story.sections)) {
    return baseZones.map((zone, index) => ({
      ...zone,
      // @ts-ignore
      instruction: story.sections[index] || zone.instruction
    }))
  }
  return baseZones
})

const encouragementMessages = [
  "You're doing great!",
  "Keep it up!",
  "Almost there!",
  "Nice circular motions!",
  "Don't forget the back teeth!",
  "You're a brushing superstar!"
]

// Computed
const currentZone = computed(() => {
  const elapsed = totalTime - currentTimeLeft.value
  return zones.find(z => elapsed >= z.timeRange[0] && elapsed < z.timeRange[1]) || zones[0]
})

const formattedTime = computed(() => {
  const minutes = Math.floor(currentTimeLeft.value / 60)
  const seconds = currentTimeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const progressCircumference = 2 * Math.PI * 90
const progressOffset = computed(() => {
  const progress = (totalTime - currentTimeLeft.value) / totalTime
  return progressCircumference * (1 - progress)
})

const encouragementMessage = computed(() => {
  return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
})

// Timer
let timer: number | null = null

const startTimer = () => {
  timer = window.setInterval(() => {
    if (!isPaused.value && currentTimeLeft.value > 0) {
      currentTimeLeft.value--
      if (currentTimeLeft.value === 0) {
        completeBrushing()
      }
    }
  }, 1000)
}

const togglePlayPause = () => {
  isPaused.value = !isPaused.value
}

const completeBrushing = () => {
  isCompleted.value = true
  if (timer) {
    clearInterval(timer)
  }

  // Save brushing record
  const record = {
    id: Date.now(),
    startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
    endTime: new Date().toISOString(),
    duration: totalTime
  }

  const existingRecords = JSON.parse(localStorage.getItem('brushingRecords') || '[]')
  existingRecords.push(record)
  localStorage.setItem('brushingRecords', JSON.stringify(existingRecords))
}

const goHome = () => {
  router.push('/')
}

const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Lifecycle
let clockTimer: number | null = null

onMounted(() => {
  startTimer()
  updateClock()
  clockTimer = setInterval(updateClock, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
.brushing-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F0 0%, #FFF5E6 100%);
  padding: 20px;
  padding-bottom: 100px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 14px;
  color: #4A5568;
}

.status-icons {
  display: flex;
  gap: 8px;
}

.timer-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-progress {
  color: #FF6B6B;
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-display {
  display: block;
  font-size: 48px;
  font-weight: bold;
  color: #2D3748;
  font-family: 'Courier New', monospace;
}

.time-label {
  font-size: 14px;
  color: #718096;
}

.zone-section {
  margin-bottom: 30px;
}

.zone-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 3px solid;
  transition: all 0.5s ease;
}

.zone-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.zone-info {
  flex: 1;
}

.zone-title {
  font-size: 20px;
  font-weight: bold;
  color: #2D3748;
  margin-bottom: 4px;
}

.zone-instruction {
  font-size: 14px;
  color: #718096;
}

.character-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.character-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 16px;
}

.speech-bubble {
  background: white;
  padding: 16px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 280px;
  text-align: center;
}

.speech-bubble p {
  font-size: 16px;
  color: #4A5568;
  font-weight: 500;
}

.controls {
  display: flex;
  justify-content: center;
}

.play-pause-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
}

.play-pause-button:hover {
  transform: scale(1.05);
}

.play-pause-button.paused {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

/* Completion Overlay */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-content {
  background: white;
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  max-width: 320px;
}

.celebration-animation {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.completion-content h2 {
  font-size: 28px;
  color: #2D3748;
  margin-bottom: 12px;
}

.completion-content p {
  font-size: 16px;
  color: #718096;
  margin-bottom: 24px;
}

.home-button {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>