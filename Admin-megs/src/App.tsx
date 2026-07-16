import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('megs_admin_auth') === 'true'
  );
  const [passcode, setPasscode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'MEGS2026') {
      localStorage.setItem('megs_admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('ACCESS DENIED: INVALID PASSCODE');
      setPasscode('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{display: 'flex', height: '100vh', width: '100vw', background: 'var(--color-bg-main)', color: 'var(--color-text-main)', alignItems: 'center', justifyContent: 'center'}}>
        <form onSubmit={handleLogin} style={{background: 'var(--color-bg-card)', padding: '4rem', border: '1px solid var(--color-border)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          <div>
            <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, color: 'var(--color-white)', fontSize: '2.5rem', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '0.5rem'}}>SYSTEM<br/>LOCKED</h2>
            <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>RESTRICTED ACCESS</p>
          </div>
          <input 
            type="password" 
            placeholder="ENTER PASSCODE" 
            className="input-text" 
            style={{textAlign: 'center', letterSpacing: '0.2em'}}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{width: '100%'}}>AUTHORIZE</button>
          <Link to="/" style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', textDecoration: 'underline'}}>RETURN TO APP</Link>
        </form>
      </div>
    );
  }

  return (
    <div style={{display: 'flex', height: '100vh', width: '100vw', background: 'var(--color-bg-main)', color: 'var(--color-text-main)'}}>
      <aside style={{width: '280px', background: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border)', padding: '2rem'}}>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, color: 'var(--color-white)', marginBottom: '3rem', fontSize: '2rem', letterSpacing: '-0.05em'}}>MEGS OS</h2>
        <nav style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-mono)'}}>
          <Link to="/" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>DASHBOARD</Link>
          <Link to="/orders" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>ORDERS</Link>
          <Link to="/products" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>PRODUCTS</Link>
          <Link to="/articles" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>JOURNAL ARTICLES</Link>
          <Link to="/create-yours" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>CREATE YOURS</Link>
          <Link to="/settings" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>HOME SETTINGS</Link>
          <button onClick={() => { localStorage.removeItem('megs_admin_auth'); setIsAuthenticated(false); }} style={{color: '#ff4444', fontSize: '0.8rem', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)'}}>LOGOUT</button>
          <Link to="/" style={{color: 'var(--color-white)', marginTop: '2rem', fontSize: '0.8rem'}}>← BACK TO APP</Link>
        </nav>
      </aside>
      <div style={{flex: 1, padding: '3rem', overflowY: 'auto'}}>
        <Routes>
          <Route path="/" element={<h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase'}}>Overview</h2>} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/products" element={<AdminProductList />} />
          <Route path="/products/new" element={<AdminProductForm />} />
          <Route path="/products/edit/:id" element={<AdminProductForm />} />
          <Route path="/articles" element={<AdminArticleList />} />
          <Route path="/articles/new" element={<AdminArticleForm />} />
          <Route path="/articles/edit/:id" element={<AdminArticleForm />} />
          <Route path="/create-yours" element={<AdminCreateYoursList />} />
          <Route path="/create-yours/new" element={<AdminCreateYoursForm />} />
          <Route path="/create-yours/edit/:id" element={<AdminCreateYoursForm />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/orders/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': 'MEGS2026' }
      });
      fetchOrders();
    } catch (e) {
      alert('Error deleting order');
    }
  };

  return (
    <div style={{maxWidth: '1200px'}}>
      <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0'}}>Orders</h2>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders found.</p> : orders.map(order => {
          let items = [];
          try { items = JSON.parse(order.order_items); } catch(e) {}
          
          return (
            <div key={order.id} style={{border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: '0 0 0.5rem 0'}}>ORDER #{order.id}</h3>
                  <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0}}>
                    {new Date(order.created_at).toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'})}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                  <select 
                    value={order.status} 
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{
                      background: order.status === 'selesai' ? '#4CAF50' : order.status === 'sedang dikirim' ? '#FF9800' : 'var(--color-bg-main)', 
                      color: order.status === 'menunggu pembayaran' ? 'var(--color-text-main)' : 'white',
                      border: '1px solid var(--color-border)', padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold'
                    }}
                  >
                    <option value="menunggu pembayaran">MENUNGGU PEMBAYARAN</option>
                    <option value="sedang dikirim">SEDANG DIKIRIM</option>
                    <option value="selesai">SELESAI</option>
                  </select>
                  <button onClick={() => handleDelete(order.id)} style={{background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>DELETE</button>
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem'}}>
                <div>
                  <h4 style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>CUSTOMER INFO</h4>
                  <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: '0 0 0.2rem 0'}}><strong>Name:</strong> {order.customer_name}</p>
                  <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: '0 0 0.2rem 0'}}><strong>Phone:</strong> {order.customer_phone}</p>
                  <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', margin: 0}}><strong>Address:</strong> {order.customer_address}</p>
                </div>
                <div>
                  <h4 style={{fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>ITEMS ({items.length})</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {items.map((item: any, idx: number) => (
                      <div key={idx} style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>
                        <span>{item.quantity}x {item.name} {item.selectedSize ? `(Size: ${item.selectedSize})` : ''}</span>
                        <span>{item.price}</span>
                      </div>
                    ))}
                    <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', paddingTop: '0.5rem', fontFamily: 'var(--font-sans)', fontWeight: 900}}>
                      <span>TOTAL</span>
                      <span>{order.total_price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': 'MEGS2026' }
      });
      fetchProducts();
    } catch (e: any) {
      alert('Error deleting product');
    }
  };

  return (
    <div style={{maxWidth: '1000px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem'}}>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>Products</h2>
        <Link to="/products/new" className="btn-primary" style={{padding: '0.8rem 1.5rem'}}>+ ADD NEW</Link>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products yet.</p> : products.map(product => {
          let displayImg = product.img;
          try {
            const parsed = JSON.parse(product.img);
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) {}
          return (
          <div key={product.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-main)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {displayImg && <img src={displayImg} alt={product.name} style={{width: '60px', height: '60px', objectFit: 'cover'}} />}
              <div>
                <h4 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: 0}}>{product.name}</h4>
                <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0}}>{product.price} // {product.category.toUpperCase()}</p>
              </div>
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <Link to={`/products/edit/${product.id}`} className="btn-secondary" style={{padding: '0.5rem 1rem'}}>EDIT</Link>
              <button onClick={() => handleDelete(product.id)} style={{background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)'}}>DELETE</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('tops');
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setPrice(data.price || '');
          setCategory(data.category || 'tops');
          setDescription(data.description || '');
          
          if (data.sizes) {
            try {
              const parsedSizes = JSON.parse(data.sizes);
              setSizes(Array.isArray(parsedSizes) ? parsedSizes.join(', ') : 'S, M, L, XL');
            } catch (e) {
              setSizes(data.sizes);
            }
          }

          if (data.img) {
            try {
              const parsedImages = JSON.parse(data.img);
              setImages(Array.isArray(parsedImages) ? parsedImages : [data.img]);
            } catch (e) {
              setImages([data.img]);
            }
          }
        });
    }
  }, [id, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      Promise.all(files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              let mimeType = 'image/jpeg';
              let quality: number | undefined = 0.8;
              if (file.type === 'image/png') {
                mimeType = 'image/png';
                quality = undefined;
              } else if (file.type === 'image/webp') {
                mimeType = 'image/webp';
              }
              resolve(canvas.toDataURL(mimeType, quality));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      })).then(newImages => {
        setImages(prev => [...prev, ...newImages]);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    const sizesArray = sizes.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const url = isEdit ? `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products/${id}` : `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify({ 
          name, 
          price, 
          img: JSON.stringify(images), 
          category,
          description,
          sizes: JSON.stringify(sizesArray)
        })
      });
      if (res.ok) {
        setStatus(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
        if (!isEdit) {
          setName(''); setPrice(''); setImages([]); setDescription(''); setSizes('S, M, L, XL');
        }
        setTimeout(() => navigate('/products'), 1500);
      } else {
        setStatus('Error saving product');
      }
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  const handleDragStart = (idx: number) => setDraggedImageIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedImageIndex === null || draggedImageIndex === idx) return;
    const newImages = [...images];
    const draggedImg = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(idx, 0, draggedImg);
    setImages(newImages);
    setDraggedImageIndex(null);
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <Link to="/products" style={{textDecoration: 'none', color: 'var(--color-text-muted)'}}>←</Link>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)'}}>
        <div className="control-group">
          <label>NAME</label>
          <input className="input-text" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VISCO JERSEY" />
        </div>
        <div className="control-group">
          <label>PRICE</label>
          <input className="input-text" type="text" required value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. IDR 250.000" />
        </div>
        <div className="control-group">
          <label>CATEGORY</label>
          <select className="input-text" value={category} onChange={e => setCategory(e.target.value)} style={{background: 'var(--color-bg-main)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', padding: '1rem', fontFamily: 'var(--font-mono)'}}>
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
          </select>
        </div>
        <div className="control-group">
          <label>DESCRIPTION</label>
          <textarea className="input-text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="Product description..." style={{minHeight: '100px'}} />
        </div>
        <div className="control-group">
          <label>AVAILABLE SIZES (comma separated)</label>
          <input className="input-text" type="text" required value={sizes} onChange={e => setSizes(e.target.value)} placeholder="e.g. S, M, L, XL" />
        </div>
        <div className="control-group">
          <label>PRODUCT IMAGES</label>
          <div style={{position: 'relative', overflow: 'hidden'}}>
            <button type="button" className="btn-secondary" style={{width: '100%'}}>
              {images.length > 0 ? `${images.length} IMAGES UPLOADED ✓` : '+ UPLOAD PHOTOS (MULTIPLE)'}
            </button>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} />
          </div>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto'}}>
            {images.map((imgSrc, idx) => (
              <div 
                key={idx} 
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                style={{position: 'relative', height: '100px', width: '100px', flexShrink: 0, cursor: 'grab', opacity: draggedImageIndex === idx ? 0.5 : 1}}
              >
                <img src={imgSrc} alt={`Preview ${idx}`} style={{height: '100%', width: '100%', objectFit: 'cover'}} />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} style={{position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)'}}>X</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>{isEdit ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}</button>
        {status && <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{status}</p>}
      </form>
    </div>
  );
}

function AdminArticleList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`);
      const data = await res.json();
      setArticles(data);
    } catch {
      console.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': 'MEGS2026' }
      });
      fetchArticles();
    } catch (e: any) {
      alert('Error deleting article');
    }
  };

  return (
    <div style={{maxWidth: '1000px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem'}}>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>Journal Articles</h2>
        <Link to="/articles/new" className="btn-primary" style={{padding: '0.8rem 1.5rem'}}>+ ADD NEW</Link>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {loading ? <p>Loading...</p> : articles.length === 0 ? <p>No articles yet.</p> : articles.map(article => {
          let displayImg = null;
          try {
            const parsed = typeof article.images === 'string' ? JSON.parse(article.images) : article.images;
            if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
          } catch (e) {}
          return (
          <div key={article.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-main)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {displayImg && <img src={displayImg} alt={article.title} style={{width: '60px', height: '60px', objectFit: 'cover'}} />}
              <div>
                <h4 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '1.2rem', margin: 0}}>{article.title}</h4>
                <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0}}>
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <Link to={`/articles/edit/${article.id}`} className="btn-secondary" style={{padding: '0.5rem 1rem'}}>EDIT</Link>
              <button onClick={() => handleDelete(article.id)} style={{background: '#ff4444', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-mono)'}}>DELETE</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function AdminArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          if (data.images) {
            try {
              const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
              setImages(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
              setImages([]);
            }
          }
        });
    }
  }, [id, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      Promise.all(files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              let mimeType = 'image/jpeg';
              let quality: number | undefined = 0.7;
              if (file.type === 'image/png') {
                mimeType = 'image/png';
                quality = undefined;
              } else if (file.type === 'image/webp') {
                mimeType = 'image/webp';
              }
              resolve(canvas.toDataURL(mimeType, quality));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      })).then(base64Images => {
        setImages(prev => [...prev, ...base64Images]);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const url = isEdit ? `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles/${id}` : `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Token': 'MEGS2026'
        },
        body: JSON.stringify({ title, excerpt, content, images })
      });
      if (res.ok) {
        setStatus(isEdit ? 'Article updated successfully!' : 'Article posted successfully!');
        if (!isEdit) {
          setTitle(''); setExcerpt(''); setContent(''); setImages([]);
        }
        setTimeout(() => navigate('/articles'), 1500);
      } else {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          setStatus(`Error: ${error.error}`);
        } catch {
          setStatus(`Error: API not found. Please run the app using wrangler pages dev.`);
        }
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const handleDragStart = (idx: number) => setDraggedImageIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedImageIndex === null || draggedImageIndex === idx) return;
    const newImages = [...images];
    const draggedImg = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(idx, 0, draggedImg);
    setImages(newImages);
    setDraggedImageIndex(null);
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <Link to="/articles" style={{textDecoration: 'none', color: 'var(--color-text-muted)'}}>←</Link>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>
          {isEdit ? 'Edit Article' : 'New Article'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div className="control-group">
          <label>TITLE</label>
          <input className="input-text" type="text" required value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="control-group">
          <label>IMAGES (GALLERY)</label>
          <div style={{position: 'relative', overflow: 'hidden'}}>
            <button type="button" className="btn-secondary" style={{width: '100%'}}>
              {images.length > 0 ? `${images.length} IMAGES UPLOADED ✓` : '+ UPLOAD PHOTOS'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleImageUpload} 
              style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} 
            />
          </div>
          {images.length > 0 && (
            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', marginTop: '1rem', paddingBottom: '10px'}}>
              {images.map((img, i) => (
                <div 
                  key={i} 
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(i)}
                  style={{position: 'relative', height: '100px', width: '100px', flexShrink: 0, cursor: 'grab', opacity: draggedImageIndex === i ? 0.5 : 1}}
                >
                  <img src={img} alt={`Preview ${i}`} style={{height: '100%', width: '100%', objectFit: 'cover'}} />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)'}}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="control-group">
          <label>EXCERPT (SHORT DESCRIPTION)</label>
          <textarea className="input-text" required rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>
        <div className="control-group">
          <label>CONTENT (MARKDOWN)</label>
          <textarea className="input-text" required rows={15} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>{isEdit ? 'UPDATE ARTICLE' : 'POST ARTICLE'}</button>
        {status && <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1rem'}}>{status}</p>}
      </form>
    </div>
  );
}

// --- ADMIN CREATE YOURS ---
function AdminCreateYoursList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch create yours items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': 'MEGS2026' }
      });
      fetchItems();
    } catch (e) {
      alert('Error deleting item');
    }
  };

  return (
    <div style={{maxWidth: '1200px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>Create Yours Options</h2>
        <Link to="/create-yours/new" className="btn-primary" style={{textDecoration: 'none', display: 'inline-block'}}>+ ADD ITEM</Link>
      </div>

      {loading ? <p>Loading...</p> : items.length === 0 ? <p>No items found.</p> : (
        <table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--color-border)', textAlign: 'left'}}>
              <th style={{padding: '1rem', color: 'var(--color-text-muted)'}}>ID</th>
              <th style={{padding: '1rem', color: 'var(--color-text-muted)'}}>IMAGE</th>
              <th style={{padding: '1rem', color: 'var(--color-text-muted)'}}>NAME</th>
              <th style={{padding: '1rem', color: 'var(--color-text-muted)'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{borderBottom: '1px solid var(--color-border)'}}>
                <td style={{padding: '1rem'}}>{item.id}</td>
                <td style={{padding: '1rem'}}>
                  {item.image ? <img src={item.image} alt={item.name} style={{width: '60px', height: '60px', objectFit: 'cover'}} /> : 'NO IMG'}
                </td>
                <td style={{padding: '1rem'}}>{item.name}</td>
                <td style={{padding: '1rem'}}>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <Link to={`/create-yours/edit/${item.id}`} style={{color: 'var(--color-text-main)', textDecoration: 'underline'}}>EDIT</Link>
                    <button onClick={() => handleDelete(item.id)} style={{color: '#ff4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline'}}>DELETE</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminCreateYoursForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', image: '', description: '' });

  useEffect(() => {
    if (id) {
      fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const item = data.find(i => i.id === Number(id));
            if (item) setFormData({ name: item.name, image: item.image, description: item.description || '' });
          }
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = `${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours${id ? `/${id}` : ''}`;
    
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify(formData)
      });
      navigate('/create-yours');
    } catch (err) {
      alert('Error saving item');
    }
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <Link to="/create-yours" style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', textDecoration: 'none', color: 'var(--color-text-muted)'}}>← BACK</Link>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0}}>
          {id ? 'Edit Item' : 'New Item'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>NAME (E.G. JERSEY)</label>
          <input required type="text" className="input-text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>UPLOAD IMAGE</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                setFormData({ ...formData, image: event.target?.result as string });
              };
              reader.readAsDataURL(file);
            }} 
            style={{color: 'var(--color-text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem'}}
          />
          {formData.image && (
            <div style={{marginTop: '1rem'}}>
              <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem'}}>PREVIEW:</p>
              <img src={formData.image} alt="Preview" style={{width: '200px', height: '200px', objectFit: 'cover', border: '1px solid var(--color-border)', borderRadius: '8px'}} />
            </div>
          )}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <label style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>DESCRIPTION (OPTIONAL)</label>
          <textarea className="input-text" style={{minHeight: '100px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>SAVE ITEM</button>
      </form>
    </div>
  );
}

export default App;


function AdminSettings() {
  const [heroSlides, setHeroSlides] = useState<{image: string, title: string, subtitle: string}[]>([]);
  const [aboutImage, setAboutImage] = useState('');
  const [aboutText, setAboutText] = useState('We engineer premium technical apparel that bridges the gap between high-performance athletic gear and modern streetwear aesthetics.');
  const [status, setStatus] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_slides) {
          try {
            setHeroSlides(JSON.parse(data.hero_slides));
          } catch(e) {}
        } else if (data.hero_image) {
          setHeroSlides([{ image: data.hero_image, title: data.hero_title || '', subtitle: data.hero_subtitle || '' }]);
        } else {
          setHeroSlides([{ image: '', title: '', subtitle: '' }]);
        }
        if (data.about_image) setAboutImage(data.about_image);
        if (data.about_text) setAboutText(data.about_text);
      });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const newSlides = [...heroSlides];
          let mimeType = 'image/jpeg';
          let quality: number | undefined = 0.8;
          if (file.type === 'image/png') {
            mimeType = 'image/png';
            quality = undefined;
          } else if (file.type === 'image/webp') {
            mimeType = 'image/webp';
          }
          newSlides[index].image = canvas.toDataURL(mimeType, quality);
          setHeroSlides(newSlides);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          let mimeType = 'image/jpeg';
          let quality: number | undefined = 0.8;
          if (file.type === 'image/png') {
            mimeType = 'image/png';
            quality = undefined;
          } else if (file.type === 'image/webp') {
            mimeType = 'image/webp';
          }
          setAboutImage(canvas.toDataURL(mimeType, quality));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = () => {
    setHeroSlides([...heroSlides, { image: '', title: '', subtitle: '' }]);
  };

  const handleRemoveSlide = (index: number) => {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify({ 
          hero_slides: JSON.stringify(heroSlides),
          about_image: aboutImage,
          about_text: aboutText
        })
      });
      if (res.ok) setStatus('Settings saved successfully!');
      else setStatus('Error saving settings.');
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newSlides = [...heroSlides];
    const draggedSlide = newSlides[draggedIndex];
    newSlides.splice(draggedIndex, 1);
    newSlides.splice(index, 0, draggedSlide);
    setHeroSlides(newSlides);
    setDraggedIndex(null);
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0'}}>Home Settings</h2>
      <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)'}}>
        
        {heroSlides.map((slide, index) => (
          <div 
            key={index} 
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={{border: '1px solid var(--color-border)', padding: '1.5rem', position: 'relative', background: 'var(--color-bg-main)', cursor: 'grab', opacity: draggedIndex === index ? 0.5 : 1}}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
              <div style={{cursor: 'grab', padding: '0.2rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </div>
              <h3 style={{fontFamily: 'var(--font-sans)', fontSize: '1.2rem', margin: 0}}>SLIDE {index + 1}</h3>
            </div>
            {heroSlides.length > 1 && (
              <button type="button" onClick={() => handleRemoveSlide(index)} style={{position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-border)', color: 'var(--color-text-main)', border: 'none', padding: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem'}}>REMOVE</button>
            )}
            
            <div className="control-group" style={{marginBottom: '1rem'}}>
              <label>TITLE</label>
              <input className="input-text" type="text" value={slide.title} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].title = e.target.value;
                setHeroSlides(newSlides);
              }} />
            </div>
            
            <div className="control-group" style={{marginBottom: '1rem'}}>
              <label>SUBTITLE</label>
              <input className="input-text" type="text" value={slide.subtitle} onChange={e => {
                const newSlides = [...heroSlides];
                newSlides[index].subtitle = e.target.value;
                setHeroSlides(newSlides);
              }} />
            </div>
            
            <div className="control-group">
              <label>BACKGROUND IMAGE</label>
              {slide.image && <img src={slide.image} alt="Hero Preview" style={{width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem'}} />}
              <div style={{position: 'relative', overflow: 'hidden'}}>
                <button type="button" className="btn-secondary" style={{width: '100%'}}>+ UPLOAD NEW BACKGROUND</button>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-secondary" onClick={handleAddSlide} style={{alignSelf: 'flex-start'}}>+ ADD NEW SLIDE</button>
        
        <hr style={{borderColor: 'var(--color-border)', width: '100%', margin: '2rem 0'}} />
        
        <h3 style={{fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem'}}>ABOUT MEGS SECTION</h3>
        <div className="control-group" style={{marginBottom: '1rem'}}>
          <label>ABOUT TEXT</label>
          <textarea className="input-text" rows={4} value={aboutText} onChange={e => setAboutText(e.target.value)} />
        </div>
        <div className="control-group">
          <label>ABOUT IMAGE (Left Side)</label>
          {aboutImage && <img src={aboutImage} alt="About Preview" style={{width: '200px', height: '200px', objectFit: 'cover', marginBottom: '1rem'}} />}
          <div style={{position: 'relative', overflow: 'hidden'}}>
            <button type="button" className="btn-secondary" style={{width: '100%'}}>+ UPLOAD ABOUT IMAGE</button>
            <input type="file" accept="image/*" onChange={handleAboutImageUpload} style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start', marginTop: '2rem'}}>SAVE SETTINGS</button>
        {status && <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)'}}>{status}</p>}
      </form>
    </div>
  );
}
