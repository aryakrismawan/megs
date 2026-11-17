import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../ShopContext';

export function CollectionChoicePopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isCollectionPopupOpen,
    setIsCollectionPopupOpen,
    collectionPopupCategory,
    theme
  } = useShop();

  useEffect(() => {
    setIsCollectionPopupOpen(false);
  }, [location.pathname, location.search, setIsCollectionPopupOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCollectionPopupOpen) {
        setIsCollectionPopupOpen(false);
      }
    };
    if (isCollectionPopupOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCollectionPopupOpen, setIsCollectionPopupOpen]);

  if (!isCollectionPopupOpen) return null;

  const handleClose = () => {
    setIsCollectionPopupOpen(false);
  };

  const handleSelectOrigin = () => {
    setIsCollectionPopupOpen(false);
    if (collectionPopupCategory) {
      navigate(`/product?cat=${collectionPopupCategory}`);
    } else {
      navigate('/product');
    }
  };

  const handleSelectThrive = () => {
    setIsCollectionPopupOpen(false);
    if (collectionPopupCategory) {
      navigate(`/megs-thrive-products?cat=${collectionPopupCategory}`);
    } else {
      navigate('/megs-thrive');
    }
  };

  const categoryLabel = collectionPopupCategory
    ? collectionPopupCategory.toUpperCase()
    : 'ALL PRODUCTS';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="megs-collection-popup-title"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <style>
        {`
          @keyframes megsPopupIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .megs-popup-box {
            animation: megsPopupIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .megs-popup-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          .megs-popup-card {
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
          }
          .megs-popup-card:hover {
            border-color: var(--color-text-main);
            transform: translateY(-6px);
            box-shadow: 0 14px 35px rgba(0, 0, 0, 0.25);
          }
          .megs-popup-cta {
            margin-top: 1.75rem;
            width: 100%;
            padding: 0.85rem 1.25rem;
            border: 1px solid var(--color-border);
            background: transparent;
            color: var(--color-text-main);
            font-family: var(--font-mono);
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            transition: all 0.2s ease;
          }
          .megs-popup-card:hover .megs-popup-cta {
            background: var(--color-text-main);
            color: var(--color-bg-main);
            border-color: var(--color-text-main);
          }
          @media (max-width: 680px) {
            .megs-popup-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            .megs-popup-card {
              padding: 1.5rem 1.25rem;
            }
          }
        `}
      </style>

      <div
        className="megs-popup-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--color-bg-main)',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Top Header Bar (matching CartSidebar & Navbar aesthetic) */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.2rem'
              }}
            >
              SELECT COLLECTION • {categoryLabel}
            </span>
            <h2
              id="megs-collection-popup-title"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              CHOOSE YOUR DESTINATION
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              lineHeight: 1,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-main)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            ×
          </button>
        </div>

        {/* Body Content: 2 Collection Cards */}
        <div style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <div className="megs-popup-grid">
            {/* Option 1: MEGS ORIGIN */}
            <div
              role="button"
              tabIndex={0}
              className="megs-popup-card"
              onClick={handleSelectOrigin}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOrigin();
                }
              }}
            >
              <div
                style={{
                  height: '85px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <img
                  src={theme === 'dark' ? '/logo putih.png' : '/logo hitam.png'}
                  alt="MEGS Origin"
                  style={{ width: '130px', maxHeight: '75px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textTransform: 'uppercase'
                  }}
                >
                  MEGS ORIGIN
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.4rem',
                    marginBottom: 0
                  }}
                >
                  Core Collection &amp; Essentials
                </p>
              </div>

              <div className="megs-popup-cta">
                EXPLORE ORIGIN &rarr;
              </div>
            </div>

            {/* Option 2: MEGS THRIVE */}
            <div
              role="button"
              tabIndex={0}
              className="megs-popup-card"
              onClick={handleSelectThrive}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectThrive();
                }
              }}
            >
              <div
                style={{
                  height: '85px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <img
                  src={theme === 'dark' ? '/MEGS COKOR PUTIH.png' : '/MEGS COKOR BLACK.png'}
                  alt="MEGS Thrive"
                  style={{ width: '175px', maxHeight: '80px', objectFit: 'contain' }}
                />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textTransform: 'uppercase'
                  }}
                >
                  MEGS THRIVE
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.4rem',
                    marginBottom: 0
                  }}
                >
                  Outdoor &amp; Active Lifestyle
                </p>
              </div>

              <div className="megs-popup-cta">
                EXPLORE THRIVE &rarr;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
