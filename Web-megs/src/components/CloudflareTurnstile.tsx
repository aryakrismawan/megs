import { useEffect, useRef, useState } from 'react';
import { useShop } from '../ShopContext';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type CloudflareTurnstileProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
};

const ENV_SITE_KEY = ((import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = ENV_SITE_KEY || '0x4AAAAAAGFfbcjD_81L3rVZ';
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function computeProofOfWork(seed: string, timestamp: number): Promise<{ nonce: number; hash: string }> {
  let nonce = 0;
  while (nonce < 250000) {
    const hash = await sha256Hex(`${seed}:${timestamp}:${nonce}`);
    if (hash.startsWith('000')) {
      return { nonce, hash };
    }
    nonce++;
    if (nonce % 350 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  const fallbackHash = await sha256Hex(`${seed}:${timestamp}:${nonce}`);
  return { nonce, hash: fallbackHash };
}

async function buildSignedAntiBotToken(cfToken: string): Promise<string> {
  const seedArray = new Uint8Array(12);
  crypto.getRandomValues(seedArray);
  const seed = Array.from(seedArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const ts = Date.now();
  const { nonce, hash } = await computeProofOfWork(seed, ts);
  const pow = btoa(JSON.stringify({ v: 1, seed, ts, nonce, hash }));
  return JSON.stringify({ cf: cfToken, pow: `pow.${pow}` });
}

export function CloudflareTurnstile({ onVerify, onExpire }: CloudflareTurnstileProps) {
  const { theme } = useShop();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [widgetUnavailable, setWidgetUnavailable] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const renderWidget = () => {
      if (isCancelled || !containerRef.current || !window.turnstile) return;

      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: theme === 'dark' ? 'dark' : 'light',
          size: 'flexible',
          callback: async (cfToken: string) => {
            if (isCancelled) return;
            try {
              const combinedToken = await buildSignedAntiBotToken(cfToken);
              if (!isCancelled) onVerify(combinedToken);
            } catch {
              if (!isCancelled) onVerify(cfToken);
            }
          },
          'expired-callback': () => {
            if (!isCancelled) onExpire();
          },
          'error-callback': () => {
            if (!isCancelled) {
              setWidgetUnavailable(true);
              onExpire();
            }
          }
        });
      } catch {
        if (!isCancelled) setWidgetUnavailable(true);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const handleLoad = () => renderWidget();
      const handleError = () => {
        if (!isCancelled) setWidgetUnavailable(true);
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      return () => {
        isCancelled = true;
        script?.removeEventListener('load', handleLoad);
        script?.removeEventListener('error', handleError);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      isCancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [theme]);

  if (widgetUnavailable) {
    return (
      <div
        style={{
          padding: '0.85rem 1rem',
          border: '1px solid #ff4444',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: '#ff4444',
          textAlign: 'center'
        }}
      >
        Widget keamanan Cloudflare gagal dimuat. Nonaktifkan pemblokir skrip/adblock lalu muat ulang halaman.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '65px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}
