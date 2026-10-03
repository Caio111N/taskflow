// Configura o servidor e o build do Vite com suporte ao React e Fast Refresh.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
