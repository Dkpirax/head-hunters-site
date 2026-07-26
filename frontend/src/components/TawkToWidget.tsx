import { useEffect, useRef } from "react";

/**
 * TawkToWidget — mounts globally in App.tsx, outside all routes.
 *
 * Rules:
 * - Fetches /api/tawk-settings exactly once at app startup.
 * - Injects the Tawk script only once (guarded by script ID check).
 * - Safe under React StrictMode (useRef prevents double-injection).
 * - Never calls hideWidget().
 * - Does not remove the script on cleanup (Tawk must persist across routes).
 * - Falls back gracefully when settings are unavailable.
 */
export default function TawkToWidget() {
  const initialised = useRef(false);

  useEffect(() => {
    // StrictMode fires effects twice in dev — guard with a ref
    if (initialised.current) return;
    initialised.current = true;

    async function initTawk() {
      try {
        const res = await fetch("/api/tawk-settings");
        if (!res.ok) {
          console.warn("[TawkToWidget] Could not load Tawk settings (HTTP", res.status, ")");
          return;
        }

        const settings: { enabled: boolean; propertyId: string; widgetId: string } = await res.json();

        if (!settings.enabled) {
          // Tawk disabled in admin settings
          return;
        }

        const { propertyId, widgetId } = settings;

        if (!propertyId || !widgetId) {
          console.warn("[TawkToWidget] Tawk Property ID or Widget ID is missing.");
          return;
        }

        // Prevent duplicate script injection (e.g. HMR in dev)
        if (document.getElementById("tawk-script")) {
          const win = window as any;
          win.Tawk_API?.showWidget?.();
          return;
        }

        const win = window as any;
        win.Tawk_API = win.Tawk_API || {};
        win.Tawk_LoadStart = new Date();

        // Preserve any existing onLoad callback (e.g. from other integrations)
        const previousOnLoad = win.Tawk_API.onLoad;
        win.Tawk_API.onLoad = () => {
          if (typeof previousOnLoad === "function") previousOnLoad();
          // Show widget naturally — never call hideWidget
          win.Tawk_API?.showWidget?.();
        };

        const script = document.createElement("script");
        script.id = "tawk-script";
        script.async = true;
        // Correct URL format: https://embed.tawk.to/{propertyId}/{widgetId}
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");

        document.body.appendChild(script);
      } catch (err) {
        // Network failure or JSON parse error — fail silently, Tawk is not critical
        console.warn("[TawkToWidget] Failed to initialise:", (err as Error).message);
      }
    }

    initTawk();

    // Intentionally NO cleanup — removing the script would destroy the widget
    // on every route change. Tawk must outlive the React component lifecycle.
  }, []); // Empty deps = runs once per app session

  return null;
}
