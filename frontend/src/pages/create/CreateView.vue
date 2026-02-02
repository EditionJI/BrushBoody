<template>
  <div class="create-container">
    <div class="mobile-wrapper" ref="wrapperRef">

    <!-- ========== STEP 1: Upload Info (New Design) ========== -->
    <div v-if="currentStep === 1" class="step-1">
      <!-- Status Bar (54px) -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="levels">
          <div class="wifi"></div>
          <div class="cellular"></div>
          <div class="battery">
            <div class="capacity"></div>
          </div>
        </div>
      </div>

      <!-- Top Navigation (54px) -->
      <div class="top-nav">
        <img src="/images/创建页/返回.png" alt="Back" class="back-button" @click="goBack" />
        <img src="/images/创建页/Create a story.png" alt="Create a story" class="title-image" />
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Upload Section -->
        <div class="upload-section">
          <div class="upload-labels">
            <img src="/images/创建页/上传.png" alt="Upload your kid's photo" class="upload-label" />
          </div>
          <div class="upload-area" @click="triggerUpload">
            <div v-if="!uploadedPhoto" class="upload-placeholder">
              <div class="plus-icon"></div>
            </div>
            <img v-else :src="uploadedPhoto" alt="Uploaded photo" class="uploaded-photo" />
            <!-- Delete button for uploaded photo -->
            <div v-if="uploadedPhoto" class="delete-button" @click.stop="deletePhoto">
              <span class="delete-x">×</span>
            </div>
          </div>
        </div>

        <!-- Nickname Input -->
        <div class="input-group">
          <img src="/images/创建页/Your-kids-nickname.png" alt="Nickname" class="input-label" />
          <div class="input-box" @click="focusNickname">
            <input
              ref="nicknameInputRef"
              v-model="nickname"
              type="text"
              placeholder="e.g. Leo"
              class="text-input"
              @blur="saveData"
            />
          </div>
        </div>

        <!-- Gender Select -->
        <div class="input-group">
          <img src="/images/创建页/Gender.png" alt="Gender" class="input-label" />
          <div class="select-box" @click="toggleGenderDropdown">
            <span class="select-text">{{ getGenderLabel(childGender) }}</span>
            <span class="select-arrow">▼</span>
          </div>
          <!-- Gender Dropdown -->
          <div v-if="showGenderDropdown" class="dropdown-menu">
            <div
              v-for="(label, key) in genderOptions"
              :key="key"
              class="dropdown-item"
              @click="selectGender(key)"
            >
              {{ label }}
            </div>
          </div>
        </div>

        <!-- Age Select -->
        <div class="input-group">
          <img src="/images/创建页/Age.png" alt="Age" class="input-label" />
          <div class="select-box" @click="toggleAgeDropdown">
            <span class="select-text">{{ getAgeLabel(childAge) }}</span>
            <span class="select-arrow">▼</span>
          </div>
          <!-- Age Dropdown -->
          <div v-if="showAgeDropdown" class="dropdown-menu dropdown-menu-age">
            <div
              v-for="age in ageOptions"
              :key="age"
              class="dropdown-item"
              @click="selectAge(age)"
            >
              {{ getAgeLabel(age) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Next Step Button -->
      <img src="/images/创建页/L.png" alt="Next Step" class="next-button" @click="handleNextStep1" />

      <!-- Home Indicator -->
      <div class="home-indicator"></div>
    </div>

    <!-- ========== STEP 2: Select Theme (Keep SVG for now) ========== -->
    <div v-if="currentStep === 2" class="step-2">
      <object data="/SVG/create-new-2.svg" type="image/svg+xml" class="full-screen-svg step-new-2-svg" @load="onNewStep2SvgLoad"></object>
    </div>

    <!-- ========== STEP 3: AI Preview (New Design) ========== -->
    <div v-if="currentStep === 3" class="step-3">
      <!-- Status Bar (54px) -->
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="levels">
          <div class="wifi"></div>
          <div class="cellular"></div>
          <div class="battery">
            <div class="capacity"></div>
          </div>
        </div>
      </div>

      <!-- Top Navigation (54px) -->
      <div class="top-nav">
        <img src="/images/创建页/返回.png" alt="Back" class="back-button" @click="goToPreviewBack" />
        <img src="/images/创建页/Create a story.png" alt="Create a story" class="title-image" />
      </div>

      <!-- Title Label -->
      <img src="/images/创建页/Previewing_ page 1.png" alt="Previewing page 1" class="preview-title" />

      <!-- Preview Image Area -->
      <div class="preview-image-container">
        <img
          v-if="uploadedPhoto"
          :src="uploadedPhoto"
          alt="Preview"
          class="preview-image"
        />
        <img
          v-else
          src="/images/首页/背景.png"
          alt="Placeholder"
          class="preview-placeholder"
        />
        <img src="/images/创建页/Mask group.png" alt="Mask" class="preview-mask" />
      </div>

      <!-- Input Section PNG (Question + Two Buttons) -->
      <img src="/images/创建页/输入框1.png" alt="Input section" class="input-section-png" />

      <!-- Clickable overlays for buttons -->
      <div class="create-button-overlay" @click="handleConfirm"></div>
      <div class="regenerate-button-overlay" @click="handleRegenerateCover"></div>

      <!-- Public Toggle (主按钮) - Separate element with text and toggle -->
      <div class="public-toggle-main">
        <span class="public-toggle-label">Public: Others can read this book.</span>
        <div class="public-toggle-switch" :class="{ active: isPublic }" @click="togglePublic">
          <div class="public-toggle-knob"></div>
        </div>
      </div>

      <!-- Home Indicator -->
      <div class="home-indicator"></div>
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

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { generateCharacter, generateStory } from '../../api/backend'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const wrapperRef = ref<HTMLElement | null>(null)

// State
const isLoading = ref(false)
const loadingMessage = ref('Creating magic...')
const currentStep = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)
const nicknameInputRef = ref<HTMLInputElement | null>(null)

// SVG document references (for Step 2 & 3)
let newStep2SvgDoc: Document | null = null
let previewSvgDoc: Document | null = null

// Form data
const uploadedPhoto = ref<string | null>(null)
const nickname = ref('')
const childGender = ref<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say')
const childAge = ref(3)
const selectedTheme = ref<number | null>(null)
const isPublic = ref(false)

// Dropdown states
const showGenderDropdown = ref(false)
const showAgeDropdown = ref(false)

// Options
const genderOptions = {
  male: 'Boy',
  female: 'Girl',
  prefer_not_to_say: 'Prefer not to say'
}
const ageOptions = Array.from({ length: 12 }, (_, i) => i + 1)

// User stats
const userStoryCount = ref(0)
const dailyRegenCount = ref(0)

// Toast
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
  if (!childGender.value) {
    triggerToast('请选择宝宝的性别')
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
const isNewUser = computed(() => {
  const stories = JSON.parse(localStorage.getItem('stories') || '[]')
  return stories.length === 0
})

// Helper functions
const getGenderLabel = (gender: string) => {
  return genderOptions[gender as keyof typeof genderOptions] || 'Unknown'
}

const getAgeLabel = (age: number) => {
  return age === 1 ? '1 year old' : `${age} years old`
}

const focusNickname = () => {
  nextTick(() => {
    nicknameInputRef.value?.focus()
  })
}

const toggleGenderDropdown = () => {
  showGenderDropdown.value = !showGenderDropdown.value
  showAgeDropdown.value = false
}

const toggleAgeDropdown = () => {
  showAgeDropdown.value = !showAgeDropdown.value
  showGenderDropdown.value = false
}

const selectGender = (key: string) => {
  childGender.value = key as any
  showGenderDropdown.value = false
  saveData()
}

const selectAge = (age: number) => {
  childAge.value = age
  showAgeDropdown.value = false
  saveData()
}

// Close dropdowns when clicking outside
const handleGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.input-group')) {
    showGenderDropdown.value = false
    showAgeDropdown.value = false
  }
}

