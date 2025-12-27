import { defineConfig } from 'vite'

export default defineConfig({
  base: '/yv/3DVisualization',
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
});
