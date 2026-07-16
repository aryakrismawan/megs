const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'Admin-megs', 'src', 'App.tsx'),
  path.join(__dirname, 'Web-megs', 'src', 'App.tsx')
];

let foundCount = 0;

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Kita cari string https://worker-megs.krisarya8.workers.dev
    const targetUrl = 'https://worker-megs.krisarya8.workers.dev';
    const envUrl = "${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}";
    
    if (content.includes(targetUrl)) {
      content = content.split(targetUrl).join(envUrl);
      fs.writeFileSync(file, content);
      console.log(`Berhasil mengganti URL hardcode di ${file}`);
      foundCount++;
    }
  }
});

if (foundCount === 0) {
  console.log('Tidak ada URL hardcode yang ditemukan. Mungkin sudah diperbaiki sebelumnya.');
}
