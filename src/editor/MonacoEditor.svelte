<!-- @component
  MonacoEditor — Wrapper around Monaco Editor with pares-editor integration.
  
  Provides syntax highlighting, autocomplete, multi-tab editing,
  and VS Code-compatible keybindings.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type * as Monaco from 'monaco-editor';
	import { commandRegistry } from '../commands/registry.js';
	import { DEFAULT_KEYMAP, parseKeybinding } from '../keybindings/keymap.js';

	interface Props {
		/** File content to display */
		value?: string;
		/** Language ID (e.g. 'typescript', 'json', 'rust') */
		language?: string;
		/** File path for title/language detection */
		filePath?: string;
		/** Read-only mode */
		readOnly?: boolean;
		/** Theme: 'dark' (default) or 'light' */
		theme?: 'dark' | 'light';
		/** Minimap visible */
		minimap?: boolean;
		/** Font size in px */
		fontSize?: number;
		/** Tab size */
		tabSize?: number;
		/** Word wrap: 'off' | 'on' | 'wordWrapColumn' */
		wordWrap?: 'off' | 'on' | 'wordWrapColumn';
		/** Called when content changes */
		onchange?: (value: string) => void;
		/** Called when editor is ready */
		onready?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
		/** Called on save (Ctrl+S) */
		onsave?: (value: string) => void;
	}

	let {
		value = '',
		language = 'plaintext',
		filePath = '',
		readOnly = false,
		theme = 'dark',
		minimap = false,
		fontSize = 14,
		tabSize = 2,
		wordWrap = 'off',
		onchange,
		onready,
		onsave,
	}: Props = $props();

	let containerEl: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
	let monaco: typeof Monaco | undefined;

	// Language detection from file extension
	const EXT_LANG_MAP: Record<string, string> = {
		'.ts': 'typescript', '.tsx': 'typescriptreact',
		'.js': 'javascript', '.jsx': 'javascriptreact',
		'.json': 'json', '.jsonc': 'json',
		'.rs': 'rust', '.toml': 'toml',
		'.py': 'python',
		'.svelte': 'html', // Monaco doesn't have native Svelte
		'.html': 'html', '.htm': 'html',
		'.css': 'css', '.scss': 'scss',
		'.md': 'markdown', '.mdx': 'markdown',
		'.yaml': 'yaml', '.yml': 'yaml',
		'.sh': 'shell', '.bash': 'shell',
		'.sql': 'sql',
		'.xml': 'xml', '.svg': 'xml',
		'.go': 'go', '.c': 'c', '.cpp': 'cpp', '.h': 'cpp',
		'.java': 'java', '.kt': 'kotlin',
		'.dockerfile': 'dockerfile',
	};

	function detectLanguage(path: string): string {
		if (language !== 'plaintext') return language;
		const ext = '.' + path.split('.').pop()?.toLowerCase();
		const basename = path.split('/').pop()?.toLowerCase() ?? '';
		if (basename === 'dockerfile') return 'dockerfile';
		if (basename === 'makefile') return 'makefile';
		return EXT_LANG_MAP[ext] ?? 'plaintext';
	}

	onMount(async () => {
		try {
			monaco = await import('monaco-editor');

			// Configure dark theme
			monaco.editor.defineTheme('pares-dark', {
				base: 'vs-dark',
				inherit: true,
				rules: [],
				colors: {
					'editor.background': '#1a1b26',
					'editor.foreground': '#c0caf5',
					'editor.lineHighlightBackground': '#292e42',
					'editor.selectionBackground': '#33467c',
					'editorCursor.foreground': '#c0caf5',
					'editorLineNumber.foreground': '#3b4261',
					'editorLineNumber.activeForeground': '#737aa2',
				},
			});

			editor = monaco.editor.create(containerEl, {
				value,
				language: detectLanguage(filePath),
				theme: theme === 'dark' ? 'pares-dark' : 'vs',
				readOnly,
				minimap: { enabled: minimap },
				fontSize,
				tabSize,
				wordWrap,
				automaticLayout: true,
				scrollBeyondLastLine: false,
				renderLineHighlight: 'line',
				smoothScrolling: true,
				cursorBlinking: 'smooth',
				cursorSmoothCaretAnimation: 'on',
				bracketPairColorization: { enabled: true },
				guides: { bracketPairs: true, indentation: true },
				padding: { top: 8 },
			});

			// Wire up change events
			editor.onDidChangeModelContent(() => {
				const val = editor?.getValue() ?? '';
				onchange?.(val);
			});

			// Wire up Ctrl+S → save
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				const val = editor?.getValue() ?? '';
				onsave?.(val);
			});

			// Register command palette shortcut
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
				editor?.getAction('editor.action.quickCommand')?.run();
			});

			onready?.(editor);
		} catch (err) {
			console.error('Failed to load Monaco Editor:', err);
		}
	});

	onDestroy(() => {
		editor?.dispose();
	});

	// React to external value changes
	$effect(() => {
		if (editor && value !== editor.getValue()) {
			editor.setValue(value);
		}
	});

	// React to language changes
	$effect(() => {
		if (editor && monaco) {
			const model = editor.getModel();
			if (model) {
				const lang = detectLanguage(filePath);
				monaco.editor.setModelLanguage(model, lang);
			}
		}
	});

	/** Expose editor instance for parent components */
	export function getEditor(): Monaco.editor.IStandaloneCodeEditor | undefined {
		return editor;
	}
</script>

<div class="monaco-container" bind:this={containerEl}></div>

<style>
	.monaco-container {
		width: 100%;
		height: 100%;
		min-height: 200px;
	}
</style>
