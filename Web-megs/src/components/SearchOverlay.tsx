import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../ShopContext';

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen, products, articles, createYoursItems } = useShop();
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

  const searchResults = query ? (() => {
    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    // Search Products
    products?.forEach(p => {
      if (p.name?.toLowerCase().includes(lowerQuery) || (p as any).description?.toLowerCase().includes(lowerQuery) || p.category?.toLowerCase().includes(lowerQuery)) {
        let img = p.img;
        try { const parsed = JSON.parse(p.img); if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0]; } catch {}
        results.push({
          id: `prod-${p.id}`,
          type: 'PRODUCT',
          title: p.name,
          subtitle: p.price,
          image: img,
          link: `/product/${p.id}`
        });
      }
    });

    // Search Articles
    articles?.forEach(a => {
      if (a.title?.toLowerCase().includes(lowerQuery) || a.content?.toLowerCase().includes(lowerQuery)) {
        let img = a.images;
        try { const parsed = JSON.parse(a.images); if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0]; } catch {}
        results.push({
          id: `art-${a.id}`,
          type: 'ARCHIVES',
          title: a.title,
          subtitle: new Date(a.created_at).toLocaleDateString(),
          image: img,
          link: `/journal/${a.id}`
        });
      }
    });

    // Search Create Yours
    createYoursItems?.forEach(c => {
      if (c.name?.toLowerCase().includes(lowerQuery) || c.category?.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `cy-${c.id}`,
          type: 'CREATE YOURS',
          title: c.name,
          subtitle: c.category || 'Custom Design',
          image: c.image,
          link: `/create-yours?category=${encodeURIComponent(c.name)}`
        });
      }
    });

    return results;
  })() : [];

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
        background: 'color-mix(in srgb, var(--color-bg-main) 95%, transparent)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', 
        color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', zIndex: 999,
        padding: '1.5rem 3rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transformOrigin: 'top', animation: 'slideDown 0.2s ease-out forwards'
      }}>
        
        {/* Search Input Box */}
        <div style={{
          width: '100%', maxWidth: '1000px', display: 'flex', alignItems: 'center', 
          border: '1px solid var(--color-border)', borderRadius: '8px',
          padding: '0.8rem 1.5rem', background: 'color-mix(in srgb, var(--color-bg-main) 40%, transparent)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-text-muted)', marginRight: '1rem'}}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search products, archives, and custom designs..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text-main)', 
              fontFamily: 'var(--font-sans)', fontSize: '1rem', outline: 'none'
            }}
          />
          <button 
            onClick={handleClose} 
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-muted)', 
              cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-main)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Search Results Area */}
        {query && (
          <div style={{
            width: '100%', maxWidth: '1000px', marginTop: '2rem',
            maxHeight: '50vh', overflowY: 'auto'
          }}>
            {searchResults.length === 0 ? (
              <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
                No results found for "{query}".
              </p>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem'}}>
                {searchResults.map(item => (
                  <Link 
                    to={item.link} 
                    key={item.id} 
                    onClick={handleClose}
                    style={{display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit'}}
                  >
                    <div style={{width: '60px', height: '80px', flexShrink: 0, overflow: 'hidden', background: 'var(--color-bg-card)', borderRadius: '4px'}}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem'}}>
                        {item.type}
                      </span>
                      <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', margin: 0, lineHeight: 1.2}}>
                        {item.title}
                      </h3>
                      <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.3rem'}}>
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
