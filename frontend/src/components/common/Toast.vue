<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-container" :class="type">
      <div class="toast-message">{{ message }}</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)
const type = ref(props.type || 'info')
const duration = ref(props.duration || 3000)

let timer: number | null = null

const startTimer = () => {
  if (timer) clearTimeout(timer)
  timer = window.setTimeout(() => {
    visible.value = false
    emit('close')
  }, duration.value)
}

watch(() => props.message, () => {
  visible.value = true
  startTimer()
}, { immediate: true })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 200px;
  max-width: 80%;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.toast-container.info {
  background: rgba(0, 0, 0, 0.8);
}

.toast-container.success {
  background: rgba(72, 187, 120, 0.9);
}

.toast-container.warning {
  background: rgba(237, 137, 54, 0.9);
}

.toast-container.error {
  background: rgba(245, 101, 101, 0.9);
}

.toast-message {
  line-height: 1.5;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style>
