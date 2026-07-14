import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';

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
      const res = await fetch('https://worker-megs.krisarya8.workers.dev/api/orders');
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
      await fetch(`https://worker-megs.krisarya8.workers.dev/api/orders/${id}`, {
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
      await fetch(`https://worker-megs.krisarya8.workers.dev/api/orders/${id}`, {
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
      const res = await fetch('https://worker-megs.krisarya8.workers.dev/api/products');
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
      await fetch(`https://worker-megs.krisarya8.workers.dev/api/products/${id}`, {
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
              <Link to={`/admin/products/edit/${product.id}`} className="btn-secondary" style={{padding: '0.5rem 1rem'}}>EDIT</Link>
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

  useEffect(() => {
    if (isEdit) {
      fetch(`https://worker-megs.krisarya8.workers.dev/api/products/${id}`)
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
              resolve(canvas.toDataURL('image/jpeg', 0.8));
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
      const url = isEdit ? `https://worker-megs.krisarya8.workers.dev/api/products/${id}` : 'https://worker-megs.krisarya8.workers.dev/api/products';
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
              <div key={idx} style={{position: 'relative', height: '100px', width: '100px', flexShrink: 0}}>
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
      const res = await fetch('https://worker-megs.krisarya8.workers.dev/api/articles');
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
      await fetch(`https://worker-megs.krisarya8.workers.dev/api/articles/${id}`, {
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
              <Link to={`/admin/articles/edit/${article.id}`} className="btn-secondary" style={{padding: '0.5rem 1rem'}}>EDIT</Link>
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

  useEffect(() => {
    if (isEdit) {
      fetch(`https://worker-megs.krisarya8.workers.dev/api/articles/${id}`)
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
              resolve(canvas.toDataURL('image/jpeg', 0.7));
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
      const url = isEdit ? `https://worker-megs.krisarya8.workers.dev/api/articles/${id}` : 'https://worker-megs.krisarya8.workers.dev/api/articles';
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
                <div key={i} style={{position: 'relative', height: '100px', width: '100px', flexShrink: 0}}>
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

export default App;
