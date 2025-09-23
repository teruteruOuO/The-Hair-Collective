// import { fileURLToPath, URL } from 'node:url'
// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import removeConsole from 'vite-plugin-remove-console'

// export default defineConfig(({ mode }) => {
//   // Load environment variables (from .env, .env.[mode], etc.)
//   // eslint-disable-next-line no-undef
//   const env = loadEnv(mode, process.cwd(), '')

//   return {
//     plugins: [
// 		react(),
// 		...(mode === 'production' ? [removeConsole()] : [])
//     ],

//     resolve: {
// 		alias: {
// 			'@': fileURLToPath(new URL('./src', import.meta.url))
// 		}
//     },

//     base: mode === 'production' ? env.VITE_BASE_URL || '/' : '/',

//     server: {
// 		host: true,
// 		port: parseInt(env.VITE_FRONTEND_PORT || '5173'),
// 		cors: true
//     },

//     preview: {
// 		host: true,
// 		port: parseInt(env.VITE_PREVIEW_PORT || '4173')
// 		},

//     build: {
// 		outDir: 'dist',
// 		sourcemap: mode === 'development',
// 		minify: 'esbuild',
// 		rollupOptions: {
// 			output: {
// 				manualChunks: {
// 					react: ['react', 'react-dom']
// 				}
// 			}
// 		}
//     }
//   }
// })



import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig(({ mode }) => {
	// root = absolute path to frontend/
	const root = path.dirname(fileURLToPath(import.meta.url))
	const env = loadEnv(mode, root, '')

	// Resolve SSL cert + key from .env paths
	const certRel = env.VITE_SSL_CERT_PATH
	const keyRel  = env.VITE_SSL_KEY_PATH
	const certPath = path.resolve(root, certRel)
	const keyPath  = path.resolve(root, keyRel)

	const httpsOpts = {
		cert: fs.readFileSync(certPath),
		key: fs.readFileSync(keyPath)
	}

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
			https: httpsOpts,   // enable HTTPS in dev
			hmr: { host: 'thehaircollective.local' }, // match your hosts file entry
			cors: true
		},

		preview: {
			host: true,
			port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
			https: httpsOpts    // enable HTTPS in preview as well
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