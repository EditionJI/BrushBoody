import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Story {
  id: number
  title: string
  characterName: string
  coverImage: string
  theme: string
  createdAt: string
  content?: string
  sections?: string[]
}

export interface BrushingRecord {
  id: number
  date: string
  duration: number
  completed: boolean
}

export const useUserStore = defineStore('user', () => {
  // State
  const stories = ref<Story[]>([])
  const brushingRecords = ref<BrushingRecord[]>([])
  const streakCount = ref<number>(0)

  // Computed
  const hasStories = computed(() => stories.value.length > 0)
  const latestStory = computed(() => stories.value[0] || null)

  // Load from localStorage
  const loadStories = () => {
    const saved = localStorage.getItem('userStories')
    if (saved) {
      stories.value = JSON.parse(saved)
    }
  }

  const loadBrushingRecords = () => {
    const saved = localStorage.getItem('brushingRecords')
    if (saved) {
      brushingRecords.value = JSON.parse(saved)
      calculateStreak()
    }
  }

  // Save to localStorage
  const saveStories = () => {
    localStorage.setItem('userStories', JSON.stringify(stories.value))
  }

  const saveBrushingRecords = () => {
    localStorage.setItem('brushingRecords', JSON.stringify(brushingRecords.value))
  }

  // Add new story
  const addStory = (story: Omit<Story, 'id' | 'createdAt'>) => {
    const newStory: Story = {
      ...story,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    stories.value.unshift(newStory)
    saveStories()
  }

  // Add brushing record
  const addBrushingRecord = (record: Omit<BrushingRecord, 'id'>) => {
    const newRecord: BrushingRecord = {
      ...record,
      id: Date.now()
    }
    brushingRecords.value.push(newRecord)
    saveBrushingRecords()
    calculateStreak()
  }

  // Calculate streak count
  const calculateStreak = () => {
    const today = new Date()
    let streak = 0
    let checkDate = new Date(today)

    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasRecord = brushingRecords.value.some(
        r => r.date === dateStr && r.completed
      )

      if (hasRecord) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // Today doesn't have a record yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    streakCount.value = streak
  }

  // Initialize
  loadStories()
  loadBrushingRecords()

  return {
    stories,
    brushingRecords,
    streakCount,
    hasStories,
    latestStory,
    addStory,
    addBrushingRecord,
    loadStories,
    loadBrushingRecords
  }
})
