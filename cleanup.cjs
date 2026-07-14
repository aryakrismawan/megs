const fs = require('fs');
const path = require('path');

// 1. Update Web-megs App.tsx
const webAppPath = path.join('Web-megs', 'src', 'App.tsx');
let webAppCode = fs.readFileSync(webAppPath, 'utf8');
// Remove Admin Route
webAppCode = webAppCode.replace(/<Route path="\/admin\/\*" element={<AdminLayout \/>} \/>/g, '');
// Change API URLs
webAppCode = webAppCode.replace(/'\/api\//g, "'http://localhost:8787/api/");
webAppCode = webAppCode.replace(/`\/api\//g, "`http://localhost:8787/api/");
fs.writeFileSync(webAppPath, webAppCode);

// 2. Update Web-megs CartSidebar.tsx
const webCartPath = path.join('Web-megs', 'src', 'components', 'CartSidebar.tsx');
let webCartCode = fs.readFileSync(webCartPath, 'utf8');
webCartCode = webCartCode.replace(/'\/api\//g, "'http://localhost:8787/api/");
fs.writeFileSync(webCartPath, webCartCode);

// 3. Update Admin-megs App.tsx
const adminAppPath = path.join('Admin-megs', 'src', 'App.tsx');
let adminAppCode = fs.readFileSync(adminAppPath, 'utf8');

// The main App component in Admin-megs should just render AdminLayout
// We replace the entire App function
const appFuncRegex = /function App\(\) \{[\s\S]*?\}\s*function Navbar/m;
const newAppFunc = `function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

function Navbar`;
adminAppCode = adminAppCode.replace(appFuncRegex, newAppFunc);

// Update all Links in AdminLayout to not have /admin prefix
// For example: <Link to="/admin/products" => <Link to="/products"
adminAppCode = adminAppCode.replace(/to="\/admin\//g, 'to="/');
adminAppCode = adminAppCode.replace(/to="\/admin"/g, 'to="/"');

// Update navigate in AdminLayout
adminAppCode = adminAppCode.replace(/navigate\('\/admin\//g, "navigate('/");

// Change API URLs
adminAppCode = adminAppCode.replace(/'\/api\//g, "'http://localhost:8787/api/");
adminAppCode = adminAppCode.replace(/`\/api\//g, "`http://localhost:8787/api/");

fs.writeFileSync(adminAppPath, adminAppCode);

// Update package.json scripts to avoid port conflicts
const webPkgPath = path.join('Web-megs', 'package.json');
let webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf8'));
webPkg.name = "web-megs";
webPkg.scripts.dev = "vite --port 5173";
fs.writeFileSync(webPkgPath, JSON.stringify(webPkg, null, 2));

const adminPkgPath = path.join('Admin-megs', 'package.json');
let adminPkg = JSON.parse(fs.readFileSync(adminPkgPath, 'utf8'));
adminPkg.name = "admin-megs";
adminPkg.scripts.dev = "vite --port 5174";
fs.writeFileSync(adminPkgPath, JSON.stringify(adminPkg, null, 2));

console.log('Cleanup complete!');
