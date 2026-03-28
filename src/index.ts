/**
 * pares-editor — Plugin entry point for pares-modulus.
 *
 * This is the manifest that pares-radix reads when loading the plugin.
 * It declares pages, panels, commands, keybindings, and settings.
 */

import type { PluginManifest } from 'pares-radix';

export const manifest: PluginManifest = {
	id: 'pares-editor',
	name: 'Pares Editor',
	version: '0.1.0',
	description: 'Lightweight code editor with VS Code-inspired features',
	author: 'Plures',
	license: 'BSL-1.1',
	platforms: ['gui'], // Monaco requires DOM — no TUI support yet

	panels: [
		{
			id: 'file-explorer',
			location: 'sidebar',
			icon: '📁',
			label: 'Explorer',
		},
	],

	pages: [
		{
			id: 'editor',
			path: '/editor',
			label: 'Editor',
			icon: '✏️',
		},
		{
			id: 'diff',
			path: '/editor/diff',
			label: 'Diff',
			icon: '📊',
		},
	],

	settings: {
		'editor.fontSize': { type: 'number', default: 14, label: 'Font Size' },
		'editor.fontFamily': { type: 'string', default: 'Fira Code, monospace', label: 'Font Family' },
		'editor.tabSize': { type: 'number', default: 4, label: 'Tab Size' },
		'editor.insertSpaces': { type: 'boolean', default: true, label: 'Insert Spaces' },
		'editor.wordWrap': { type: 'string', default: 'off', label: 'Word Wrap', options: ['off', 'on', 'wordWrapColumn', 'bounded'] },
		'editor.minimap': { type: 'boolean', default: true, label: 'Show Minimap' },
		'editor.lineNumbers': { type: 'string', default: 'on', label: 'Line Numbers', options: ['on', 'off', 'relative'] },
		'editor.renderWhitespace': { type: 'string', default: 'selection', label: 'Render Whitespace', options: ['none', 'boundary', 'selection', 'trailing', 'all'] },
		'editor.bracketPairColorization': { type: 'boolean', default: true, label: 'Bracket Pair Colorization' },
		'editor.formatOnSave': { type: 'boolean', default: false, label: 'Format on Save' },
		'editor.autoSave': { type: 'string', default: 'off', label: 'Auto Save', options: ['off', 'afterDelay', 'onFocusChange'] },
		'editor.autoSaveDelay': { type: 'number', default: 1000, label: 'Auto Save Delay (ms)' },
	},
};

export default manifest;
