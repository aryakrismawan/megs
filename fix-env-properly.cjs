const fs = require('fs');
const path = require('path');

const filesToModify = [
  path.join('Web-megs', 'src', 'App.tsx'),
  path.join('Web-megs', 'src', 'ShopContext.tsx'),
  path.join('Admin-megs', 'src', 'App.tsx'),
  path.join('Admin-megs', 'src', 'ShopContext.tsx'),
];

filesToModify.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Ganti 'https://worker-megs.krisarya8.workers.dev/api/...'
    // menjadi \`\${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8788'}/api/...\`
    
    // Gunakan regex untuk menangkap URL di dalam tanda kutip tunggal
    content = content.replace(/'https:\/\/worker-megs\.krisarya8\.workers\.dev([^']+)'/g, 
      "`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8788'}$1`"
    );
    
    // Tangani tanda kutip ganda
    content = content.replace(/"https:\/\/worker-megs\.krisarya8\.workers\.dev([^"]+)"/g, 
      "`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8788'}$1`"
    );
    
    fs.writeFileSync(file, content);
    console.log(`Berhasil memperbaiki URL di ${file}`);
  }
});