// ========== SVG INTERACTIONS - Step 2 (Theme Selection) ==========
const onNewStep2SvgLoad = () => {
  console.log('=== create-new-2.svg loaded ===')

  const objectEl = document.querySelector('.step-new-2-svg') as HTMLObjectElement
  if (!objectEl) {
    console.error('SVG object element not found for create-new-2')
    return
  }

  newStep2SvgDoc = objectEl.contentDocument
  if (!newStep2SvgDoc) {
    console.error('Cannot access SVG document for create-new-2')
    return
  }

  console.log('SVG loaded, setting up interactions for theme selection...')

  const svgRoot = newStep2SvgDoc.querySelector('svg')
  if (!svgRoot) {
    console.error('SVG root not found')
    return
  }

  // 1. 返回按钮
  const backButton = newStep2SvgDoc.getElementById('back-button')
  if (backButton) {
    console.log('✅ Found back-button')
    backButton.style.cursor = 'pointer'
    backButton.style.pointerEvents = 'auto'
    backButton.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('🔙 Back button clicked (step 2)')
      goToStep(1)
    })
  }

  // 2. 主题选项
  for (let i = 1; i <= 4; i++) {
    const themeOption = newStep2SvgDoc.getElementById(`theme-option-${i}`) as SVGRectElement
    if (themeOption) {
      console.log(`✅ Found theme-option-${i}`)
      themeOption.style.cursor = 'pointer'
      themeOption.style.pointerEvents = 'auto'

      themeOption.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log(`🎨 Theme ${i} clicked`)
        selectTheme(i)
        updateThemeSelection(newStep2SvgDoc, svgRoot, i)
      })

      if (selectedTheme.value === i) {
        updateThemeSelection(newStep2SvgDoc, svgRoot, i)
      }
    }
  }

  watch(selectedTheme, (newTheme) => {
    if (newStep2SvgDoc && svgRoot) {
      updateThemeSelection(newStep2SvgDoc, svgRoot, newTheme)
    }
  })

  // 3. Next 按钮
  const allRects = newStep2SvgDoc.querySelectorAll('rect')
  allRects.forEach((rect) => {
    const x = parseFloat(rect.getAttribute('x') || '0')
    const y = parseFloat(rect.getAttribute('y') || '0')
    const width = parseFloat(rect.getAttribute('width') || '0')
    const height = parseFloat(rect.getAttribute('height') || '0')

    if (Math.abs(x - 28) < 1 && Math.abs(y - 752) < 2 && width >= 340 && width <= 343 && height >= 47 && height <= 49) {
      rect.style.cursor = 'pointer'
      rect.style.pointerEvents = 'auto'
      rect.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log('➡️ Next button clicked (step 2)')

        if (!selectedTheme.value) {
          triggerToast('请选择一个主题')
          return
        }

        goToStep(3)
      })
      console.log('✅ Added click to next button rect')
    }
  })

  console.log('create-new-2.svg interactions setup complete')
}

