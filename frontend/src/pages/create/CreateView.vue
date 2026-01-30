<template>
  <div class="create-container">
    <div class="mobile-wrapper" ref="wrapperRef">
    <!-- ========== UNIFIED FLOW (New + Existing Users) ========== -->

    <!-- Step 1: Upload photo, nickname, gender, age -->
    <div v-if="currentStep === 1" class="step-new-1">
      <object data="/SVG/create-new-1.svg" type="image/svg+xml" class="full-screen-svg step-new-1-svg" @load="onNewStep1SvgLoad"></object>

      <!-- Hidden file input for upload -->
      <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
    </div>

    <!-- Step 2: Select theme -->
    <div v-if="currentStep === 2" class="step-new-2">
      <object data="/SVG/create-new-2.svg" type="image/svg+xml" class="full-screen-svg step-new-2-svg" @load="onNewStep2SvgLoad"></object>
    </div>

    <!-- ========== PREVIEW STEP (SHARED) ========== -->

    <div v-if="currentStep === 3" class="step-preview">
      <object data="/SVG/create-preview.svg" type="image/svg+xml" class="full-screen-svg step-preview-svg" @load="onPreviewSvgLoad"></object>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { generateCharacter, generateStory } from '../../api/backend'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const wrapperRef = ref<HTMLElement | null>(null)
const debugEnabled = ref(false)

// State
const isLoading = ref(false)
const loadingMessage = ref('Creating magic...')
const currentStep = ref(1)
const fileInput = ref<HTMLInputElement | null>(null)

// SVG document references
let newStep1SvgDoc: Document | null = null
let newStep2SvgDoc: Document | null = null
let previewSvgDoc: Document | null = null

const uploadedPhoto = ref<string | null>(null)
const nickname = ref('')
const childGender = ref<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say')
const childAge = ref(3)
const selectedTheme = ref<number | null>(null)
const previewImage = ref<string>('/images/preview-placeholder.png')
const previewVersion = ref(0)
const isPublic = ref(false) // Public toggle state

// User story generation stats
const userStoryCount = ref(0) // 用户已生成绘本数
const dailyRegenCount = ref(0) // 今日重新生成封面次数

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
// Check if user is new or existing - based on whether they have completed stories
const isNewUser = computed(() => {
  const stories = JSON.parse(localStorage.getItem('stories') || '[]')
  return stories.length === 0
})

