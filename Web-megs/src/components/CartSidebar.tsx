import React, { useState } from 'react';
import { useShop } from '../ShopContext';

export function CartSidebar() {
  const { cart, removeFromCart, isCartOpen, setIsCartOpen, clearCart } = useShop();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Reset step when cart opens/closes
  React.useEffect(() => {
    if (!isCartOpen) {
      setCheckoutStep('cart');
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format cart items
    const itemsText = cart.map(item => 
      `- ${item.name} (${item.selectedSize ? `Size: ${item.selectedSize}` : 'No Size'}) x${item.quantity} (Rp. ${item.price})`
    ).join('\n');
    
    // Calculate total price for DB
    const totalPrice = cart.reduce((sum, item) => {
      const priceNum = parseInt(item.price.replace(/\D/g, ''), 10) || 0;
      return sum + (priceNum * item.quantity);
    }, 0);
    const totalFormatted = `Rp. ${totalPrice.toLocaleString('id-ID')}`;

    try {
      // Save order to database
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          order_items: JSON.stringify(cart),
          total_price: totalFormatted
        })
      });
    } catch (e) {
      console.error('Failed to save order to DB', e);
    }

    const text = `*NEW ORDER - MEGS*

*Customer Details:*
Name: ${name}
Phone: ${phone}
Address: ${address}

*Order Items:*
${itemsText}

*Total:* ${totalFormatted}

Please confirm my order and provide payment details. Thank you!`;

    const encodedText = encodeURIComponent(text);
    const waNumber = '6285863144773'; 
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, '_blank');
    
    // Clear cart and close sidebar
    if (clearCart) clearCart();
    setIsCartOpen(false);
  };


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
            {checkoutStep === 'form' && (
              <button onClick={() => setCheckoutStep('cart')} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)'}}>←</button>
            )}
            <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', margin: 0}}>
              {checkoutStep === 'form' ? 'Checkout' : `Bag (${totalItems})`}
            </h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1.5rem'}}>×</button>
        </div>
        
        {checkoutStep === 'cart' ? (
          <>
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
                      <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={{alignSelf: 'flex-start', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: 0}}>REMOVE</button>
                    </div>
                  </div>
                )})
              )}
            </div>

            {cart.length > 0 && (
              <div style={{padding: '2rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)'}}>
                <button onClick={() => setCheckoutStep('form')} className="btn-primary" style={{width: '100%'}}>PROCEED TO CHECKOUT</button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleWhatsAppCheckout} style={{flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
            <div style={{padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Please provide your details for delivery. We will process your order via WhatsApp.</p>
              
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>FULL NAME</label>
                <input required className="input-text" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>WHATSAPP NUMBER</label>
                <input required className="input-text" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 081234567890" />
              </div>
              
              <div className="control-group">
                <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>FULL ADDRESS</label>
                <textarea required className="input-text" rows={4} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, Zip Code..." />
              </div>
            </div>
            
            <div style={{padding: '2rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)'}}>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>CONFIRM VIA WHATSAPP</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
