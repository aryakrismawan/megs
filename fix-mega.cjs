const fs = require('fs');
const path = require('path');

// 1. Perbaiki ukuran font di index.css
const cssPath = path.join(__dirname, 'Web-megs', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/\.nav-megamenu-title\s*{[^}]*font-size:\s*0\.9rem;[^}]*}/, (match) => match.replace('0.9rem', '0.75rem'));
  css = css.replace(/\.nav-megamenu-subtitle\s*{[^}]*font-size:\s*0\.8rem;[^}]*}/, (match) => match.replace('0.8rem', '0.65rem'));
  fs.writeFileSync(cssPath, css);
}

// 2. Perbaiki pemanggilan gambar journal di App.tsx
const appPath = path.join(__dirname, 'Web-megs', 'src', 'App.tsx');
if (fs.existsSync(appPath)) {
  let app = fs.readFileSync(appPath, 'utf8');
  // Ganti article.img menjadi article.images di dalam Navbar
  const oldArticleImgBlock = `let displayImg = article.img;
              try {
                const parsed = JSON.parse(article.img);`;
  const newArticleImgBlock = `let displayImg = article.images;
              try {
                const parsed = JSON.parse(article.images);`;
  
  if (app.includes(oldArticleImgBlock)) {
    app = app.replace(oldArticleImgBlock, newArticleImgBlock);
    fs.writeFileSync(appPath, app);
    console.log('BERHASIL memperbaiki gambar journal dan memperkecil ukuran font!');
  } else {
    console.log('Gagal menemukan blok article.img di App.tsx');
  }
}
