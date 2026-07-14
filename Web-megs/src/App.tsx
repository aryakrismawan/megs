import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { ShopProvider, useShop } from './ShopContext';
import { CartSidebar } from './components/CartSidebar';
import { SearchOverlay } from './components/SearchOverlay';

// --- TYPES ---
type DesignElement = {
  id: string;
  type: 'image' | 'text';
  content: string; 
  position: { x: number; y: number }; // Persentase (0 - 100)
  scale: number;
  label: string;
  color?: string;
  view: 'front' | 'back'; // Menentukan di sisi mana elemen ini berada
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <CartSidebar />
          <SearchOverlay />
          <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/design" element={<DesignView2D />} />
            <Route path="/product" element={<ProductListView />} />
            <Route path="/product/:id" element={<ProductDetailView />} />
            <Route path="/journal" element={<JournalView />} />
            <Route path="/journal/:id" element={<ArticleDetailView />} />
            <Route path="/contact" element={<ContactView />} />
            
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2026 MEGS // ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
      </Router>
    </ShopProvider>
  );
}

function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('megs_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsSearchOpen } = useShop();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('megs_theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header className="navbar" style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr'}}>
      <Link to="/" className="logo-container" style={{zIndex: 200}}>
        <span className="brand-name">MEGS</span>
      </Link>
      
      <nav className="desktop-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
        <Link to="/journal" className={location.pathname === '/journal' ? 'active' : ''}>Journal</Link>
        <Link to="/design" className={location.pathname === '/design' ? 'active' : ''}>2D Studio</Link>
        <Link to="/product" className={location.pathname === '/product' ? 'active' : ''}>Product</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Kontak</Link>
      </nav>
      
      <div className="nav-controls">
        <button onClick={() => setIsSearchOpen(true)} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button onClick={() => setIsCartOpen(true)} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', position: 'relative'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {totalItems > 0 && (
            <span style={{position: 'absolute', top: 0, right: 0, background: 'var(--color-text-main)', color: 'var(--color-bg-main)', fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-bg-main)'}}>
              {totalItems}
            </span>
          )}
        </button>
        <button 
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          style={{background: 'none', border: 'none', color: 'var(--color-text-main)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'}}
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
          <Link to="/">Beranda</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/design">2D Studio</Link>
          <Link to="/product">Product</Link>
          <Link to="/contact">Kontak</Link>
        </div>
      )}
    </header>
  );
}

