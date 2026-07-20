
import { useNavigate } from 'react-router-dom';
import { useShop } from '../ShopContext';

export function CartSidebar() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useShop();

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  return (
    <>
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 999, backdropFilter: 'blur(2px)'}}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100vh', 
        background: 'var(--color-bg-main)', color: 'var(--color-text-main)', 
        borderLeft: '1px solid var(--color-border)', zIndex: 1000,
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{padding: '2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', margin: 0}}>
              Bag ({totalItems})
            </h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1.5rem'}}>×</button>
        </div>
        
        <div style={{flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {cart.length === 0 ? (
            <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem'}}>YOUR BAG IS EMPTY.</p>
          ) : (
            cart.map(item => {
              let displayImg = item.img;
              try {
                const parsed = JSON.parse(item.img);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) {}

              return (
              <div key={`${item.id}-${item.selectedSize || 'none'}`} style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem'}}>
                <img src={displayImg} alt={item.name} style={{width: '80px', height: '100px', objectFit: 'contain', background: 'var(--color-bg-card)'}} />
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                  <div>
                    <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', margin: 0}}>{item.name}</h3>
                    {item.selectedSize && <span style={{fontFamily: 'var(--font-mono)', fontSize: '0.7rem', display: 'inline-block', marginTop: '0.2rem', background: 'var(--color-text-main)', color: 'var(--color-bg-main)', padding: '2px 6px'}}>SIZE: {item.selectedSize}</span>}
                    <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem'}}>Rp. {item.price} x {item.quantity}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-main)', padding: '2px 6px', border: '1px solid var(--color-border)' }}>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>-</button>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={{background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: 0}}>REMOVE</button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {cart.length > 0 && (
          <div style={{padding: '2rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)'}}>
            <button 
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }} 
              className="btn-primary" style={{width: '100%'}}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