// ========== SVG INTERACTIONS - create-new-1.svg ==========
const onNewStep1SvgLoad = () => {
  console.log('=== create-new-1.svg loaded ===')

  // 原则1: 访问 SVG 内部 DOM
  const objectEl = document.querySelector('.step-new-1-svg') as HTMLObjectElement
  if (!objectEl) {
    console.error('SVG object element not found')
    return
  }

  newStep1SvgDoc = objectEl.contentDocument
  if (!newStep1SvgDoc) {
    console.error('Cannot access SVG document')
    return
  }

  console.log('SVG document accessed successfully')

  // 原则2: 通过 ID 定位 SVG 中的元素并添加交互

  const svgRoot = newStep1SvgDoc.querySelector('svg')
  if (!svgRoot) {
    console.error('SVG root not found')
    return
  }

  // 1. 返回按钮
  const backButton = newStep1SvgDoc.getElementById('back-button')
  if (backButton) {
    console.log('✅ Found back-button')
    backButton.style.cursor = 'pointer'
    backButton.style.pointerEvents = 'auto'
    backButton.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('🔙 Back button clicked!')
      goBack()
    })
  }

  // 2. 上传照片区域
  const uploadArea = newStep1SvgDoc.getElementById('upload-area')
  if (uploadArea) {
    console.log('✅ Found upload-area')
    uploadArea.style.cursor = 'pointer'
    uploadArea.style.pointerEvents = 'auto'
    uploadArea.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('📷 Upload area clicked!')
      triggerUpload()
    })
  }

  // 3. 昵称输入 - 通过ID定位
  const nicknameInput = newStep1SvgDoc.getElementById('nickname-input')
  if (nicknameInput) {
    console.log('✅ Found nickname-input')
    nicknameInput.style.cursor = 'text'
    nicknameInput.style.pointerEvents = 'auto'

    let nicknameTextElement: SVGTextElement | null = null

    // 隐藏原始文字path - 扩大范围确保覆盖所有可能的文字元素
    const allPaths = newStep1SvgDoc.querySelectorAll('path')
    allPaths.forEach((path) => {
      try {
        const bbox = path.getBBox()
        // 昵称区域: 扩大范围确保覆盖原始文字
        if (bbox.x >= 20 && bbox.x <= 380 && bbox.y >= 310 && bbox.y <= 400) {
          path.style.display = 'none'
          path.style.visibility = 'hidden'
          path.setAttribute('display', 'none')
        }
      } catch (e) {
        // Ignore paths without bbox
      }
    })

    // 同时隐藏该区域可能的text元素
    const allTexts = newStep1SvgDoc.querySelectorAll('text')
    allTexts.forEach((text) => {
      try {
        const x = parseFloat(text.getAttribute('x') || '0')
        const y = parseFloat(text.getAttribute('y') || '0')
        if (x >= 20 && x <= 380 && y >= 310 && y <= 400) {
          text.style.display = 'none'
          text.style.visibility = 'hidden'
          text.setAttribute('display', 'none')
        }
      } catch (e) {}
    })

    // 创建新的 text 元素显示用户输入
    nicknameTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    nicknameTextElement.setAttribute('id', 'nickname-text-display')
    nicknameTextElement.setAttribute('x', '44')
    nicknameTextElement.setAttribute('y', '355')
    nicknameTextElement.setAttribute('fill', '#333')
    nicknameTextElement.setAttribute('font-size', '16')
    nicknameTextElement.setAttribute('font-family', 'Arial, sans-serif')
    nicknameTextElement.textContent = nickname.value || 'e.g. Leo'
    svgRoot.appendChild(nicknameTextElement)

    // 点击时创建编辑器
    nicknameInput.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('✏️ Nickname area clicked')

      let inputContainer = newStep1SvgDoc.getElementById('nickname-input-container')
      if (!inputContainer) {
        inputContainer = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
        inputContainer.setAttribute('id', 'nickname-input-container')
        inputContainer.setAttribute('x', '28')
        inputContainer.setAttribute('y', '323')
        inputContainer.setAttribute('width', '343')
        inputContainer.setAttribute('height', '54')

        const inputDiv = document.createElement('div')
        inputDiv.style.width = '100%'
        inputDiv.style.height = '100%'
        inputDiv.style.display = 'flex'
        inputDiv.style.alignItems = 'center'

        const input = document.createElement('input')
        input.type = 'text'
        input.value = nickname.value
        input.placeholder = 'e.g. Leo'
        input.style.width = '100%'
        input.style.height = '100%'
        input.style.border = 'none'
        input.style.background = 'transparent'
        input.style.fontSize = '16px'
        input.style.padding = '0 16px'
        input.style.boxSizing = 'border-box'
        input.style.outline = 'none'
        input.style.color = '#333'

        input.addEventListener('input', (e) => {
          nickname.value = (e.target as HTMLInputElement).value
          if (nicknameTextElement) {
            nicknameTextElement.textContent = nickname.value || 'e.g. Leo'
          }
        })

        input.addEventListener('click', (e) => e.stopPropagation())

        input.addEventListener('blur', () => {
          setTimeout(() => inputContainer?.remove(), 100)
        })

        inputDiv.appendChild(input)
        inputContainer.appendChild(inputDiv)
        svgRoot.appendChild(inputContainer)
        nextTick(() => input.focus())
      } else {
        const input = inputContainer.querySelector('input')
        input?.focus()
      }
    })

    watch(nickname, (newValue) => {
      if (nicknameTextElement) {
        nicknameTextElement.textContent = newValue || 'e.g. Leo'
      }
    })
  }

  // 4. 性别选择 - 通过ID定位
  const genderInput = newStep1SvgDoc.getElementById('gender-input')
  if (genderInput) {
    console.log('✅ Found gender-input')
    genderInput.style.cursor = 'pointer'
    genderInput.style.pointerEvents = 'auto'

    const labels = { male: 'Boy', female: 'Girl', prefer_not_to_say: 'Prefer not to say' }
    let genderDropdown: HTMLElement | null = null
    let genderTextElement: SVGTextElement | null = null

    // 隐藏原始文字path
    const allPaths = newStep1SvgDoc.querySelectorAll('path')
    allPaths.forEach((path) => {
      try {
        const bbox = path.getBBox()
        // 性别区域: y ≈ 437-491
        if (bbox.y >= 430 && bbox.y <= 500 && bbox.x >= 20 && bbox.x <= 380) {
          path.style.display = 'none'
          path.style.visibility = 'hidden'
        }
      } catch (e) {}
    })

    // 同时隐藏该区域可能的text元素
    const allTexts = newStep1SvgDoc.querySelectorAll('text')
    allTexts.forEach((text) => {
      try {
        const x = parseFloat(text.getAttribute('x') || '0')
        const y = parseFloat(text.getAttribute('y') || '0')
        if (x >= 20 && x <= 380 && y >= 430 && y <= 500) {
          text.style.display = 'none'
          text.style.visibility = 'hidden'
        }
      } catch (e) {}
    })

    // 创建新的 text 元素显示用户选择
    genderTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    genderTextElement.setAttribute('id', 'gender-text-display')
    genderTextElement.setAttribute('x', '44')
    genderTextElement.setAttribute('y', '467')
    genderTextElement.setAttribute('fill', '#333')
    genderTextElement.setAttribute('font-size', '16')
    genderTextElement.setAttribute('font-family', 'Arial, sans-serif')
    genderTextElement.textContent = labels[childGender.value]
    svgRoot.appendChild(genderTextElement)

    // 创建下拉箭头
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    arrowPath.setAttribute('d', 'M 340 455 L 350 465 L 360 455')
    arrowPath.setAttribute('stroke', '#999')
    arrowPath.setAttribute('stroke-width', '2')
    arrowPath.setAttribute('fill', 'none')
    svgRoot.appendChild(arrowPath)

    genderInput.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('⚧ Gender clicked, showing dropdown')

      if (genderDropdown) {
        genderDropdown.remove()
        genderDropdown = null
      } else {
        genderDropdown = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
        genderDropdown.setAttribute('x', '28')
        genderDropdown.setAttribute('y', '491')
        genderDropdown.setAttribute('width', '343')
        genderDropdown.setAttribute('height', '150')

        const dropdownDiv = document.createElement('div')
        dropdownDiv.style.width = '100%'
        dropdownDiv.style.height = '100%'
        dropdownDiv.style.background = 'white'
        dropdownDiv.style.borderRadius = '12px'
        dropdownDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
        dropdownDiv.style.overflow = 'hidden'

        Object.entries(labels).forEach(([key, label], index) => {
          const option = document.createElement('div')
          option.textContent = label
          option.style.padding = '12px 16px'
          option.style.cursor = 'pointer'
          option.style.borderBottom = index < 2 ? '1px solid #eee' : 'none'
          option.style.fontSize = '16px'
          option.style.color = '#333'

          option.addEventListener('mouseenter', () => option.style.background = '#f5f5f5')
          option.addEventListener('mouseleave', () => option.style.background = 'white')

          option.addEventListener('click', (e) => {
            e.stopPropagation()
            childGender.value = key as any
            if (genderTextElement) {
              genderTextElement.textContent = label
            }
            genderDropdown?.remove()
            genderDropdown = null
            console.log('Gender selected:', label)
          })

          dropdownDiv.appendChild(option)
        })

        genderDropdown.appendChild(dropdownDiv)
        svgRoot.appendChild(genderDropdown)
      }
    })

    watch(childGender, (newValue) => {
      if (genderTextElement) {
        genderTextElement.textContent = labels[newValue]
      }
    })
  }

  // 5. 年龄选择 - 通过ID定位
  const ageInput = newStep1SvgDoc.getElementById('age-input')
  if (ageInput) {
    console.log('✅ Found age-input')
    ageInput.style.cursor = 'pointer'
    ageInput.style.pointerEvents = 'auto'

    const getAgeLabel = (age: number) => age === 1 ? '1 year old' : `${age} years old`
    let ageDropdown: HTMLElement | null = null
    let ageTextElement: SVGTextElement | null = null

    // 隐藏原始文字path
    const allPaths = newStep1SvgDoc.querySelectorAll('path')
    allPaths.forEach((path) => {
      try {
        const bbox = path.getBBox()
        // 年龄区域: y ≈ 551-605
        if (bbox.y >= 540 && bbox.y <= 620 && bbox.x >= 20 && bbox.x <= 380) {
          path.style.display = 'none'
          path.style.visibility = 'hidden'
        }
      } catch (e) {}
    })

    // 同时隐藏该区域可能的text元素
    const allTexts = newStep1SvgDoc.querySelectorAll('text')
    allTexts.forEach((text) => {
      try {
        const x = parseFloat(text.getAttribute('x') || '0')
        const y = parseFloat(text.getAttribute('y') || '0')
        if (x >= 20 && x <= 380 && y >= 540 && y <= 620) {
          text.style.display = 'none'
          text.style.visibility = 'hidden'
        }
      } catch (e) {}
    })

    // 创建新的 text 元素显示用户选择
    ageTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    ageTextElement.setAttribute('id', 'age-text-display')
    ageTextElement.setAttribute('x', '44')
    ageTextElement.setAttribute('y', '581')
    ageTextElement.setAttribute('fill', '#333')
    ageTextElement.setAttribute('font-size', '16')
    ageTextElement.setAttribute('font-family', 'Arial, sans-serif')
    ageTextElement.textContent = getAgeLabel(childAge.value)
    svgRoot.appendChild(ageTextElement)

    // 创建下拉箭头
    const arrowPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    arrowPath2.setAttribute('d', 'M 340 569 L 350 579 L 360 569')
    arrowPath2.setAttribute('stroke', '#999')
    arrowPath2.setAttribute('stroke-width', '2')
    arrowPath2.setAttribute('fill', 'none')
    svgRoot.appendChild(arrowPath2)

    ageInput.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('🎂 Age clicked, showing dropdown')

      if (ageDropdown) {
        ageDropdown.remove()
        ageDropdown = null
      } else {
        // 计算可用高度：SVG总高度852，下拉框从605开始，剩余247px
        // 但这样太小，所以需要向上扩展或者减小下拉框高度
        // 方案：向上弹出，使用更紧凑的设计
        const dropdownHeight = 240 // 显示约6个选项的高度
        const startY = 605 - dropdownHeight + 54 // 向上弹出

        ageDropdown = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
        ageDropdown.setAttribute('x', '28')
        ageDropdown.setAttribute('y', startY.toString())
        ageDropdown.setAttribute('width', '343')
        ageDropdown.setAttribute('height', dropdownHeight.toString())

        const dropdownDiv = document.createElement('div')
        dropdownDiv.style.width = '100%'
        dropdownDiv.style.height = '100%'
        dropdownDiv.style.background = 'white'
        dropdownDiv.style.borderRadius = '12px'
        dropdownDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
        dropdownDiv.style.overflow = 'auto'
        dropdownDiv.style.maxHeight = dropdownHeight + 'px'

        for (let i = 1; i <= 12; i++) {
          const option = document.createElement('div')
          const label = getAgeLabel(i)
          option.textContent = label
          option.style.padding = '10px 16px' // 减小padding
          option.style.cursor = 'pointer'
          option.style.borderBottom = i < 12 ? '1px solid #eee' : 'none'
          option.style.fontSize = '15px' // 减小字体
          option.style.color = '#333'
          option.style.flexShrink = '0'

          option.addEventListener('mouseenter', () => option.style.background = '#f5f5f5')
          option.addEventListener('mouseleave', () => option.style.background = 'white')

          option.addEventListener('click', (e) => {
            e.stopPropagation()
            childAge.value = i
            if (ageTextElement) {
              ageTextElement.textContent = label
            }
            ageDropdown?.remove()
            ageDropdown = null
            console.log('Age selected:', label)
          })

          dropdownDiv.appendChild(option)
        }

        ageDropdown.appendChild(dropdownDiv)
        svgRoot.appendChild(ageDropdown)
      }
    })

    watch(childAge, (newValue) => {
      if (ageTextElement) {
        ageTextElement.textContent = getAgeLabel(newValue)
      }
    })
  }

  // 6. Next 按钮 - 通过ID定位，但需要处理所有重叠的rect
  const nextButton = newStep1SvgDoc.getElementById('next-button')
  if (nextButton) {
    console.log('✅ Found next-button')

    // 找到next区域所有的rect元素（有4个重叠的rect）
    const allRects = newStep1SvgDoc.querySelectorAll('rect')
    allRects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0')
      const y = parseFloat(rect.getAttribute('y') || '0')
      const width = parseFloat(rect.getAttribute('width') || '0')
      const height = parseFloat(rect.getAttribute('height') || '0')

      // Next按钮区域: x=28, y=752, width=342, height=48
      if (Math.abs(x - 28) < 1 && Math.abs(y - 752) < 2 && width >= 340 && width <= 343 && height >= 47 && height <= 49) {
        rect.style.cursor = 'pointer'
        rect.style.pointerEvents = 'auto'
        rect.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('➡️ Next button clicked!')
          handleNextStep1()
        })
        console.log('✅ Added click to next button rect')
      }
    })
  }

  console.log('create-new-1.svg interactions setup complete')

  // 如果是老用户，立即显示已有数据
  if (uploadedPhoto.value) {
    console.log('📷 Existing user photo found, displaying...')
    // 触发照片显示
    nextTick(() => {
      displayUploadedPhoto(uploadedPhoto.value!)
    })
  }
}

