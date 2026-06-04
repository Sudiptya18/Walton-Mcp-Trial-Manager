import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredHost = env.VITE_DEV_HOST || 'waltonmcp.localhost';
  const previewPort = Number(env.VITE_DEV_PORT || 4180);
  // Custom hostnames (e.g. waltonmcp.localhost) need a hosts-file entry; bind 127.0.0.1 for npm run dev.
  const bindHost =
    env.VITE_DEV_BIND ||
    (['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(configuredHost)
      ? configuredHost
      : '127.0.0.1');
  const apiPort = process.env.API_PORT || '5080';
  const apiTarget = env.VITE_API_URL || `http://127.0.0.1:${apiPort}`;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    preview: {
      host: bindHost,
      port: previewPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget.replace(/\/$/, '') || `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    server: {
      host: bindHost,
      port: previewPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget.replace(/\/$/, '') || `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  };
});
