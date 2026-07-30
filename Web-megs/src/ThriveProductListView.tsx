import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from './ShopContext';

export default function ThriveProductListView() {
  const { products, setTheme } = useShop();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('cat');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setTheme('light');
    window.scrollTo(0, 0);
  }, [categoryFilter, setTheme]);

  const thriveProducts = products.filter(p => p.category.startsWith('thrive_'));
  const filteredProducts = categoryFilter
    ? thriveProducts.filter(p => p.category.toLowerCase() === `thrive_${categoryFilter.toLowerCase()}`)
    : thriveProducts;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-main)', minHeight: '100vh', fontFamily: 'var(--font-sans)', position: 'relative' }}>
      {/* Spacer for Navbar */}
      <div style={{ height: '80px', background: 'var(--color-bg-main)' }}></div>

      {/* THE STICKY LOGO NAVBAR */}
      <div style={{
        position: 'sticky',
        top: 80, // below main navbar
        zIndex: 998,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(245, 245, 240, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 0',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <img src="/MEGS COKOR BLACK.png" alt="MEGS THRIVE LOGO" style={{ height: '40px', objectFit: 'contain' }} />
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 5vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '0.02em',
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            color: 'var(--color-text-main)'
          }}>
            THE COLLECTION
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.1rem',
            color: 'var(--color-text-muted)',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Engineered for the elements. Built to thrive.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/megs-thrive-products" style={{
              padding: '0.5rem 1.5rem',
              border: '1px solid var(--color-border)',
              background: !categoryFilter ? 'var(--color-text-main)' : 'transparent',
              color: !categoryFilter ? 'var(--color-bg-main)' : 'var(--color-text-main)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              transition: 'all 0.3s'
            }}>ALL</Link>
            <Link to="/megs-thrive-products?cat=tops" style={{
              padding: '0.5rem 1.5rem',
              border: '1px solid var(--color-border)',
              background: categoryFilter === 'tops' ? 'var(--color-text-main)' : 'transparent',
              color: categoryFilter === 'tops' ? 'var(--color-bg-main)' : 'var(--color-text-main)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              transition: 'all 0.3s'
            }}>TOPS</Link>
            <Link to="/megs-thrive-products?cat=bottoms" style={{
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
        <div style={{ textAlign: 'left', marginTop: '6rem' }}>
          <Link to="/megs-style" style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.2rem',
            transition: 'color 0.3s'
          }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-main)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            ← BACK TO MEGS THRIVE HOME
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', fontFamily: 'var(--font-mono)', color: '#666' }}>
            NO PRODUCTS AVAILABLE IN THIS COLLECTION YET.
          </div>
        ) : (
          <div className="product-grid">
            {currentProducts.map(product => {
              let displayImg = product.img;
              try {
                const parsed = JSON.parse(product.img);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) { }

              let totalStock = 1;
              try {
                const parsedSizes = JSON.parse(product.sizes || '[]');
                if (Array.isArray(parsedSizes)) {
                  totalStock = parsedSizes.reduce((sum, s) => sum + (typeof s === 'string' ? 1 : (s.stock || 0)), 0);
                }
              } catch(e) {}
              const isSoldOut = totalStock === 0;

              return (
                <div key={product.id} className={`product-card ${isSoldOut ? 'sold-out' : ''}`}>
                  {isSoldOut ? <div className="new-badge" style={{ background: '#ff4444', color: 'white' }}>SOLD OUT</div> : <div className="new-badge">THRIVE</div>}
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
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginTop: '6rem' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '0.8rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-mono)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.3 : 1,
                transition: 'all 0.3s'
              }}
              onMouseOver={e => { if (currentPage !== 1) { e.currentTarget.style.background = 'var(--color-text-main)'; e.currentTarget.style.color = 'var(--color-bg-main)'; } }}
              onMouseOut={e => { if (currentPage !== 1) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-main)'; } }}
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
              style={{
                padding: '0.8rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-mono)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.3 : 1,
                transition: 'all 0.3s'
              }}
              onMouseOver={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = 'var(--color-text-main)'; e.currentTarget.style.color = 'var(--color-bg-main)'; } }}
              onMouseOut={e => { if (currentPage !== totalPages) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-main)'; } }}
            >
              NEXT →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
