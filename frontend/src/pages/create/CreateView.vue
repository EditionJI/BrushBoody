<template>
  <div class="create-container">
    <div class="mobile-wrapper" ref="wrapperRef">
    <!-- ========== NEW USER FLOW ========== -->

    <!-- Step 1: Upload photo, nickname, personality, age -->
    <div v-if="isNewUser && currentStep === 1" class="step-new-1">
      <img src="/images/create-new-1.png" alt="Create new step 1" class="full-screen-image" @load="onBgImageLoad" />

      <div class="overlay-layer" :style="overlayLayerStyle">
        <div class="back-button" :style="rectStyle(activeRects.back)" @click="goBack"></div>

        <div class="upload-photo-area" :style="rectStyle(activeRects.upload)" @click="triggerUpload">
          <div class="upload-placeholder" v-if="!uploadedPhoto">+</div>
          <img
            v-if="uploadedPhoto"
            :src="uploadedPhoto"
            alt="Uploaded"
            class="uploaded-photo"
          />
          <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
        </div>

        <div
          v-if="uploadedPhoto"
          class="delete-icon"
          :style="rectStyle(activeRects.delete)"
          @click.stop="deletePhoto"
        >×</div>

        <div class="nickname-input-area" :style="rectStyle(activeRects.nickname)">
          <input
            ref="nicknameInput"
            v-model="nickname"
            type="text"
            class="white-input"
            placeholder="e.g. Leo"
            autocomplete="off"
          />
        </div>

        <div class="personality-input-area" :style="rectStyle(activeRects.personality)">
          <input
            ref="personalityInput"
            v-model="childPersonality"
            type="text"
            class="white-input"
            placeholder="e.g. Curious, energetic, shy"
            autocomplete="off"
          />
        </div>

        <div class="age-input-area" :style="rectStyle(activeRects.age)">
          <div class="custom-select-wrapper">
            <select ref="ageSelect" v-model="childAge" class="white-select">
              <option :value="1">1 year old</option>
              <option :value="2">2 years old</option>
              <option :value="3">3 years old</option>
              <option :value="4">4 years old</option>
              <option :value="5">5 years old</option>
              <option :value="6">6 years old</option>
              <option :value="7">7 years old</option>
              <option :value="8">8 years old</option>
              <option :value="9">9 years old</option>
              <option :value="10">10 years old</option>
              <option :value="11">11 years old</option>
              <option :value="12">12 years old</option>
              <option :value="13">13 years old</option>
              <option :value="14">14 years old</option>
              <option :value="15">15 years old</option>
              <option :value="16">16 years old</option>
              <option :value="17">17 years old</option>
              <option :value="18">18 years old</option>
            </select>
            <div class="select-arrow"></div>
          </div>
        </div>

        <div class="next-button" :style="rectStyle(activeRects.next)" @click="handleNextStep1"></div>
      </div>
    </div>

    <!-- Step 2: Select theme -->
    <div v-if="isNewUser && currentStep === 2" class="step-new-2">
      <img src="/images/create-new-2.png" alt="Create new step 2" class="full-screen-image" @load="onBgImageLoad" />

      <!-- Back button -->
      <div class="back-button" @click="goToStep(1)"></div>

      <!-- Theme options -->
      <div class="theme-option-1" @click="selectTheme(1)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 1 }"></div>
      </div>
      <div class="theme-option-2" @click="selectTheme(2)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 2 }"></div>
      </div>
      <div class="theme-option-3" @click="selectTheme(3)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 3 }"></div>
      </div>
      <div class="theme-option-4" @click="selectTheme(4)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 4 }"></div>
      </div>

      <!-- Next button -->
      <div class="next-button" @click="goToStep(3)"></div>
    </div>

    <!-- ========== EXISTING USER FLOW ========== -->

    <!-- Step 1: Show old photo + select theme -->
    <div v-if="!isNewUser && currentStep === 1" class="step-existing-1">
      <img src="/images/create-existing-1.png" alt="Create existing step 1" class="full-screen-image" @load="onBgImageLoad" />

      <!-- Back button -->
      <div class="back-button" @click="goBack"></div>

      <!-- Old photo display -->
      <img v-if="uploadedPhoto" :src="uploadedPhoto" alt="Old photo" class="existing-photo" />

      <!-- Plus button to upload new photo -->
      <div class="upload-new-photo-button" @click="goToStep(2)"></div>

      <!-- Theme options -->
      <div class="theme-option-existing-1" @click="selectTheme(1)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 1 }"></div>
      </div>
      <div class="theme-option-existing-2" @click="selectTheme(2)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 2 }"></div>
      </div>
      <div class="theme-option-existing-3" @click="selectTheme(3)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 3 }"></div>
      </div>
      <div class="theme-option-existing-4" @click="selectTheme(4)">
        <div class="theme-radio" :class="{ checked: selectedTheme === 4 }"></div>
      </div>

      <!-- Next button -->
      <div class="next-button" @click="goToStep(3)"></div>
    </div>

    <!-- Step 2: Upload new photo -->
    <div v-if="!isNewUser && currentStep === 2" class="step-existing-2">
      <img src="/images/create-existing-2.png" alt="Create existing step 2" class="full-screen-image" @load="onBgImageLoad" />

      <div class="overlay-layer" :style="overlayLayerStyle">
        <div class="back-button" :style="rectStyle(activeRects.back)" @click="goToStep(1)"></div>

        <div class="upload-photo-area" :style="rectStyle(activeRects.upload, 'rgba(255, 0, 0, 0.14)')" @click="triggerUpload">
          <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
        </div>

        <img
          v-if="uploadedPhoto"
          :src="uploadedPhoto"
          alt="Uploaded"
          class="uploaded-photo"
          :style="rectStyle(activeRects.upload)"
        />

        <div
          v-if="uploadedPhoto"
          class="delete-icon"
          :style="rectStyle(activeRects.delete, 'rgba(255, 0, 0, 0.14)')"
          @click.stop="deletePhoto"
        >×</div>

        <div class="nickname-input-area" :style="rectStyle(activeRects.nickname, 'rgba(0, 0, 255, 0.12)')">
          <input
            ref="nicknameInput"
            v-model="nickname"
            type="text"
            class="transparent-input"
            autocomplete="off"
          />
        </div>

        <div class="personality-input-area" :style="rectStyle(activeRects.personality, 'rgba(0, 255, 0, 0.12)')">
          <textarea
            ref="personalityInput"
            v-model="childPersonality"
            class="transparent-textarea"
          ></textarea>
        </div>

        <div class="age-input-area" :style="rectStyle(activeRects.age, 'rgba(255, 255, 0, 0.16)')">
          <select ref="ageSelect" v-model="childAge" class="transparent-select">
            <option :value="1">1</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
            <option :value="6">6</option>
            <option :value="7">7</option>
            <option :value="8">8</option>
            <option :value="9">9</option>
            <option :value="10">10</option>
            <option :value="11">11</option>
            <option :value="12">12</option>
            <option :value="13">13</option>
            <option :value="14">14</option>
            <option :value="15">15</option>
            <option :value="16">16</option>
            <option :value="17">17</option>
            <option :value="18">18</option>
          </select>
        </div>

        <div class="next-button" :style="rectStyle(activeRects.next)" @click="goToStep(1)"></div>
      </div>
    </div>

    <!-- ========== PREVIEW STEP (SHARED) ========== -->

    <div v-if="currentStep === 3" class="step-preview">
      <img src="/images/create-preview.png" alt="Preview" class="full-screen-image" @load="onBgImageLoad" />

      <!-- Back button -->
      <div class="back-button" @click="goToPreviewBack"></div>

      <!-- Yes button -->
      <div class="yes-button" @click="handleConfirm"></div>

      <!-- No button -->
      <div class="no-button" @click="regeneratePreview"></div>

      <!-- Preview image -->
      <div v-if="previewImage" class="preview-image-container">
        <img :src="previewImage" alt="Preview" class="preview-image" />
      </div>
    </div>
    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="showToast" class="toast-notification">
        {{ toastMessage }}
      </div>
    </transition>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateCharacter, generateStory } from '../../api/backend'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const wrapperRef = ref<HTMLElement | null>(null)
