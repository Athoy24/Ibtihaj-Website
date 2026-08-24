declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Unified Meta Tracking Helper Function
 * Fires client-side Meta Pixel event (fbq) and dispatches server-side CAPI event.
 */
export async function trackMetaEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: Record<string, unknown>,
  eventId?: string
) {
  // 1. Client-Side Meta Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (eventId) {
      window.fbq('track', eventName, customData, { eventID: eventId });
    } else {
      window.fbq('track', eventName, customData);
    }
  }

  // 2. Server-Side Conversions API (CAPI)
  try {
    const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : '';

    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventSourceUrl,
        customData,
        userData,
        eventId,
      }),
    });
  } catch (error) {
    console.error('Error dispatching Meta CAPI event:', error);
  }
}