// 显示已上传照片的函数（提取出来以便复用）
const displayUploadedPhoto = (photoData: string) => {
  if (!newStep1SvgDoc) return

  const svgRoot = newStep1SvgDoc.querySelector('svg')
  if (!svgRoot) return

  // 移除旧的图片和删除按钮
  const oldImage = newStep1SvgDoc.getElementById('uploaded-photo-image')
  const oldDelete = newStep1SvgDoc.getElementById('delete-button')
  oldImage?.remove()
  oldDelete?.remove()

  // 创建SVG image元素显示上传的照片
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('id', 'uploaded-photo-image')
  image.setAttribute('x', '28')
  image.setAttribute('y', '183')
  image.setAttribute('width', '80')
  image.setAttribute('height', '80')
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', photoData)
  image.setAttribute('href', photoData)

  // 创建clipPath实现圆角
  const clipPathId = 'photo-clip-' + Date.now()
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
  clipPath.setAttribute('id', clipPathId)

  const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  clipRect.setAttribute('x', '28')
  clipRect.setAttribute('y', '183')
  clipRect.setAttribute('width', '80')
  clipRect.setAttribute('height', '80')
  clipRect.setAttribute('rx', '12')
  clipRect.setAttribute('ry', '12')

  clipPath.appendChild(clipRect)
  svgRoot.appendChild(clipPath)

  image.setAttribute('clip-path', `url(#${clipPathId})`)
  svgRoot.appendChild(image)

  // 创建删除按钮
  const deleteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  deleteGroup.setAttribute('id', 'delete-button')
  deleteGroup.style.cursor = 'pointer'
  deleteGroup.style.pointerEvents = 'auto'

  const deleteBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  deleteBg.setAttribute('cx', '100')
  deleteBg.setAttribute('cy', '191')
  deleteBg.setAttribute('r', '12')
  deleteBg.setAttribute('fill', 'white')
  deleteBg.setAttribute('stroke', '#FF6B6B')
  deleteBg.setAttribute('stroke-width', '2')

  const deleteX1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  deleteX1.setAttribute('x1', '96')
  deleteX1.setAttribute('y1', '187')
  deleteX1.setAttribute('x2', '104')
  deleteX1.setAttribute('y2', '195')
  deleteX1.setAttribute('stroke', '#FF6B6B')
  deleteX1.setAttribute('stroke-width', '2')
  deleteX1.setAttribute('stroke-linecap', 'round')

  const deleteX2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  deleteX2.setAttribute('x1', '104')
  deleteX2.setAttribute('y1', '187')
  deleteX2.setAttribute('x2', '96')
  deleteX2.setAttribute('y2', '195')
  deleteX2.setAttribute('stroke', '#FF6B6B')
  deleteX2.setAttribute('stroke-width', '2')
  deleteX2.setAttribute('stroke-linecap', 'round')

  deleteGroup.appendChild(deleteBg)
  deleteGroup.appendChild(deleteX1)
  deleteGroup.appendChild(deleteX2)

  deleteGroup.addEventListener('click', (e) => {
    e.stopPropagation()
    console.log('🗑️ Delete button clicked')
    deletePhoto()
  })

  svgRoot.appendChild(deleteGroup)
}

