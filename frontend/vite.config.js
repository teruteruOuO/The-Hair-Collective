import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig(({ mode }) => {
  // Load environment variables (from .env, .env.[mode], etc.)
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
		react(),
		...(mode === 'production' ? [removeConsole()] : [])
    ],

    resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
    },

    base: mode === 'production' ? env.VITE_BASE_URL || '/' : '/',

    server: {
		host: true,
		port: parseInt(env.VITE_FRONTEND_PORT || '5173'),
		cors: true
    },

    preview: {
		host: true,
		port: parseInt(env.VITE_PREVIEW_PORT || '4173')
		},

    build: {
		outDir: 'dist',
		sourcemap: mode === 'development',
		minify: 'esbuild',
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom']
				}
			}
		}
    }
  }
})