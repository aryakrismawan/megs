const fs = require('fs');
const path = require('path');

// 1. Update CSS
const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Hapus CSS dropdown lama jika ada
  cssContent = cssContent.replace(/\/\* Nav Dropdowns \*\/[\s\S]*?(?=\n\n|$)/, '');
  
  const megaMenuCss = `
/* Nav Megamenu */
.nav-item {
  position: static; /* so megamenu can be absolute to the header or fixed */
  display: flex;
  align-items: center;
  height: 100%;
  padding: 1rem 0;
}
.nav-megamenu {
  position: fixed;
  top: 75px;
  left: 0;
  width: 100vw;
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  padding: 3rem 10vw;
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  z-index: 998;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.nav-item:hover .nav-megamenu {
  display: grid;
  animation: slideDown 0.2s ease-out forwards;
}
.nav-megamenu-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-decoration: none;
  color: var(--color-text-main);
  transition: transform 0.3s ease;
}
.nav-megamenu-item:hover {
  transform: translateY(-5px);
}
.nav-megamenu-img-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  background: var(--color-bg-card);
  overflow: hidden;
}
.nav-megamenu-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.nav-megamenu-title {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.nav-megamenu-subtitle {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
`;
  fs.writeFileSync(cssPath, cssContent + megaMenuCss);
}

// 2. Update Navbar in App.tsx
const appPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');

  // Replace existing Navbar function entirely
  const navbarRegex = /function Navbar\(\) \{[\s\S]*?return \([\s\S]*?<\/header>\s*\);\s*\}/;
  
  const newNavbar = `function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('megs_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsSearchOpen, isSearchOpen, products } = useShop();
  const [articles, setArticles] = useState<any[]>([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('megs_theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles\`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(err => console.error(err));
  }, []);

  if (location.pathname.startsWith('/admin')) return null;

  const recentProducts = products.slice(0, 4);
  const recentArticles = articles.slice(0, 4);

  return (
    <header className="navbar" style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr'}}>
      <Link to="/" className="logo-container" style={{zIndex: 200}}>
        <span className="brand-name">MEGS</span>
      </Link>
      
      <nav className="desktop-nav">
        <div className="nav-item">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
        </div>

        <div className="nav-item">
          <Link to="/journal" className={location.pathname.startsWith('/journal') ? 'active' : ''}>Journal</Link>
          <div className="nav-megamenu">
            {recentArticles.map(article => {
              let displayImg = article.img;
              try {
                const parsed = JSON.parse(article.img);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) {}
              
              return (
                <Link to={\`/journal/\${article.id}\`} key={article.id} className="nav-megamenu-item">
                  <div className="nav-megamenu-img-wrapper">
                    <img src={displayImg} alt={article.title} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                  <div className="nav-megamenu-title">{article.title}</div>
                  <div className="nav-megamenu-subtitle">{new Date(article.created_at).toLocaleDateString()}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="nav-item">
          <Link to="/design" className={location.pathname === '/design' ? 'active' : ''}>2D Studio</Link>
        </div>

        <div className="nav-item">
          <Link to="/product" className={location.pathname.startsWith('/product') ? 'active' : ''}>Product</Link>
          <div className="nav-megamenu">
            {recentProducts.map(product => {
              let displayImg = product.img;
              try {
                const parsed = JSON.parse(product.img);
                if (Array.isArray(parsed) && parsed.length > 0) displayImg = parsed[0];
              } catch (e) {}
              
              return (
                <Link to={\`/product/\${product.id}\`} key={product.id} className="nav-megamenu-item">
                  <div className="nav-megamenu-img-wrapper">
                    <img src={displayImg} alt={product.name} style={{objectFit: 'contain'}} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  </div>
                  <div className="nav-megamenu-title">{product.name}</div>
                  <div className="nav-megamenu-subtitle">{product.price}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="nav-item">
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Kontak</Link>
        </div>
      </nav>
      
      <div className="nav-controls">
        <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center'}}>
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
        
        <button className={\`mobile-toggle \${isMobileMenuOpen ? 'open' : ''}\`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
}`;

  if (navbarRegex.test(appContent)) {
    appContent = appContent.replace(navbarRegex, newNavbar);
    fs.writeFileSync(appPath, appContent);
    console.log('Megamenu berhasil ditambahkan ke Navbar!');
  } else {
    console.log('Gagal menemukan Navbar di App.tsx');
  }
}