// 监听数据变化，更新 SVG 显示
watch(uploadedPhoto, (newPhoto) => {
  if (newStep1SvgDoc && newPhoto) {
    console.log('📷 Photo changed, updating SVG')
    displayUploadedPhoto(newPhoto)
  } else if (newStep1SvgDoc && !newPhoto) {
    // 清除照片显示
    const oldImage = newStep1SvgDoc.getElementById('uploaded-photo-image')
    const oldDelete = newStep1SvgDoc.getElementById('delete-button')
    oldImage?.remove()
    oldDelete?.remove()
  }
})

// ========== SVG INTERACTIONS - create-new-2.svg (Theme Selection) ==========
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

  // 1. 返回按钮 - 通过ID定位
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

  // 2. 主题选项 - 通过ID定位
  for (let i = 1; i <= 4; i++) {
    const themeOption = newStep2SvgDoc.getElementById(`theme-option-${i}`) as SVGRectElement
    if (themeOption) {
      console.log(`✅ Found theme-option-${i}`)
      themeOption.style.cursor = 'pointer'
      themeOption.style.pointerEvents = 'auto'

      // 添加选中指示器（radio圆圈）
      let radioCircle = newStep2SvgDoc.getElementById(`theme-radio-${i}`)

      themeOption.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log(`🎨 Theme ${i} clicked`)
        selectTheme(i)

        // 更新选中状态
        updateThemeSelection(newStep2SvgDoc, svgRoot, i)
      })

      // 如果是当前选中的主题，显示选中状态
      if (selectedTheme.value === i) {
        updateThemeSelection(newStep2SvgDoc, svgRoot, i)
      }
    }
  }

  // 监听主题变化，同步更新SVG显示
  watch(selectedTheme, (newTheme) => {
    if (newStep2SvgDoc && svgRoot) {
      updateThemeSelection(newStep2SvgDoc, svgRoot, newTheme)
    }
  })

  // 3. Next 按钮 - 通过ID定位（处理多个重叠的rect）
  const allRects = newStep2SvgDoc.querySelectorAll('rect')
  allRects.forEach((rect) => {
    const x = parseFloat(rect.getAttribute('x') || '0')
    const y = parseFloat(rect.getAttribute('y') || '0')
    const width = parseFloat(rect.getAttribute('width') || '0')
    const height = parseFloat(rect.getAttribute('height') || '0')

    // Next按钮区域: x=28, y=752, width=342, height=48
    if (Math.abs(x - 28) < 1 && Math.abs(y - 752) < 2 && width >= 340 && width <= 343 && height >= 47 && height <= 49) {
      rect.style.cursor = 'pointer'
      rect.style.pointerEvents = 'auto'
      rect.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log('➡️ Next button clicked (step 2)')

        // 验证是否选择了主题
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

// 更新主题选中状态的函数
const updateThemeSelection = (svgDoc: Document, svgRoot: SVGSVGElement, selectedId: number) => {
  // 移除旧的选中指示器
  for (let i = 1; i <= 4; i++) {
    const oldRadio = svgDoc.getElementById(`theme-radio-${i}`)
    oldRadio?.remove()
  }

  // 添加新的选中指示器
  const themeOption = svgDoc.getElementById(`theme-option-${selectedId}`) as SVGRectElement
  if (!themeOption) return

  const x = parseFloat(themeOption.getAttribute('x') || '0')
  const y = parseFloat(themeOption.getAttribute('y') || '0')
  const width = parseFloat(themeOption.getAttribute('width') || '0')

  // 创建选中圆圈（在右侧）
  const radioGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  radioGroup.setAttribute('id', `theme-radio-${selectedId}`)

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', (x + width - 30).toString())
  circle.setAttribute('cy', (y + 34).toString())
  circle.setAttribute('r', '10')
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', '#4A90E2')
  circle.setAttribute('stroke-width', '3')

  // 内部实心圆
  const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  innerCircle.setAttribute('cx', (x + width - 30).toString())
  innerCircle.setAttribute('cy', (y + 34).toString())
  innerCircle.setAttribute('r', '5')
  innerCircle.setAttribute('fill', '#4A90E2')

  radioGroup.appendChild(circle)
  radioGroup.appendChild(innerCircle)
  svgRoot.appendChild(radioGroup)
}

// ========== SVG INTERACTIONS - create-preview.svg (Preview Page) ==========
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

  // 1. 返回按钮 - 通过ID定位
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

  // 2. Public toggle - 通过ID定位
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

    // 初始化显示当前public状态
    updatePublicToggleDisplay(previewSvgDoc, svgRoot)
  }

  // 监听isPublic变化，同步更新SVG显示
  watch(isPublic, (newValue) => {
    if (previewSvgDoc && svgRoot) {
      updatePublicToggleDisplay(previewSvgDoc, svgRoot)
    }
  })

  // 3. Yes 按钮 - 通过ID定位
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

    // 处理可能有重叠的rect（阴影效果）
    const allRects = previewSvgDoc.querySelectorAll('rect')
    allRects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0')
      const y = parseFloat(rect.getAttribute('y') || '0')
      const width = parseFloat(rect.getAttribute('width') || '0')
      const height = parseFloat(rect.getAttribute('height') || '0')

      // Yes按钮区域: x=28, y=652, width=342, height=56
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

  // 4. No 按钮 - 通过ID定位
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

    // 处理可能有重叠的rect（边框效果）
    const allRects = previewSvgDoc.querySelectorAll('rect')
    allRects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute('x') || '0')
      const y = parseFloat(rect.getAttribute('y') || '0')
      const width = parseFloat(rect.getAttribute('width') || '0')
      const height = parseFloat(rect.getAttribute('height') || '0')

      // No按钮区域: x=28, y=724, width=342, height=56
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

  // 5. 显示预览封面图
  if (uploadedPhoto.value) {
    updatePreviewImage(uploadedPhoto.value)
  }

  console.log('create-preview.svg interactions setup complete')
}

