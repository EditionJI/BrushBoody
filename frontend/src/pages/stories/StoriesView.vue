<template>
  <!-- 绘本广场 - 外层容器居中 -->
  <div class="stories-container">
    <div class="mobile-wrapper">
      <!-- 背景层 -->
      <div class="bg-layer"></div>

      <!-- Done 按钮 - 编辑模式时显示 -->
      <button v-if="editMode" class="done-button" @click="exitEditMode">
        Done
      </button>

      <!-- 绘本卡片网格 -->
      <div class="stories-grid" :class="{ 'edit-mode': editMode }">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading stories...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Oops!</div>
          <div class="error-description">{{ error }}</div>
          <button class="retry-button" @click="loadStories">Retry</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="stories.length === 0" class="empty-state">
          <div class="empty-icon">📖</div>
          <div class="empty-title">No stories yet</div>
          <div class="empty-description">Create your first brushing story!</div>
        </div>

        <!-- 故事卡片 - 只在非加载且非错误状态显示 -->
        <template v-if="!isLoading && !error">
          <div
            v-for="(story, index) in stories"
            :key="story.task_id"
            class="story-card"
            :class="{ 'shake': editMode && shakingCards.includes(story.task_id) }"
            :style="{
              '--shadow-color': getShadowColor(index),
              'animation-delay': editMode ? `${index * 0.08}s` : '0s'
            }"
            @click="handleCardClick(story)"
            @touchstart="handleTouchStart($event, story)"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @mousedown="handleMouseDown($event, story)"
            @mouseup="handleMouseUp"
          >
          <!-- 卡片背景 -->
          <div class="card-bg"></div>

          <!-- 3D阴影层 -->
          <div class="card-shadow-3d"></div>

          <!-- 阴影层2 -->
          <div class="card-shadow-layer-2"></div>

          <!-- 阴影层3 -->
          <div class="card-shadow-layer-3"></div>

          <!-- 封面图片 -->
          <img
            :src="story.cover_image_url"
            :alt="story.child_name"
            class="card-cover"
            @error="handleImageError($event, story)"
          />

          <!-- 故事名称 -->
          <div class="story-name">{{ story.child_name }}</div>

          <!-- 分享按钮 -->
          <button
            v-if="!editMode"
            class="share-button"
            @click.stop="shareStory(story)"
          >
            <img src="/images/绘本广场/btn1.png" alt="Share" class="share-btn-img" />
          </button>

          <!-- 删除按钮 - 编辑模式 -->
          <button
            v-if="editMode"
            class="delete-button"
            @click.stop="confirmDelete(story)"
          >
            Delete
          </button>
          </div>
        </template>
      </div>

      <!-- 创建按钮 -->
      <button class="create-button" @click="goToCreate">
        <img src="/images/绘本广场/Group 1321316051.png" alt="Create" class="create-btn-img" />
      </button>

      <!-- 删除确认弹窗 -->
      <Teleport to="body">
        <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-title">Delete this story?</div>
            <div class="modal-description">
              Are you sure you want to delete "{{ storyToDelete?.child_name }}"?
            </div>
            <div class="modal-actions">
              <button class="modal-btn modal-btn-cancel" @click="showDeleteModal = false">
                Cancel
              </button>
              <button class="modal-btn modal-btn-delete" @click="deleteStory">
                Delete
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyFeed, type FeedItemWithOwn } from '@/api/feed'

// Router & Store
const router = useRouter()
const userStore = useUserStore()

// 计算属性
const childName = computed(() => userStore.lastChildInfo?.name || 'My')

// 数据状态
const stories = ref<FeedItemWithOwn[]>([])
const editMode = ref(false)
const showDeleteModal = ref(false)
const storyToDelete = ref<FeedItemWithOwn | null>(null)
const shakingCards = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// 长按状态 - 添加移动检测
const longPressTimer = ref<NodeJS.Timeout | null>(null)
const LONG_PRESS_DURATION = 500
const touchMoveDistance = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)

// 卡片阴影颜色循环
const shadowColors = [
  '#A89C60', // 金棕色
  '#6093A8', // 蓝灰色
  '#6C6D9E', // 紫灰色
  '#6AA670', // 绿色
  '#81628D', // 紫粉色
  '#D9D9D9', // 灰色
]

