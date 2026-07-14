-- 0000_schema.sql
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tops',
  img TEXT,
  description TEXT DEFAULT '',
  sizes TEXT DEFAULT '["S", "M", "L", "XL"]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  order_items TEXT NOT NULL,
  total_price TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu pembayaran',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
