const fs = require('fs');
const path = require('path');

// 1. Create Migration File
const migrationDir = path.join(__dirname, 'Worker-megs', 'migrations');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}
const migrationContent = `-- 0001_settings.sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_image', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop');
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_title', 'ENGINEERED FOR EXCELLENCE');
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_subtitle', 'PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.');
`;
fs.writeFileSync(path.join(migrationDir, '0001_settings.sql'), migrationContent);
console.log('[1/4] Migration created.');

// 2. Add API Endpoints in Worker
const workerPath = path.join(__dirname, 'Worker-megs', 'src', 'index.ts');
if (fs.existsSync(workerPath)) {
  let workerContent = fs.readFileSync(workerPath, 'utf8');
  if (!workerContent.includes('/api/settings')) {
    const endpoints = `
// --- SETTINGS ---
app.get('/api/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM settings").all();
    const settingsObj = results.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return c.json(settingsObj);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/settings', async (c) => {
  try {
    const adminToken = c.req.header('X-Admin-Token');
    if (adminToken !== 'MEGS2026') return c.json({ error: 'Unauthorized' }, 401);
    
    const body = await c.req.json();
    const stmts = [];
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        stmts.push(c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value));
      }
    }
    await c.env.DB.batch(stmts);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app;`;
    workerContent = workerContent.replace('export default app;', endpoints);
    fs.writeFileSync(workerPath, workerContent);
    console.log('[2/4] Worker APIs added.');
  }
}

// 3. Admin-megs modifications
const adminAppPath = path.join(__dirname, 'Admin-megs', 'src', 'App.tsx');
if (fs.existsSync(adminAppPath)) {
  let adminAppContent = fs.readFileSync(adminAppPath, 'utf8');
  
  if (!adminAppContent.includes('AdminSettings')) {
    // Add Sidebar Link
    adminAppContent = adminAppContent.replace(
      `<Link to="/articles" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>JOURNAL ARTICLES</Link>`,
      `<Link to="/articles" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>JOURNAL ARTICLES</Link>\n          <Link to="/settings" style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>HOME SETTINGS</Link>`
    );

    // Add Route
    adminAppContent = adminAppContent.replace(
      `<Route path="/articles/edit/:id" element={<AdminArticleForm />} />`,
      `<Route path="/articles/edit/:id" element={<AdminArticleForm />} />\n          <Route path="/settings" element={<AdminSettings />} />`
    );

    // Add Component
    const adminSettingsComponent = `
function AdminSettings() {
  const [heroImage, setHeroImage] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`)
      .then(res => res.json())
      .then(data => {
        setHeroImage(data.hero_image || '');
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
      });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setHeroImage(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'MEGS2026' },
        body: JSON.stringify({ hero_image: heroImage, hero_title: heroTitle, hero_subtitle: heroSubtitle })
      });
      if (res.ok) setStatus('Settings saved successfully!');
      else setStatus('Error saving settings.');
    } catch (e: any) {
      setStatus(e.message);
    }
  };

  return (
    <div style={{maxWidth: '800px'}}>
      <h2 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: '0 0 2rem 0'}}>Home Settings</h2>
      <form onSubmit={handleSave} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-card)', padding: '2rem', border: '1px solid var(--color-border)'}}>
        <div className="control-group">
          <label>HERO TITLE</label>
          <input className="input-text" type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} />
        </div>
        <div className="control-group">
          <label>HERO SUBTITLE</label>
          <input className="input-text" type="text" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} />
        </div>
        <div className="control-group">
          <label>HERO BACKGROUND IMAGE</label>
          {heroImage && <img src={heroImage} alt="Hero Preview" style={{width: '100%', height: '200px', objectFit: 'cover', marginBottom: '1rem'}} />}
          <div style={{position: 'relative', overflow: 'hidden'}}>
            <button type="button" className="btn-secondary" style={{width: '100%'}}>+ UPLOAD NEW BACKGROUND</button>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{fontSize: '100px', position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer'}} />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>SAVE SETTINGS</button>
        {status && <p style={{fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)'}}>{status}</p>}
      </form>
    </div>
  );
}
`;
    adminAppContent = adminAppContent + '\n' + adminSettingsComponent;
    fs.writeFileSync(adminAppPath, adminAppContent);
    console.log('[3/4] Admin App updated.');
  }
}

// 4. Web-megs modifications
const webAppPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(webAppPath)) {
  let webAppContent = fs.readFileSync(webAppPath, 'utf8');
  
  if (!webAppContent.includes('const [settings, setSettings] = useState')) {
    // Add settings state to HomeView
    const oldHomeViewStart = `function HomeView() {
  const { products, addToCart } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);`;
    
    const newHomeViewStart = `function HomeView() {
  const { products, addToCart } = useShop();
  const [articles, setArticles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ 
    hero_image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop',
    hero_title: 'ENGINEERED FOR EXCELLENCE',
    hero_subtitle: 'PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.'
  });
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(\`\${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/settings\`)
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) setSettings(data);
      })
      .catch(console.error);
  }, []);`;
    
    webAppContent = webAppContent.replace(oldHomeViewStart, newHomeViewStart);

    // Replace static text/image with dynamic settings
    const oldHero = `<div className="page-header page-header-hero" style={{padding: '2rem', paddingTop: '12rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>ENGINEERED FOR EXCELLENCE</h1>
        <p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: '#dddddd', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.</p>`;
        
    const newHero = `<div className="page-header page-header-hero" style={{backgroundImage: \`linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('\${settings.hero_image}')\`, padding: '2rem', paddingTop: '12rem', paddingBottom: '6rem', textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        <h1 style={{fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 'clamp(3rem, 6vw, 6rem)', color: '#ffffff', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9, textAlign: 'center', margin: 0, maxWidth: '800px'}}>{settings.hero_title}</h1>
        <p style={{textAlign: 'center', margin: '1.5rem 0 0 0', color: '#dddddd', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', maxWidth: '600px'}}>{settings.hero_subtitle}</p>`;
        
    webAppContent = webAppContent.replace(oldHero, newHero);
    
    fs.writeFileSync(webAppPath, webAppContent);
    console.log('[4/4] Web App updated.');
  }
}