const updateThemeSelection = (svgDoc: Document, svgRoot: SVGSVGElement, selectedId: number) => {
  for (let i = 1; i <= 4; i++) {
    const oldRadio = svgDoc.getElementById(`theme-radio-${i}`)
    oldRadio?.remove()
  }

  const themeOption = svgDoc.getElementById(`theme-option-${selectedId}`) as SVGRectElement
  if (!themeOption) return

  const x = parseFloat(themeOption.getAttribute('x') || '0')
  const y = parseFloat(themeOption.getAttribute('y') || '0')
  const width = parseFloat(themeOption.getAttribute('width') || '0')

  const radioGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  radioGroup.setAttribute('id', `theme-radio-${selectedId}`)

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', (x + width - 30).toString())
  circle.setAttribute('cy', (y + 34).toString())
  circle.setAttribute('r', '10')
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', '#4A90E2')
  circle.setAttribute('stroke-width', '3')

  const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  innerCircle.setAttribute('cx', (x + width - 30).toString())
  innerCircle.setAttribute('cy', (y + 34).toString())
  innerCircle.setAttribute('r', '5')
  innerCircle.setAttribute('fill', '#4A90E2')

  radioGroup.appendChild(circle)
  radioGroup.appendChild(innerCircle)
  svgRoot.appendChild(radioGroup)
}

