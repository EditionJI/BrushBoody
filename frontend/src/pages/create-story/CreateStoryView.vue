<template>
  <div class="create-story-container">
    <div class="header">
      <button @click="goBack" class="back-button">← Back</button>
      <div class="progress-dots">
        <span v-for="step in 5" :key="step" :class="{ active: currentStep >= step }" class="dot"></span>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- Step 1: Select Role -->
    <div v-if="currentStep === 1" class="step-content">
      <h2 class="step-title">Choose a Character Theme</h2>
      <div class="role-grid">
        <div
          v-for="role in roles"
          :key="role.id"
          @click="selectRole(role)"
          :class="{ selected: selectedRole?.id === role.id }"
          class="role-card"
        >
          <div class="role-icon">{{ role.icon }}</div>
          <span class="role-name">{{ role.name }}</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Upload Photo -->
    <div v-if="currentStep === 2" class="step-content">
      <h2 class="step-title">Upload Your Child's Photo</h2>
      <div class="upload-area" @click="triggerFileInput">
        <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" class="hidden" />
        <div v-if="!uploadedPhoto" class="upload-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p>Tap to upload photo</p>
        </div>
        <div v-else class="upload-preview">
          <img :src="uploadedPhoto" alt="Uploaded" />
        </div>
      </div>
    </div>

    <!-- Step 3: Fill Info -->
    <div v-if="currentStep === 3" class="step-content">
      <h2 class="step-title">Tell Us About Your Child</h2>
      <div class="form-group">
        <label>Name</label>
        <input v-model="childInfo.name" type="text" placeholder="Enter name" />
      </div>
      <div class="form-group">
        <label>Age</label>
        <input v-model="childInfo.age" type="number" placeholder="Enter age" />
      </div>
      <div class="form-group">
        <label>Favorite Things (Optional)</label>
        <textarea v-model="childInfo.preferences" placeholder="What do they love?"></textarea>
      </div>
    </div>

    <!-- Step 4: AI Preview -->
    <div v-if="currentStep === 4" class="step-content">
      <h2 class="step-title">Creating Your Story...</h2>
      <div v-if="isGenerating" class="generating-state">
        <div class="loading-spinner"></div>
        <p>AI is working its magic!</p>
      </div>
      <div v-else class="preview-content">
        <img :src="generatedCharacter" alt="Generated Character" class="preview-image" />
        <h3>{{ generatedStory.title }}</h3>
        <p class="preview-text">{{ generatedStory.preview }}</p>
      </div>
    </div>

    <!-- Step 5: Privacy Settings -->
    <div v-if="currentStep === 5" class="step-content">
      <h2 class="step-title">Privacy Settings</h2>
      <div class="privacy-options">
        <div
          @click="selectPrivacy('public')"
          :class="{ selected: privacy === 'public' }"
          class="privacy-card"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <h3>Public</h3>
          <p>Share with other parents</p>
        </div>
        <div
          @click="selectPrivacy('private')"
          :class="{ selected: privacy === 'private' }"
          class="privacy-card"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h3>Private</h3>
          <p>Only for your child</p>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="button-group">
      <button v-if="currentStep > 1" @click="previousStep" class="btn-secondary">Back</button>
      <button v-if="currentStep < 5" @click="nextStep" :disabled="!canProceed" class="btn-primary">
        {{ currentStep === 4 ? 'Generate' : 'Next' }}
      </button>
      <button v-if="currentStep === 5" @click="finishCreation" class="btn-primary">Create Story</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const currentStep = ref(1)
const selectedRole = ref<any>(null)
const uploadedPhoto = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const childInfo = ref({
  name: '',
  age: '',
  preferences: ''
})
const isGenerating = ref(false)
const generatedCharacter = ref('')
const generatedStory = ref({
  title: '',
  preview: ''
})
const privacy = ref<'public' | 'private'>('public')

// Data
const roles = [
  { id: 1, name: 'Space Hero', icon: '🚀' },
  { id: 2, name: 'Fairy Tale', icon: '🏰' },
  { id: 3, name: 'Ocean Explorer', icon: '🌊' },
  { id: 4, name: ' Jungle Adventure', icon: '🌴' },
  { id: 5, name: 'Magical World', icon: '✨' },
  { id: 6, name: 'Super Hero', icon: '🦸' }
]

// Computed
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return !!selectedRole.value
    case 2: return !!uploadedPhoto.value
    case 3: return !!childInfo.value.name && !!childInfo.value.age
    case 4: return !isGenerating.value && !!generatedCharacter.value
    default: return true
  }
})

// Methods
const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

const selectRole = (role: any) => {
  selectedRole.value = role
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedPhoto.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const nextStep = () => {
  if (currentStep.value === 4) {
    generateStory()
  } else {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const generateStory = () => {
  isGenerating.value = true

  // Mock AI generation - replace with actual Gemini API call
  setTimeout(() => {
    generatedCharacter.value = uploadedPhoto.value
    generatedStory.value = {
      title: `${childInfo.value.name}'s ${selectedRole.value?.name} Adventure`,
      preview: `Join ${childInfo.value.name} on an exciting ${selectedRole.value?.name.toLowerCase()} adventure!`
    }
    isGenerating.value = false
  }, 3000)
}

const selectPrivacy = (value: 'public' | 'private') => {
  privacy.value = value
}

const finishCreation = () => {
  // Save story to localStorage (mock)
  const story = {
    id: Date.now(),
    title: generatedStory.value.title,
    characterImage: generatedCharacter.value,
    privacy: privacy.value,
    createdAt: new Date().toISOString()
  }

  const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]')
  existingStories.push(story)
  localStorage.setItem('userStories', JSON.stringify(existingStories))

  router.push('/')
}
</script>

<style scoped>
.create-story-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF9F0 0%, #FFF5E6 100%);
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.back-button {
  background: none;
  border: none;
  font-size: 16px;
  color: #4A5568;
  cursor: pointer;
}

.progress-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E2E8F0;
}

.dot.active {
  background: #FF6B6B;
}

.spacer {
  width: 60px;
}

.step-content {
  max-width: 400px;
  margin: 0 auto;
}

.step-title {
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #2D3748;
  text-align: center;
  margin-bottom: 30px;
}

/* Role Grid */
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.role-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-card.selected {
  border-color: #FF6B6B;
  background: #FFF5F5;
}

.role-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.role-name {
  font-weight: 600;
  color: #4A5568;
}

/* Upload Area */
.upload-area {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  border: 3px dashed #E2E8F0;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #FF6B6B;
}

.upload-placeholder svg {
  color: #A0AEC0;
  margin-bottom: 16px;
}

.upload-placeholder p {
  color: #718096;
}

.upload-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
}

.hidden {
  display: none;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #FF6B6B;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

/* Generating State */
.generating-state {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #E2E8F0;
  border-top-color: #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Preview */
.preview-content {
  text-align: center;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 16px;
  margin-bottom: 20px;
}

.preview-text {
  color: #718096;
  line-height: 1.6;
}

/* Privacy Options */
.privacy-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.privacy-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.privacy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.privacy-card.selected {
  border-color: #FF6B6B;
  background: #FFF5F5;
}

.privacy-card svg {
  color: #FF6B6B;
  margin-bottom: 16px;
}

.privacy-card h3 {
  font-size: 18px;
  color: #2D3748;
  margin-bottom: 8px;
}

.privacy-card p {
  font-size: 14px;
  color: #718096;
}

/* Button Group */
.button-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 16px 32px;
  background: #E2E8F0;
  color: #4A5568;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>
