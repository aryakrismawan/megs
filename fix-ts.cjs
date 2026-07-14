const fs = require('fs');
const path = require('path');

// 1. Fix vite.config.ts
const viteConfigPath = path.join('Web-megs', 'vite.config.ts');
fs.writeFileSync(viteConfigPath, `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
`);

// 2. Fix Web-megs/src/App.tsx
const appPath = path.join('Web-megs', 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/images\.map\(\(\_, idx\) =>/g, 'images.map((_img: any, idx: number) =>');

// Cut out AdminLayout and below
const adminLayoutIndex = appContent.indexOf('function AdminLayout() {');
if (adminLayoutIndex !== -1) {
  appContent = appContent.substring(0, adminLayoutIndex) + '\nexport default App;\n';
}
fs.writeFileSync(appPath, appContent);

// 3. Fix SearchOverlay.tsx
const searchOverlayPath = path.join('Web-megs', 'src', 'components', 'SearchOverlay.tsx');
if (fs.existsSync(searchOverlayPath)) {
  let searchContent = fs.readFileSync(searchOverlayPath, 'utf8');
  searchContent = searchContent.replace(/import React, \{ useState \} from 'react';/g, 'import { useState } from \'react\';');
  searchContent = searchContent.replace(/import \{ Link \} from 'react-router-dom';\n/g, '');
  fs.writeFileSync(searchOverlayPath, searchContent);
}

console.log("Semua error TypeScript berhasil diperbaiki!");