// ========== SVG INTERACTIONS - Step 3 (Preview) ==========
const onPreviewSvgLoad = () => {
  console.log('=== create-preview.svg loaded ===')

  const objectEl = document.querySelector('.step-preview-svg') as HTMLObjectElement
  if (!objectEl) {
    console.error('SVG object element not found for preview')
    return
  }

  previewSvgDoc = objectEl.contentDocument
  if (!previewSvgDoc) {
    console.error('Cannot access SVG document for preview')
    return
  }

  console.log('SVG loaded, setting up interactions for preview...')

  const svgRoot = previewSvgDoc.querySelector('svg')
  if (!svgRoot) {
    console.error('SVG root not found')
    return
  }

  // 1. 返回按钮
  const backButton = previewSvgDoc.getElementById('back-button')
  if (backButton) {
    console.log('✅ Found back-button')
    backButton.style.cursor = 'pointer'
    backButton.style.pointerEvents = 'auto'
    backButton.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('🔙 Back button clicked (preview)')
      goToPreviewBack()
    })
  }

  // 2. Public toggle
  const publicToggle = previewSvgDoc.getElementById('public-toggle')
  if (publicToggle) {
    console.log('✅ Found public-toggle')
    publicToggle.style.cursor = 'pointer'
    publicToggle.style.pointerEvents = 'auto'
    publicToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('🔘 Public toggle clicked')
      togglePublic()
    })

    updatePublicToggleDisplay(previewSvgDoc, svgRoot)
  }

  watch(isPublic, (newValue) => {
    if (previewSvgDoc && svgRoot) {
      updatePublicToggleDisplay(previewSvgDoc, svgRoot)
    }
  })

  // 3. Yes 按钮
  const yesButton = previewSvgDoc.getElementById('yes-button')
  if (yesButton) {
    console.log('✅ Found yes-button')
    yesButton.style.cursor = 'pointer'
    yesButton.style.pointerEvents = 'auto'
    yesButton.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('✅ Yes button clicked')
      handleConfirm()
    })

    const allRects = previewSvgDoc.querySelectorAll('rect')
    allRects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0')
      const y = parseFloat(rect.getAttribute('y') || '0')
      const width = parseFloat(rect.getAttribute('width') || '0')
      const height = parseFloat(rect.getAttribute('height') || '0')

      if (!rect.getAttribute('id') && Math.abs(x - 28) < 1 && Math.abs(y - 652) < 2 && width >= 340 && width <= 344 && height >= 54 && height <= 58) {
        rect.style.cursor = 'pointer'
        rect.style.pointerEvents = 'auto'
        rect.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('✅ Yes button clicked (shadow)')
          handleConfirm()
        })
      }
    })
  }

  // 4. No 按钮
  const noButton = previewSvgDoc.getElementById('no-button')
  if (noButton) {
    console.log('✅ Found no-button')
    noButton.style.cursor = 'pointer'
    noButton.style.pointerEvents = 'auto'
    noButton.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('❌ No button clicked')
      handleRegenerateCover()
    })

    const allRects = previewSvgDoc.querySelectorAll('rect')
    allRects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0')
      const y = parseFloat(rect.getAttribute('y') || '0')
      const width = parseFloat(rect.getAttribute('width') || '0')
      const height = parseFloat(rect.getAttribute('height') || '0')

      if (!rect.getAttribute('id') && Math.abs(x - 28) < 1 && Math.abs(y - 724) < 2 && width >= 340 && width <= 344 && height >= 54 && height <= 58) {
        rect.style.cursor = 'pointer'
        rect.style.pointerEvents = 'auto'
        rect.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('❌ No button clicked (border)')
          handleRegenerateCover()
        })
      }
    })
  }

  if (uploadedPhoto.value) {
    updatePreviewImage(uploadedPhoto.value)
  }

  console.log('create-preview.svg interactions setup complete')
}

