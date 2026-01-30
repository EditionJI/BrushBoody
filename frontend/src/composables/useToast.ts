import { createApp, ref } from 'vue'
import Toast from '../components/common/Toast.vue'

const toastContainer = ref<HTMLDivElement | null>(null)

export function useToast() {
  const show = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000) => {
    // Create container if not exists
    if (!toastContainer.value) {
      toastContainer.value = document.createElement('div')
      toastContainer.value.id = 'toast-container'
      document.body.appendChild(toastContainer.value)
    }

    // Create toast instance
    const toastApp = createApp(Toast, {
      message,
      type,
      duration,
      onClose: () => {
        toastApp.unmount()
        if (toastContainer.value && toastContainer.value.childNodes.length === 0) {
          document.body.removeChild(toastContainer.value)
          toastContainer.value = null
        }
      }
    })

    const toastElement = document.createElement('div')
    toastContainer.value.appendChild(toastElement)
    toastApp.mount(toastElement)
  }

  return {
    show,
    info: (message: string, duration?: number) => show(message, 'info', duration),
    success: (message: string, duration?: number) => show(message, 'success', duration),
    warning: (message: string, duration?: number) => show(message, 'warning', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration)
  }
}
