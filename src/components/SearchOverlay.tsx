import React, { useState } from 'react';
import { useShop } from '../ShopContext';
import { Link } from 'react-router-dom';

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen, products } = useShop();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = query 
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      <div 
        onClick={() => {setIsSearchOpen(false); setQuery('');}}
        style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1999, backdropFilter: 'blur(2px)'}}
      />
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', maxHeight: '70vh', height: 'auto',
        background: 'var(--color-bg-main)', color: 'var(--color-text-main)',
        zIndex: 2000, display: 'flex', flexDirection: 'column',
        borderBottom: '1px solid var(--color-border)',
        transformOrigin: 'top', animation: 'slideDown 0.3s ease-out forwards'
      }}>
      <div style={{padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)'}}>
        <input 
          type="text" 
          placeholder="SEARCH PRODUCTS..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            background: 'transparent', border: 'none', color: 'var(--color-text-main)', 
            fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 4rem)', 
            outline: 'none', textTransform: 'uppercase', width: '100%'
          }}
        />
        <button onClick={() => {setIsSearchOpen(false); setQuery('');}} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '2rem', padding: '0 1rem'}}>×</button>
      </div>
      
      <div style={{flex: 1, padding: '3rem', overflowY: 'auto'}}>
        {query && filteredProducts.length === 0 && (
          <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '1rem'}}>NO RESULTS FOUND FOR "{query}".</p>
        )}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem'}}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{width: '100%', aspectRatio: '3/4', background: 'var(--color-accent)', overflow: 'hidden', marginBottom: '1rem'}}>
                <img src={product.img} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
              </div>
              <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', margin: 0}}>{product.name}</h3>
              <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.5rem'}}>{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
