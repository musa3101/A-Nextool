import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@clientes': path.resolve(__dirname, '../clientes'),
      'lucide-react': path.resolve(__dirname, './node_modules/lucide-react'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      '@insforge/sdk': path.resolve(__dirname, './node_modules/@insforge/sdk'),
      'framer-motion': path.resolve(__dirname, './node_modules/framer-motion'),
    },
    dedupe: ['react', 'react-dom', 'lucide-react', 'framer-motion'],
  },
  server: {
    port: 5173,
    host: true,
  },
});

