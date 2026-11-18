import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../ShopContext';

export function CartSidebar() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useShop();

  const totalItems = cart.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0);
  const subtotal = cart.reduce((sum, item) => {
    const priceNum = parseInt(String(item?.price ?? '0').replace(/\D/g, ''), 10) || 0;
    return sum + priceNum * (Number(item?.quantity) || 1);
  }, 0);

  // Close on Escape key & lock background scroll while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  return createPortal(
    <>
      <style>
        {`
          @keyframes megsBagItemReveal {
            from {
              opacity: 0;
              transform: translateX(16px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .megs-cart-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        visibility 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .megs-cart-backdrop.open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
          .megs-cart-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            max-width: 420px;
            height: 100dvh;
            background: var(--color-bg-main);
            color: var(--color-text-main);
            border-left: 1px solid var(--color-border);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            box-shadow: -20px 0 60px rgba(0, 0, 0, 0.35);
            transform: translate3d(100%, 0, 0);
            visibility: hidden;
            transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                        visibility 0.38s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform;
          }
          @media (max-width: 640px) {
            .megs-cart-drawer {
              width: min(72vw, 310px);
              max-width: 75vw;
            }
            .megs-cart-header {
              padding: 1rem 1.15rem !important;
            }
            .megs-cart-header h2 {
              font-size: 1rem !important;
            }
            .megs-cart-list {
              padding: 1rem 1.15rem !important;
              gap: 0.9rem !important;
            }
            .megs-cart-thumb {
              width: 56px !important;
              height: 70px !important;
            }
            .megs-cart-footer {
              padding: 1rem 1.15rem 1.25rem 1.15rem !important;
            }
          }
          .megs-cart-drawer.open {
            transform: translate3d(0, 0, 0);
            visibility: visible;
          }
          .megs-cart-item {
            display: flex;
            gap: 1rem;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 1.25rem;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          .megs-cart-drawer.open .megs-cart-item {
            animation: megsBagItemReveal 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .megs-qty-btn {
            background: none;
            border: none;
            color: var(--color-text-main);
            cursor: pointer;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            width: 26px;
            height: 26px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.15s ease, color 0.15s ease;
          }
          .megs-qty-btn:hover {
            background: var(--color-text-main);
            color: var(--color-bg-main);
          }
        `}
      </style>

      {/* Smooth Backdrop */}
      <div
        className={`megs-cart-backdrop ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-Over Bag Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
        className={`megs-cart-drawer ${isCartOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div
          className="megs-cart-header"
          style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                textTransform: 'uppercase',
                fontSize: '1.35rem',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              YOUR BAG ({totalItems})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close bag"
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-main)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        {/* Bag Items List */}
        <div
          className="megs-cart-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1rem',
                gap: '1.25rem'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)'
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem'
                  }}
                >
                  YOUR BAG IS EMPTY
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.78rem',
                    lineHeight: 1.5
                  }}
                >
                  Explore our latest technical gear and add your favorite pieces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/product');
                }}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              >
                EXPLORE PRODUCTS &rarr;
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              let displayImg = typeof item?.img === 'string' ? item.img : '';
              try {
                if (displayImg) {
                  const parsed = JSON.parse(displayImg);
                  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    displayImg = parsed[0];
                  }
                }
              } catch {
                // fallback
              }

              const itemPriceNum = parseInt(String(item?.price ?? '0').replace(/\D/g, ''), 10) || 0;
              const lineTotal = itemPriceNum * (Number(item?.quantity) || 1);

              return (
                <div
                  key={`${item.id}-${item.selectedSize || 'none'}-${idx}`}
                  className="megs-cart-item"
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.25)}s` }}
                >
                  {displayImg ? (
                    <img
                      src={displayImg}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="megs-cart-thumb"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate(`/product/${item.id}`);
                      }}
                      style={{
                        width: '80px',
                        height: '100px',
                        objectFit: 'cover',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div
                      className="megs-cart-thumb"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate(`/product/${item.id}`);
                      }}
                      style={{
                        width: '80px',
                        height: '100px',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      MEGS
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                      <h3
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(`/product/${item.id}`);
                        }}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          margin: 0,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.name}
                      </h3>
                      {item.selectedSize && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            display: 'inline-block',
                            marginTop: '0.3rem',
                            background: 'var(--color-text-main)',
                            color: 'var(--color-bg-main)',
                            padding: '2px 6px',
                            fontWeight: 700
                          }}
                        >
                          SIZE: {item.selectedSize}
                        </span>
                      )}
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-text-muted)',
                          fontSize: '0.78rem',
                          marginTop: '0.35rem'
                        }}
                      >
                        Rp {lineTotal.toLocaleString('id-ID')}
                        {item.quantity > 1 && (
                          <span style={{ opacity: 0.75 }}> (Rp. {item.price} × {item.quantity})</span>
                        )}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: 'var(--color-bg-main)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <button
                          type="button"
                          className="megs-qty-btn"
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            minWidth: '28px',
                            textAlign: 'center',
                            fontWeight: 700
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="megs-qty-btn"
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          textDecoration: 'underline',
                          padding: '0.2rem 0',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#ff4444')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Subtotal & Actions */}
        {cart.length > 0 && (
          <div
            className="megs-cart-footer"
            style={{
              padding: '1.5rem 2rem 2rem 2rem',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                  ESTIMATED SUBTOTAL
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.25rem' }}>
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Ongkos kirim dihitung saat Checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem' }}
            >
              PROCEED TO CHECKOUT &rarr;
            </button>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
