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
    
    window.Tawk_API.onLoad = () => {
      setIsLoaded(true);
      const currentStatus = window.Tawk_API?.getStatus();
      if (currentStatus) setStatus(currentStatus);
      try {
        window.Tawk_API?.hideWidget();
      } catch (e) {}
    };

    window.Tawk_API.onStatusChange = (newStatus) => {
      setStatus(newStatus);
    };

    window.Tawk_LoadStart = new Date();
    
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);
  }, [enabled, propertyId, widgetId]);

  const showTawk = useCallback(() => {
    if (window.Tawk_API) {
      try {
        window.Tawk_API.showWidget();
        window.Tawk_API.maximize();
      } catch (e) {}
    }
  }, []);

  const hideTawk = useCallback(() => {
    if (window.Tawk_API) {
      try {
        window.Tawk_API.minimize();
        window.Tawk_API.hideWidget();
      } catch (e) {}
    }
  }, []);

  return {
    isLoaded,
    status,
    showTawk,
    hideTawk,
  };
}
