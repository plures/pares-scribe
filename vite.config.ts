import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		mainFields: ['module', 'main'],
		conditions: ['browser'],
	},
	build: {
		lib: {
			entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
			name: 'pares-scribe',
			fileName: 'pares-scribe',
		},
		rollupOptions: {
			external: ['svelte', 'monaco-editor'],
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		testTimeout: 25000,
		include: ['tests/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
		deps: {
			optimizer: {
				web: { include: ['monaco-editor'] },
			},
		},
	},
	css: { devSourcemap: false },
	// monaco-editor ships a marked.umd.js.map reference for a file it doesn't
	// actually publish; vite's dev sourcemap resolution logs (and, under
	// vitest, exits non-zero on) the resulting ENOENT even though every test
	// passes. Disabling sourcemap generation for the optimized deps here is
	// the documented fix (the map is dev-tooling-only, not a runtime path).
	optimizeDeps: { esbuildOptions: { sourcemap: false } },
});
