import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// In-memory sliding window rate limiter per isolate to protect D1 from order spam floods
const orderRateLimitMap = new Map<string, number>();


// Enable CORS for frontend applications
app.use('/api/*', cors({
  origin: '*', // Allow all origins for dev, in production you should restrict this
  allowHeaders: ['Content-Type', 'X-Admin-Token'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}));

async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyAdmin(c: any): Promise<boolean> {
  const token = c.req.header('X-Admin-Token');
  if (!token) return false;
  try {
    const decoded = atob(token);
    const [username, hash] = decoded.split(':');
    if (!username || !hash) return false;
    const admin = await c.env.DB.prepare("SELECT id FROM admins WHERE username = ? AND password_hash = ?").bind(username, hash).first();
    return !!admin;
  } catch (e) {
    return false;
  }
}

// --- AUTH & ADMINS ---
app.post('/api/login', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`).run();

    const { results } = await c.env.DB.prepare("SELECT * FROM admins").all();
    if (results.length === 0) {
      const defaultHash = await hashPassword('admin');
      await c.env.DB.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").bind('admin', defaultHash).run();
    }

    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Missing credentials' }, 400);

    const hash = await hashPassword(password);
    const admin = await c.env.DB.prepare("SELECT * FROM admins WHERE username = ? AND password_hash = ?").bind(username, hash).first();

    if (!admin) return c.json({ error: 'Invalid credentials' }, 401);

    const token = btoa(`${username}:${hash}`);
    return c.json({ success: true, token });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get('/api/admins', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const { results } = await c.env.DB.prepare("SELECT id, username FROM admins").all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/admins', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Missing fields' }, 400);
    const hash = await hashPassword(password);
    await c.env.DB.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").bind(username, hash).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/admins/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM admins WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/admins/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    const { username, password } = await c.req.json();
    if (!username) return c.json({ error: 'Missing username' }, 400);

    if (password) {
      const hash = await hashPassword(password);
      await c.env.DB.prepare("UPDATE admins SET username = ?, password_hash = ? WHERE id = ?").bind(username, hash, id).run();
    } else {
      await c.env.DB.prepare("UPDATE admins SET username = ? WHERE id = ?").bind(username, id).run();
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
    c.header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/products', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { name, price, category, img, description, sizes } = body;

    const info = await c.env.DB.prepare(
      "INSERT INTO products (name, price, category, img, description, sizes) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      name, price, category,
      typeof img === 'string' ? img : JSON.stringify(img),
      description || '',
      typeof sizes === 'string' ? sizes : JSON.stringify(sizes)
    ).run();

    return c.json({ success: true, id: info.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/products/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, price, category, img, description, sizes } = body;

    const result = await c.env.DB.prepare(
      "UPDATE products SET name = ?, price = ?, category = ?, img = ?, description = ?, sizes = ? WHERE id = ?"
    ).bind(
      name, price, category,
      typeof img === 'string' ? img : JSON.stringify(img),
      description || '',
      typeof sizes === 'string' ? sizes : JSON.stringify(sizes),
      id
    ).run();

    if (result.meta.changes === 0) return c.json({ error: 'Product not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/products/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});


// --- ARTICLES ---
app.get('/api/articles', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM articles ORDER BY created_at DESC").all();
    c.header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get('/api/articles/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await c.env.DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/articles', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { title, excerpt, content, images, created_at } = body;

    let info;
    if (created_at) {
      info = await c.env.DB.prepare(
        "INSERT INTO articles (title, excerpt, content, images, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(
        title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images), created_at
      ).run();
    } else {
      info = await c.env.DB.prepare(
        "INSERT INTO articles (title, excerpt, content, images) VALUES (?, ?, ?, ?)"
      ).bind(
        title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images)
      ).run();
    }

    return c.json({ success: true, id: info.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/articles/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, excerpt, content, images, created_at } = body;

    let result;
    if (created_at) {
      result = await c.env.DB.prepare(
        "UPDATE articles SET title = ?, excerpt = ?, content = ?, images = ?, created_at = ? WHERE id = ?"
      ).bind(
        title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images), created_at, id
      ).run();
    } else {
      result = await c.env.DB.prepare(
        "UPDATE articles SET title = ?, excerpt = ?, content = ?, images = ? WHERE id = ?"
      ).bind(
        title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images), id
      ).run();
    }

    if (result.meta.changes === 0) return c.json({ error: 'Article not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/articles/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});


// --- CREATE YOURS ---
app.get('/api/create-yours', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS create_yours (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, image TEXT, description TEXT)`).run();
    try {
      await c.env.DB.prepare(`ALTER TABLE create_yours ADD COLUMN form_config TEXT`).run();
    } catch (e) { }
    const { results } = await c.env.DB.prepare("SELECT * FROM create_yours ORDER BY id DESC").all();
    c.header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/create-yours', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS create_yours (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, image TEXT, description TEXT)`).run();
    try {
      await c.env.DB.prepare(`ALTER TABLE create_yours ADD COLUMN form_config TEXT`).run();
    } catch (e) { }
    const body = await c.req.json();
    const { name, image, description, form_config } = body;

    const info = await c.env.DB.prepare("INSERT INTO create_yours (name, image, description, form_config) VALUES (?, ?, ?, ?)").bind(name, image || '', description || '', form_config || '').run();
    return c.json({ success: true, id: info.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/create-yours/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, image, description, form_config } = body;

    const result = await c.env.DB.prepare("UPDATE create_yours SET name = ?, image = ?, description = ?, form_config = ? WHERE id = ?").bind(name, image || '', description || '', form_config || '', id).run();
    if (result.meta.changes === 0) return c.json({ error: 'Item not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/create-yours/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM create_yours WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- ORDERS ---
app.get('/api/orders', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const data = await c.req.json();
    const { customer_name, customer_phone, customer_address, order_items, total_price, coupon_code, turnstile_token, honeypot } = data;

    // 1. Honeypot Anti-Bot Check
    if (honeypot && String(honeypot).trim() !== '') {
      return c.json({ error: 'Bot activity detected' }, 400);
    }

    if (!customer_name || !customer_phone || !customer_address || !order_items) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // 2. Payload Length & Sanitization Guard to prevent DB overflow
    const cleanName = String(customer_name).trim().slice(0, 120);
    const cleanPhone = String(customer_phone).replace(/\D/g, '').slice(0, 25);
    const cleanAddress = String(customer_address).trim().slice(0, 1200);
    const serializedItems = typeof order_items === 'string' ? order_items : JSON.stringify(order_items);

    if (!cleanPhone || serializedItems.length > 20000) {
      return c.json({ error: 'Invalid order payload' }, 400);
    }

    // 3. Per-IP & Per-Phone Rate Limiting (25s cooldown)
    const clientIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || cleanPhone;
    const rateKey = `${clientIp}:${cleanPhone}`;
    const nowMs = Date.now();
    const lastOrderMs = orderRateLimitMap.get(rateKey) || 0;
    if (nowMs - lastOrderMs < 25000) {
      return c.json({ error: 'Mohon tunggu beberapa detik sebelum mengirim pesanan kembali.' }, 429);
    }

    // 4. Mandatory Server-Side Anti-Bot Verification (Cloudflare Turnstile + SHA-256 Proof-of-Work)
    if (!turnstile_token || typeof turnstile_token !== 'string') {
      return c.json({ error: 'Verifikasi anti-bot diperlukan sebelum membuat pesanan.' }, 403);
    }

    let cfTokenToVerify = turnstile_token;
    let powTokenToVerify = '';

    if (turnstile_token.startsWith('{')) {
      try {
        const bundle = JSON.parse(turnstile_token);
        cfTokenToVerify = typeof bundle.cf === 'string' ? bundle.cf : '';
        powTokenToVerify = typeof bundle.pow === 'string' ? bundle.pow : '';
      } catch {
        return c.json({ error: 'Format token keamanan tidak valid.' }, 403);
      }
    } else if (turnstile_token.startsWith('pow.')) {
      powTokenToVerify = turnstile_token;
      cfTokenToVerify = '';
    }

    if (powTokenToVerify) {
      const isValidPow = await verifyPowToken(powTokenToVerify);
      if (!isValidPow) {
        return c.json({ error: 'Token keamanan tidak valid atau sudah kedaluwarsa. Silakan verifikasi ulang.' }, 403);
      }
    } else if (!c.env.TURNSTILE_SECRET_KEY) {
      return c.json({ error: 'Token verifikasi anti-bot tidak valid.' }, 403);
    }

    if (c.env.TURNSTILE_SECRET_KEY) {
      if (!cfTokenToVerify) {
        return c.json({ error: 'Verifikasi Cloudflare Turnstile diperlukan.' }, 403);
      }
      try {
        const formData = new FormData();
        formData.append('secret', c.env.TURNSTILE_SECRET_KEY);
        formData.append('response', cfTokenToVerify);
        if (c.req.header('CF-Connecting-IP')) {
          formData.append('remoteip', c.req.header('CF-Connecting-IP')!);
        }
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData
        });
        const verifyOutcome: any = await verifyRes.json();
        if (!verifyOutcome.success) {
          return c.json({ error: 'Verifikasi Cloudflare Turnstile gagal. Silakan muat ulang halaman.' }, 403);
        }
      } catch {
        return c.json({ error: 'Gagal menghubungi server verifikasi Cloudflare. Silakan coba lagi.' }, 403);
      }
    }

    orderRateLimitMap.set(rateKey, nowMs);
    if (orderRateLimitMap.size > 500) {
      const oldestKey = orderRateLimitMap.keys().next().value;
      if (oldestKey) orderRateLimitMap.delete(oldestKey);
    }

    const info = await c.env.DB.prepare(
      `INSERT INTO orders (customer_name, customer_phone, customer_address, order_items, total_price, status) 
       VALUES (?, ?, ?, ?, ?, 'menunggu pembayaran')`
    ).bind(
      cleanName,
      cleanPhone,
      cleanAddress,
      serializedItems,
      total_price || ''
    ).run();

    if (coupon_code) {
      await c.env.DB.prepare("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?").bind(coupon_code.toUpperCase()).run();
    }

    return c.json({ success: true, id: info.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.put('/api/orders/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const data = await c.req.json();
    const { status } = data;

    if (!status) return c.json({ error: 'Missing status field' }, 400);

    const result = await c.env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?")
      .bind(status, id).run();

    if (result.meta.changes === 0) return c.json({ error: 'Order not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/orders/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});


// --- SETTINGS ---
app.get('/api/settings', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`).run();

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
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`).run();

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

// --- MEDIA UPLOAD (D1 CHUNKING) ---
app.post('/api/upload', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);

    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, mime_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS media_chunks (media_id TEXT, chunk_index INTEGER, data TEXT, PRIMARY KEY (media_id, chunk_index))`).run();

    const { file } = await c.req.json();
    if (!file || typeof file !== 'string') return c.json({ error: 'Missing file data' }, 400);

    // file is expected to be a data URL: data:video/mp4;base64,AAAA...
    const match = file.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return c.json({ error: 'Invalid file format' }, 400);

    const mimeType = match[1];
    const base64Data = match[2];

    const id = crypto.randomUUID();

    // Chunk size: 700KB (700,000 chars of base64) to safely stay under D1's 1MB row limit
    const CHUNK_SIZE = 700000;
    const stmts = [];

    stmts.push(c.env.DB.prepare("INSERT INTO media (id, mime_type) VALUES (?, ?)").bind(id, mimeType));

    for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
      const chunk = base64Data.slice(i, i + CHUNK_SIZE);
      stmts.push(c.env.DB.prepare("INSERT INTO media_chunks (media_id, chunk_index, data) VALUES (?, ?, ?)").bind(id, i / CHUNK_SIZE, chunk));
    }

    await c.env.DB.batch(stmts);

    let ext = '';
    if (mimeType.includes('video/mp4')) ext = '.mp4';
    else if (mimeType.includes('video/webm')) ext = '.webm';
    else if (mimeType.includes('image/png')) ext = '.png';
    else if (mimeType.includes('image/webp')) ext = '.webp';
    else if (mimeType.includes('image/jpeg')) ext = '.jpg';

    return c.json({ success: true, url: `/api/media/${id}${ext}` });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.get('/api/media/:id', async (c) => {
  try {
    let id = c.req.param('id');
    if (id.includes('.')) {
      id = id.split('.')[0];
    }

    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, mime_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS media_chunks (media_id TEXT, chunk_index INTEGER, data TEXT, PRIMARY KEY (media_id, chunk_index))`).run();

    const mediaRow = await c.env.DB.prepare("SELECT mime_type FROM media WHERE id = ?").bind(id).first();
    if (!mediaRow) return c.json({ error: 'Not found' }, 404);

    const { results } = await c.env.DB.prepare("SELECT data FROM media_chunks WHERE media_id = ? ORDER BY chunk_index ASC").bind(id).all();
    if (!results || results.length === 0) return c.json({ error: 'Chunks not found' }, 404);

    const base64Data = results.map((r: any) => r.data).join('');

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes.buffer, {
      headers: {
        'Content-Type': mediaRow.mime_type as string,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- COUPONS ---
app.get('/api/coupons', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, discount_percentage INTEGER NOT NULL, valid_from DATETIME, valid_until DATETIME, usage_limit INTEGER, used_count INTEGER DEFAULT 0)`).run();
    const { results } = await c.env.DB.prepare("SELECT * FROM coupons ORDER BY id DESC").all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/coupons', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, discount_percentage INTEGER NOT NULL, valid_from DATETIME, valid_until DATETIME, usage_limit INTEGER, used_count INTEGER DEFAULT 0)`).run();
    const { code, discount_percentage, valid_from, valid_until, usage_limit } = await c.req.json();
    if (!code || discount_percentage === undefined) return c.json({ error: 'Missing fields' }, 400);

    const result = await c.env.DB.prepare(
      "INSERT INTO coupons (code, discount_percentage, valid_from, valid_until, usage_limit, used_count) VALUES (?, ?, ?, ?, ?, 0)"
    ).bind(code.toUpperCase(), discount_percentage, valid_from || null, valid_until || null, usage_limit || null).run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/coupons/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM coupons WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/verify-coupon', async (c) => {
  try {
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, discount_percentage INTEGER NOT NULL, valid_from DATETIME, valid_until DATETIME, usage_limit INTEGER, used_count INTEGER DEFAULT 0)`).run();
    const { code } = await c.req.json();
    if (!code) return c.json({ error: 'Missing coupon code' }, 400);

    const coupon = await c.env.DB.prepare("SELECT * FROM coupons WHERE code = ?").bind(code.toUpperCase()).first();
    if (!coupon) return c.json({ error: 'Invalid coupon code' }, 404);

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return c.json({ error: 'Coupon is not active yet' }, 400);
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return c.json({ error: 'Coupon has expired' }, 400);
    if (coupon.usage_limit && (coupon.used_count as number) >= (coupon.usage_limit as number)) return c.json({ error: 'Coupon usage limit reached' }, 400);

    return c.json({ success: true, discount_percentage: coupon.discount_percentage, id: coupon.id, code: coupon.code });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app;