const bgNaturalWidth = ref<number | null>(null)
const bgNaturalHeight = ref<number | null>(null)
const overlayOffsetX = ref(0)
const overlayOffsetY = ref(0)
const overlayScale = ref(1)
const debugEnabled = ref(false)
let resizeObserver: ResizeObserver | null = null

const overlayLayerStyle = computed(() => {
  const w = bgNaturalWidth.value
  const h = bgNaturalHeight.value

  if (!w || !h) {
    return { display: 'none' }
  }

  return {
    position: 'absolute',
    top: '0',
    left: '0',
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${overlayOffsetX.value}px, ${overlayOffsetY.value}px) scale(${overlayScale.value})`,
    transformOrigin: 'top left',
    zIndex: '10'
  }
})

const recomputeOverlay = () => {
  const w = bgNaturalWidth.value
  const h = bgNaturalHeight.value
  const wrapper = wrapperRef.value

  if (!w || !h || !wrapper) return

  const containerW = wrapper.clientWidth
  const containerH = wrapper.clientHeight
  const scale = Math.min(containerW / w, containerH / h)
  const renderW = w * scale
  const renderH = h * scale

  overlayScale.value = scale
  overlayOffsetX.value = (containerW - renderW) / 2
  overlayOffsetY.value = (containerH - renderH) / 2
}

const onBgImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  bgNaturalWidth.value = img.naturalWidth
  bgNaturalHeight.value = img.naturalHeight
  recomputeOverlay()
}

type DesignRect = { x: number; y: number; w: number; h: number; r?: number }

const DESIGN_W = 375
const DESIGN_H = 812

const stepFormRects = {
  back: { x: 24, y: 56, w: 40, h: 40 } satisfies DesignRect,
  next: { x: 16, y: 720, w: 343, h: 48, r: 24 } satisfies DesignRect,
  upload: { x: 24, y: 170, w: 80, h: 80, r: 12 } satisfies DesignRect,
  delete: { x: 92, y: 165, w: 24, h: 24, r: 12 } satisfies DesignRect,
  nickname: { x: 20, y: 305, w: 335, h: 56, r: 12 } satisfies DesignRect,
  personality: { x: 20, y: 415, w: 335, h: 56, r: 12 } satisfies DesignRect,
  age: { x: 20, y: 525, w: 335, h: 56, r: 12 } satisfies DesignRect
}

const activeRects = computed(() => stepFormRects)

const rectStyle = (rect: DesignRect, debugColor?: string) => {
  const w = bgNaturalWidth.value
  const h = bgNaturalHeight.value
  if (!w || !h) return {}

  const style: Record<string, string> = {
    position: 'absolute',
    left: `${(rect.x / DESIGN_W) * w}px`,
    top: `${(rect.y / DESIGN_H) * h}px`,
    width: `${(rect.w / DESIGN_W) * w}px`,
    height: `${(rect.h / DESIGN_H) * h}px`
  }

  if (rect.r != null) {
    style.borderRadius = `${(rect.r / DESIGN_W) * w}px`
  }

  // Debug highlight logic removed for production
  if (debugEnabled.value && debugColor) {
    style.background = debugColor
  }

  return style
}

// State
const isLoading = ref(false)
const loadingMessage = ref('Creating magic...')
const currentStep = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const nicknameInput = ref<HTMLInputElement | null>(null)
const personalityInput = ref<HTMLTextAreaElement | null>(null)
const ageSelect = ref<HTMLSelectElement | null>(null)

const uploadedPhoto = ref<string | null>(null)
const nickname = ref('')
const childPersonality = ref('')
const childAge = ref(3)
const selectedTheme = ref<number | null>(null)
const previewImage = ref<string>('/images/preview-placeholder.png')
const previewVersion = ref(0)

const showToast = ref(false)
const toastMessage = ref('')

const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const validateStep1 = () => {
  if (!uploadedPhoto.value) {
    triggerToast('请上传宝宝的照片')
    return false
  }
  if (!nickname.value.trim()) {
    triggerToast('请输入宝宝的昵称')
    return false
  }
  if (!childPersonality.value.trim()) {
    triggerToast('请输入宝宝的个性')
    return false
  }
  if (!childAge.value) {
    triggerToast('请选择宝宝的年龄')
    return false
  }
  return true
}

const handleNextStep1 = () => {
  if (validateStep1()) {
    goToStep(2)
  }
}

// Check if user is new or existing
// Check if user is new or existing - based on whether they have completed stories
const isNewUser = computed(() => {
  const stories = JSON.parse(localStorage.getItem('stories') || '[]')
  return stories.length === 0
})

onMounted(() => {
  debugEnabled.value = new URLSearchParams(window.location.search).get('debug') === '1'

  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => recomputeOverlay())
    resizeObserver.observe(wrapperRef.value)
  }

  // Load saved data
  const savedPhoto = localStorage.getItem('savedPhoto')
  const savedData = localStorage.getItem('createStoryData')

  if (savedPhoto) {
    uploadedPhoto.value = savedPhoto
  }

  if (savedData) {
    const data = JSON.parse(savedData)
    nickname.value = data.nickname || ''
    childPersonality.value = data.childPersonality || ''
    childAge.value = data.childAge || ''
    selectedTheme.value = data.selectedTheme || null
  }

  // Set initial step based on user type
  if (uploadedPhoto.value) {
    currentStep.value = 1 // Existing user step 1
  } else {
    currentStep.value = 1 // New user step 1
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const goBack = () => {
  if (currentStep.value > 1) {
    if (isNewUser.value) {
      currentStep.value--
    } else {
      if (currentStep.value === 2) {
        currentStep.value = 1
      }
    }
  } else {
    // If there is a history entry, go back; otherwise go to home
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/')
    }
  }
}

const goToPreviewBack = () => {
  if (isNewUser.value) {
    currentStep.value = 2
  } else {
    currentStep.value = 1
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
  saveData()
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      uploadedPhoto.value = e.target?.result as string
      localStorage.setItem('savedPhoto', uploadedPhoto.value)
      saveData()
    }

    reader.readAsDataURL(file)
  }
}

const deletePhoto = () => {
  uploadedPhoto.value = null
  localStorage.removeItem('savedPhoto')
}

const selectTheme = (themeId: number) => {
  selectedTheme.value = themeId
}

const saveData = () => {
  const data = {
    nickname: nickname.value,
    childPersonality: childPersonality.value,
    childAge: childAge.value,
    selectedTheme: selectedTheme.value,
    uploadedPhoto: uploadedPhoto.value
  }
  localStorage.setItem('createStoryData', JSON.stringify(data))
}

const generateAndPreview = async () => {
  if (!uploadedPhoto.value) {
    alert('Please upload a photo first!')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Painting your character...'

  try {
    // Call Backend API
    const characterUrl = await generateCharacter({
      photo: uploadedPhoto.value,
      childName: nickname.value || 'Hero',
      childAge: childAge.value,
      theme: getThemeName(selectedTheme.value || 1)
    })

    previewImage.value = characterUrl
    goToStep(3)
  } catch (error) {
    console.error(error)
    alert('Failed to generate character. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const getThemeName = (id: number) => {
  const themes = ['Space Adventure', 'Jungle Safari', 'Ocean Explorer', 'Superhero']
  return themes[id - 1] || 'Space Adventure'
}

const handleConfirm = async () => {
  isLoading.value = true
  loadingMessage.value = 'Writing your story...'

  try {
    // Generate Story
    const storyData = await generateStory({
      characterName: nickname.value || 'Hero',
      childAge: childAge.value,
      theme: getThemeName(selectedTheme.value || 1),
      preferences: childPersonality.value
    })
    
    // Save to Store
    userStore.addStory({
      title: storyData.title,
      characterName: nickname.value || 'Hero',
      coverImage: previewImage.value,
      theme: getThemeName(selectedTheme.value || 1),
      // @ts-ignore - Adding extra fields to story object
      content: storyData.content,
      sections: storyData.sections
    })

    // Navigate to brushing page
    router.push('/brushing')
  } catch (error) {
    console.error(error)
    alert('Failed to generate story. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const regeneratePreview = () => {
  // Refresh preview image
  previewVersion.value++
  previewImage.value = `/images/preview-placeholder.png?v=${previewVersion.value}`
}
</script>

<style scoped>
.create-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #FFF9F0;
  display: flex;
  justify-content: center;
  align-items: center; /* Center vertically too */
}

.mobile-wrapper {
  position: relative;
  width: min(375px, 100vw, calc(100vh * 375 / 812));
  /* Enforce aspect ratio to match standard mobile design (iPhone X approx) */
  aspect-ratio: 375 / 812;
  height: min(100vh, calc(100vw * 812 / 375));
}

.full-screen-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

/* ========== COMMON ELEMENTS ========== */
/* Using percentages based on 375x812 design reference */

.back-button {
  position: absolute;
  top: 6.9%;
  left: 6.4%;
  width: 10.7%;
  height: 4.9%;
  z-index: 10;
  cursor: pointer;
  /* background: rgba(255, 0, 0, 0.2); Debug */
}

.next-button {
  position: absolute;
  bottom: 5.4%;
  left: 4.3%;
  width: 91.5%;
  height: 5.9%;
  z-index: 10;
  cursor: pointer;
  /* background: rgba(0, 255, 0, 0.2); Debug */
}

.theme-radio {
  position: absolute;
  right: 6%;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: 3px solid #4A90E2;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-radio.checked {
  opacity: 1;
  background: #4A90E2;
}

/* ========== NEW USER STEP 1 ========== */
.upload-photo-area {
  position: absolute;
  z-index: 10;
  cursor: pointer;
  background: #F6F6F6; /* Solid opaque background */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.upload-placeholder {
  font-size: 32px;
  color: #999;
  font-weight: 300;
}

.uploaded-photo {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  z-index: 5;
}

.delete-icon {
  position: absolute;
  z-index: 20;
  cursor: pointer;
  color: #FF6B6B;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nickname-input-area,
.personality-input-area,
.age-input-area {
  position: absolute;
  z-index: 10;
}

.white-input {
  width: 100%;
  height: 100%;
  background: #F6F6F6; /* Solid opaque background */
  border: none;
  border-radius: 12px; /* Match design */
  outline: none;
  color: #333;
  font-size: 16px;
  padding: 0 16px;
  margin: 0;
  box-sizing: border-box;
}

.white-input::placeholder {
  color: #999;
}

.custom-select-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.white-select {
  width: 100%;
  height: 100%;
  background: #F6F6F6;
  border: none;
  border-radius: 12px;
  outline: none;
  color: #333;
  font-size: 16px;
  padding: 0 16px;
  margin: 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #999;
  pointer-events: none;
}


/* ========== NEW USER STEP 2 ========== */
.theme-option-1,
.theme-option-2,
.theme-option-3,
.theme-option-4 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 85.3%;
  height: 8.6%;
  z-index: 10;
  cursor: pointer;
  /* background: rgba(0,0,0,0.1); Debug */
}

.theme-option-1 { top: 18.5%; }
.theme-option-2 { top: 28.3%; }
.theme-option-3 { top: 38.2%; }
.theme-option-4 { top: 48.0%; }

/* ========== EXISTING USER STEP 1 ========== */
.existing-photo {
  position: absolute;
  top: 9.8%;
  left: 8%;
  width: 21.3%;
  height: 9.8%;
  object-fit: cover;
  z-index: 5;
}

.upload-new-photo-button {
  position: absolute;
  top: 9.8%;
  left: 24%;
  width: 13.3%;
  height: 6.1%;
  z-index: 10;
  cursor: pointer;
}

.theme-option-existing-1,
.theme-option-existing-2,
.theme-option-existing-3,
.theme-option-existing-4 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 85.3%;
  height: 8.6%;
  z-index: 10;
  cursor: pointer;
}

.theme-option-existing-1 { top: 24.6%; }
.theme-option-existing-2 { top: 34.5%; }
.theme-option-existing-3 { top: 44.3%; }
.theme-option-existing-4 { top: 54.2%; }

/* ========== PREVIEW STEP ========== */
.yes-button,
.no-button {
  position: absolute;
  bottom: 14.8%;
  width: 37.3%;
  height: 7.4%;
  z-index: 10;
  cursor: pointer;
  /* background: rgba(0,0,0,0.1); Debug */
}

.yes-button { left: 10.6%; }
.no-button { right: 10.6%; }

.preview-image-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 74.6%;
  height: 43.1%;
  z-index: 5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.hidden {
  display: none;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 3000;
  text-align: center;
  max-width: 80%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
