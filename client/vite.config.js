import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/socket.io': {
        target: isProduction
          ? 'https://handup.onrender.com'
          : 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
