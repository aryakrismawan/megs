const fs = require('fs');
const path = require('path');

// 1. Fix Admin-megs/src/App.tsx
const appPath = path.join('Admin-megs', 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Hapus useLocation
appContent = appContent.replace('useLocation, ', '');
// Hapus DesignElement
appContent = appContent.replace(/\/\/ --- TYPES ---\n.*?};\n\n/s, '');

fs.writeFileSync(appPath, appContent);

// 2. Fix Admin-megs/src/components/SearchOverlay.tsx
const searchOverlayPath = path.join('Admin-megs', 'src', 'components', 'SearchOverlay.tsx');
if (fs.existsSync(searchOverlayPath)) {
  let searchContent = fs.readFileSync(searchOverlayPath, 'utf8');
  searchContent = searchContent.replace(/import React, \{ useState \} from 'react';/g, "import { useState } from 'react';");
  searchContent = searchContent.replace(/import \{ Link \} from 'react-router-dom';\n/g, '');
  fs.writeFileSync(searchOverlayPath, searchContent);
}

console.log("Sisa error Admin dibersihkan!");