const updatePublicToggleDisplay = (svgDoc: Document, svgRoot: SVGSVGElement) => {
  const publicToggle = svgDoc.getElementById('public-toggle') as SVGRectElement
  if (!publicToggle) return

  const x = parseFloat(publicToggle.getAttribute('x') || '0')
  const y = parseFloat(publicToggle.getAttribute('y') || '0')
  const width = parseFloat(publicToggle.getAttribute('width') || '0')

  const oldToggleIndicator = svgDoc.getElementById('toggle-indicator')
  oldToggleIndicator?.remove()

  const toggleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  toggleGroup.setAttribute('id', 'toggle-indicator')

  const toggleBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  toggleBg.setAttribute('x', (x + width - 60).toString())
  toggleBg.setAttribute('y', (y + 19).toString())
  toggleBg.setAttribute('width', '50')
  toggleBg.setAttribute('height', '28')
  toggleBg.setAttribute('rx', '14')
  toggleBg.setAttribute('fill', isPublic.value ? '#4A90E2' : '#ccc')
  toggleGroup.appendChild(toggleBg)

  const toggleSlider = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  toggleSlider.setAttribute('cx', isPublic.value ? (x + width - 20).toString() : (x + width - 50).toString())
  toggleSlider.setAttribute('cy', (y + 33).toString())
  toggleSlider.setAttribute('r', '12')
  toggleSlider.setAttribute('fill', 'white')
  toggleSlider.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
  toggleGroup.appendChild(toggleSlider)

  svgRoot.appendChild(toggleGroup)
}

onMounted(() => {
  // Load user stats
  userStoryCount.value = parseInt(localStorage.getItem('userStoryCount') || '0')
  checkDailyRegenLimit()

  // Load saved data
  const savedPhoto = localStorage.getItem('savedPhoto')
  const savedData = localStorage.getItem('createStoryData')

  if (savedPhoto) {
    uploadedPhoto.value = savedPhoto
  }

  if (savedData) {
    const data = JSON.parse(savedData)
    nickname.value = data.nickname || ''
    childGender.value = data.childGender || 'prefer_not_to_say'
    childAge.value = data.childAge || ''
    selectedTheme.value = data.selectedTheme || null
    isPublic.value = data.isPublic || false
  }

  // Set initial step
  currentStep.value = 1

  // Add global click listener for closing dropdowns
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
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
    if (window.history.state && window.history.state.back) {
      router.back()
    } else {
      router.push('/')
    }
  }
}

const goToPreviewBack = () => {
  currentStep.value = 2
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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('图片大小不能超过5MB')
      return
    }

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
  saveData()
}

const selectTheme = (themeId: number) => {
  selectedTheme.value = themeId
}

const saveData = () => {
  const data = {
    nickname: nickname.value,
    childGender: childGender.value,
    childAge: childAge.value,
    selectedTheme: selectedTheme.value,
    uploadedPhoto: uploadedPhoto.value,
    isPublic: isPublic.value
  }
  localStorage.setItem('createStoryData', JSON.stringify(data))
}

const togglePublic = () => {
  isPublic.value = !isPublic.value
  saveData()
}

const getThemeName = (id: number) => {
  const themes = ['Space Adventure', 'Jungle Safari', 'Ocean Explorer', 'Superhero']
  return themes[id - 1] || 'Space Adventure'
}

