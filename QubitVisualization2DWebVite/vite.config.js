import { defineConfig } from 'vite'

export default defineConfig({
  base: '/yv/2DVisualization',
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // OR put specific hostname here
  },
});
