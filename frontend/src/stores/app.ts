import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const hasSeenOnboarding = ref<boolean>(false)
  const currentRoute = ref<string>('')

  // Load from localStorage
  const loadState = () => {
    const saved = localStorage.getItem('hasSeenOnboarding')
    if (saved) {
      hasSeenOnboarding.value = JSON.parse(saved)
    }
  }

  // Save to localStorage
  const saveState = () => {
    localStorage.setItem('hasSeenOnboarding', JSON.stringify(hasSeenOnboarding.value))
  }

  // Mark onboarding as seen
  const completeOnboarding = () => {
    hasSeenOnboarding.value = true
    saveState()
  }

  // Initialize
  loadState()

  return {
    hasSeenOnboarding,
    currentRoute,
    completeOnboarding,
    loadState
  }
})
