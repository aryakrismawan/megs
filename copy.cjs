const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy to Web-megs
fs.mkdirSync('Web-megs', { recursive: true });
copyRecursiveSync('src', 'Web-megs/src');
copyRecursiveSync('public', 'Web-megs/public');
if(fs.existsSync('index.html')) fs.copyFileSync('index.html', 'Web-megs/index.html');
if(fs.existsSync('package.json')) fs.copyFileSync('package.json', 'Web-megs/package.json');
if(fs.existsSync('tsconfig.json')) fs.copyFileSync('tsconfig.json', 'Web-megs/tsconfig.json');
if(fs.existsSync('tsconfig.node.json')) fs.copyFileSync('tsconfig.node.json', 'Web-megs/tsconfig.node.json');
if(fs.existsSync('vite.config.ts')) fs.copyFileSync('vite.config.ts', 'Web-megs/vite.config.ts');

// Copy to Admin-megs
fs.mkdirSync('Admin-megs', { recursive: true });
copyRecursiveSync('src', 'Admin-megs/src');
copyRecursiveSync('public', 'Admin-megs/public');
if(fs.existsSync('index.html')) fs.copyFileSync('index.html', 'Admin-megs/index.html');
if(fs.existsSync('package.json')) fs.copyFileSync('package.json', 'Admin-megs/package.json');
if(fs.existsSync('tsconfig.json')) fs.copyFileSync('tsconfig.json', 'Admin-megs/tsconfig.json');
if(fs.existsSync('tsconfig.node.json')) fs.copyFileSync('tsconfig.node.json', 'Admin-megs/tsconfig.node.json');
if(fs.existsSync('vite.config.ts')) fs.copyFileSync('vite.config.ts', 'Admin-megs/vite.config.ts');

console.log('Copy complete!');