const getShadowColor = (index: number) => {
  return shadowColors[index % shadowColors.length]
}

// 加载故事列表 - 添加加载状态
const loadStories = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await getMyFeed({ limit: 50 })
    stories.value = response.data || []
    console.log('Stories loaded:', stories.value.length)
  } catch (err) {
    console.error('Failed to load stories:', err)
    error.value = 'Failed to load stories. Please try again.'
    stories.value = []
  } finally {
    isLoading.value = false
  }
}

// 处理图片加载错误
const handleImageError = (event: Event, story: FeedItemWithOwn) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/绘本广场/Image1.png'
}

// 卡片点击
const handleCardClick = (story: FeedItemWithOwn) => {
  if (editMode.value) return
  router.push({
    path: '/brushing',
    query: {
      source: 'stories_square',
      taskId: story.task_id,
      userName: story.child_name,
      isOtherStory: 'false'
    }
  })
}

// 分享故事
const shareStory = async (story: FeedItemWithOwn) => {
  const shareUrl = `${window.location.origin}/shared/${story.task_id}`
  const shareData = {
    title: `${story.child_name}'s brushing story`,
    text: 'Check out this brushing story!',
    url: shareUrl
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.log('Share cancelled:', err)
    }
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard')
    }).catch(() => {
      alert('Share failed')
    })
  }
}

// 长按处理 - 添加移动检测
const handleTouchStart = (event: TouchEvent, story: FeedItemWithOwn) => {
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchMoveDistance.value = 0

  longPressTimer.value = setTimeout(() => {
    if (touchMoveDistance.value < 10) {
      enterEditMode()
      shakingCards.value.push(story.task_id)
    }
  }, LONG_PRESS_DURATION)
}

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0]
  const distance = Math.hypot(
    touch.clientX - touchStartX.value,
    touch.clientY - touchStartY.value
  )
  touchMoveDistance.value = distance

  // 如果移动距离超过阈值，取消长按计时器
  if (distance > 10 && longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

const handleTouchEnd = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  touchMoveDistance.value = 0
}

const handleMouseDown = (event: MouseEvent, story: FeedItemWithOwn) => {
  longPressTimer.value = setTimeout(() => {
    enterEditMode()
    shakingCards.value.push(story.task_id)
  }, LONG_PRESS_DURATION)
}

const handleMouseUp = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

// 进入编辑模式
const enterEditMode = () => {
  editMode.value = true
  setTimeout(() => {
    shakingCards.value = stories.value.map(s => s.task_id)
  }, 50)
}

// 退出编辑模式
const exitEditMode = () => {
  editMode.value = false
  shakingCards.value = []
}

// 确认删除
const confirmDelete = (story: FeedItemWithOwn) => {
  storyToDelete.value = story
  showDeleteModal.value = true
}

// 删除故事
const deleteStory = () => {
  if (storyToDelete.value) {
    stories.value = stories.value.filter(s => s.task_id !== storyToDelete.value!.task_id)
    showDeleteModal.value = false
    storyToDelete.value = null
    exitEditMode()
  }
}

// 生命周期
onMounted(() => {
  loadStories()
})
</script>

<style scoped>
/* ============================================
   绘本广场 - 主容器
   ============================================ */
.stories-container {
  width: 100vw;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #d4dff5 0%, #e8ecf5 50%, #f5f5f5 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mobile-wrapper {
  position: relative;
  max-width: 390px;
  width: 100%;
  max-height: 844px;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.mobile-wrapper::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 背景层 */
.bg-layer {
  position: fixed;
  inset: 0;
  background: #FFFFFF;
  z-index: 0;
}

/* Done 按钮 */
.done-button {
  position: fixed;
  top: 67px;
  right: 16px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #007AFF;
  cursor: pointer;
  z-index: 200;
  transition: opacity 0.2s ease;
}

.done-button:active {
  opacity: 0.6;
}

/* ============================================
   绘本卡片网格
   位置: left: 16px, top: 120px
   尺寸: 358px × 436px
   ============================================ */
.stories-grid {
  position: fixed;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 100px; /* 留出底部导航栏空间 */
  padding: 0 16px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
  transition: all 0.3s ease;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* 确保不遮挡底部导航栏和创建按钮 */
  z-index: 1;
}

.stories-grid::-webkit-scrollbar {
  display: none;
}

.stories-grid.edit-mode {
  padding-bottom: 60px;
}

/* 加载状态 */
.loading-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.loading-spinner::before {
  content: '';
  position: fixed;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 115, 255, 0.1);
  border-radius: 50%;
  border-top-color: #0073FF;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 15px;
  color: #8E8E93;
  font-weight: 500;
}

