const fs = require('fs');
const path = require('path');

// 1. Modifikasi index.css
const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  // Update navbar transparent
  const navbarOld = `.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}`;
  
  const navbarNew = `.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 0.3s ease, border-color 0.3s ease, padding 0.3s ease;
  z-index: 1000;
}

.navbar-scrolled {
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 3rem;
}

.megs-logo-svg {
  color: var(--color-text-main);
}

.nav-btn-highlight {
  background: #6c5ce7;
  color: #ffffff !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 800 !important;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
}

.nav-btn-highlight:hover {
  background: #a29bfe;
  transform: translateY(-2px);
}

/* Global Loader */
.global-loader {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: var(--color-bg-main);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s ease;
}

.global-loader.hidden {
  opacity: 0;
  pointer-events: none;
}

.spinning-logo {
  animation: spinLogo 2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  width: 60px;
  height: 60px;
  color: var(--color-text-main);
}

@keyframes spinLogo {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); color: #6c5ce7; }
  100% { transform: rotate(360deg) scale(1); }
}

.page-header-hero {
  background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  color: white !important;
  min-height: 80vh;
}
`;
  if (css.includes(navbarOld)) {
    css = css.replace(navbarOld, navbarNew);
    fs.writeFileSync(cssPath, css);
    console.log('Update CSS berhasil');
  }
}

// 2. Modifikasi App.tsx
const appPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');

  // Add global loader state in App()
  if (app.includes('function App() {') && !app.includes('GlobalLoader')) {
    const oldApp = `function App() {
  return (
    <ShopProvider>
      <Router>
      <div className="app-container">`;
    const newApp = `function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={\`global-loader \${isLoading ? '' : 'hidden'}\`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinning-logo">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </div>
  );
}

function App() {
  return (
    <ShopProvider>
      <Router>
      <div className="app-container">
        <GlobalLoader />`;
    app = app.replace(oldApp, newApp);
  }

  // Navbar transparent state
  const oldNavbarStart = `function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('megs_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsSearchOpen, isSearchOpen, products } = useShop();
  const [articles, setArticles] = useState<any[]>([]);`;
  
  const newNavbarStart = `function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('megs_theme') || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsSearchOpen, isSearchOpen, products } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);`;
  app = app.replace(oldNavbarStart, newNavbarStart);

  // Navbar header tag and logo
  const oldHeader = `<header className="navbar" style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr'}}>
      <Link to="/" className="logo-container" style={{zIndex: 200}}>
        <span className="brand-name">MEGS</span>
      </Link>`;
      
  const newHeader = `<header className={\`navbar \${isScrolled ? 'navbar-scrolled' : ''}\`} style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr'}}>
      <Link to="/" className="logo-container" style={{zIndex: 200, textDecoration: 'none'}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="megs-logo-svg">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span className="brand-name">MEGS</span>
      </Link>`;
  app = app.replace(oldHeader, newHeader);

  // Highlight Product Link
  const oldProductLink = `<Link to="/product" className={location.pathname.startsWith('/product') ? 'active' : ''}>Product</Link>`;
  const newProductLink = `<Link to="/product" className={\`nav-btn-highlight \${location.pathname.startsWith('/product') ? 'active' : ''}\`}>SHOP NOW</Link>`;
  app = app.replace(oldProductLink, newProductLink);

  // Hero section in HomeView
  const oldHero = `<div className="page-header" style={{padding: '2rem', paddingTop: '8rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>`;
  const newHero = `<div className="page-header page-header-hero" style={{padding: '2rem', paddingTop: '12rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>`;
  app = app.replace(oldHero, newHero);
  
  // Hero section text colors (to ensure readable on image)
  const oldHeroTitle = `<h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>ENGINEERED FOR EXCELLENCE</h1>`;
  const newHeroTitle = `<h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>ENGINEERED FOR EXCELLENCE</h1>`;
  app = app.replace(oldHeroTitle, newHeroTitle);
  
  const oldHeroSub = `<p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.</p>`;
  const newHeroSub = `<p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: '#dddddd', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.</p>`;
  app = app.replace(oldHeroSub, newHeroSub);

  fs.writeFileSync(appPath, app);
  console.log('Update App.tsx berhasil');
}
