import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();


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
  } catch(e) {
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
  } catch(e: any) {
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
  } catch(e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.delete('/api/admins/:id', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    const id = c.req.param('id');
    await c.env.DB.prepare("DELETE FROM admins WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch(e: any) {
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
  } catch(e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
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
    const { title, excerpt, content, images } = body;
    
    const info = await c.env.DB.prepare(
      "INSERT INTO articles (title, excerpt, content, images) VALUES (?, ?, ?, ?)"
    ).bind(
      title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images)
    ).run();

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
    const { title, excerpt, content, images } = body;

    const result = await c.env.DB.prepare(
      "UPDATE articles SET title = ?, excerpt = ?, content = ?, images = ? WHERE id = ?"
    ).bind(
      title, excerpt, content, typeof images === 'string' ? images : JSON.stringify(images), id
    ).run();

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
    const { results } = await c.env.DB.prepare("SELECT * FROM create_yours ORDER BY id DESC").all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/create-yours', async (c) => {
  try {
    if (!(await verifyAdmin(c))) return c.json({ error: 'Unauthorized' }, 401);
    
    await c.env.DB.prepare(`CREATE TABLE IF NOT EXISTS create_yours (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, image TEXT, description TEXT)`).run();
    const body = await c.req.json();
    const { name, image, description } = body;
    
    const info = await c.env.DB.prepare("INSERT INTO create_yours (name, image, description) VALUES (?, ?, ?)").bind(name, image || '', description || '').run();
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
    const { name, image, description } = body;

    const result = await c.env.DB.prepare("UPDATE create_yours SET name = ?, image = ?, description = ? WHERE id = ?").bind(name, image || '', description || '', id).run();
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
    const { customer_name, customer_phone, customer_address, order_items, total_price } = data;

    if (!customer_name || !customer_phone || !customer_address || !order_items) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const info = await c.env.DB.prepare(
      `INSERT INTO orders (customer_name, customer_phone, customer_address, order_items, total_price, status) 
       VALUES (?, ?, ?, ?, ?, 'menunggu pembayaran')`
    ).bind(
      customer_name,
      customer_phone,
      customer_address,
      typeof order_items === 'string' ? order_items : JSON.stringify(order_items),
      total_price || ''
    ).run();

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

export default app;
