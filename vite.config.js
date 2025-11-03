import { defineConfig } from 'vite';
import typegpuPlugin from 'unplugin-typegpu/vite';

export default defineConfig({
  plugins: [typegpuPlugin()],
  base: '/Jellyslider/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
