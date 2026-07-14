const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
const destDir = path.join(__dirname, 'Worker-megs', '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

if (fs.existsSync(srcDir)) {
  fs.readdirSync(srcDir).forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
  });
  console.log('Database berhasil direstore!');
} else {
  console.log('Database lama tidak ditemukan.');
}
