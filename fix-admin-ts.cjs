const fs = require('fs');
const path = require('path');

// 1. Fix vite.config.ts
const viteConfigPath = path.join('Admin-megs', 'vite.config.ts');
fs.writeFileSync(viteConfigPath, `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  }
})
`);

// 2. Fix Admin-megs/src/App.tsx
const appPath = path.join('Admin-megs', 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Hapus import yang tidak dipakai
appContent = appContent.replace(/import \{ ShopProvider, useShop \} from '\.\/ShopContext';\n/g, '');
appContent = appContent.replace(/import \{ CartSidebar \} from '\.\/components\/CartSidebar';\n/g, '');
appContent = appContent.replace(/import \{ SearchOverlay \} from '\.\/components\/SearchOverlay';\n/g, '');
// Hapus useRef, useCallback dari React import
appContent = appContent.replace(/import React, \{ useState, useRef, useEffect, useCallback \} from 'react';/, "import React, { useState, useEffect } from 'react';");

// Potong kode dari function Navbar() sampai sebelum function AdminLayout()
const navbarIndex = appContent.indexOf('function Navbar() {');
const adminLayoutIndex = appContent.indexOf('function AdminLayout() {');

if (navbarIndex !== -1 && adminLayoutIndex !== -1) {
  appContent = appContent.substring(0, navbarIndex) + appContent.substring(adminLayoutIndex);
}

fs.writeFileSync(appPath, appContent);
console.log("TS Admin Fixed!");
