import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { ShopProvider, useShop } from './ShopContext';
import { CartSidebar } from './components/CartSidebar';
import { SearchOverlay } from './components/SearchOverlay';

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- HOOK FOR DRAGGABLE SCROLL ---
function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    setDragged(true);
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged) {
      e.stopPropagation();
      e.preventDefault();
      setDragged(false);
    }
  };

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onClickCapture,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      scrollSnapType: isDragging ? 'none' : ''
    }
  };
}

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container">
          <GlobalLoader />
          <Navbar />
          <CartSidebar />
          <SearchOverlay />
          <style>
            {`
              @keyframes fadeInUpMain {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .main-content {
                animation: fadeInUpMain 0.8s ease-out forwards;
              }
            `}
          </style>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/track-order" element={<TrackOrderView />} />
              <Route path="/product" element={<ProductListView />} />
              <Route path="/product/:id" element={<ProductDetailView />} />
              <Route path="/journal" element={<JournalView />} />
              <Route path="/journal/:id" element={<ArticleDetailView />} />
              <Route path="/contact" element={<ContactView />} />
              <Route path="/create-yours" element={<CreateYoursView />} />

            </Routes>
          </main>
          <footer className="footer" style={{ padding: '6rem 2rem 3rem 2rem', background: 'var(--color-bg-main)', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="footer-grid">

                {/* Column 1: Brand Info */}
                <div className="footer-brand">
                  <h3
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      margin: '0 0 1.5rem 0',
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                    }}
                  >
                    MEGS
                  </h3>

                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-main)',
                      lineHeight: 1.6,
                      maxWidth: '300px',
                      margin: 0,
                      textAlign: 'justify',
                    }}
                  >
                    Since launching in 2026, MEGS develops technical apparel that bridges the gap between high-performance athletic gear and modern streetwear aesthetics to help you unlock your best performance.
                  </p>
                </div>

                {/* Column 2: Shop */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.5rem' }}>Shop</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', width: '100%' }}>
                    <Link to="/product?cat=all" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>All</Link>
                    <Link to="/product?cat=tops" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>Tops</Link>
                    <Link to="/product?cat=bottoms" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>Bottoms</Link>
                  </div>
                </div>

                {/* Column 3: Help */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.5rem' }}>Help</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', width: '100%' }}>
                    <Link to="/contact" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>FAQ</Link>
                    <Link to="/track-order" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>Delivery</Link>
                    <Link to="/contact" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>Return Policy</Link>
                    <Link to="/contact" style={{ color: 'var(--color-text-main)', textDecoration: 'none' }}>Contact Us</Link>
                    <span style={{ color: 'var(--color-text-main)', cursor: 'pointer' }}>Payment Options</span>
                  </div>
                </div>

              </div>

              {/* Bottom Section */}
              <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>

                {/* Social Icons */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <a href="https://www.instagram.com/megsapparel_/" aria-label="Instagram" style={{ color: 'var(--color-text-main)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-muted)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-main)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.tiktok.com/@megsapparel0" aria-label="TikTok" style={{ color: 'var(--color-text-main)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-muted)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-main)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  </a>
                  <a href="https://wa.me/6285863144773" aria-label="WhatsApp" style={{ color: 'var(--color-text-main)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-muted)'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-main)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>

                {/* Right Aligned Links & Shipping */}
                <div className="footer-bottom-links" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', justifyContent: 'flex-end' }}>
                    <span>&copy;2026 MEGS&reg;</span>
                    <span style={{ cursor: 'pointer' }}>Manage Cookies</span>
                    <span style={{ cursor: 'pointer' }}>Terms &amp; Conditions</span>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                  </div>
                </div>

              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ShopProvider>
  );
}

function GlobalLoader() {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsVisible(true);

    // Hold the loading screen for 1200ms
    const timerVisible = setTimeout(() => {
      setIsVisible(false); // trigger fade-out transition
    }, 1200);

    // Unmount after fade-out completes (1200ms + 500ms transition)
    const timerMount = setTimeout(() => {
      setIsMounted(false);
    }, 1700);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(timerVisible);
      clearTimeout(timerMount);
    };
  }, [location.pathname]);

  if (!isMounted) return null;

  // Mendapatkan tema aktif langsung dari HTML root element
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const logoSrc = currentTheme === 'dark' ? '/logo putih.png' : '/logo hitam.png';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'var(--color-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999999, transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      pointerEvents: isVisible ? 'auto' : 'none'
    }}>
      <style>
        {`
          @keyframes pulse-megs {
            0% { opacity: 0.1; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 0.1; transform: scale(0.95); }
          }
          .loader-logo-img {
            animation: pulse-megs 1.2s infinite ease-in-out;
            width: 150px;
            height: auto;
          }
        `}
      </style>
      <img src={logoSrc} alt="MEGS Loading" className="loader-logo-img" />
    </div>
  );
}

