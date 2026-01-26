<template>
  <div class="stories-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <img src="/images/stories-square.png" alt="绘本广场" class="stories-full-image" @load="onBgImageLoad" />

      <div class="hotspot-layer" :style="hotspotLayerStyle">
        <div class="back-button-area" @click="goBack"></div>
        <div class="create-button-area" @click="goToCreate"></div>
        <div
          v-for="i in 3"
          :key="i"
          class="story-card-area"
          :style="storyCardStyle(i)"
          @click="viewStory(i)"
        ></div>
      </div>
    </div>

    <!-- Bottom Menu Click Areas -->
    <div class="bottom-menu">
      <div class="menu-click-area home-menu" @click.stop="goToHome"></div>
      <div class="menu-click-area create-menu" @click.stop="goToCreate"></div>
      <div class="menu-click-area stories-menu" @click.stop="stayHere"></div>
      <div class="menu-click-area parents-menu" @click.stop="goToParents"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const wrapperRef = ref<HTMLElement | null>(null)
const bgNaturalWidth = ref<number | null>(null)
const bgNaturalHeight = ref<number | null>(null)
const overlayOffsetX = ref(0)
const overlayOffsetY = ref(0)
const overlayScale = ref(1)
let resizeObserver: ResizeObserver | null = null

const hotspotLayerStyle = computed(() => {
  const w = bgNaturalWidth.value
  const h = bgNaturalHeight.value
  if (!w || !h) return { display: 'none' }

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
  overlayScale.value = scale
  overlayOffsetX.value = (containerW - w * scale) / 2
  overlayOffsetY.value = (containerH - h * scale) / 2
}

const onBgImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  bgNaturalWidth.value = img.naturalWidth
  bgNaturalHeight.value = img.naturalHeight
  recomputeOverlay()
}

onMounted(() => {
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => recomputeOverlay())
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

const goToCreate = () => {
  router.push('/create')
}

const goToHome = () => {
  router.push('/')
}

const goToParents = () => {
  router.push('/parents')
}

const stayHere = () => {
  // Already on stories page, do nothing
}

const viewStory = (index: number) => {
  // Navigate to story detail or brushing page
  router.push('/brushing')
}

const storyCardStyle = (index: number) => {
  const topMap: Record<number, string> = {
    1: '180px',
    2: '400px',
    3: '620px'
  }
  return { top: topMap[index] || '180px' }
}
</script>

<style scoped>
.stories-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #FFF9F0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: min(375px, 100vw, calc(100vh * 375 / 812));
  aspect-ratio: 375 / 812;
  height: min(100vh, calc(100vw * 812 / 375));
}

.stories-full-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.hotspot-layer {
  position: absolute;
  top: 0;
  left: 0;
}

/* Back button area - top left */
.back-button-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 88px;
  z-index: 10;
  cursor: pointer;
}

/* Create button - blue button in UI */
.create-button-area {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 50px;
  z-index: 10;
  cursor: pointer;
}

/* Story card areas - for viewing stories */
.story-card-area {
  position: absolute;
  top: 180px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 200px;
  z-index: 10;
  cursor: pointer;
}

/* Bottom Menu Click Areas */
.bottom-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 0;
  background: transparent;
  z-index: 100;
  height: 80px;
}

.menu-click-area {
  flex: 1;
  height: 80px;
  cursor: pointer;
  background: transparent;
}

.menu-click-area:active {
  background: rgba(0, 0, 0, 0.05);
}
</style>
