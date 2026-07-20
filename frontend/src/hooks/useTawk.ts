import { useEffect, useRef, useState, useCallback } from 'react';
import type { TawkAPI } from '../lib/tawk';

interface UseTawkOptions {
  propertyId?: string;
  widgetId?: string;
  enabled?: boolean;
}

export function useTawk({ propertyId, widgetId, enabled }: UseTawkOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<'online' | 'away' | 'offline' | 'unknown'>('unknown');
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!enabled || !propertyId || !widgetId) return;
    if (scriptLoaded.current || document.getElementById('tawk-script')) return;

    scriptLoaded.current = true;
    
    window.Tawk_API = window.Tawk_API || ({} as TawkAPI);
    
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = () => {
        // Always hide immediately on load unless we explicitly show it
        window.Tawk_API?.hideWidget();
        setIsLoaded(true);
        const currentStatus = window.Tawk_API?.getStatus();
        if (currentStatus) setStatus(currentStatus);
      };

      window.Tawk_API.onStatusChange = (newStatus) => {
        setStatus(newStatus);
      };
    }

    window.Tawk_LoadStart = new Date();
    
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (!isLoaded) {
        console.warn('Tawk.to script load timed out.');
      }
    }, 10000);

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
      // We don't remove the script or shutdown Tawk API here to prevent reconnect issues 
      // when navigating between pages in SPA.
    };
  }, [enabled, propertyId, widgetId]);

  const showTawk = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    }
  }, []);

  const hideTawk = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.minimize();
      window.Tawk_API.hideWidget();
    }
  }, []);

  return {
    isLoaded,
    status,
    showTawk,
    hideTawk,
  };
}