/* 错误状态 */
.error-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.error-description {
  font-size: 14px;
  color: #8E8E93;
  margin-bottom: 16px;
}

.retry-button {
  padding: 10px 20px;
  background: #0073FF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.retry-button:active {
  opacity: 0.8;
}

/* 空状态 */
.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
}

.empty-description {
  font-size: 14px;
  color: #8E8E93;
}

/* ============================================
   故事卡片
   尺寸: 171px × 210px
   ============================================ */
.story-card {
  position: relative;
  width: 171px;
  height: 210px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.story-card:active:not(.shake) {
  transform: scale(0.95);
}

/* 抖动动画 - 编辑模式 */
.story-card.shake {
  animation: cardShake 0.4s ease-in-out infinite;
}

@keyframes cardShake {
  0%, 100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-2deg) scale(1.02);
  }
  40% {
    transform: rotate(2deg) scale(1.02);
  }
  60% {
    transform: rotate(-1deg) scale(1.01);
  }
  80% {
    transform: rotate(1deg) scale(1.01);
  }
}

/* 卡片背景 */
.card-bg {
  position: fixed;
  inset: 0;
  background: #F5F5F5;
  border-radius: 16px;
  overflow: hidden;
}

/* 3D阴影效果 */
.card-shadow-3d {
  position: fixed;
  left: 5%;
  right: 5%;
  top: 0;
  bottom: 27%;
  background: var(--shadow-color, #A89C60);
  border-radius: 16px;
  transform: matrix(1, 0.06, -0.06, 1, 0, 0);
  box-shadow: 0px 15.8959px 7.57394px -7.48043px rgba(31, 32, 34, 0.25);
  pointer-events: none;
}

/* 阴影层2 */
.card-shadow-layer-2 {
  position: fixed;
  left: 5%;
  right: 5%;
  top: 1.73%;
  bottom: 15%;
  background: #D9D9D9;
  border-radius: 16px;
  pointer-events: none;
}

/* 阴影层3 */
.card-shadow-layer-3 {
  position: fixed;
  left: 5%;
  right: 5%;
  top: 1.73%;
  bottom: 15%;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  pointer-events: none;
}

/* 封面图片 */
.card-cover {
  position: fixed;
  left: 5%;
  right: 5%;
  top: 2%;
  bottom: 18%;
  width: 90%;
  height: 80%;
  object-fit: cover;
  border-radius: 16px;
  z-index: 1;
}

/* 故事名称 */
.story-name {
  position: fixed;
  left: 16%;
  right: 16%;
  bottom: 18%;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  color: #222222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
}

/* 分享按钮 */
.share-button {
  position: fixed;
  left: 12%;
  right: 12%;
  bottom: 5%;
  height: auto;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 3;
  transition: transform 0.2s ease;
}

.share-button:active {
  transform: scale(0.92);
}

.share-btn-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* 删除按钮 */
.delete-button {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 20px;
  background: rgba(255, 59, 48, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  z-index: 30;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.4);
  transition: all 0.2s ease;
}

.delete-button:active {
  transform: translate(-50%, -50%) scale(0.95);
}

/* ============================================
   创建按钮
   尺寸: 74.44px × 73.75px
   ============================================ */
.create-button {
  position: fixed;
  right: 16px;
  bottom: 104px; /* 距离底部导航栏上方 16px */
  width: 74.44px;
  height: 73.75px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 150;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.create-button:active {
  transform: scale(0.9);
}

.create-btn-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ============================================
   删除确认弹窗
   ============================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 390px;
  width: 100%;
  max-height: 844px;
  height: calc(var(--vh, 1vh) * 100);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.modal-description {
  font-size: 15px;
  color: #8E8E93;
  margin-bottom: 24px;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn:active {
  transform: scale(0.96);
}

.modal-btn-cancel {
  background: #F2F2F7;
  color: #007AFF;
}

.modal-btn-delete {
  background: #FF3B30;
  color: white;
}

.modal-btn-delete:hover {
  background: #ff2d21;
}
</style>