function HomeView() {
  const { products, addToCart } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(data => {
        if (Array.isArray(data)) setArticles(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;
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
    <div className="page-content" style={{paddingTop: '0'}}>
      <div className="page-header" style={{padding: '2rem', paddingTop: '8rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>ENGINEERED FOR EXCELLENCE</h1>
        <p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.</p>
      </div>

      {/* CATEGORIES SECTION */}
      <div style={{background: 'var(--color-bg-card)', padding: '0 0 5rem 0', borderTop: '1px solid var(--color-border)'}}>
        <div className="page-header" style={{padding: '4rem 2rem 2rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
          <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9}}>CATEGORIES</h2>
          <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>FIND YOUR ESSENTIALS</p>
        </div>
        
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', padding: '0 2rem'}}>
          
          {/* TOPS */}
          <div style={{flex: 1, minWidth: '300px', maxWidth: '500px', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.3s', border: '1px solid var(--color-border)'}} className="category-card" onClick={() => window.location.href='/product?cat=tops'}>
            <svg viewBox="0 0 100 100" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', width: '90%', height: '90%', zIndex: 1, opacity: 0.3}} className="category-svg">
              <path d="M25 20 L40 15 C45 20 55 20 60 15 L75 20 L90 50 L80 60 L70 40 L70 90 L30 90 L30 40 L20 60 L10 50 Z" />
              <path d="M40 15 C45 25 55 25 60 15" strokeWidth="1" />
              <line x1="25" y1="20" x2="30" y2="40" />
              <line x1="75" y1="20" x2="70" y2="40" />
              <line x1="15" y1="55" x2="25" y2="65" stroke="transparent" />
            </svg>
            <div style={{position: 'relative', zIndex: 2, textAlign: 'left', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', boxSizing: 'border-box'}}>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--color-text-main)', margin: '0 0 1rem 0'}}>TOPS</h3>
              <button className="btn-secondary" style={{width: 'fit-content', background: 'var(--color-text-main)', color: 'var(--color-bg-main)', border: 'none', padding: '0.8rem 2rem'}}>
                SHOP TOPS →
              </button>
            </div>
          </div>

          {/* BOTTOMS */}
          <div style={{flex: 1, minWidth: '300px', maxWidth: '500px', aspectRatio: '1/1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.3s', border: '1px solid var(--color-border)'}} className="category-card" onClick={() => window.location.href='/product?cat=bottoms'}>
            <svg viewBox="0 0 100 100" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', width: '90%', height: '90%', zIndex: 1, opacity: 0.3}} className="category-svg">
              <path d="M20 20 L80 20 L95 80 L60 90 L50 60 L40 90 L5 80 Z" />
              <path d="M30 20 C30 30 70 30 70 20" strokeWidth="1" />
              <line x1="45" y1="20" x2="40" y2="50" />
              <line x1="55" y1="20" x2="60" y2="50" />
              <path d="M25 25 L25 50 C25 60 15 60 15 60" />
              <path d="M75 25 L75 50 C75 60 85 60 85 60" />
            </svg>
            <div style={{position: 'relative', zIndex: 2, textAlign: 'left', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', boxSizing: 'border-box'}}>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--color-text-main)', margin: '0 0 1rem 0'}}>BOTTOMS</h3>
              <button className="btn-secondary" style={{width: 'fit-content', background: 'var(--color-text-main)', color: 'var(--color-bg-main)', border: 'none', padding: '0.8rem 2rem'}}>
                SHOP BOTTOMS →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={{paddingTop: '5rem', borderTop: '1px solid var(--color-border)'}}>
        <div className="page-header" style={{padding: '0 2rem 2rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
          <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9}}>PRODUCTS</h2>
          <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>LATEST RELEASES</p>
        </div>
      <div className="product-slider">
        {products.slice(0, 5).map(product => {
          let displayImg = product.img;
          try {
            const parsed = JSON.parse(product.img);
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) {}
          return (
          <div key={product.id} className="product-card">
            <div className="new-badge">NEW</div>
            <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="product-image-container">
                <img src={displayImg} alt={product.name} className="product-image" onError={(e) => {
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
        )})}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', padding: '2rem 0 4rem 0'}}>
        <Link to="/product" style={{
          padding: '1rem 3rem',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-main)',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>VIEW MORE</Link>
      </div>
      </div>
      
      {/* RUN TEASER REMOVED */}
      {/* EDITORIAL SLIDER AT THE BOTTOM */}
      {!loading && articles.length > 0 && (
        <div style={{marginTop: '0', borderTop: '1px solid var(--color-border)'}}>
          <div className="page-header" style={{padding: '4rem 2rem 2rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
            <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9}}>JOURNAL</h2>
            <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>LATEST STORIES & EDITORIALS</p>
          </div>
          <div className="horizontal-carousel" ref={carouselRef}>
          {articles.map((article) => {
            const imagesArr = article.images ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) : [];
            const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;
            return (
            <div key={article.id} className="carousel-card" onClick={() => window.location.href = `/journal/${article.id}`}>
              {coverImage && (
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1}}>
                  <img src={coverImage} alt="Cover" className="carousel-img" />
                </div>
              )}
              {/* GRADIENT OVERLAY FOR TEXT READABILITY */}
              <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', zIndex: 2}} />
              
              <div style={{position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', zIndex: 3, color: '#fff'}}>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.8}}>
                  {new Date(article.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase()} // EDITORIAL
                </p>
                <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '0.5rem', lineHeight: 1}}>
                  {article.title}
                </h2>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {article.excerpt}
                </p>
              </div>
            </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}

function ProductListView() {
  const { products, addToCart } = useShop();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('cat');

  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
    : products;
  
  return (
    <div className="page-content" style={{paddingTop: '80px', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="page-header" style={{padding: '5rem 2rem 3rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'left', margin: 0}}>
          {categoryFilter ? `${categoryFilter} PRODUCTS` : 'ALL PRODUCTS'}
        </h1>
        <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>Our complete catalog of performance gear.</p>
        
        <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
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
      <div className="product-grid" style={{padding: '0 2rem'}}>
        {filteredProducts.map(product => {
          let displayImg = product.img;
          try {
            const parsed = JSON.parse(product.img);
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) {}
          return (
          <div key={product.id} className="product-card">
            <div className="new-badge">NEW</div>
            <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="product-image-container">
                <img src={displayImg} alt={product.name} className="product-image" onError={(e) => {
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
        )})}
      </div>
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

  useEffect(() => {
    fetch(`https://worker-megs.krisarya8.workers.dev/api/products/${id}`)
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
    return <div style={{paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)'}}>Loading...</div>;
  }

  if (!product) {
    return <div style={{paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)'}}>Product not found.</div>;
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
  } catch (e) {}

  return (
    <div className="page-content" style={{paddingTop: '80px', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '4rem', padding: '100px 2rem 4rem 2rem', flexWrap: 'wrap'}}>
      {/* LEFT: GALLERY */}
      <div style={{flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{width: '100%', aspectRatio: '4/5', background: 'var(--color-bg-card)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {images.length > 0 ? (
            <img src={images[activeImageIndex]} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
          ) : (
            <div style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)'}}>NO IMAGE</div>
          )}
        </div>
        {images.length > 1 && (
          <div style={{display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none'}}>
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
                <img src={imgSrc} alt={`Thumbnail ${idx}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: DETAILS */}
      <div style={{flex: '1 1 400px', display: 'flex', flexDirection: 'column'}}>
        <div style={{marginBottom: '2rem'}}>
          <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem'}}>{product.category}</p>
          <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', textTransform: 'uppercase', margin: '0 0 1rem 0', lineHeight: 1}}>
            {product.name}
          </h1>
          <p style={{fontFamily: 'var(--font-mono)', fontSize: '1.2rem', margin: 0}}>Rp. {product.price}</p>
        </div>

        {sizes.length > 0 && (
          <div style={{marginBottom: '2rem'}}>
            <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1rem'}}>SELECT SIZE</p>
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
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
            {!selectedSize && <p style={{color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem'}}>Please select a size to continue</p>}
          </div>
        )}

        <button 
          onClick={() => {
            if (sizes.length > 0 && !selectedSize) return;
            addToCart(product, selectedSize || undefined);
          }} 
          className="btn-primary" 
          style={{padding: '1.5rem', fontSize: '1.1rem', marginBottom: '3rem', opacity: (sizes.length > 0 && !selectedSize) ? 0.5 : 1}}
          disabled={sizes.length > 0 && !selectedSize}
        >
          ADD TO BAG
        </button>

        <div style={{borderTop: '1px solid var(--color-border)', paddingTop: '2rem'}}>
          <h3 style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '1rem'}}>DESCRIPTION</h3>
          <p style={{fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap'}}>
            {product.description || 'No description available for this product.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 2D EDITOR VIEW ---
function DesignView2D() {
  const [color, setColor] = useState('#ffffff'); // Warna dasar overlay
  const [view, setView] = useState<'front' | 'back'>('front');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [textInput, setTextInput] = useState('');
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  // State untuk fitur Drag & Drop
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{id: string, startX: number, startY: number, startLeft: number, startTop: number} | null>(null);

  // Gambar mockup 2D (Adidas World Cup style) yang sudah disalin ke folder public
  const frontImage = '/adidas_front.png';
  const backImage = '/adidas_back.png';

  const colors = ['#ffffff', '#888888', '#333333', '#111111', '#000000'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, label: string, position: {x:number, y:number}) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newId = Date.now().toString();
        setElements(prev => [...prev, {
          id: newId, type: 'image', content: url,
          position: position, scale: 1, label: label, view: view
        }]);
        setActiveElementId(newId);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const addText = (text: string, label: string, position: {x:number, y:number}, customColor?: string) => {
    if (!text.trim()) return;
    const newId = Date.now().toString();
    setElements(prev => [...prev, {
      id: newId, type: 'text', content: text,
      position: position, scale: 1, label: label, view: view, color: customColor || '#0a0c10'
    }]);
    setTextInput('');
    setActiveElementId(newId);
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    if (activeElementId === id) setActiveElementId(null);
  };

  const updateElement = (id: string, key: keyof DesignElement, value: any) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, [key]: value } : el));
  };

  const updatePosition = useCallback((id: string, axis: 'x' | 'y', value: number) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, position: { ...el.position, [axis]: value } } : el));
  }, []);

  // Effect untuk menangani pergerakan Drag & Drop secara global
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const newX = Math.max(0, Math.min(100, dragState.startLeft + (deltaX / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, dragState.startTop + (deltaY / rect.height) * 100));
      
      setElements(prev => prev.map(el => el.id === dragState.id ? { ...el, position: { x: newX, y: newY } } : el));
    };

    const handlePointerUp = () => setDragState(null);

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState]);

  const currentElements = elements.filter(el => el.view === view);

  return (
    <div className="page-content" style={{maxWidth: '1600px', margin: '0 auto', paddingTop: '100px'}}>
      <div style={{marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.03em', textTransform: 'uppercase'}}>2D Configurator</h1>
          <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '0.5rem'}}>Precision engineering for your gear</p>
        </div>
      </div>
      
      <div className="design-workspace">
        
        {/* PANEL KIRI: KONTROL */}
        <div className="design-controls">
          
          <div className="view-toggle">
            <button 
              className={view === 'front' ? 'active-view' : ''} 
              onClick={() => setView('front')}
            >
              FRONT VIEW
            </button>
            <button 
              className={view === 'back' ? 'active-view' : ''} 
              onClick={() => setView('back')}
            >
              BACK VIEW
            </button>
          </div>

          <div className="control-group">
            <label>01 // BASE TINT</label>
            <div className="color-options">
              {colors.map(c => (
                <button 
                  key={c}
                  className={`color-btn ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }} 
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          
          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label>02 // ADD LAYER (TEXT)</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <input 
                type="text" 
                value={textInput} 
                onChange={(e) => setTextInput(e.target.value)} 
                placeholder="INPUT TEXT..."
                className="input-text"
                style={{flex: 1}}
              />
            </div>
            <div style={{display: 'flex', gap: '1px', flexWrap: 'wrap', marginTop: '8px'}}>
              {view === 'back' ? (
                <>
                  <button className="btn-secondary" onClick={() => addText(textInput, 'NAME', {x: 50, y: 25}, '#000000')} style={{flex: 1, padding: '0.8rem', fontSize: '0.75rem'}}>+ NAME</button>
                  <button className="btn-secondary" onClick={() => addText(textInput, 'NUMBER', {x: 50, y: 50}, '#000000')} style={{flex: 1, padding: '0.8rem', fontSize: '0.75rem'}}>+ NUMBER</button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => addText(textInput, 'SPONSOR', {x: 50, y: 50}, '#000000')} style={{width: '100%', padding: '0.8rem', fontSize: '0.75rem'}}>+ SPONSOR</button>
              )}
            </div>
          </div>

          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label>03 // ADD LAYER (IMAGE)</label>
            <div style={{position: 'relative', overflow: 'hidden'}}>
              <button className="btn-secondary" style={{width: '100%', padding: '0.8rem', fontSize: '0.75rem'}}>+ UPLOAD LOGO</button>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/svg+xml" 
                onChange={(e) => handleFileUpload(e, "LOGO", {x: view === 'front' ? 70 : 50, y: view === 'front' ? 30 : 20})} 
                style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} 
              />
            </div>
          </div>

          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label>04 // ACTIVE LAYERS</label>
            {elements.length === 0 ? (
              <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontStyle: 'italic', marginTop: '0.5rem'}}>No active layers on this side.</p>
            ) : (
              <ul className="layer-list" style={{marginTop: '0.5rem'}}>
                {elements.map((el) => (
                  <li key={el.id} 
                      onClick={() => setActiveElementId(el.id)}
                      className={`layer-item ${activeElementId === el.id ? 'active' : ''}`}
                      style={{
                        padding: '12px',
                        marginBottom: '4px'
                      }}>
                    <div className="layer-header">
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '0.65rem', padding: '2px 4px', background: 'var(--color-white)', color: '#000', fontFamily: 'var(--font-mono)'}}>{el.view === 'front' ? 'FR' : 'BK'}</span>
                        <span className="layer-label">{el.label}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} style={{background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)'}}>✕</button>
                    </div>

                    {/* SLIDERS */}
                    {activeElementId === el.id && (
                      <div className="layer-sliders" onClick={e => e.stopPropagation()}>
                        {el.type === 'text' && (
                           <div className="slider-group">
                             <label>COLOR</label>
                             <input type="color" value={el.color} onChange={(e) => updateElement(el.id, 'color', e.target.value)} style={{width: '100%', height: '30px', cursor: 'pointer', background: 'none', border: 'none', padding: 0}} />
                           </div>
                        )}
                        <div className="slider-group">
                          <label>POS X <span>{el.position.x}%</span></label>
                          <input type="range" min="0" max="100" step="1" value={el.position.x} onChange={(e) => updatePosition(el.id, 'x', parseFloat(e.target.value))} />
                        </div>
                        <div className="slider-group">
                          <label>POS Y <span>{el.position.y}%</span></label>
                          <input type="range" min="0" max="100" step="1" value={el.position.y} onChange={(e) => updatePosition(el.id, 'y', parseFloat(e.target.value))} />
                        </div>
                        <div className="slider-group">
                          <label>SCALE <span>{el.scale.toFixed(1)}x</span></label>
                          <input type="range" min="0.1" max="5" step="0.1" value={el.scale} onChange={(e) => updateElement(el.id, 'scale', parseFloat(e.target.value))} />
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <button className="btn-primary" style={{marginTop: 'auto'}}>SAVE SPECS</button>
        </div>

        {/* PANEL KANAN: KANVAS 2D */}
        <div className="canvas-area">
          
          <div className="mockup-container" style={{position: 'relative', width: '100%', maxWidth: '600px', aspectRatio: '1/1', overflow: 'hidden'}}>
            
            {/* GAMBAR JERSEY DASAR */}
            <img 
              src={view === 'front' ? frontImage : backImage} 
              alt="Jersey Template" 
              style={{
                width: '100%', height: '100%', objectFit: 'contain', 
                position: 'absolute', top: 0, left: 0, zIndex: 1
              }} 
            />

            {/* EFEK WARNA KAIN (Blend Mode) */}
            {color !== '#ffffff' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: color, mixBlendMode: 'multiply', opacity: 0.8, zIndex: 2, pointerEvents: 'none'
              }} />
            )}

            {/* AREA DESAIN OVERLAY (Decals) */}
            <div ref={containerRef} className="overlay-container" style={{position: 'absolute', top: '10%', left: '20%', width: '60%', height: '80%', zIndex: 3, pointerEvents: 'none'}}>
              {currentElements.map(el => (
                <div 
                  key={el.id}
                  style={{
                    position: 'absolute', 
                    top: `${el.position.y}%`, 
                    left: `${el.position.x}%`, 
                    transform: `translate(-50%, -50%) scale(${el.scale})`,
                    pointerEvents: 'auto',
                    border: activeElementId === el.id ? '1px dashed var(--color-border)' : '1px dashed transparent',
                    padding: '2px',
                    transition: dragState?.id === el.id ? 'none' : 'border 0.2s ease, transform 0.1s ease',
                    cursor: dragState?.id === el.id ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    touchAction: 'none' // Mencegah scroll layar saat drag di HP
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setActiveElementId(el.id);
                    setDragState({
                      id: el.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      startLeft: el.position.x,
                      startTop: el.position.y
                    });
                  }}
                >
                  {el.type === 'text' ? (
                    <span style={{
                      fontFamily: "var(--font-sans)", 
                      fontWeight: 900,
                      fontSize: el.label.includes('NUMBER') ? '120px' : '40px', 
                      color: el.color,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.05em'
                    }}>
                      {el.content}
                    </span>
                  ) : (
                    <img src={el.content} alt={el.label} style={{width: '100px', height: 'auto', display: 'block'}} />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
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
    <div className="page-content" style={{paddingTop: '80px', paddingBottom: '5rem', minHeight: '80vh'}}>
      <div style={{maxWidth: '800px', margin: '0 auto'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '4rem', letterSpacing: '-0.05em', textTransform: 'uppercase', marginBottom: '2rem', textAlign: 'center'}}>
          Contact Us
        </h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem'}}>
          
          {/* INFO COLUMN */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem'}}>HEADQUARTERS</h3>
              <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6}}>
                123 Fashion District<br/>
                South Jakarta, Indonesia 12190
              </p>
            </div>
            
            <div>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem'}}>CUSTOMER SUPPORT</h3>
              <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6}}>
                WhatsApp: +62 858 6314 4773<br/>
                Email: support@megs.co.id
              </p>
            </div>
            
            <div>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem'}}>SOCIAL</h3>
              <div style={{display: 'flex', gap: '1rem'}}>
                <a href="#" style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', textDecoration: 'underline'}}>INSTAGRAM</a>
                <a href="#" style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-main)', textDecoration: 'underline'}}>TIKTOK</a>
              </div>
            </div>
          </div>
          
          {/* FORM COLUMN */}
          <div>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>NAME</label>
                <input required className="input-text" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>EMAIL</label>
                <input required className="input-text" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" />
              </div>
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>MESSAGE</label>
                <textarea required className="input-text" rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}}>SEND MESSAGE</button>
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
    fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
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
    <div className="page-content" style={{paddingTop: '100px', maxWidth: '1000px', margin: '0 auto'}}>
       <div className="page-header" style={{padding: '5rem 0 3rem', textAlign: 'left', alignItems: 'flex-start'}}>
        <h1 style={{fontSize: 'clamp(3rem, 6vw, 6rem)', textAlign: 'left'}}>JOURNAL</h1>
        <p style={{textAlign: 'left', margin: '1rem 0 0 0'}}>Insights, editorials, and engineering logs.</p>
      </div>

      <div className="journal-list" style={{display: 'flex', flexDirection: 'column', gap: '4rem'}}>
        {loading ? <p style={{fontFamily: 'var(--font-mono)'}}>LOADING...</p> : articles.length === 0 ? (
          <p style={{fontFamily: 'var(--font-mono)'}}>NO ARTICLES FOUND. START POSTING IN THE ADMIN OS.</p>
        ) : articles.map((article: any) => {
          const imagesArr = article.images ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) : [];
          const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;
          return (
          <article key={article.id} style={{borderTop: '1px solid var(--color-border)', paddingTop: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem'}}>
              <div style={{flex: 1, minWidth: '300px'}}>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem'}}>
                  {new Date(article.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase()} // EDITORIAL
                </p>
                <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '1rem'}}>
                  {article.title}
                </h2>
                <p style={{fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem'}}>
                  {article.excerpt}
                </p>
                <Link to={`/journal/${article.id}`} className="btn-secondary">READ FULL STORY</Link>
              </div>
              <div style={{flex: 1, minWidth: '300px', background: 'var(--color-accent)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                {coverImage ? (
                  <img src={coverImage} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <span style={{fontFamily: 'var(--font-mono)', color: 'var(--color-border)'}}>IMG_PLACEHOLDER</span>
                )}
              </div>
            </div>
          </article>
        )})}
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
    fetch(`https://worker-megs.krisarya8.workers.dev/api/articles/${id}`)
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
    return <div className="page-content" style={{paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)'}}>LOADING...</div>;
  }

  if (!article) {
    return <div className="page-content" style={{paddingTop: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)'}}>ARTICLE NOT FOUND.</div>;
  }

  const images = Array.isArray(article.images) ? article.images : [];

  return (
    <div className="page-content" style={{paddingTop: '80px', paddingBottom: '5rem'}}>
      <Link to="/journal" style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textDecoration: 'underline', marginBottom: '2rem', display: 'inline-block'}}>← BACK TO JOURNAL</Link>
      
      <div className="article-detail-container">
      
        {/* LEFT COLUMN: INSTA-STYLE CAROUSEL */}
        <div className="article-image-col">
          {images.length > 0 ? (
            <div style={{position: 'relative', width: '100%', aspectRatio: '4/5', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', overflow: 'hidden'}}>
              <img src={images[currentImageIndex]} alt={`Slide ${currentImageIndex + 1}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          
          {/* LEFT ARROW */}
          {images.length > 1 && currentImageIndex > 0 && (
            <button 
              onClick={() => setCurrentImageIndex(prev => prev - 1)}
              style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2}}
            >
              ←
            </button>
          )}
          
          {/* RIGHT ARROW */}
          {images.length > 1 && currentImageIndex < images.length - 1 && (
            <button 
              onClick={() => setCurrentImageIndex(prev => prev + 1)}
              style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2}}
            >
              →
            </button>
          )}

          {/* DOTS INDICATOR */}
          {images.length > 1 && (
            <div style={{position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'center', gap: '5px', zIndex: 2}}>
              {images.map((_img: any, idx: number) => (
                <div key={idx} style={{width: '6px', height: '6px', borderRadius: '50%', background: currentImageIndex === idx ? '#fff' : 'rgba(255,255,255,0.5)'}} />
              ))}
            </div>
          )}
            </div>
          ) : (
            <div style={{width: '100%', aspectRatio: '4/5', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--color-border)'}}>NO IMAGE</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ARTICLE CONTENT (CAPTION) */}
        <div className="article-content-col">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem'}}>
            <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0}}>
              {article.title}
            </h1>
            <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>
              {new Date(article.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase()}
            </span>
          </div>
          
          <p style={{fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '1rem'}}>
            {article.excerpt}
          </p>

          <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap'}}>
            {article.content}
          </div>
        </div>
        
      </div>
    </div>
  );
}



export default App;
