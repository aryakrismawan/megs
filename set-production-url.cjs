const fs = require('fs');
const path = require('path');

const OLD_URL = 'http://localhost:8787';
const NEW_URL = 'https://worker-megs.krisarya8.workers.dev';

function replaceInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.split(OLD_URL).join(NEW_URL);
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
}

replaceInFile(path.join('Web-megs', 'src', 'App.tsx'));
replaceInFile(path.join('Web-megs', 'src', 'ShopContext.tsx'));
replaceInFile(path.join('Web-megs', 'src', 'components', 'CartSidebar.tsx'));
replaceInFile(path.join('Admin-megs', 'src', 'App.tsx'));