const handleConfirm = async () => {
  if (userStoryCount.value >= 3) {
    console.log('User has generated 3+ stories, redirecting to payment')
    router.push('/payment')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Creating your story...'

  try {
    await new Promise(resolve => setTimeout(resolve, 3000))

    userStoryCount.value++
    localStorage.setItem('userStoryCount', userStoryCount.value.toString())

    userStore.addStory({
      title: `${nickname.value || 'Hero'}'s ${getThemeName(selectedTheme.value || 1)} Story`,
      characterName: nickname.value || 'Hero',
      coverImage: uploadedPhoto.value || '/images/preview-placeholder.png',
      theme: getThemeName(selectedTheme.value || 1),
      isPublic: isPublic.value
    })

    router.push('/brushing')
  } catch (error) {
    console.error(error)
    triggerToast('Failed to generate story. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const checkDailyRegenLimit = (): boolean => {
  const today = new Date().toDateString()
  const savedDate = localStorage.getItem('regenDate')
  const savedCount = localStorage.getItem('dailyRegenCount')

  if (savedDate === today) {
    dailyRegenCount.value = parseInt(savedCount || '0')
  } else {
    dailyRegenCount.value = 0
    localStorage.setItem('regenDate', today)
    localStorage.setItem('dailyRegenCount', '0')
  }

  return dailyRegenCount.value < 3
}

const handleRegenerateCover = async () => {
  if (!checkDailyRegenLimit()) {
    triggerToast('今日重新生成次数已用完，明天再试')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Regenerating cover...'

  try {
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (uploadedPhoto.value) {
      updatePreviewImage(uploadedPhoto.value)
    }

    dailyRegenCount.value++
    localStorage.setItem('dailyRegenCount', dailyRegenCount.value.toString())
    localStorage.setItem('regenDate', new Date().toDateString())

    console.log('Cover regenerated, daily count:', dailyRegenCount.value)
  } catch (error) {
    console.error(error)
    triggerToast('生成失败，请重新尝试')
  } finally {
    isLoading.value = false
  }
}

const updatePreviewImage = (imageSrc: string) => {
  if (!previewSvgDoc) return

  const pattern0 = previewSvgDoc.getElementById('pattern0_1183_631')
  if (!pattern0) {
    console.error('pattern0_1183_631 not found')
    return
  }

  let image0 = previewSvgDoc.getElementById('image0_1183_631') as SVGImageElement
  if (!image0) {
    const svgRoot = previewSvgDoc.querySelector('svg')
    if (!svgRoot) return

    image0 = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image0.setAttribute('id', 'image0_1183_631')
    image0.setAttribute('width', '343')
    image0.setAttribute('height', '267')
    svgRoot.appendChild(image0)
    console.log('Created image0_1183_631 element')
  }

  image0.setAttribute('href', imageSrc)
  image0.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageSrc)
  image0.setAttribute('preserveAspectRatio', 'xMidYMid slice')

  const useElement = pattern0.querySelector('use')
  if (useElement) {
    useElement.setAttribute('transform', 'scale(343, 267)')
    console.log('Updated pattern0 use transform to: scale(343, 267)')
  }

  console.log('Preview image updated successfully')
}
</script>

<style scoped>
.create-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: 390px;
  height: 844px;
  overflow: hidden;
  background: #FFFFFF;
}

/* ========== STEP 1 STYLES ========== */
.step-1 {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Status Bar */
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 390px;
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 10;
}

.time {
  font-family: 'PingFang SC';
  font-weight: 600;
  font-size: 17px;
  color: #000000;
}

.levels {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wifi {
  width: 17px;
  height: 12px;
  background: #000000;
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}

.cellular {
  width: 19px;
  height: 12px;
  background: #000000;
  clip-path: polygon(0 0, 20% 0, 20% 40%, 40% 40%, 40% 0, 60% 0, 60% 60%, 80% 60%, 80% 0, 100% 0, 100% 100%, 0 100%);
}

.battery {
  position: relative;
  width: 25px;
  height: 12px;
  border: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 4px;
}

.battery::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 3px;
  width: 1.33px;
  height: 6px;
  background: #000000;
  border-radius: 0 2px 2px 0;
}

.capacity {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 21px;
  height: 8px;
  background: #000000;
  border-radius: 2px;
}

/* Top Navigation */
.top-nav {
  position: absolute;
  top: 54px;
  left: 0;
  width: 390px;
  height: 54px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.back-button {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  cursor: pointer;
  z-index: 11;
}

.title-image {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 28px;
  width: auto;
}

/* Main Content */
.main-content {
  position: absolute;
  left: 24px;
  top: 124px;
  width: 343px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Upload Section */
.upload-section {
  position: relative;
  width: 342px;
  height: 135px;
}

.upload-label {
  display: block;
}

.upload-area {
  position: absolute;
  width: 80px;
  height: 80px;
  left: 0;
  top: 55px;
  background: transparent;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  width: 28px;
  height: 28px;
  position: relative;
  opacity: 0.8;
}

.plus-icon::before,
.plus-icon::after {
  content: '';
  position: absolute;
  background: #101010;
  border-radius: 2px;
}

.plus-icon::before {
  width: 2px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.plus-icon::after {
  width: 100%;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
}

.uploaded-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #FF6B6B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-x {
  font-size: 18px;
  color: #FF6B6B;
  font-weight: bold;
  line-height: 1;
}

/* Input Groups */
.input-group {
  position: relative;
  width: 343px;
}

.input-label {
  display: block;
  margin-bottom: 10px;
}

.input-box,
.select-box {
  width: 343px;
  height: 54px;
  background: #FFFFFF;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: text;
}

.select-box {
  cursor: pointer;
  justify-content: space-between;
}

.text-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.text-input::placeholder {
  color: #8E8E9D;
}

.select-text {
  font-size: 14px;
  color: #333;
}

.select-arrow {
  font-size: 12px;
  color: #3A4750;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 343px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.dropdown-menu-age {
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

/* Next Button */
.next-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 748px;
  width: 342px;
  height: 48px;
  cursor: pointer;
  z-index: 10;
}

/* Home Indicator */
.home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 139px;
  height: 5px;
  background: #000000;
  border-radius: 100px;
}

/* ========== STEP 2 & 3 STYLES (Keep SVG) ========== */
.full-screen-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.step-new-2-svg,
.step-preview-svg {
  width: 390px;
  height: 836px;
  left: 0;
  top: 4px;
  position: absolute;
  object-fit: contain;
}

/* ========== COMMON ========== */
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

/* ========== STEP 3 STYLES (Preview - New Design) ========== */
.step-3 {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Preview Image Container - According to CSS: top: 156px, left: 24px, height: 257px */
.preview-image-container {
  position: absolute;
  left: 24px;
  top: 156px;
  width: 343px;
  height: 257px;
  background: #EAF6FF;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 16px;
  overflow: hidden;
}

/* Preview Title - According to CSS: position absolute, top: 124px, left: 24px, height: 22px */
.preview-title {
  position: absolute;
  left: 24px;
  top: 124px;
  width: 343px;
  height: 22px;
  display: block;
  object-fit: contain;
  object-position: left;
}

/* Preview Image Container */
.preview-image-container {
  position: relative;
  width: 343px;
  height: 257px;
  background: #EAF6FF;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 16px;
  overflow: hidden;
}

.preview-image,
.preview-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Input Section PNG (Question + Two Buttons) - According to CSS: top: 553px, height: 182px */
.input-section-png {
  position: absolute;
  left: 24px;
  top: 553px;
  width: 343px;
  height: 182px;
  display: block;
  object-fit: contain;
}

/* Create Button Overlay (Clickable Area) - Inside 输入框1 */
.create-button-overlay {
  position: absolute;
  left: 24px;
  top: 607px;
  width: 342px;
  height: 56px;
  cursor: pointer;
  z-index: 20;
}

/* Regenerate Button Overlay (Clickable Area) - Inside 输入框1 */
.regenerate-button-overlay {
  position: absolute;
  left: 24px;
  top: 679px;
  width: 342px;
  height: 56px;
  cursor: pointer;
  z-index: 20;
}

/* Public Toggle Main (主按钮) - According to CSS: bottom: 327px, height: 68px */
.public-toggle-main {
  position: absolute;
  left: 23px;
  bottom: 327px;
  width: 343px;
  height: 68px;
  background: #FFFFFF;
  border: 1px solid rgba(105, 105, 105, 0.25);
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  gap: 8px;
  box-sizing: border-box;
}

/* Public Toggle Label */
.public-toggle-label {
  flex: none;
  order: 0;
  width: 252px;
  height: 20px;
  font-family: 'PingFang SC';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #FF9718;
}

/* Public Toggle Switch */
.public-toggle-switch {
  position: relative;
  flex: none;
  order: 1;
  width: 51px;
  height: 30px;
  background: #B4B4B4;
  border-radius: 100px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.public-toggle-switch.active {
  background: #4A90E2;
}

/* Public Toggle Knob */
.public-toggle-knob {
  position: absolute;
  width: 26px;
  height: 26px;
  right: 23px;
  top: calc(50% - 26px/2);
  background: #FFFFFF;
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 3px 8px rgba(0, 0, 0, 0.15), 0px 3px 1px rgba(0, 0, 0, 0.06);
  border-radius: 100px;
  transition: right 0.3s ease;
}

.public-toggle-switch.active .public-toggle-knob {
  right: 2px;
}
</style>