function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('megs_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsSearchOpen, isSearchOpen, products } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('megs_theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(err => console.error(err));
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  const recentProducts = products.slice(0, 4);
  const recentArticles = articles.slice(0, 4);

  const isTransparentHero = !isScrolled && location.pathname === '/';
  const logoSrc = (theme === 'dark' || isTransparentHero) ? '/logo putih.png' : '/logo hitam.png';

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${isTransparentHero ? 'navbar-hero' : ''}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
      <Link to="/" className="logo-container" style={{ zIndex: 200, textDecoration: 'none' }}>
        <img src={logoSrc} alt="MEGS Logo" className="brand-logo" />
      </Link>

      <nav className="desktop-nav">
        <div className="nav-item">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>HOME</Link>
        </div>

        <div className="nav-item">
          <Link to="/journal" className={location.pathname.startsWith('/journal') ? 'active' : ''}>ARCHIVES</Link>
          <div className="nav-megamenu">
            {recentArticles.map(article => {
              let displayImg = article.images;
              try {
                const parsed = JSON.parse(article.images);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) { }

              return (
                <Link to={`/journal/${article.id}`} key={article.id} className="nav-megamenu-item">
                  <div className="nav-megamenu-img-wrapper">
                    <img src={displayImg} alt={article.title} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                  <div className="nav-megamenu-title">{article.title}</div>
                  <div className="nav-megamenu-subtitle">{new Date(article.created_at).toLocaleDateString()}</div>
                </Link>
              );
            })}
          </div>
        </div>


        <div className="nav-item">
          <Link to="/product" className={location.pathname.startsWith('/product') ? 'active' : ''}>PRODUCTS</Link>
          <div className="nav-megamenu">
            {recentProducts.map(product => {
              let displayImg = product.img;
              try {
                const parsed = JSON.parse(product.img);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) { }

              return (
                <Link to={`/product/${product.id}`} key={product.id} className="nav-megamenu-item">
                  <div className="nav-megamenu-img-wrapper">
                    <img src={displayImg} alt={product.name} style={{ objectFit: 'contain' }} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                  <div className="nav-megamenu-title">{product.name}</div>
                  <div className="nav-megamenu-subtitle">{product.price}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="nav-item">
          <Link to="/create-yours" className={location.pathname === '/create-yours' ? 'active' : ''}>CREATE YOURS</Link>
        </div>

        <div className="nav-item">
          <Link to="/track-order" className={location.pathname === '/track-order' ? 'active' : ''}>TRACK ORDER</Link>
        </div>

        <div className="nav-item">
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
        </div>
      </nav>

      <div className="nav-controls">
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalItems > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-text-main)', color: 'var(--color-bg-main)', fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-bg-main)' }}>
              {totalItems}
            </span>
          )}
        </button>
        <button
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>

        <button className={`mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/">HOME</Link>
          <Link to="/journal">ARCHIVES</Link>
          <Link to="/product">PRODUCTS</Link>
          <Link to="/create-yours">CREATE YOURS</Link>
          <Link to="/track-order">TRACK ORDER</Link>
          <Link to="/contact">CONTACT</Link>
        </div>
      )}
    </header>
  );
}

function HomeView() {
  const { products, addToCart } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [aboutImage, setAboutImage] = useState('');
  const [aboutText, setAboutText] = useState('We engineer premium technical apparel that bridges the gap between high-performance athletic gear and modern streetwear aesthetics. Every piece is meticulously designed to push boundaries and elevate your everyday performance.');
  const [activeHero, setActiveHero] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [createYoursItems, setCreateYoursItems] = useState<any[]>([]);

  const archiveScroll = useDraggableScroll();
  const productScroll = useDraggableScroll();
  const createYoursScroll = useDraggableScroll();

  // Swipe Handlers for Hero Slider
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 40) {
      if (e.deltaX > 0) {
        setActiveHero(prev => (prev + 1) % (heroSlides.length || 1));
      } else {
        setActiveHero(prev => (prev - 1 + (heroSlides.length || 1)) % (heroSlides.length || 1));
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 800);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) setTouchStart(e.targetTouches[0].clientX);
    else setTouchStart((e as React.MouseEvent).clientX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) setTouchEnd(e.targetTouches[0].clientX);
    else if (touchStart > 0) setTouchEnd((e as React.MouseEvent).clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === 0 || touchEnd === 0) return;
    const distance = touchStart - touchEnd;
    if (distance > 75) {
      setActiveHero(prev => (prev + 1) % (heroSlides.length || 1));
    }
    if (distance < -75) {
      setActiveHero(prev => (prev - 1 + (heroSlides.length || 1)) % (heroSlides.length || 1));
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_slides) {
          try {
            setHeroSlides(JSON.parse(data.hero_slides));
          } catch (e) { }
        } else if (data.hero_image) {
          try {
            const parsed = JSON.parse(data.hero_image);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroSlides(parsed.map((img: string) => ({ image: img, title: data.hero_title, subtitle: data.hero_subtitle })));
            } else {
              setHeroSlides([{ image: data.hero_image, title: data.hero_title, subtitle: data.hero_subtitle }]);
            }
          } catch (e) {
            setHeroSlides([{ image: data.hero_image, title: data.hero_title, subtitle: data.hero_subtitle }]);
          }
        }
        if (data.about_image) setAboutImage(data.about_image);
        if (data.about_text) setAboutText(data.about_text);
      })
      .catch(console.error)
      .finally(() => setHeroLoading(false));
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const currentSlide = heroSlides[activeHero];
    const isMp4 = currentSlide?.image?.startsWith('data:video/') || currentSlide?.image?.endsWith('.mp4') || currentSlide?.image?.endsWith('.webm');

    // If it's a raw video and no custom duration is provided, let the onEnded event handle the slide transition
    if (isMp4 && !currentSlide?.duration) {
      return;
    }

    const duration = currentSlide?.duration ? parseInt(currentSlide.duration) * 1000 : 5000;

    const timeout = setTimeout(() => {
      setActiveHero(prev => (prev + 1) % heroSlides.length);
    }, duration);

    return () => clearTimeout(timeout);
  }, [heroSlides, activeHero]);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });

    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCreateYoursItems(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [articles.length]);

  return (
    <>
      {/* FULL WIDTH HERO SLIDER */}
      <div
        className="page-header-hero"
        style={{ overflow: 'hidden', position: 'relative', width: '100%', display: 'block', cursor: 'grab', background: heroLoading ? '#000' : 'transparent' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onWheel={handleWheel}
        onMouseLeave={() => { setTouchStart(0); setTouchEnd(0); }}
      >
        <div style={{
          display: 'flex',
          width: `${heroSlides.length * 100}%`,
          height: '100%',
          transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
          transform: `translateX(-${activeHero * (100 / heroSlides.length)}%)`
        }}>
          {heroSlides.map((slide, idx) => {
            const ytId = getYoutubeId(slide.image);
            return (
              <div key={idx} className="hero-slide-item" style={{
                width: `${100 / heroSlides.length}%`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {ytId ? (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 }}>
                    <iframe
                      ref={el => {
                        if (el && el.contentWindow) {
                          if (activeHero === idx) {
                            el.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                          } else {
                            el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                          }
                        }
                      }}
                      onLoad={(e) => {
                        if (activeHero !== idx) {
                          (e.target as HTMLIFrameElement).contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        }
                      }}
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1`}
                      style={{ width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.15)', pointerEvents: 'none' }}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                ) : slide.image.startsWith('data:video/') || slide.image.endsWith('.mp4') || slide.image.endsWith('.webm') ? (
                  <video
                    ref={el => {
                      if (el) {
                        if (activeHero === idx) el.play().catch(() => { });
                        else el.pause();
                      }
                    }}
                    src={slide.image}
                    autoPlay
                    loop={heroSlides.length <= 1}
                    muted
                    playsInline
                    onEnded={() => {
                      if (heroSlides.length > 1) {
                        setActiveHero(prev => (prev + 1) % heroSlides.length);
                      }
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url('${slide.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1
                  }} />
                )}
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
                  zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', textAlign: 'right', paddingBottom: '7vh', paddingRight: '2rem' }}>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slider Indicators - Strip Lines */}
        {heroSlides.length > 1 && (
          <div style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <style>
              {`
                @keyframes heroProgress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}
            </style>
            {heroSlides.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveHero(idx)}
                style={{
                  width: activeHero === idx ? '50px' : '30px',
                  height: '3px',
                  background: 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '3px'
                }}
              >
                {activeHero === idx && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    background: '#fff',
                    animation: 'heroProgress 5s linear forwards'
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="page-content" style={{ paddingTop: '0' }}>

        {/* ABOUT US SECTION */}
        <div className="about-section" style={{ padding: '6rem 2rem', background: 'var(--color-bg-main)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto', gap: '4rem', alignItems: 'center' }}>
            {aboutImage && (
              <div style={{ flex: '1 1 400px' }}>
                <img src={aboutImage} alt="About MEGS" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'cover', border: '1px solid var(--color-border)', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              </div>
            )}
            <div style={{ flex: '1 1 400px', textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-text-main)', letterSpacing: '-0.02em', margin: '0 0 1.5rem 0', textTransform: 'uppercase' }}>ABOUT US</h2>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                {aboutText}
              </p>
            </div>
          </div>
        </div>

        {/* ARCHIVES SECTION */}
        {!loading && articles.length > 0 && (
          <div style={{ padding: '4rem 0 0 0', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '3rem', padding: '0 2rem' }}>
              <div />
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--color-text-main)', letterSpacing: '-0.03em', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>ARCHIVES</h2>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => { if (archiveScroll.ref.current) archiveScroll.ref.current.scrollBy({ left: -400, behavior: 'smooth' }) }} className="slider-nav-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => { if (archiveScroll.ref.current) archiveScroll.ref.current.scrollBy({ left: 400, behavior: 'smooth' }) }} className="slider-nav-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>
            <style>{`.archive-scroll-container::-webkit-scrollbar { display: none; }`}</style>
            <div
              className="archive-scroll-container"
              ref={archiveScroll.ref}
              onMouseDown={archiveScroll.onMouseDown}
              onMouseLeave={archiveScroll.onMouseLeave}
              onMouseUp={archiveScroll.onMouseUp}
              onMouseMove={archiveScroll.onMouseMove}
              onClickCapture={archiveScroll.onClickCapture}
              style={{ display: 'flex', gap: '2rem', overflowX: 'auto', padding: '0 2rem 1rem 2rem', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', ...archiveScroll.style }}
            >
              {articles.slice(0, 6).map(article => {
                const imagesArr = article.images ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) : [];
                const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;
                return (
                  <Link to={`/journal/${article.id}`} key={article.id} className="archive-card slider-item slider-item-archive">
                    {coverImage ? (
                      <img src={coverImage} alt={article.title} loading="lazy" className="archive-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-main)', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>NO IMAGE</span>
                      </div>
                    )}

                    <div className="archive-overlay" />

                    <div className="archive-content">
                      <h3 className="archive-title">{article.title}</h3>
                      <p className="archive-subtitle">
                        {article.excerpt || new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </p>
                      <div className="archive-btn">READ</div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 2rem 4rem 2rem' }}>
              <Link to="/journal" className="btn-secondary view-all-btn">VIEW ALL ARCHIVES</Link>
            </div>
          </div>
        )}

        {/* CREATE YOURS SECTION */}
        {!loading && createYoursItems.length > 0 && (
          <div style={{ padding: '4rem 0', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '3rem', maxWidth: '1200px', margin: '0 auto 3rem auto', padding: '0 2rem' }}>
              <div />
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--color-text-main)', letterSpacing: '-0.03em', textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>CREATE YOURS</h2>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => { if (createYoursScroll.ref.current) createYoursScroll.ref.current.scrollBy({ left: -400, behavior: 'smooth' }) }} className="slider-nav-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={() => { if (createYoursScroll.ref.current) createYoursScroll.ref.current.scrollBy({ left: 400, behavior: 'smooth' }) }} className="slider-nav-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>

            <style>{`.create-yours-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div
              className="create-yours-scroll"
              ref={createYoursScroll.ref}
              onMouseDown={createYoursScroll.onMouseDown}
              onMouseLeave={createYoursScroll.onMouseLeave}
              onMouseUp={createYoursScroll.onMouseUp}
              onMouseMove={createYoursScroll.onMouseMove}
              onClickCapture={createYoursScroll.onClickCapture}
              style={{ display: 'flex', gap: '2rem', overflowX: 'auto', padding: '0 2rem 1rem 2rem', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', ...createYoursScroll.style }}
            >
              {createYoursItems.map(item => (
                <Link to={`/create-yours?category=${encodeURIComponent(item.name)}`} key={item.id} className="archive-card slider-item slider-item-create" style={{ aspectRatio: '3/4' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" className="archive-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-main)', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>NO IMAGE</span>
                    </div>
                  )}

                  <div className="archive-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)' }} />

                  <div className="archive-content" style={{ justifyContent: 'flex-end', paddingBottom: '3rem' }}>
                    <h3 className="archive-title" style={{ color: '#fff' }}>{item.name}</h3>
                    {item.description && (
                      <p className="archive-subtitle" style={{ color: '#fff', opacity: 0.8, marginBottom: '1.5rem' }}>{item.description}</p>
                    )}
                    <div className="archive-btn" style={{ background: '#fff', color: '#000' }}>START DESIGN</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES SECTION */}
        {!loading && products.length > 0 && (
          <>
            <div style={{ background: 'var(--color-bg-card)', padding: '0 0 5rem 0', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ padding: '4rem 2rem 2rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--color-text-main)', letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 0.9, width: '100%', textAlign: 'center' }}>SHOP BY CATEGORY</h2>
              </div>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ flex: 1, padding: '3rem 2rem', textAlign: 'center', borderRight: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => window.location.href = '/product?cat=tops'}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', border: '1px solid var(--color-text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.38 3.46L16 2a8.59 8.59 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem' }}>TOPS</h3>
                </div>
                <div style={{ flex: 1, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/product?cat=bottoms'}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', border: '1px solid var(--color-text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 21l1.5-15a1.5 1.5 0 0 1 1.5-1h9a1.5 1.5 0 0 1 1.5 1l1.5 15h-5.5l-2-10l-2 10z" />
                      <path d="M12 5v5" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem' }}>BOTTOMS</h3>
                </div>
              </div>
            </div>

            {/* FEATURED PRODUCTS */}
            <div style={{ padding: '4rem 2rem 0 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                <div />
                <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--color-text-main)', letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1, margin: 0, textAlign: 'center' }}>NEW ARRIVALS</h2>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button onClick={() => { if (productScroll.ref.current) productScroll.ref.current.scrollBy({ left: -400, behavior: 'smooth' }) }} className="slider-nav-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button onClick={() => { if (productScroll.ref.current) productScroll.ref.current.scrollBy({ left: 400, behavior: 'smooth' }) }} className="slider-nav-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div
              className="product-slider"
              ref={productScroll.ref}
              onMouseDown={productScroll.onMouseDown}
              onMouseLeave={productScroll.onMouseLeave}
              onMouseUp={productScroll.onMouseUp}
              onMouseMove={productScroll.onMouseMove}
              onClickCapture={productScroll.onClickCapture}
              style={productScroll.style}
            >
              {products.slice(0, 5).map(product => {
                let displayImg = product.img;
                try {
                  const parsed = JSON.parse(product.img);
                  if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
                } catch (e) { }
                return (
                  <div key={product.id} className="product-card">
                    <div className="new-badge">NEW</div>
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="product-image-container">
                        <img src={displayImg} alt={product.name} loading="lazy" className="product-image" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p>Rp. {product.price}</p>
                      </div>
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="btn-secondary">ADD TO BAG</button>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 2rem 4rem 2rem' }}>
              <Link to="/product" className="btn-secondary view-all-btn">VIEW ALL PRODUCTS</Link>
            </div>
          </>
        )}

      </div>
    </>
  );
}
function ProductListView() {
  const { products, addToCart } = useShop();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('cat');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  const filteredProducts = categoryFilter
    ? products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="page-content" style={{ paddingTop: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ padding: '5rem 2rem 3rem 2rem', textAlign: 'left', alignItems: 'flex-start' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'left', margin: 0 }}>
          {categoryFilter ? `${categoryFilter} PRODUCTS` : 'ALL PRODUCTS'}
        </h1>
        <p style={{ textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)' }}>Our complete catalog of performance gear.</p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Link to="/product" style={{
            padding: '0.5rem 1.5rem',
            border: '1px solid var(--color-border)',
            background: !categoryFilter ? 'var(--color-text-main)' : 'transparent',
            color: !categoryFilter ? 'var(--color-bg-main)' : 'var(--color-text-main)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            transition: 'all 0.3s'
          }}>ALL</Link>
          <Link to="/product?cat=tops" style={{
            padding: '0.5rem 1.5rem',
            border: '1px solid var(--color-border)',
            background: categoryFilter === 'tops' ? 'var(--color-text-main)' : 'transparent',
            color: categoryFilter === 'tops' ? 'var(--color-bg-main)' : 'var(--color-text-main)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            transition: 'all 0.3s'
          }}>TOPS</Link>
          <Link to="/product?cat=bottoms" style={{
            padding: '0.5rem 1.5rem',
            border: '1px solid var(--color-border)',
            background: categoryFilter === 'bottoms' ? 'var(--color-text-main)' : 'transparent',
            color: categoryFilter === 'bottoms' ? 'var(--color-bg-main)' : 'var(--color-text-main)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            transition: 'all 0.3s'
          }}>BOTTOMS</Link>
        </div>
      </div>
      <div className="product-grid" style={{ padding: '0 2rem' }}>
        {currentProducts.map(product => {
          let displayImg = product.img;
          try {
            const parsed = JSON.parse(product.img);
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) { }
          return (
            <div key={product.id} className="product-card">
              <div className="new-badge">NEW</div>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-image-container">
                  <img src={displayImg} alt={product.name} loading="lazy" className="product-image" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>Rp. {product.price}</p>
                </div>
              </Link>
              <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="btn-secondary">ADD TO BAG</button>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '4rem 2rem' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            ← PREV
          </button>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            PAGE {currentPage} OF {totalPages}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}

function ProductDetailView() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useShop();

  // Carousel & Zoom State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: '50%', y: '50%' });
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>Loading...</div>;
  }

  if (!product) {
    return <div style={{ paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>Product not found.</div>;
  }

  let images: string[] = [];
  try {
    const parsed = JSON.parse(product.img);
    images = Array.isArray(parsed) ? parsed : [product.img];
  } catch (e) {
    if (product.img) images = [product.img];
  }

  let sizes: string[] = [];
  try {
    if (product.sizes) {
      const parsed = JSON.parse(product.sizes);
      sizes = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { }

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) setTouchStart(e.targetTouches[0].clientX);
    else setTouchStart((e as React.MouseEvent).clientX);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) setTouchEnd(e.targetTouches[0].clientX);
    else if (touchStart > 0) setTouchEnd((e as React.MouseEvent).clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === 0 || touchEnd === 0) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setActiveImageIndex(prev => (prev + 1) % images.length);
    }
    if (distance < -50) {
      setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x: `${x}%`, y: `${y}%` });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current || images.length <= 1) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 40) {
      if (e.deltaX > 0) {
        setActiveImageIndex(prev => (prev + 1) % images.length);
      } else {
        setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 500);
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: '80px', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '4rem', padding: '100px 2rem 4rem 2rem', flexWrap: 'wrap' }}>
      {/* LEFT: GALLERY */}
      <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4/5',
            background: 'var(--color-bg-card)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isZoomed ? 'zoom-out' : (images.length > 1 ? 'grab' : 'zoom-in')
          }}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => { setIsZoomed(false); setTouchStart(0); setTouchEnd(0); }}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
        >
          {images.length > 0 ? (
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPos.x} ${zoomPos.y}`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>NO IMAGE</div>
          )}

          {/* ARROWS FOR MULTIPLE IMAGES */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev - 1 + images.length) % images.length); }}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', color: '#000', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                ←
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => (prev + 1) % images.length); }}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', color: '#000', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              >
                →
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '80px', height: '100px', background: 'var(--color-bg-card)',
                  cursor: 'pointer', border: activeImageIndex === idx ? '2px solid var(--color-text-main)' : '2px solid transparent',
                  borderRadius: '4px', overflow: 'hidden', flexShrink: 0
                }}
              >
                <img src={imgSrc} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: DETAILS */}
      <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{product.category}</p>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', margin: '0 0 1rem 0', lineHeight: 1 }}>
            {product.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', margin: 0 }}>Rp. {product.price}</p>
        </div>

        {sizes.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1rem' }}>SELECT SIZE</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: selectedSize === s ? 'var(--color-text-main)' : 'transparent',
                    color: selectedSize === s ? 'var(--color-bg-main)' : 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {!selectedSize && <p style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Please select a size to continue</p>}
          </div>
        )}

        <button
          onClick={() => {
            if (sizes.length > 0 && !selectedSize) return;
            addToCart(product, selectedSize || undefined);
          }}
          className="btn-primary"
          style={{ padding: '1.5rem', fontSize: '1.1rem', marginBottom: '3rem', opacity: (sizes.length > 0 && !selectedSize) ? 0.5 : 1 }}
          disabled={sizes.length > 0 && !selectedSize}
        >
          ADD TO BAG
        </button>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1rem' }}>DESCRIPTION</h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
            {product.description || 'No description available for this product.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- TRACK ORDER VIEW ---
function TrackOrderView() {
  const [wa, setWa] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'result' | 'not_found'>('idle');
  const [orders, setOrders] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wa) return;
    setStatus('loading');

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`);
      const allOrders = await res.json();

      const userOrders = allOrders.filter((o: any) => o.customer_phone === wa);
      if (userOrders.length > 0) {
        setOrders(userOrders);
        setStatus('result');
      } else {
        setStatus('not_found');
      }
    } catch (err) {
      console.error(err);
      setStatus('not_found');
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: '120px', paddingBottom: '5rem', minHeight: '80vh' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em', textTransform: 'uppercase', marginBottom: '1rem', lineHeight: 1 }}>
          TRACK ORDER
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '3rem' }}>
          ENTER YOUR WHATSAPP NUMBER TO CHECK THE STATUS OF YOUR DELIVERY.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>WHATSAPP NUMBER</label>
            <input
              required
              className="input-text"
              type="tel"
              value={wa}
              onChange={e => setWa(e.target.value)}
              placeholder="e.g. 08123456789"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={status === 'loading'}>
            {status === 'loading' ? 'TRACKING...' : 'TRACK ORDER'}
          </button>
        </form>

        {status === 'not_found' && (
          <div style={{ padding: '2rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'red', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            ORDER NOT FOUND FOR THIS NUMBER.
          </div>
        )}

        {status === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {orders.map((o, idx) => {
              let displayStatus = o.status?.toUpperCase() || 'UNKNOWN';
              if (displayStatus === 'MENUNGGU PEMBAYARAN') displayStatus = 'AWAITING PAYMENT';
              if (displayStatus === 'SEDANG DIKIRIM') displayStatus = 'SHIPPING';
              if (displayStatus === 'SELESAI') displayStatus = 'COMPLETED';

              return (
                <div key={idx} style={{ padding: '1.5rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 900 }}>ORDER #{o.id}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    STATUS: <strong style={{ color: displayStatus === 'COMPLETED' ? 'green' : 'var(--color-text-main)' }}>{displayStatus}</strong>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    TOTAL: Rp {o.total_price.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*NEW INQUIRY*
Name: ${name}
Email: ${email}
Message: ${message}`;
    const encodedText = encodeURIComponent(text);
    const waNumber = '6285863144773';
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="page-content" style={{ paddingTop: '80px', paddingBottom: '5rem', minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '4rem', letterSpacing: '-0.05em', textTransform: 'uppercase', marginBottom: '2rem', textAlign: 'center' }}>
          Contact Us
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>

          {/* INFO COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>HEADQUARTERS</h3>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                123 Fashion District<br />
                South Jakarta, Indonesia 12190
              </p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>CUSTOMER SUPPORT</h3>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                WhatsApp: +62 858 6314 4773<br />
                Email: support@megs.co.id
              </p>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>SOCIAL</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="https://www.instagram.com/megsapparel_/" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', textDecoration: 'underline' }}>INSTAGRAM</a>
                <a href="https://www.tiktok.com/@megsapparel0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', textDecoration: 'underline' }}>TIKTOK</a>
              </div>
            </div>
          </div>

          {/* FORM COLUMN */}
          <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>NAME</label>
                <input required className="input-text" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>EMAIL</label>
                <input required className="input-text" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" />
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>MESSAGE</label>
                <textarea required className="input-text" rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>SEND MESSAGE</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}


function JournalView() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error('API is not running. Did you start the app with wrangler pages dev?');
        }
      })
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-content" style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ padding: '5rem 0 3rem', textAlign: 'left', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', textAlign: 'left' }}>ARCHIVES</h1>
        <p style={{ textAlign: 'left', margin: '1rem 0 0 0' }}>Insights, editorials, and engineering logs.</p>
      </div>

      <div className="journal-list" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {loading ? <p style={{ fontFamily: 'var(--font-mono)' }}>LOADING...</p> : articles.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)' }}>NO ARTICLES FOUND</p>
        ) : articles.map((article: any) => {
          const imagesArr = article.images ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) : [];
          const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;
          return (
            <article key={article.id} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {article.excerpt}
                  </p>
                  <Link to={`/journal/${article.id}`} className="btn-secondary">READ FULL STORY</Link>
                </div>
                <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-accent)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-border)' }}>IMG_PLACEHOLDER</span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  );
}

function ArticleDetailView() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.images && typeof data.images === 'string') {
          data.images = JSON.parse(data.images);
        }
        setArticle(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="page-content" style={{ paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>LOADING...</div>;
  }

  if (!article) {
    return <div className="page-content" style={{ paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>ARTICLE NOT FOUND.</div>;
  }

  const images = Array.isArray(article.images) ? article.images : [];

  return (
    <div className="page-content" style={{ paddingTop: '120px', paddingBottom: '5rem' }}>
      <Link to="/journal" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-main)', textDecoration: 'underline', marginBottom: '2rem', display: 'inline-block', position: 'relative', zIndex: 10 }}>← BACK TO ARCHIVES</Link>

      <div className="article-detail-container">

        {/* LEFT COLUMN: INSTA-STYLE CAROUSEL */}
        <div className="article-image-col">
          {images.length > 0 ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              <img src={images[currentImageIndex]} alt={`Slide ${currentImageIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* LEFT ARROW */}
              {images.length > 1 && currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev - 1)}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  ←
                </button>
              )}

              {/* RIGHT ARROW */}
              {images.length > 1 && currentImageIndex < images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  →
                </button>
              )}

              {/* DOTS INDICATOR */}
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 2 }}>
                  {images.map((_img: any, idx: number) => (
                    <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentImageIndex === idx ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '4/5', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-border)' }}>NO IMAGE</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ARTICLE CONTENT (CAPTION) */}
        <div className="article-content-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
              {article.title}
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>
            {article.excerpt}
          </p>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {article.content}
          </div>
        </div>

      </div>
    </div>
  );
}

function CreateYoursView() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category');

  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<string>(initialCategory || 'Jersey');

  const [qty, setQty] = useState('');
  const [pants, setPants] = useState('Yes');
  const [paket, setPaket] = useState('Basic');
  const [bahan, setBahan] = useState('Basic');
  const [print, setPrint] = useState('Print');
  const [sablon, setSablon] = useState('');
  const [sizeChart, setSizeChart] = useState('');
  const [addOn, setAddOn] = useState('');

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          if (!initialCategory && data.length > 0) {
            setCategory(data[0].name);
          }
        }
      });
  }, [initialCategory]);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  // Update default bahan if category changes
  useEffect(() => {
    if (category.toLowerCase() === 'jersey') {
      setBahan('Basic');
    } else {
      setBahan('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let text = `*CREATE YOURS - ${category.toUpperCase()}*\n\n`;
    text += `*QTY:* ${qty}\n`;
    if (category.toLowerCase() === 'jersey') {
      text += `*Pants:* ${pants}\n`;
      text += `*Nama Paket:* ${paket}\n`;
      text += `*Bahan:* ${bahan}\n`;
      text += `*Print:* ${print}\n`;
    } else {
      text += `*Bahan:* ${bahan}\n`;
      text += `*Sablon:* ${sablon}\n`;
    }
    text += `*Size Chart:* ${sizeChart}\n`;
    text += `*Add On:* ${addOn || '-'}`;

    const encodedText = encodeURIComponent(text);
    const waNumber = '6285863144773'; // Admin WhatsApp
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="page-content" style={{ paddingTop: '120px', paddingBottom: '5rem', minHeight: '80vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.05em', textTransform: 'uppercase', marginBottom: '1rem', lineHeight: 1, textAlign: 'center' }}>
          CREATE YOURS
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '3rem', textAlign: 'center' }}>
          CUSTOMIZE YOUR APPAREL AND GET A QUOTE VIA WHATSAPP.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.name)}
              className={category === item.name ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: '1 1 100px', padding: '0.8rem', textAlign: 'center', fontSize: '0.9rem' }}
            >
              {item.name.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)' }}>
          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>QTY (MIN 12, &lt;12 DILUAR PRICE LIST)</label>
            <input required className="input-text" type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 24" />
          </div>

          {category.toLowerCase() === 'jersey' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>PANTS</label>
                <select className="input-text" value={pants} onChange={e => setPants(e.target.value)}>
                  <option value="Yes">YES</option>
                  <option value="No">NO</option>
                </select>
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>NAMA PAKET</label>
                <select className="input-text" value={paket} onChange={e => setPaket(e.target.value)}>
                  <option value="Basic">BASIC</option>
                  <option value="Standard">STANDARD</option>
                  <option value="Premium">PREMIUM</option>
                </select>
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>BAHAN</label>
                <select className="input-text" value={bahan} onChange={e => setBahan(e.target.value)}>
                  <option value="Basic">BASIC</option>
                  <option value="Standard">STANDARD</option>
                  <option value="Premium">PREMIUM</option>
                </select>
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>PRINT OR NON PRINT</label>
                <select className="input-text" value={print} onChange={e => setPrint(e.target.value)}>
                  <option value="Print">PRINT</option>
                  <option value="Non Print">NON PRINT</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>BAHAN</label>
                <input required className="input-text" type="text" value={bahan} onChange={e => setBahan(e.target.value)} placeholder={`Bahan ${category}`} />
              </div>
              <div className="control-group">
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SABLON</label>
                <input required className="input-text" type="text" value={sablon} onChange={e => setSablon(e.target.value)} placeholder={`Tipe Sablon`} />
              </div>
            </div>
          )}

          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SIZE CHART</label>
            <textarea required className="input-text" rows={2} value={sizeChart} onChange={e => setSizeChart(e.target.value)} placeholder="e.g. S: 5, M: 10, L: 5, XL: 4" />
          </div>

          <div className="control-group">
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>ADD ON</label>
            <textarea className="input-text" rows={2} value={addOn} onChange={e => setAddOn(e.target.value)} placeholder="Any additional requirements or notes?" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            SEND FORM VIA WHATSAPP
          </button>
        </form>
      </div>
    </div>
  );
}



export default App;
