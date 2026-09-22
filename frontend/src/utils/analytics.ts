/**
 * GA4 Event Tracking Utility for Head Hunters Sri Lanka
 * 
 * Strict Privacy Rule: NEVER transmit candidate names, emails, phone numbers,
 * CV document content, or application answers to analytics.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type GAEventName =
  | 'employer_enquiry_submit'
  | 'candidate_application_submit'
  | 'cv_upload'
  | 'phone_click'
  | 'whatsapp_click'
  | 'job_view'
  | 'job_apply_start'
  | 'job_apply_complete';

interface EventParams {
  job_id?: string;
  job_title?: string;
  sector?: string;
  source_page?: string;
  enquiry_type?: string;
  [key: string]: any;
}

export function trackEvent(eventName: GAEventName, params: EventParams = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        send_to: undefined, // uses default GA4 measurement ID
      });
    }
    // Also log in development for debugging
    if (import.meta.env?.DEV) {
      console.log(`[GA4 Event] ${eventName}`, params);
    }
  } catch (error) {
    console.error('Failed to dispatch analytics event:', error);
  }
}
