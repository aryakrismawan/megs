const fs = require('fs');
const path = require('path');

const filesWithEnv = [
  path.join('Web-megs', 'src', 'App.tsx'),
  path.join('Web-megs', 'src', 'ShopContext.tsx'),
  path.join('Admin-megs', 'src', 'App.tsx'),
  path.join('Admin-megs', 'src', 'ShopContext.tsx'),
];

filesWithEnv.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ganti import.meta.env dengan (import.meta as any).env untuk menghindari error TypeScript
    content = content.replace(/import\.meta\.env/g, '(import.meta as any).env');
    fs.writeFileSync(file, content);
    console.log(`Berhasil memperbaiki (import.meta as any) di ${file}`);
  }
});

const webShopContextPath = path.join('Web-megs', 'src', 'ShopContext.tsx');
if (fs.existsSync(webShopContextPath)) {
  let content = fs.readFileSync(webShopContextPath, 'utf8');
  // Tambahkan description pada type Product
  if (!content.includes('description?: string;')) {
    content = content.replace(/category: string;/g, "category: string;\n  description?: string;");
    fs.writeFileSync(webShopContextPath, content);
    console.log('Berhasil menambahkan description ke Product type di Web-megs');
  }
}

const searchOverlayPath = path.join('Web-megs', 'src', 'components', 'SearchOverlay.tsx');
if (fs.existsSync(searchOverlayPath)) {
  let content = fs.readFileSync(searchOverlayPath, 'utf8');
  // Cast ke any saat mengakses description untuk menghindari error TS
  content = content.replace(/p\.description\?/g, "(p as any).description?");
  fs.writeFileSync(searchOverlayPath, content);
  console.log('Berhasil meng-cast description di SearchOverlay.tsx');
}
