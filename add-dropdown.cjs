const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  if (!cssContent.includes('.nav-dropdown')) {
    const appendCss = `
/* Nav Dropdowns */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 1rem 0;
}
.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-main);
  border: 1px solid var(--color-border);
  padding: 0;
  display: none;
  flex-direction: column;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 1000;
}
.nav-item:hover .nav-dropdown {
  display: flex;
  animation: slideDown 0.2s ease-out forwards;
}
.nav-dropdown a {
  padding: 1rem 2rem;
  display: block;
  font-size: 0.8rem !important;
  border-bottom: 1px solid var(--color-border);
  text-align: center;
  width: 100%;
}
.nav-dropdown a:last-child {
  border-bottom: none;
}
.nav-dropdown a:hover {
  background: var(--color-text-main);
  color: var(--color-bg-main) !important;
}
`;
    fs.writeFileSync(cssPath, cssContent + appendCss);
    console.log('Added Dropdown CSS');
  }
}

const appPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  const oldNav = `<nav className="desktop-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
        <Link to="/journal" className={location.pathname === '/journal' ? 'active' : ''}>Journal</Link>
        <Link to="/design" className={location.pathname === '/design' ? 'active' : ''}>2D Studio</Link>
        <Link to="/product" className={location.pathname === '/product' ? 'active' : ''}>Product</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Kontak</Link>
      </nav>`;
      
  const newNav = `<nav className="desktop-nav">
        <div className="nav-item">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>
        </div>

        <div className="nav-item">
          <Link to="/journal" className={location.pathname.startsWith('/journal') ? 'active' : ''}>Journal</Link>
          <div className="nav-dropdown">
            <Link to="/journal">LATEST ARTICLES</Link>
            <Link to="/journal?category=editorials">EDITORIALS</Link>
            <Link to="/journal?category=lookbooks">LOOKBOOKS</Link>
          </div>
        </div>

        <div className="nav-item">
          <Link to="/design" className={location.pathname === '/design' ? 'active' : ''}>2D Studio</Link>
        </div>

        <div className="nav-item">
          <Link to="/product" className={location.pathname.startsWith('/product') ? 'active' : ''}>Product</Link>
          <div className="nav-dropdown">
            <Link to="/product">ALL PRODUCTS</Link>
            <Link to="/product?category=tops">TOPS</Link>
            <Link to="/product?category=bottoms">BOTTOMS</Link>
            <Link to="/product?category=accessories">ACCESSORIES</Link>
          </div>
        </div>

        <div className="nav-item">
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Kontak</Link>
        </div>
      </nav>`;

  if (appContent.includes(oldNav)) {
    appContent = appContent.replace(oldNav, newNav);
    fs.writeFileSync(appPath, appContent);
    console.log('Added Dropdowns to App.tsx');
  } else {
    console.log('App.tsx string replace failed: String not found.');
  }
}
