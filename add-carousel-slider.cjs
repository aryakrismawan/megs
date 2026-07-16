const fs = require('fs');
const path = require('path');

// 1. Update Admin-megs AdminSettings
const adminAppPath = path.join(__dirname, 'Admin-megs', 'src', 'App.tsx');
if (fs.existsSync(adminAppPath)) {
  let admin = fs.readFileSync(adminAppPath, 'utf8');

  // Replace AdminSettings completely
  const oldAdminSettingsRegex = /function AdminSettings\(\) \{[\s\S]*?(?=^export default App;)/m;
  
  const newAdminSettings = `function AdminSettings() {
  const [slides, setSlides] = useState<any[]>([{ image: '', title: '', subtitle: '' }]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_slides) {
          try {
            setSlides(JSON.parse(data.hero_slides));
          } catch(e) {}
        } else if (data.hero_image) {
          setSlides([{ image: data.hero_image, title: data.hero_title, subtitle: data.hero_subtitle }]);
        }
      });
  }, []);

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          const newSlides = [...slides];
          newSlides[index].image = canvas.toDataURL('image/jpeg', 0.8);
          setSlides(newSlides);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const moveSlide = (index: number, dir: number) => {
    if (index + dir < 0 || index + dir >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + dir];
    newSlides[index + dir] = temp;
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([...slides, { image: '', title: '', subtitle: '' }]);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return alert('Minimum 1 slide required');
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify({ hero_slides: JSON.stringify(slides) })
      });
      if (res.ok) setStatus('Settings saved successfully!');
      else setStatus('Error saving settings.');
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0'}}>Hero Carousel Settings</h2>
      <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        {slides.map((slide, index) => (
          <div key={index} style={{background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontFamily: 'var(--font-sans)'}}>Slide {index + 1}</h3>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0}>UP</button>
                <button type="button" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1}>DOWN</button>
                <button type="button" onClick={() => removeSlide(index)} style={{background: '#ff4444', color: 'white', border: 'none'}}>REMOVE</button>
              </div>
            </div>
            
            <div className="control-group">
              <label>HERO TITLE</label>
              <input className="input-text" type="text" value={slide.title} onChange={e => handleUpdate(index, 'title', e.target.value)} />
            </div>
            <div className="control-group">
              <label>HERO SUBTITLE</label>
              <input className="input-text" type="text" value={slide.subtitle} onChange={e => handleUpdate(index, 'subtitle', e.target.value)} />
            </div>
            <div className="control-group">
              <label>HERO BACKGROUND IMAGE</label>
              {slide.image && <img src={slide.image} alt="Hero Preview" style={{width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem'}} />}
              <div style={{position: 'relative', overflow: 'hidden'}}>
                <button type="button" className="btn-secondary" style={{width: '100%'}}>+ UPLOAD NEW BACKGROUND</button>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(index, e)} style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} />
              </div>
            </div>
          </div>
        ))}

        <div style={{display: 'flex', gap: '1rem'}}>
          <button type="button" onClick={addSlide} className="btn-secondary" style={{flex: 1}}>+ ADD NEW SLIDE</button>
          <button type="submit" className="btn-primary" style={{flex: 1}}>SAVE CAROUSEL</button>
        </div>
        {status && <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)'}}>{status}</p>}
      </form>
    </div>
  );
}
`;
  if (admin.match(oldAdminSettingsRegex)) {
    admin = admin.replace(oldAdminSettingsRegex, newAdminSettings);
    fs.writeFileSync(adminAppPath, admin);
    console.log('Update Admin-megs berhasil');
  }
}

// 2. Update Web-megs App.tsx HomeView
const webAppPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(webAppPath)) {
  let webApp = fs.readFileSync(webAppPath, 'utf8');

  // Regex to extract and replace the entire HomeView function
  const oldHomeViewRegex = /function HomeView\(\) \{[\s\S]*?\}\s*(?=function ProductListView\(\))/;

  const newHomeView = `function HomeView() {
  const { products, addToCart } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([{ 
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop',
    title: 'ENGINEERED FOR EXCELLENCE',
    subtitle: 'PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.'
  }]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_slides) {
          try {
            setHeroSlides(JSON.parse(data.hero_slides));
          } catch(e) {}
        } else if (data.hero_image) {
          setHeroSlides([{ image: data.hero_image, title: data.hero_title, subtitle: data.hero_subtitle }]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHero(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles\`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [articles.length]);

  return (
    <>
      {/* FULL WIDTH HERO SLIDER */}
      <div className="page-header-hero" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100vh', display: 'block' }}>
        <div style={{ 
          display: 'flex', 
          width: \`\${heroSlides.length * 100}%\`, 
          height: '100%',
          transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)', 
          transform: \`translateX(-\${activeHero * (100 / heroSlides.length)}%)\`
        }}>
          {heroSlides.map((slide, idx) => (
            <div key={idx} style={{ 
              width: \`\${100 / heroSlides.length}%\`, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              backgroundImage: \`linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('\${slide.image}')\`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              padding: '2rem'
            }}>
              <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 8rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '90vw'}}>{slide.title}</h1>
              <p style={{textAlign: 'center', margin: '2rem 0 0 0', color: '#eeeeee', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>{slide.subtitle}</p>
            </div>
          ))}
        </div>
        
        {/* Slider Indicators - Strip Lines */}
        {heroSlides.length > 1 && (
          <div style={{position: 'absolute', bottom: '3rem', display: 'flex', gap: '8px', left: '50%', transform: 'translateX(-50%)'}}>
            {heroSlides.map((_, idx) => (
              <div key={idx} onClick={() => setActiveHero(idx)} style={{width: '35px', height: '3px', background: activeHero === idx ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.3s'}}></div>
            ))}
          </div>
        )}
      </div>

      <div className="page-content" style={{paddingTop: '0'}}>
      {/* CATEGORIES SECTION */}
      <div style={{background: 'var(--color-bg-card)', padding: '0 0 5rem 0', borderTop: '1px solid var(--color-border)'}}>
        <div style={{display: 'flex', borderBottom: '1px solid var(--color-border)'}}>
          <div style={{flex: 1, padding: '3rem 2rem', textAlign: 'center', borderRight: '1px solid var(--color-border)', cursor: 'pointer'}} onClick={() => window.location.href='/product?cat=tops'}>
            <div style={{width: '80px', height: '80px', margin: '0 auto 1.5rem', border: '1px solid var(--color-text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.38 3.46L16 2a8.59 8.59 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>
            </div>
            <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem'}}>TOPS</h3>
          </div>
          <div style={{flex: 1, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer'}} onClick={() => window.location.href='/product?cat=bottoms'}>
            <div style={{width: '80px', height: '80px', margin: '0 auto 1.5rem', border: '1px solid var(--color-text-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.94 22.84a1.88 1.88 0 0 0 .91-1.25l1.09-5.45A3.16 3.16 0 0 0 19.86 13H15v-2h-6v2H4.14a3.16 3.16 0 0 0-3.08 3.14l1.09 5.45a1.88 1.88 0 0 0 .91 1.25 1.57 1.57 0 0 0 .94.16h16a1.57 1.57 0 0 0 .94-.16z"></path><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem'}}>BOTTOMS</h3>
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="page-header" style={{padding: '4rem 2rem 2rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
        <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9}}>NEW ARRIVALS</h2>
        <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>THE LATEST IN TECHNICAL APPAREL</p>
      </div>

      <div className="product-grid">
        {products.slice(0, 8).map(p => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </div>
      
      {/* EDITORIAL SLIDER AT THE BOTTOM */}
      {!loading && articles.length > 0 && (
        <div style={{marginTop: '0', borderTop: '1px solid var(--color-border)'}}>
          <div className="page-header" style={{padding: '4rem 2rem 2rem 2rem', textAlign: 'left', alignItems: 'flex-start'}}>
            <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: 'var(--color-text-main)', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9}}>JOURNAL</h2>
            <p style={{textAlign: 'left', margin: '1rem 0 0 0', color: 'var(--color-text-muted)'}}>LATEST STORIES & EDITORIALS</p>
          </div>
          <div className="horizontal-carousel" ref={carouselRef}>
          {articles.map((article) => {
            const imagesArr = article.images ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) : [];
            const coverImage = imagesArr.length > 0 ? imagesArr[0] : null;
            return (
            <div key={article.id} className="carousel-card" onClick={() => window.location.href = \`/journal/\${article.id}\`}>
              {coverImage && (
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1}}>
                  <img src={coverImage} alt="Cover" className="carousel-img" />
                </div>
              )}
              {/* GRADIENT OVERLAY FOR TEXT READABILITY */}
              <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', zIndex: 2}} />
              
              <div style={{position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', zIndex: 3, color: '#fff'}}>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.8}}>
                  {new Date(article.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase()} // EDITORIAL
                </p>
                <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '0.5rem', lineHeight: 1}}>
                  {article.title}
                </h2>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {article.excerpt}
                </p>
              </div>
            </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
    </>
  );
}
`;
  if (webApp.match(oldHomeViewRegex)) {
    webApp = webApp.replace(oldHomeViewRegex, newHomeView);
    fs.writeFileSync(webAppPath, webApp);
    console.log('Update Web-megs App.tsx berhasil');
  } else {
    console.log('Regex for HomeView failed to match!');
  }
}

// 3. Update Web-megs index.css (Megamenu Glassmorphism)
const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  const oldMegamenu = `.nav-megamenu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  background: var(--color-bg-main);
  border-bottom: 1px solid var(--color-border);
  padding: 3rem 4rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 100;
}`;
  
  const newMegamenu = `.nav-megamenu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  background: rgba(10, 12, 16, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 4rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 100;
}`;
  
  if (css.includes(oldMegamenu)) {
    css = css.replace(oldMegamenu, newMegamenu);
    fs.writeFileSync(cssPath, css);
    console.log('Update Web-megs index.css berhasil');
  }
}
