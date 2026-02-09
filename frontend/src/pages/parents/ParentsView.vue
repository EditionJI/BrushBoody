<template>
  <div class="parents-container">
    <div class="mobile-wrapper" ref="wrapperRef">
      <img src="/images/parents-dashboard.png" alt="父母看板" class="parents-full-image" @load="onBgImageLoad" />

      <div class="hotspot-layer" :style="hotspotLayerStyle">
        <div class="settings-button-area" @click="goToSettings"></div>
        <div class="stats-area-1" @click="viewStats"></div>
        <div class="stats-area-2" @click="viewStats"></div>
        <div class="stats-area-3" @click="viewStats"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const wrapperRef = ref<HTMLElement | null>(null);
const bgNaturalWidth = ref<number | null>(null);
const bgNaturalHeight = ref<number | null>(null);
const overlayOffsetX = ref(0);
const overlayOffsetY = ref(0);
const overlayScale = ref(1);
let resizeObserver: ResizeObserver | null = null;

const hotspotLayerStyle = computed(() => {
  const w = bgNaturalWidth.value;
  const h = bgNaturalHeight.value;
  if (!w || !h) return { display: "none" };

  return {
    position: "absolute",
    top: "0",
    left: "0",
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${overlayOffsetX.value}px, ${overlayOffsetY.value}px) scale(${overlayScale.value})`,
    transformOrigin: "top left",
    zIndex: "10",
  };
});

const recomputeOverlay = () => {
  const w = bgNaturalWidth.value;
  const h = bgNaturalHeight.value;
  const wrapper = wrapperRef.value;
  if (!w || !h || !wrapper) return;

  const containerW = wrapper.clientWidth;
  const containerH = wrapper.clientHeight;
  const scale = Math.min(containerW / w, containerH / h);
  overlayScale.value = scale;
  overlayOffsetX.value = (containerW - w * scale) / 2;
  overlayOffsetY.value = (containerH - h * scale) / 2;
};

const onBgImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  bgNaturalWidth.value = img.naturalWidth;
  bgNaturalHeight.value = img.naturalHeight;
  recomputeOverlay();
};

onMounted(() => {
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => recomputeOverlay());
    resizeObserver.observe(wrapperRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

const goToSettings = () => {
  // Navigate to settings page (to be implemented)
  console.log("Navigate to settings");
};

const viewStats = () => {
  // Show detailed statistics (to be implemented)
  console.log("View detailed statistics");
};
</script>

<style scoped>
.parents-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #fff9f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-wrapper {
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 100%;
  overflow: hidden;
}

.parents-full-image {
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

/* Settings button - top right */
.settings-button-area {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 50px;
  height: 50px;
  z-index: 10;
  cursor: pointer;
}

/* Statistics clickable areas */
.stats-area-1 {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 120px;
  z-index: 10;
  cursor: pointer;
}

.stats-area-2 {
  position: absolute;
  top: 220px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 120px;
  z-index: 10;
  cursor: pointer;
}

.stats-area-3 {
  position: absolute;
  top: 360px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 120px;
  z-index: 10;
  cursor: pointer;
}
</style>
