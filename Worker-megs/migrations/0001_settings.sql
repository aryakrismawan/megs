-- 0001_settings.sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_image', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop');
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_title', 'ENGINEERED FOR EXCELLENCE');
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_subtitle', 'PREMIUM ATHLETIC GEAR DESIGNED FOR MAXIMUM PERFORMANCE.');
