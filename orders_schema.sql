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
