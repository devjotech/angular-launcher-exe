import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // necessário para carregar via file:// no app empacotado
  server: { port: 5173, strictPort: true },
});
