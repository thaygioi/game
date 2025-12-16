
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Nâng target lên esnext để hỗ trợ Top-level await trong PDF.js
    target: 'esnext',
    rollupOptions: {
      // Đánh dấu các thư viện này là external để Vite không bundle chúng
      // Trình duyệt sẽ tự tải từ CDN dựa trên Import Map trong index.html
      external: [
        'pdfjs-dist/build/pdf', 
        'pdfjs-dist/build/pdf.worker'
      ]
    }
  },
  esbuild: {
    // Đảm bảo esbuild cũng hỗ trợ target cao nhất
    target: 'esnext' 
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
});
