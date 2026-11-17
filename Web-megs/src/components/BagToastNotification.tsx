import { createPortal } from 'react-dom';
import { useShop } from '../ShopContext';

export function BagToastNotification() {
  const { bagToast, dismissBagToast, cart, setIsCartOpen } = useShop();

  if (!bagToast) return null;

  const { product, selectedSize, key } = bagToast;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  let displayImg = product.img;
  try {
    const parsed = JSON.parse(product.img);
    if (Array.isArray(parsed) && parsed.length > 0) {
      displayImg = parsed[0];
    }
  } catch {
    // Fallback to raw img string
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '86px',
        right: '24px',
        zIndex: 9995,
        width: 'calc(100vw - 32px)',
        maxWidth: '375px',
        pointerEvents: 'none'
      }}
    >
      <style>
        {`
          @keyframes megsBagToastIn {
            0% {
              opacity: 0;
              transform: translateY(-14px) scale(0.96);
            }
            65% {
              opacity: 1;
              transform: translateY(2px) scale(1.01);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes megsCheckPop {
            0% {
              transform: scale(0.4);
              opacity: 0;
            }
            70% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes megsToastProgress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          @media (max-width: 600px) {
            .megs-bag-toast-card {
              right: 16px !important;
            }
          }
        `}
      </style>

      <div
        key={key}
        role="status"
        aria-live="polite"
        className="megs-bag-toast-card"
        style={{
          pointerEvents: 'auto',
          background: 'var(--color-bg-main)',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-text-main)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.32)',
          overflow: 'hidden',
          animation: 'megsBagToastIn 0.34s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--color-text-main)',
                color: 'var(--color-bg-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 900,
                animation: 'megsCheckPop 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              ADDED TO BAG
            </span>
          </div>

          <button
            type="button"
            onClick={dismissBagToast}
            aria-label="Close notification"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.15rem',
              lineHeight: 1,
              padding: '0.15rem 0.35rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Item Summary */}
        <div
          style={{
            padding: '1rem',
            display: 'flex',
            gap: '0.9rem',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '70px',
              flexShrink: 0,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
          >
            <img
              src={displayImg}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                margin: '0 0 0.3rem 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {product.name}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedSize && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    background: 'var(--color-text-main)',
                    color: 'var(--color-bg-main)',
                    padding: '2px 6px',
                    fontWeight: 700
                  }}
                >
                  SIZE: {selectedSize}
                </span>
              )}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                Rp. {product.price}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '0 1rem 1rem 1rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.6rem'
          }}
        >
          <button
            type="button"
            onClick={dismissBagToast}
            className="btn-secondary"
            style={{
              padding: '0.65rem 0.5rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            KEEP BROWSING
          </button>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="btn-primary"
            style={{
              padding: '0.65rem 0.5rem',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            VIEW BAG ({totalItems})
          </button>
        </div>

        {/* Auto-dismiss Progress Indicator */}
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'var(--color-border)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--color-text-main)',
              animation: 'megsToastProgress 3.8s linear forwards'
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
