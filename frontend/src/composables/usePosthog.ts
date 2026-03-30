import posthog from 'posthog-js'

/**
 * Get device properties for analytics
 */
export function getDeviceProperties() {
  const ua = navigator.userAgent
  return {
    $browser: getBrowser(),
    $browser_version: getBrowserVersion(),
    $os: getOS(),
    $os_version: getOSVersion(),
    $device_type: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
    $screen_width: window.screen.width,
    $screen_height: window.screen.height,
    $viewport_width: window.innerWidth,
    $viewport_height: window.innerHeight,
  }
}

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  return 'Other'
}

function getBrowserVersion(): string {
  const ua = navigator.userAgent
  const match = ua.match(/(Chrome|Safari|Firefox|Edg)\/[\d.]+/)
  return match ? match[0].split('/')[1] : 'unknown'
}

function getOS(): string {
  const ua = navigator.userAgent
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}

function getOSVersion(): string {
  const ua = navigator.userAgent
  if (ua.includes('iPhone OS')) {
    const match = ua.match(/iPhone OS ([\d_]+)/)
    return match ? match[1].replace(/_/g, '.') : 'unknown'
  }
  if (ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/)
    return match ? match[1] : 'unknown'
  }
  return 'unknown'
}

/**
 * PostHog analytics composable
 * Usage:
 * import { usePosthog } from '@/composables/usePosthog'
 * const { track, identify } = usePosthog()
 */
export function usePosthog() {
  /**
   * Track an event
   * @param event - Event name
   * @param properties - Event properties
   */
  const track = (event: string, properties?: Record<string, any>) => {
    posthog.capture(event, properties)
  }

  /**
   * Identify a user
   * @param userId - User ID
   * @param properties - User properties
   */
  const identify = (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties)
  }

  /**
   * Track page view
   * @param page - Page name
   */
  const pageView = (page?: string) => {
    posthog.capture('$pageview', {
      $current_url: page || window.location.pathname
    })
  }

  return {
    track,
    identify,
    pageView
  }
}
