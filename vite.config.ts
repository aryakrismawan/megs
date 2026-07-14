import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

const srcFront = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\f4ea8a04-1a0a-4e65-ab5a-3ec534084a46\\adidas_jersey_front_1783963398689.png';
const srcBack = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\f4ea8a04-1a0a-4e65-ab5a-3ec534084a46\\adidas_jersey_back_1783963406779.png';
const destFront = path.resolve(__dirname, 'public/adidas_front.png');
const destBack = path.resolve(__dirname, 'public/adidas_back.png');

try {
  if (fs.existsSync(srcFront)) fs.copyFileSync(srcFront, destFront);
  if (fs.existsSync(srcBack)) fs.copyFileSync(srcBack, destBack);
} catch (e) {
  console.error("Gagal menyalin template gambar:", e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      }
    }
  }
})
