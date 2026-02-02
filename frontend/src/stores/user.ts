import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Story {
  id: number
  userId: string
  characterName: string
  age: number
  gender: string
  theme: string
  coverImage: string
  title: string
  description: string
  videoUrl: string
  duration: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface BrushingRecord {
  id: number
  userId: string
  storyId: string
  source: 'home' | 'create' | 'stories_square' | 'shared'
  completed: boolean
  duration: number
  date: string
  brushedAt: string
}

export interface ChildInfo {
  photo: string
  name: string
  gender: 'male' | 'female' | 'prefer_not_to_say'
  age: number
}

export const useUserStore = defineStore('user', () => {
  // State
  const userId = ref<string>(`user_${Date.now()}`)
  const subscriptionStatus = ref<'free' | 'paid'>('free')
  const hasCreatedStory = ref<boolean>(false)
  const lastChildInfo = ref<ChildInfo | null>(null)
  const stories = ref<Story[]>([])
  const brushingRecords = ref<BrushingRecord[]>([])
  const streakCount = ref<number>(0)

  // Computed
  const hasStories = computed(() => stories.value.length > 0)
  const latestStory = computed(() => stories.value[0] || null)
  const isPaidUser = computed(() => subscriptionStatus.value === 'paid')

  // Load from localStorage
  const loadUserData = () => {
    const savedUserId = localStorage.getItem('userId')
    if (savedUserId) {
      userId.value = savedUserId
    } else {
      localStorage.setItem('userId', userId.value)
    }

    const savedSubscription = localStorage.getItem('subscriptionStatus')
    if (savedSubscription) {
      subscriptionStatus.value = JSON.parse(savedSubscription)
    }

    const savedCreatedStory = localStorage.getItem('hasCreatedStory')
    if (savedCreatedStory) {
      hasCreatedStory.value = JSON.parse(savedCreatedStory)
    }

    const savedChildInfo = localStorage.getItem('lastChildInfo')
    if (savedChildInfo) {
      lastChildInfo.value = JSON.parse(savedChildInfo)
    }

    loadStories()
    loadBrushingRecords()
  }

  const loadStories = () => {
    const saved = localStorage.getItem('userStories')
    if (saved) {
      try {
        stories.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse stories:', e)
        stories.value = []
      }
    }
  }

  const loadBrushingRecords = () => {
    const saved = localStorage.getItem('brushingRecords')
    if (saved) {
      try {
        brushingRecords.value = JSON.parse(saved)
        calculateStreak()
      } catch (e) {
        console.error('Failed to parse brushing records:', e)
        brushingRecords.value = []
      }
    }
  }

  // Save to localStorage
  const saveSubscriptionStatus = () => {
    localStorage.setItem('subscriptionStatus', JSON.stringify(subscriptionStatus.value))
  }

  const saveChildInfo = () => {
    if (lastChildInfo.value) {
      localStorage.setItem('lastChildInfo', JSON.stringify(lastChildInfo.value))
    }
  }

  const saveStories = () => {
    localStorage.setItem('userStories', JSON.stringify(stories.value))
  }

  const saveBrushingRecords = () => {
    localStorage.setItem('brushingRecords', JSON.stringify(brushingRecords.value))
  }

  // Actions
  const upgradeSubscription = () => {
    subscriptionStatus.value = 'paid'
    saveSubscriptionStatus()
  }

  const setChildInfo = (info: ChildInfo) => {
    lastChildInfo.value = info
    saveChildInfo()
  }

  const markStoryCreated = () => {
    hasCreatedStory.value = true
    localStorage.setItem('hasCreatedStory', 'true')
  }

  // Add new story
  const addStory = (story: Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newStory: Story = {
      ...story,
      id: Date.now(),
      userId: userId.value,
      createdAt: now,
      updatedAt: now
    }
    stories.value.unshift(newStory)
    markStoryCreated()
    saveStories()
  }

  // Delete story
  const deleteStory = (storyId: number) => {
    const index = stories.value.findIndex(s => s.id === storyId)
    if (index !== -1) {
      stories.value.splice(index, 1)
      saveStories()
    }
  }

  // Add brushing record
  const addBrushingRecord = (record: Omit<BrushingRecord, 'id' | 'userId'>) => {
    const newRecord: BrushingRecord = {
      ...record,
      id: Date.now(),
      userId: userId.value
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

  // Get本周平均刷牙时长
  const getWeeklyAvgDuration = (): number => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekRecords = brushingRecords.value.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate >= weekAgo && r.completed
    })

    if (weekRecords.length === 0) return 0

    const totalDuration = weekRecords.reduce((sum, r) => sum + r.duration, 0)
    return Math.round((totalDuration / weekRecords.length) * 10) / 10
  }

  // Get total completed count
  const getTotalCompletedCount = (): number => {
    return brushingRecords.value.filter(r => r.completed).length
  }

  // Get time saved (assuming each brushing saves 5 minutes of parent time)
  const getTimeSaved = (): number => {
    return getTotalCompletedCount() * 5
  }

  // Initialize
  loadUserData()

  return {
    // State
    userId,
    subscriptionStatus,
    hasCreatedStory,
    lastChildInfo,
    stories,
    brushingRecords,
    streakCount,

    // Computed
    hasStories,
    latestStory,
    isPaidUser,

    // Actions
    upgradeSubscription,
    setChildInfo,
    addStory,
    deleteStory,
    addBrushingRecord,
    getWeeklyAvgDuration,
    getTotalCompletedCount,
    getTimeSaved,
    loadUserData,
    loadStories,
    loadBrushingRecords
  }
})
