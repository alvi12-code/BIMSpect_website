"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
    }
  ) => string;
  reset?: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_ID = "bimspect-turnstile-script";

export const hasTurnstileSiteKey = Boolean(SITE_KEY);

type TurnstileProps = {
  onToken: (token: string) => void;
  onError: () => void;
  resetVersion: number;
};

export function Turnstile({ onToken, onError, resetVersion }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onToken, onError });
  const previousResetVersion = useRef(resetVersion);

  useEffect(() => {
    callbacksRef.current = { onToken, onError };
  }, [onError, onToken]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) {
      return;
    }

    let disposed = false;
    const render = () => {
      if (disposed || !containerRef.current || widgetIdRef.current || !window.turnstile) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => callbacksRef.current.onToken(token),
        "error-callback": () => callbacksRef.current.onError(),
        "expired-callback": () => callbacksRef.current.onToken("")
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const reportError = () => callbacksRef.current.onError();
    script.addEventListener("load", render);
    script.addEventListener("error", reportError);
    render();

    return () => {
      disposed = true;
      script.removeEventListener("load", render);
      script.removeEventListener("error", reportError);
      if (widgetIdRef.current) {
        window.turnstile?.remove?.(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (previousResetVersion.current === resetVersion) {
      return;
    }

    previousResetVersion.current = resetVersion;
    window.turnstile?.reset?.(widgetIdRef.current ?? undefined);
  }, [resetVersion]);

  if (!SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} aria-label="Human verification" />;
}
