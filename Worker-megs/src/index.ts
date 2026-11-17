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
    } catch(e) {}
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
    try {
      await c.env.DB.prepare(`ALTER TABLE create_yours ADD COLUMN form_config TEXT`).run();
    } catch(e) {}
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

// --- ORDERS & REAL-TIME RESI TRACKING ---
async function ensureOrderColumns(db: D1Database) {
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN tracking_number TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN courier TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN tracking_logs TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN updated_at DATETIME`).run();
  } catch (e) {}
}

function normalizeCourierCode(courierInput: string, awb: string): { code: string; name: string } {
  const c = (courierInput || '').toLowerCase().trim();
  const resi = (awb || '').toUpperCase().trim();

  if (c.includes('j&t') || c === 'jnt') return { code: 'jnt', name: 'J&T Express' };
  if (c.includes('jne')) return { code: 'jne', name: 'JNE Express' };
  if (c.includes('sicepat')) return { code: 'sicepat', name: 'SiCepat Ekspres' };
  if (c.includes('spx') || c.includes('shopee')) return { code: 'spx', name: 'Shopee Express (SPX)' };
  if (c.includes('ide') || c.includes('id express') || c.includes('idexpress')) return { code: 'ide', name: 'ID Express' };
  if (c.includes('ninja')) return { code: 'ninja', name: 'Ninja Xpress' };
  if (c.includes('anteraja')) return { code: 'anteraja', name: 'AnterAja' };
  if (c.includes('pos')) return { code: 'pos', name: 'Pos Indonesia' };
  if (c.includes('lion')) return { code: 'lion', name: 'Lion Parcel' };
  if (c.includes('tiki')) return { code: 'tiki', name: 'TIKI' };
  if (c.includes('wahana')) return { code: 'wahana', name: 'Wahana' };
  if (c.includes('sap')) return { code: 'sap', name: 'SAP Express' };

  // Auto-detect from resi prefix
  if (resi.startsWith('SPXID') || resi.startsWith('ID2')) return { code: 'spx', name: 'Shopee Express (SPX)' };
  if (resi.startsWith('IDE') || resi.startsWith('IDS')) return { code: 'ide', name: 'ID Express' };
  if (resi.startsWith('JP') || resi.startsWith('JX') || resi.startsWith('JD') || resi.startsWith('JT')) return { code: 'jnt', name: 'J&T Express' };
  if (resi.startsWith('00') || resi.startsWith('TK')) return { code: 'sicepat', name: 'SiCepat Ekspres' };
  if (resi.startsWith('NV') || resi.startsWith('NL') || resi.startsWith('NVID')) return { code: 'ninja', name: 'Ninja Xpress' };
  if (resi.startsWith('1000') || resi.startsWith('1100')) return { code: 'anteraja', name: 'AnterAja' };
  if (resi.startsWith('P2') || resi.startsWith('POS')) return { code: 'pos', name: 'Pos Indonesia' };
  if (resi.startsWith('11') || resi.startsWith('99') || resi.startsWith('LP')) return { code: 'lion', name: 'Lion Parcel' };
  return { code: 'jne', name: 'JNE Express' };
}

app.get('/api/orders', async (c) => {
  try {
    await ensureOrderColumns(c.env.DB);
    const { results } = await c.env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    await ensureOrderColumns(c.env.DB);
    const data = await c.req.json();
    const { customer_name, customer_phone, customer_address, order_items, total_price, coupon_code, courier } = data;

    if (!customer_name || !customer_phone || !customer_address || !order_items) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const initialLogs = JSON.stringify([
      {
        date: new Date().toISOString(),
        desc: 'Pesanan berhasil dibuat oleh pelanggan di katalog MEGS Apparel (Menunggu konfirmasi pembayaran).',
        location: 'SISTEM MEGS APPAREL'
      }
    ]);

    const info = await c.env.DB.prepare(
      `INSERT INTO orders (customer_name, customer_phone, customer_address, order_items, total_price, status, courier, tracking_logs, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'menunggu pembayaran', ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      customer_name,
      customer_phone,
      customer_address,
      typeof order_items === 'string' ? order_items : JSON.stringify(order_items),
      total_price || '',
      courier || '',
      initialLogs
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
    await ensureOrderColumns(c.env.DB);
    
    const id = c.req.param('id');
    const data = await c.req.json();
    const { status, tracking_number, courier, tracking_logs, new_log_entry } = data;
    
    const existing: any = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ error: 'Order not found' }, 404);

    const nextStatus = status ?? existing.status;
    const nextTracking = tracking_number !== undefined ? tracking_number.trim().toUpperCase() : (existing.tracking_number || '');
    const nextCourier = courier !== undefined ? courier : (existing.courier || '');

    let logsArr: any[] = [];
    try {
      logsArr = existing.tracking_logs ? JSON.parse(existing.tracking_logs) : [];
      if (!Array.isArray(logsArr)) logsArr = [];
    } catch {
      logsArr = [];
    }

    if (tracking_logs !== undefined) {
      logsArr = typeof tracking_logs === 'string' ? JSON.parse(tracking_logs) : tracking_logs;
    } else {
      if (new_log_entry && new_log_entry.desc) {
        logsArr.unshift({
          date: new Date().toISOString(),
          desc: new_log_entry.desc,
          location: new_log_entry.location || 'CICURUG, KAB. SUKABUMI'
        });
      } else if (status && status !== existing.status) {
        if (status === 'diproses') {
          logsArr.unshift({
            date: new Date().toISOString(),
            desc: 'Pembayaran terverifikasi. Pesanan sedang dikemas di Gudang MEGS Cicurug, Kab. Sukabumi.',
            location: 'GUDANG MEGS — CICURUG, SUKABUMI'
          });
        } else if (status === 'dikirim') {
          logsArr.unshift({
            date: new Date().toISOString(),
            desc: `Paket telah diserahkan ke agen ekspedisi ${nextCourier || 'Kurir'}${nextTracking ? ` dengan Nomor Resi ${nextTracking}` : ''}.`,
            location: 'DROP POINT CICURUG, SUKABUMI'
          });
        } else if (status === 'selesai') {
          logsArr.unshift({
            date: new Date().toISOString(),
            desc: `Paket telah diterima oleh ${existing.customer_name} di alamat tujuan. Pesanan selesai.`,
            location: 'ALAMAT TUJUAN PENERIMA'
          });
        }
      }
    }

    const result = await c.env.DB.prepare(
      "UPDATE orders SET status = ?, tracking_number = ?, courier = ?, tracking_logs = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(nextStatus, nextTracking, nextCourier, JSON.stringify(logsArr), id).run();

    if (result.meta.changes === 0) return c.json({ error: 'Order not found' }, 404);
    return c.json({
      success: true,
      status: nextStatus,
      tracking_number: nextTracking,
      courier: nextCourier,
      tracking_logs: logsArr
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- REAL-TIME CEK RESI ENDPOINT (BERDU-STYLE WAYBILL TRACKING) ---
app.get('/api/track-resi', async (c) => {
  try {
    await ensureOrderColumns(c.env.DB);
    const awb = (c.req.query('awb') || '').trim().toUpperCase();
    const courierParam = (c.req.query('courier') || 'AUTO').trim();

    if (!awb) {
      return c.json({ success: false, error: 'Nomor resi tidak boleh kosong.' }, 400);
    }

    // 1. Cek apakah resi terdaftar pada tabel orders di database MEGS
    const matchedOrder: any = await c.env.DB.prepare(
      "SELECT * FROM orders WHERE UPPER(tracking_number) = ? LIMIT 1"
    ).bind(awb).first();

    const { code: courierCode, name: courierName } = normalizeCourierCode(
      courierParam !== 'AUTO' ? courierParam : (matchedOrder?.courier || ''),
      awb
    );

    // 2. Ambil konfigurasi API Key Binderbyte / Biteship dari tabel settings jika tersedia
    let binderbyteKey = '';
    let biteshipKey = '';
    try {
      const settingsRows = await c.env.DB.prepare(
        "SELECT key, value FROM settings WHERE key IN ('binderbyte_api_key', 'biteship_api_key')"
      ).all();
      for (const r of (settingsRows.results || []) as any[]) {
        if (r.key === 'binderbyte_api_key') binderbyteKey = (r.value || '').trim();
        if (r.key === 'biteship_api_key') biteshipKey = (r.value || '').trim();
      }
    } catch {}

    // 3A. Coba lacak Real-Time via API Publik Shopee Express (SPX) jika kurir = spx
    if (courierCode === 'spx' || awb.startsWith('SPXID')) {
      try {
        const spxRes = await fetch(
          `https://spx.co.id/api/v2/fleet_order/tracking/search?sls_tracking_number=${encodeURIComponent(awb)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (spxRes.ok) {
          const spxJson: any = await spxRes.json();
          const records = spxJson?.data?.tracking_list;
          if (Array.isArray(records) && records.length > 0) {
            const history = records.map((item: any) => ({
              date: new Date((item.timestamp || 0) * 1000).toISOString(),
              desc: item.message || item.description || '-',
              location: item.current_location?.location_name || ''
            }));
            const latestStatus = spxJson?.data?.current_status || 'ON PROCESS';
            return c.json({
              success: true,
              source: 'LIVE_COURIER_API',
              summary: {
                awb,
                courier: 'Shopee Express (SPX)',
                service: 'SPX Standard',
                status: latestStatus.toUpperCase(),
                date: history[0]?.date || '',
                shipper: matchedOrder ? 'MEGS APPAREL (Cicurug, Kab. Sukabumi)' : '-',
                receiver: matchedOrder?.customer_name || '-',
                origin: 'Cicurug, Kab. Sukabumi',
                destination: matchedOrder?.customer_address || '-'
              },
              history,
              order: matchedOrder || null
            });
          }
        }
      } catch {}
    }

    // 3B. Coba lacak Real-Time via API Publik Ninja Xpress jika kurir = ninja
    if (courierCode === 'ninja' || awb.startsWith('NV') || awb.startsWith('NL')) {
      try {
        const ninjaRes = await fetch(
          `https://api.ninjavan.co/id/dash/1.2/public/orders?tracking_id=${encodeURIComponent(awb)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (ninjaRes.ok) {
          const ninjaJson: any = await ninjaRes.json();
          const orderData = Array.isArray(ninjaJson) ? ninjaJson[0] : ninjaJson;
          if (orderData && Array.isArray(orderData.events) && orderData.events.length > 0) {
            const history = [...orderData.events].reverse().map((ev: any) => ({
              date: ev.time || new Date().toISOString(),
              desc: ev.description || ev.type || '-',
              location: ev.hub_name || ''
            }));
            return c.json({
              success: true,
              source: 'LIVE_COURIER_API',
              summary: {
                awb,
                courier: 'Ninja Xpress',
                service: orderData.service_type || 'Standard',
                status: (orderData.status || 'ON PROCESS').toUpperCase(),
                date: history[0]?.date || '',
                shipper: orderData.from_name || 'MEGS APPAREL (Cicurug, Kab. Sukabumi)',
                receiver: orderData.to_name || matchedOrder?.customer_name || '-',
                origin: orderData.from_city || 'Cicurug, Kab. Sukabumi',
                destination: orderData.to_city || matchedOrder?.customer_address || '-'
              },
              history,
              order: matchedOrder || null
            });
          }
        }
      } catch {}
    }

    // 3C. Lacak Real-Time via Binderbyte API (J&T, JNE, SiCepat, ID Express, AnterAja, Pos, Lion, TIKI, Wahana, dll.)
    if (binderbyteKey) {
      try {
        const bbUrl = `https://api.binderbyte.com/v1/track?api_key=${encodeURIComponent(binderbyteKey)}&courier=${encodeURIComponent(courierCode)}&awb=${encodeURIComponent(awb)}`;
        const bbRes = await fetch(bbUrl);
        const bbJson: any = await bbRes.json();

        if (bbJson && bbJson.status === 200 && bbJson.data) {
          const d = bbJson.data;
          const history = Array.isArray(d.history)
            ? d.history.map((h: any) => ({
                date: h.date || '',
                desc: h.desc || '',
                location: h.location || ''
              }))
            : [];

          // Jika resi ini milik order di MEGS, simpan juga riwayat terbarunya ke database
          if (matchedOrder && history.length > 0) {
            const isDelivered = String(d.summary?.status || '').toUpperCase().includes('DELIVERED');
            const updatedStatus = isDelivered ? 'selesai' : matchedOrder.status;
            await c.env.DB.prepare(
              "UPDATE orders SET tracking_logs = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            ).bind(JSON.stringify(history), updatedStatus, matchedOrder.id).run();
          }

          return c.json({
            success: true,
            source: 'LIVE_COURIER_API',
            summary: {
              awb: d.summary?.awb || awb,
              courier: d.summary?.courier || courierName,
              service: d.summary?.service || 'Reguler',
              status: (d.summary?.status || 'ON PROCESS').toUpperCase(),
              date: d.summary?.date || history[0]?.date || '',
              weight: d.summary?.weight || '',
              amount: d.summary?.amount || '',
              shipper: d.detail?.shipper || 'MEGS APPAREL (Cicurug, Kab. Sukabumi)',
              receiver: d.detail?.receiver || matchedOrder?.customer_name || '-',
              origin: d.detail?.origin || 'Cicurug, Kab. Sukabumi',
              destination: d.detail?.destination || matchedOrder?.customer_address || '-'
            },
            history,
            order: matchedOrder || null
          });
        }
      } catch {}
    }

    // 3D. Lacak Real-Time via Biteship API (jika biteship_api_key diisi)
    if (biteshipKey) {
      try {
        const bsRes = await fetch(
          `https://api.biteship.com/v1/trackings/${encodeURIComponent(awb)}/couriers/${encodeURIComponent(courierCode)}`,
          { headers: { Authorization: biteshipKey } }
        );
        const bsJson: any = await bsRes.json();
        if (bsJson && bsJson.success && Array.isArray(bsJson.history)) {
          const history = [...bsJson.history].reverse().map((h: any) => ({
            date: h.updated_at || '',
            desc: h.note || '',
            location: h.service_type || ''
          }));
          return c.json({
            success: true,
            source: 'LIVE_COURIER_API',
            summary: {
              awb: bsJson.waybill_id || awb,
              courier: courierName,
              service: bsJson.courier?.company || 'Reguler',
              status: (bsJson.status || 'ON PROCESS').toUpperCase(),
              date: history[0]?.date || '',
              shipper: bsJson.origin?.contact_name || 'MEGS APPAREL (Cicurug, Kab. Sukabumi)',
              receiver: bsJson.destination?.contact_name || matchedOrder?.customer_name || '-',
              origin: bsJson.origin?.address || 'Cicurug, Kab. Sukabumi',
              destination: bsJson.destination?.address || matchedOrder?.customer_address || '-'
            },
            history,
            order: matchedOrder || null
          });
        }
      } catch {}
    }

    // 4. Jika nomor resi terdaftar pada pesanan asli di database MEGS, kembalikan data & log riil dari database MEGS
    if (matchedOrder) {
      let realLogs: any[] = [];
      try {
        realLogs = matchedOrder.tracking_logs ? JSON.parse(matchedOrder.tracking_logs) : [];
        if (!Array.isArray(realLogs)) realLogs = [];
      } catch {
        realLogs = [];
      }

      if (realLogs.length === 0) {
        realLogs = [
          {
            date: matchedOrder.updated_at || matchedOrder.created_at,
            desc: `Nomor Resi ${awb} (${matchedOrder.courier || courierName}) telah terdaftar untuk Order #${matchedOrder.id}. Status saat ini: ${(matchedOrder.status || '').toUpperCase()}.`,
            location: 'GUDANG MEGS — CICURUG, SUKABUMI'
          },
          {
            date: matchedOrder.created_at,
            desc: `Pesanan #${matchedOrder.id} atas nama ${matchedOrder.customer_name} tercatat di sistem MEGS.`,
            location: 'SISTEM MEGS APPAREL'
          }
        ];
      }

      const statusMap: Record<string, string> = {
        'menunggu pembayaran': 'MENUNGGU PEMBAYARAN',
        'diproses': 'SEDANG DIKEMAS (MANIFESTED)',
        'dikirim': 'DALAM PENGIRIMAN (ON PROCESS)',
        'selesai': 'TERKIRIM (DELIVERED)'
      };

      return c.json({
        success: true,
        source: 'MEGS_DATABASE',
        needsCourierApiKey: !binderbyteKey && !biteshipKey,
        summary: {
          awb,
          courier: matchedOrder.courier || courierName,
          service: 'Reguler',
          status: statusMap[String(matchedOrder.status || '').toLowerCase()] || String(matchedOrder.status || 'ON PROCESS').toUpperCase(),
          date: matchedOrder.updated_at || matchedOrder.created_at,
          shipper: 'MEGS APPAREL (Cicurug, Kab. Sukabumi)',
          receiver: matchedOrder.customer_name || '-',
          origin: 'Cicurug, Kab. Sukabumi, Jawa Barat',
          destination: matchedOrder.customer_address || '-'
        },
        history: realLogs,
        order: matchedOrder
      });
    }

    // 5. Jika resi tidak ada di database MEGS dan API Key kurir eksternal belum diisi / tidak ditemukan
    return c.json({
      success: false,
      needsCourierApiKey: !binderbyteKey && !biteshipKey,
      courierDetected: courierName,
      awb,
      error: !binderbyteKey && !biteshipKey
        ? `Nomor resi ${awb} (${courierName}) belum terdaftar di pesanan internal MEGS, dan API Key Kurir Eksternal (Binderbyte) belum diaktifkan di Admin Panel.`
        : `Nomor resi ${awb} untuk ekspedisi ${courierName} tidak ditemukan atau belum tercatat di server ekspedisi.`
    }, 404);
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
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
