import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

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
  const onMouseLeave = () => { setIsDragging(false); };
  const onMouseUp = () => { setIsDragging(false); };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) setDragged(true);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onClickCapture,
    style: { cursor: isDragging ? 'grabbing' : 'grab' }
  };
}
import { useShop } from './ShopContext';

export default function MegsStyleView() {
  const { setTheme, products } = useShop();
  const productScroll = useDraggableScroll();
  const [config, setConfig] = useState<any>({
    heroTitle: 'MEGS THRIVE',
    heroSubtitle: 'Technical fabrics combined with utilitarian design. Premium activewear that moves with you, whatever the environment throws your way.',
    heroBtnText: 'EXPLORE THE COLLECTION',
    heroBgImg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2000&auto=format&fit=crop',
    heroBgLink: '',
    promoTitle: 'MEGS THRIVE TRAIL RUN',
    promoSubtitle: 'Feel the miles fly by.',
    promo1Img: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=1200&auto=format&fit=crop',
    promo1Link: '',
    promo2Img: 'https://images.unsplash.com/photo-1552674605-15c9ef04305c?q=80&w=1200&auto=format&fit=crop',
    promo2Link: '',
    productTitle: 'Shop Everything MEGS THRIVE',
    product1: { name: 'STORM SHELL JACKET', category: "Men's Outerwear", price: 'Rp 1.899.000', img: 'https://images.unsplash.com/photo-1542840410-3092f99611a3?q=80&w=800&auto=format&fit=crop' },
    product2: { name: 'TRAIL CARGO PANTS', category: "Men's Bottoms", price: 'Rp 1.299.000', img: 'https://images.unsplash.com/photo-1622370725510-9f056d6d84ce?q=80&w=800&auto=format&fit=crop' },
    product3: { name: 'TREK 30L BACKPACK', category: 'Accessories & Gear', price: 'Rp 2.199.000', img: 'https://images.unsplash.com/photo-1575428652377-a2d80b2273fc?q=80&w=800&auto=format&fit=crop' },
    manifestoTitle: "NATURE DOESN'T COMPROMISE.<br/>NEITHER DO WE.",
    manifestoText: 'Every piece in the MEGS THRIVE collection is rigorously tested in the elements. We combine technical fabrics with utilitarian design to create gear that performs anywhere on earth.',
    manifestoBgImg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2000&auto=format&fit=crop',
    manifestoLink: '',
    marqueeText: 'GET OUT THERE • ALL CONDITIONS • MEGS THRIVE • GET OUT THERE • ALL CONDITIONS • MEGS THRIVE • '
  });

  const renderLink = (link: string | undefined, children: React.ReactNode) => {
    if (!link) return children;
    const style: React.CSSProperties = { display: 'block', width: '100%', textDecoration: 'none', color: 'inherit' };
    if (link.startsWith('http')) {
      return <a href={link} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>;
    }
    return <Link to={link} style={style}>{children}</Link>;
  };

  useEffect(() => {
    setTheme('light');
    window.scrollTo(0, 0);
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data && data.megs_thrive_settings) {
          try {
            setConfig({ ...config, ...JSON.parse(data.megs_thrive_settings) });
          } catch (e) { }
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div style={{ background: '#F5F5F0', color: '#111', minHeight: '100vh', fontFamily: 'var(--font-sans)', position: 'relative' }}>

      {/* Spacer for Navbar */}
      <div style={{ height: '80px', background: '#F5F5F0' }}></div>

      {/* TOP TITLE SECTION */}
      <section style={{
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5rem 5vw 2rem 5vw',
        background: '#F5F5F0',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#111',
          fontSize: 'clamp(3rem, 12vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '0.02em',
          margin: '0',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          opacity: 0.95
        }}>
          MEGS THRIVE
        </h1>
      </section>

      {/* THE STICKY LOGO NAVBAR */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#EAEAEA',
        padding: '12px 0',
        boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #d0d0d0'
      }}>
        <img src="/MEGS COKOR BLACK.png" alt="MEGS THRIVE LOGO" style={{ height: '55px', objectFit: 'contain', filter: 'brightness(0) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
      </div>

      {/* HERO IMAGE SECTION */}
      <section style={{
        position: 'relative',
        width: '100vw',
        margin: '0',
        display: 'flex',
        background: '#666666',
        overflow: 'hidden'
      }}>
        <img src={config.heroBgImg} alt="Hero" style={{ width: '100%', height: 'auto', display: 'block', minHeight: '50vh', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)', zIndex: 1 }}></div>

        <div style={{ position: 'absolute', bottom: '6rem', left: '5vw', zIndex: 2, textAlign: 'left', width: '100%', maxWidth: '800px' }}>
          <h2 style={{
            color: '#fff',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {config.heroTitle}
          </h2>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '2.5rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            maxWidth: '600px'
          }}>
            {config.heroSubtitle}
          </p>

          <Link to="/megs-thrive-products" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            background: '#666666',
            color: '#fff',
            padding: '1.2rem 2.5rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(102,102,102,0.3)'
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.background = '#777777';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102,102,102,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#666666';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,102,102,0.3)';
            }}>
            {config.heroBtnText}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>

      {/* PROMO / HIGHLIGHTS SECTION */}
      <section style={{ padding: '8rem 0 0 0', background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, color: '#666666', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0', lineHeight: 1 }}>
          {config.promoTitle}
        </h2>
        <p style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#111', margin: '0 0 4rem 0', letterSpacing: '-0.04em' }}>
          {config.promoSubtitle}
        </p>

        <div className="acg-grid-2" style={{ padding: '2rem', background: '#000', alignItems: 'flex-start' }}>
          {renderLink(config.promo1Link, (
            <div style={{ position: 'relative', width: '100%', transition: 'transform 0.3s' }}
              onMouseOver={e => config.promo1Link && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseOut={e => config.promo1Link && (e.currentTarget.style.transform = 'scale(1)')}>
              <img src={config.promo1Img} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Promo 1" />
            </div>
          ))}
          {renderLink(config.promo2Link, (
            <div style={{ position: 'relative', width: '100%', transition: 'transform 0.3s' }}
              onMouseOver={e => config.promo2Link && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseOut={e => config.promo2Link && (e.currentTarget.style.transform = 'scale(1)')}>
              <img src={config.promo2Img} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Promo 2" />
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS GRID */}
      <section style={{ padding: '6rem 5vw', background: '#fff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#666666', margin: 0, letterSpacing: '-0.02em' }}>
              {config.productTitle}
            </h2>
            <Link to="/megs-thrive-products" style={{
              fontWeight: 'bold',
              color: '#111',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Shop <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#f0f0f0', borderRadius: '50%', fontSize: '1.2rem' }}>&rarr;</span>
            </Link>
          </div>

          <div className="slider-wrapper" style={{ position: 'relative' }}>
            <button onClick={() => { if (productScroll.ref.current) productScroll.ref.current.scrollBy({ left: -400, behavior: 'smooth' }) }} className="slider-nav-btn slider-nav-left" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: '#111', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => { if (productScroll.ref.current) productScroll.ref.current.scrollBy({ left: 400, behavior: 'smooth' }) }} className="slider-nav-btn slider-nav-right" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: '#111', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <div
              className="product-slider"
              ref={productScroll.ref}
              onMouseDown={productScroll.onMouseDown}
              onMouseLeave={productScroll.onMouseLeave}
              onMouseUp={productScroll.onMouseUp}
              onMouseMove={productScroll.onMouseMove}
              onClickCapture={productScroll.onClickCapture}
              style={{ ...productScroll.style, scrollPadding: '0 2rem' }}
            >
              {products.filter(p => p.category.startsWith('thrive_')).slice(0, 10).map(product => {
                let displayImg = product.img;
                try {
                  const parsed = JSON.parse(product.img);
                  if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
                } catch (e) { }

                let totalStock = 1;
                try {
                  const parsedSizes = JSON.parse(product.sizes);
                  if (Array.isArray(parsedSizes)) {
                    totalStock = parsedSizes.reduce((sum, s) => sum + (typeof s === 'string' ? 1 : (s.stock || 0)), 0);
                  }
                } catch(e) {}
                const isSoldOut = totalStock === 0;

                return (
                  <div key={product.id} className={`product-card ${isSoldOut ? 'sold-out' : ''}`}>
                    {isSoldOut ? <div className="new-badge" style={{ background: '#ff4444', color: 'white' }}>SOLD OUT</div> : <div className="new-badge">NEW</div>}
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', opacity: isSoldOut ? 0.6 : 1 }}>
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
                    <Link to={`/product/${product.id}`} className="btn-secondary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', pointerEvents: isSoldOut ? 'none' : 'auto' }}>
                      {isSoldOut ? 'SOLD OUT' : 'CHOOSE OPTIONS'}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* LIFESTYLE MARQUEE */}
      <section style={{ width: '100%', background: '#F5F5F0', padding: '3rem 0', overflow: 'hidden', borderTop: '1px solid #ddd' }}>
        <div style={{ whiteSpace: 'nowrap', display: 'flex', gap: '2rem', animation: 'marquee 60s linear infinite', width: 'max-content' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#666666', textTransform: 'uppercase', margin: 0 }}>
            {config.marqueeText} {config.marqueeText} {config.marqueeText}
          </h2>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#666666', textTransform: 'uppercase', margin: 0 }}>
            {config.marqueeText} {config.marqueeText} {config.marqueeText}
          </h2>
        </div>
      </section>

      {/* MANIFESTO BANNER */}
      {renderLink(config.manifestoLink, (
        <section style={{ width: '100%', display: 'flex', background: '#000', transition: 'transform 0.3s' }}
          onMouseOver={e => config.manifestoLink && (e.currentTarget.style.transform = 'scale(0.99)')}
          onMouseOut={e => config.manifestoLink && (e.currentTarget.style.transform = 'scale(1)')}>
          <img src={config.manifestoBgImg} alt="Manifesto" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </section>
      ))}

    </div>
  );
}
