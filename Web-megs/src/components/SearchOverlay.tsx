import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../ShopContext';

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen, products } = useShop();
  const [query, setQuery] = useState('');

  // Menutup pencarian jika tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query 
    ? products.filter(p => {
        const lowerQuery = query.toLowerCase();
        const inName = p.name?.toLowerCase().includes(lowerQuery);
        const inDesc = (p as any).description?.toLowerCase().includes(lowerQuery);
        return inName || inDesc;
      })
    : [];

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Background Dimmer */}
      <div 
        onClick={handleClose}
        style={{
          position: 'fixed', top: '80px', left: 0, width: '100vw', height: 'calc(100vh - 80px)', 
          background: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(2px)'
        }}
      />

      {/* Dropdown Search Bar under Navbar */}
      <div style={{
        position: 'fixed', top: '75px', left: 0, width: '100vw', 
        background: 'var(--color-bg-main)', color: 'var(--color-text-main)', 
        borderBottom: '1px solid var(--color-border)', zIndex: 999,
        padding: '1.5rem 3rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transformOrigin: 'top', animation: 'slideDown 0.2s ease-out forwards'
      }}>
        
        {/* Search Input Box */}
        <div style={{
          width: '100%', maxWidth: '1000px', display: 'flex', alignItems: 'center', 
          border: '1px solid var(--color-border)', borderRadius: '4px',
          padding: '0.8rem 1.5rem', background: 'var(--color-bg-main)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-text-muted)', marginRight: '1rem'}}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search products, articles, FAQ ect." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text-main)', 
              fontFamily: 'var(--font-sans)', fontSize: '1rem', outline: 'none'
            }}
          />
        </div>
        
        {/* Search Results Area */}
        {query && (
          <div style={{
            width: '100%', maxWidth: '1000px', marginTop: '2rem',
            maxHeight: '50vh', overflowY: 'auto'
          }}>
            {filteredProducts.length === 0 ? (
              <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
                No results found for "{query}".
              </p>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem'}}>
                {filteredProducts.map(product => {
                  let displayImg = product.img;
                  try {
                    const parsed = JSON.parse(product.img);
                    if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
                  } catch (e) {}

                  return (
                    <Link 
                      to={`/product/${product.id}`} 
                      key={product.id} 
                      onClick={handleClose}
                      style={{display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit'}}
                    >
                      <div style={{width: '60px', height: '80px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-bg-card)'}}>
                        <img 
                          src={displayImg} 
                          alt={product.name} 
                          style={{width: '100%', height: '100%', objectFit: 'contain'}} 
                          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                      </div>
                      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', margin: 0}}>
                          {product.name}
                        </h3>
                        <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.2rem'}}>
                          {product.price}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
