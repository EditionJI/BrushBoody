import posthog from 'posthog-js'

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
