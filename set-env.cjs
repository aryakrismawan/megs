const fs = require('fs');
const path = require('path');

const API_PRODUCTION = 'https://worker-megs.krisarya8.workers.dev';
const API_LOCAL = 'http://127.0.0.1:8788';

const envProdContent = `VITE_API_URL=${API_PRODUCTION}\n`;
const envDevContent = `VITE_API_URL=${API_LOCAL}\n`;

// 1. Create .env files
fs.writeFileSync(path.join('Web-megs', '.env.development'), envDevContent);
fs.writeFileSync(path.join('Web-megs', '.env.production'), envProdContent);
fs.writeFileSync(path.join('Admin-megs', '.env.development'), envDevContent);
fs.writeFileSync(path.join('Admin-megs', '.env.production'), envProdContent);

console.log('Created .env files');

// 2. Modify source files
const filesToModify = [
  path.join('Web-megs', 'src', 'App.tsx'),
  path.join('Web-megs', 'src', 'ShopContext.tsx'),
  path.join('Admin-megs', 'src', 'App.tsx'),
  path.join('Admin-megs', 'src', 'ShopContext.tsx'),
];

filesToModify.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ganti 'https://worker-megs.krisarya8.workers.dev' menjadi (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8788')
    // We have to be careful about quotes. Let's just replace the string literal if it includes quotes, or replace just the URL.
    // The previous script replaced API_URL = 'http...' with API_URL = 'https...'
    // Now we want to replace API_URL = 'https://worker-megs.krisarya8.workers.dev'
    // with API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8788'
    
    // Replace URL inside quotes
    content = content.replace(/'https:\/\/worker-megs\.krisarya8\.workers\.dev'/g, "import.meta.env.VITE_API_URL");
    content = content.replace(/"https:\/\/worker-megs\.krisarya8\.workers\.dev"/g, "import.meta.env.VITE_API_URL");
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

console.log('DONE!');
