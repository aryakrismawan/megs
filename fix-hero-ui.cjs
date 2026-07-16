const fs = require('fs');
const path = require('path');

// 1. Update index.css
const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  // Update navbar-scrolled to glassmorphism
  const oldScrolled = `.navbar-scrolled {
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 3rem;
}`;
  const newScrolled = `.navbar-scrolled {
  background: rgba(10, 12, 16, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 3rem;
}`;
  if (css.includes(oldScrolled)) {
    css = css.replace(oldScrolled, newScrolled);
  }

  // Remove padding from page-header-hero and use full width/height
  const oldHeroClass = `.page-header-hero {
  background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  color: white !important;
  min-height: 80vh;
}`;
  const newHeroClass = `.page-header-hero {
  background-size: cover;
  background-position: center;
  color: white !important;
  min-height: 100vh;
  width: 100%;
  transition: background-image 1s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}`;
  if (css.includes(oldHeroClass)) {
    css = css.replace(oldHeroClass, newHeroClass);
  } else {
    // If it was already modified, just append or replace whatever is there
    css = css.replace(/\.page-header-hero\s*{[^}]*}/, newHeroClass);
  }

  fs.writeFileSync(cssPath, css);
  console.log('Update index.css berhasil');
}

// 2. Update App.tsx
const appPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');

  // Revert Logo
  const oldLogo = `<Link to="/" className="logo-container" style={{zIndex: 200, textDecoration: 'none'}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="megs-logo-svg">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span className="brand-name">MEGS</span>
      </Link>`;
  const newLogo = `<Link to="/" className="logo-container" style={{zIndex: 200, textDecoration: 'none'}}>
        <span className="brand-name">MEGS</span>
      </Link>`;
  if (app.includes(oldLogo)) {
    app = app.replace(oldLogo, newLogo);
  }

  // Revert SHOP NOW
  const oldShopNow = `<Link to="/product" className={\`nav-btn-highlight \${location.pathname.startsWith('/product') ? 'active' : ''}\`}>SHOP NOW</Link>`;
  const newProduct = `<Link to="/product" className={location.pathname.startsWith('/product') ? 'active' : ''}>Product</Link>`;
  if (app.includes(oldShopNow)) {
    app = app.replace(oldShopNow, newProduct);
  }

  // Inject Slider Logic into HomeView
  const oldHomeViewStart = `  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {`;
  
  const newHomeViewStart = `  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero(prev => (prev + 1) % 2); // Toggle between 2 images
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {`;
  
  if (app.includes(oldHomeViewStart)) {
    app = app.replace(oldHomeViewStart, newHomeViewStart);
  }

  // Extract Hero Section from page-content
  const oldHeroSection = `<div className="page-content" style={{paddingTop: '0'}}>
      <div className="page-header page-header-hero" style={{backgroundImage: \`linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('\${settings.hero_image}')\`, padding: '2rem', paddingTop: '12rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>{settings.hero_title}</h1>
        <p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: '#dddddd', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>{settings.hero_subtitle}</p>
      </div>

      {/* CATEGORIES SECTION */}`;

  const newHeroSection = `
      {/* FULL WIDTH HERO SLIDER */}
      <div className="page-header-hero" style={{
        backgroundImage: \`linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('\${activeHero === 0 ? settings.hero_image : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop'}')\`
      }}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 8rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '90vw'}}>{settings.hero_title}</h1>
        <p style={{textAlign: 'center', margin: '2rem 0 0 0', color: '#eeeeee', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>{settings.hero_subtitle}</p>
        
        {/* Slider Indicators */}
        <div style={{position: 'absolute', bottom: '2rem', display: 'flex', gap: '10px'}}>
          <div onClick={() => setActiveHero(0)} style={{width: '12px', height: '12px', borderRadius: '50%', background: activeHero === 0 ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: '0.3s'}}></div>
          <div onClick={() => setActiveHero(1)} style={{width: '12px', height: '12px', borderRadius: '50%', background: activeHero === 1 ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: '0.3s'}}></div>
        </div>
      </div>

      <div className="page-content" style={{paddingTop: '0'}}>
      {/* CATEGORIES SECTION */}`;

  if (app.includes(oldHeroSection)) {
    app = app.replace(oldHeroSection, newHeroSection);
  }

  fs.writeFileSync(appPath, app);
  console.log('Update App.tsx berhasil');
}
