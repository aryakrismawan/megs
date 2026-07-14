const fs = require('fs');
const path = require('path');

// Ganti port di .env.development
const filesToFix = [
  path.join('Web-megs', '.env.development'),
  path.join('Admin-megs', '.env.development'),
  path.join('Web-megs', 'src', 'App.tsx'),
  path.join('Web-megs', 'src', 'ShopContext.tsx'),
  path.join('Admin-megs', 'src', 'App.tsx'),
  path.join('Admin-megs', 'src', 'ShopContext.tsx'),
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ganti 8788 menjadi 8787
    content = content.replace(/8788/g, '8787');
    fs.writeFileSync(file, content);
    console.log(`Berhasil mengubah port di ${file}`);
  }
});
