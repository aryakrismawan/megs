import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

const REVEAL_SELECTOR = [
  '.about-section',
  '.product-card',
  '.archive-card',
  '.acg-section',
  '.journal-list article',
  '.article-detail-container',
  '.megs-checkout-card'
].join(', ');

export function ScrollUXEnhancer() {
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 1. Passive 60fps Scroll Progress Bar & Back-to-Top Visibility
  useEffect(() => {
    let rafId: number | null = null;

    const updateScrollMetrics = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }

      setShowBackToTop(scrollTop > 480);
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScrollMetrics);
      }
    };

    updateScrollMetrics();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [location.pathname]);

  // 2. IntersectionObserver + MutationObserver for Staggered Scroll Reveals (StrictMode-safe)
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observedInThisEffect = new WeakSet<Element>();
    const activeTimers: number[] = [];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: '0px 0px 20px 0px'
      }
    );

    const registerTargets = () => {
      const elements = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
      elements.forEach((el, idx) => {
        if (el.classList.contains('is-revealed') || observedInThisEffect.has(el)) {
          return;
        }
        observedInThisEffect.add(el);
        el.classList.add('megs-scroll-reveal');

        const rect = el.getBoundingClientRect();
        // If already in or above the viewport, reveal immediately with subtle stagger
        if (rect.top < window.innerHeight * 0.96) {
          const delay = Math.min((idx % 5) * 45, 180);
          const timerId = window.setTimeout(() => {
            el.classList.add('is-revealed');
          }, delay);
          activeTimers.push(timerId);
        } else {
          el.style.transitionDelay = `${Math.min((idx % 4) * 0.05, 0.15)}s`;
          io.observe(el);
        }
      });
    };

    registerTargets();

    // Observe dynamically loaded products/articles from API
    const mo = new MutationObserver(() => {
      registerTargets();
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      activeTimers.forEach((id) => window.clearTimeout(id));
      io.disconnect();
      mo.disconnect();
    };
  }, [location.pathname, location.search]);

  return createPortal(
    <>
      {/* Top Minimalist Scroll Progress Bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '2px',
          zIndex: 10005,
          pointerEvents: 'none',
          background: 'transparent'
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--color-text-main)',
            transformOrigin: '0% 50%',
            transform: 'scaleX(0)',
            transition: 'transform 0.08s linear',
            willChange: 'transform'
          }}
        />
      </div>

      {/* Floating Back-to-Top Button */}
      <button
        type="button"
        aria-label="Scroll back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '44px',
          height: '44px',
          background: 'var(--color-bg-main)',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9990,
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.25)',
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transform: showBackToTop ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transition: 'opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.32s, background-color 0.2s, color 0.2s, border-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--color-text-main)';
          e.currentTarget.style.color = 'var(--color-bg-main)';
          e.currentTarget.style.borderColor = 'var(--color-text-main)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-main)';
          e.currentTarget.style.color = 'var(--color-text-main)';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </>,
    document.body
  );
}