// 更新Public toggle显示状态的函数
const updatePublicToggleDisplay = (svgDoc: Document, svgRoot: SVGSVGElement) => {
  const publicToggle = svgDoc.getElementById('public-toggle') as SVGRectElement
  if (!publicToggle) return

  const x = parseFloat(publicToggle.getAttribute('x') || '0')
  const y = parseFloat(publicToggle.getAttribute('y') || '0')
  const width = parseFloat(publicToggle.getAttribute('width') || '0')

  // 移除旧的toggle状态指示器
  const oldToggleIndicator = svgDoc.getElementById('toggle-indicator')
  oldToggleIndicator?.remove()

  // 创建toggle状态指示器（开关按钮）
  const toggleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  toggleGroup.setAttribute('id', 'toggle-indicator')

  // 开关背景
  const toggleBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  toggleBg.setAttribute('x', (x + width - 60).toString())
  toggleBg.setAttribute('y', (y + 19).toString())
  toggleBg.setAttribute('width', '50')
  toggleBg.setAttribute('height', '28')
  toggleBg.setAttribute('rx', '14')
  toggleBg.setAttribute('fill', isPublic.value ? '#4A90E2' : '#ccc')
  toggleGroup.appendChild(toggleBg)

  // 开关滑块
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
  debugEnabled.value = new URLSearchParams(window.location.search).get('debug') === '1'

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

  // Set initial step based on user type
  if (uploadedPhoto.value) {
    currentStep.value = 1 // Existing user step 1
  } else {
    currentStep.value = 1 // New user step 1
  }
})

