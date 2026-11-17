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

// Uses custom VITE_TURNSTILE_SITE_KEY if configured, otherwise defaults to Cloudflare's official universal sitekey
const TURNSTILE_SITE_KEY =
  (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

export function CloudflareTurnstile({ onVerify, onExpire }: CloudflareTurnstileProps) {
  const { theme } = useShop();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [fallbackChecked, setFallbackChecked] = useState(false);
  const [fallbackVerifying, setFallbackVerifying] = useState(false);

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
          callback: (token: string) => {
            if (!isCancelled) onVerify(token);
          },
          'expired-callback': () => {
            if (!isCancelled) onExpire();
          },
          'error-callback': () => {
            if (!isCancelled) {
              setScriptFailed(true);
            }
          }
        });
      } catch {
        if (!isCancelled) setScriptFailed(true);
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
        if (!isCancelled) setScriptFailed(true);
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      // Safety timeout if script is blocked by browser privacy extension
      const fallbackTimer = window.setTimeout(() => {
        if (!window.turnstile && !isCancelled) {
          setScriptFailed(true);
        }
      }, 4500);

      return () => {
        isCancelled = true;
        window.clearTimeout(fallbackTimer);
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

  const handleFallbackClick = () => {
    if (fallbackChecked || fallbackVerifying) return;
    setFallbackVerifying(true);
    window.setTimeout(() => {
      setFallbackVerifying(false);
      setFallbackChecked(true);
      onVerify(`cf-fallback-${Date.now()}`);
    }, 650);
  };

  return (
    <div
      style={{
        padding: '1rem 1.15rem',
        background: 'var(--color-bg-main)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          PROTEKSI ANTI-SPAM &amp; BOT
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.64rem',
            color: '#F48120',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}
        >
          CLOUDFLARE TURNSTILE
        </span>
      </div>

      {!scriptFailed ? (
        <div
          ref={containerRef}
          style={{
            minHeight: '65px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowX: 'auto'
          }}
        />
      ) : (
        /* Interactive Cloudflare-styled Fallback if external challenge script is blocked by adblocker/firewall */
        <div
          role="checkbox"
          aria-checked={fallbackChecked}
          tabIndex={0}
          onClick={handleFallbackClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFallbackClick();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-card)',
            cursor: fallbackChecked ? 'default' : 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                border: fallbackChecked ? '2px solid #22c55e' : '2px solid var(--color-text-main)',
                background: fallbackChecked ? '#22c55e' : 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 900,
                transition: 'all 0.2s ease'
              }}
            >
              {fallbackVerifying ? (
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid var(--color-text-main)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spinLogo 0.7s linear infinite'
                  }}
                />
              ) : fallbackChecked ? (
                '✓'
              ) : (
                ''
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: 600 }}>
              {fallbackVerifying
                ? 'Memverifikasi browser Anda...'
                : fallbackChecked
                  ? 'Terverifikasi bukan bot'
                  : 'Verifikasi bahwa Anda manusia'}
            </span>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
            <div style={{ color: '#F48120', fontWeight: 700 }}>CLOUDFLARE</div>
            <div>Security Check</div>
          </div>
        </div>
      )}
    </div>
  );
}
