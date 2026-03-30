import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // AudioContext instance
  const audioContext = ref<AudioContext | null>(null)
  const isAudioUnlocked = ref(false)

  /**
   * Unlock audio playback by creating and resuming AudioContext
   * This must be called from a user interaction handler (click/touch)
   * Returns a promise that resolves when audio is successfully unlocked
   */
  const unlockAudio = (): Promise<void> => {
    if (isAudioUnlocked.value) return Promise.resolve()

    return new Promise((resolve) => {
      try {
        // Create AudioContext
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Resume the context (required for autoplay policy)
        ctx.resume().then(() => {
          audioContext.value = ctx
          isAudioUnlocked.value = true
          console.log('Audio unlocked successfully')
          resolve()
        }).catch((err: Error) => {
          console.log('AudioContext resume failed:', err)
          resolve() // still resolve so navigation can continue
        })

        // Create a short silent buffer and play it
        // This "uses" the audio context and satisfies browser requirements
        const buffer = ctx.createBuffer(1, 1, 22050)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start()
      } catch (err) {
        console.log('Failed to unlock audio:', err)
        resolve() // still resolve so navigation can continue
      }
    })
  }

  return {
    audioContext,
    isAudioUnlocked,
    unlockAudio
  }
})