onUnmounted(() => {
  // Cleanup if needed
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
  // AI预览页返回到主题选择页（Step 2）
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
      childGender: childGender.value,
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
  // 检查用户已生成绘本数
  if (userStoryCount.value >= 3) {
    // 超过3本，跳转付费页
    console.log('User has generated 3+ stories, redirecting to payment')
    router.push('/payment')
    return
  }

  // 不超过3本，直接生成绘本
  isLoading.value = true
  loadingMessage.value = 'Creating your story...'

  try {
    // TODO: 调用生成绘本 API
    // 模拟 API 调用，3秒后跳转
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 用户生成绘本数 +1
    userStoryCount.value++
    localStorage.setItem('userStoryCount', userStoryCount.value.toString())

    // Save to Store (模拟数据)
    userStore.addStory({
      title: `${nickname.value || 'Hero'}'s ${getThemeName(selectedTheme.value || 1)} Story`,
      characterName: nickname.value || 'Hero',
      coverImage: uploadedPhoto.value || '/images/preview-placeholder.png',
      theme: getThemeName(selectedTheme.value || 1),
      isPublic: isPublic.value
    })

    // Navigate to brushing page
    router.push('/brushing')
  } catch (error) {
    console.error(error)
    triggerToast('Failed to generate story. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// 检查今日重新生成次数
const checkDailyRegenLimit = (): boolean => {
  const today = new Date().toDateString()
  const savedDate = localStorage.getItem('regenDate')
  const savedCount = localStorage.getItem('dailyRegenCount')

  if (savedDate === today) {
    dailyRegenCount.value = parseInt(savedCount || '0')
  } else {
    // 新的一天，重置计数
    dailyRegenCount.value = 0
    localStorage.setItem('regenDate', today)
    localStorage.setItem('dailyRegenCount', '0')
  }

  return dailyRegenCount.value < 3
}

// 重新生成封面
const handleRegenerateCover = async () => {
  // 检查是否超过每日限制
  if (!checkDailyRegenLimit()) {
    triggerToast('今日重新生成次数已用完，明天再试')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Regenerating cover...'

  try {
    // TODO: 调用生成封面 API
    // 模拟 API 调用，3秒后更新预览图
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 用用户上传的照片替换预览图（模拟新生成的封面）
    if (uploadedPhoto.value) {
      updatePreviewImage(uploadedPhoto.value)
    }

    // 今日重新生成数 +1
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

// 更新预览图（替换使用 pattern0_1183_631 的 path 区域的图片）
const updatePreviewImage = (imageSrc: string) => {
  if (!previewSvgDoc) return

  // 获取 pattern0 元素
  const pattern0 = previewSvgDoc.getElementById('pattern0_1183_631')
  if (!pattern0) {
    console.error('pattern0_1183_631 not found')
    return
  }

  // 检查是否已有 image0_1183_631 元素，如果没有则创建
  let image0 = previewSvgDoc.getElementById('image0_1183_631') as SVGImageElement
  if (!image0) {
    // 创建新的 image 元素
    const svgRoot = previewSvgDoc.querySelector('svg')
    if (!svgRoot) return

    image0 = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image0.setAttribute('id', 'image0_1183_631')
    image0.setAttribute('width', '343')
    image0.setAttribute('height', '267')
    svgRoot.appendChild(image0)
    console.log('Created image0_1183_631 element')
  }

  // 更新图片源
  image0.setAttribute('href', imageSrc)
  image0.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageSrc)
  image0.setAttribute('preserveAspectRatio', 'xMidYMid slice')

  // 修复 pattern0 中 use 元素的 transform 矩阵
  // 原始矩阵：matrix(0.000478238 0 0 0.000701464 -0.000715145 -0.373359)
  // 新矩阵：直接使用 scale(343, 267) 来填充 path 区域
  const useElement = pattern0.querySelector('use')
  if (useElement) {
    // 使用简单的 scale 变换，让图片填充整个 pattern 区域
    useElement.setAttribute('transform', 'scale(343, 267)')
    console.log('Updated pattern0 use transform to: scale(343, 267)')
  }

  console.log('Preview image updated successfully')
}

const regeneratePreview = () => {
  // 此函数已废弃，使用 handleRegenerateCover 代替
  handleRegenerateCover()
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
  width: 375px;
  height: 812px;
  overflow: hidden;
  background: white;
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

.full-screen-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Scale SVG from 398×852 to 390×844 */
.step-new-1-svg,
.step-new-2-svg,
.step-preview-svg {
  width: 390px;
  height: 836px;
  left: 0;
  top: 4px;
  position: absolute;
  object-fit: contain;
}

/* SVG 内部元素通过 contentDocument 设置 pointer-events: auto 来接收点击 */

/* ========== COMMON ELEMENTS ========== */
/* Using percentages based on 390x836 SVG design */

.back-button {
  position: absolute;
  top: 6.7%;
  left: 6.2%;
  width: 10.3%;
  height: 4.8%;
  z-index: 10;
  cursor: pointer;
}

.next-button {
  position: absolute;
  bottom: 5.3%;
  left: 4.1%;
  width: 87.7%;
  height: 5.7%;
  z-index: 10;
  cursor: pointer;
}

/* ========== NEW USER STEP 1 ========== */
.upload-photo-area {
  position: absolute;
  top: 20.3%;
  left: 6.2%;
  width: 20.5%;
  height: 9.6%;
  z-index: 10;
  cursor: pointer;
  background: #F6F6F6;
  border-radius: 12px;
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
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.delete-icon {
  position: absolute;
  top: 19.7%;
  left: 24.6%;
  width: 6.2%;
  height: 6.2%;
  aspect-ratio: 1;
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

.nickname-input-area {
  position: absolute;
  top: 36.5%;
  left: 5.1%;
  width: 87.9%;
  height: 6.5%;
  z-index: 10;
}

.gender-input-area {
  position: absolute;
  top: 48.3%;
  left: 5.1%;
  width: 87.9%;
  height: 6.5%;
  z-index: 10;
}

.age-input-area {
  position: absolute;
  top: 60.2%;
  left: 5.1%;
  width: 87.9%;
  height: 6.5%;
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
