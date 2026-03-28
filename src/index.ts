/**
 * pares-editor — Lightweight VS Code-inspired code editor plugin for pares-radix.
 *
 * @module pares-editor
 */

// ── Editor Components ───────────────────────────────────────────────────────
export { default as EditorLayout } from './editor/EditorLayout.svelte';
export { default as MonacoEditor } from './editor/MonacoEditor.svelte';
export { default as FileExplorer } from './editor/FileExplorer.svelte';
export { default as CommandPalette } from './editor/CommandPalette.svelte';

// ── Commands ────────────────────────────────────────────────────────────────
export { commandRegistry, type CommandEntry, type CommandHandler } from './commands/registry.js';
export { TEXT_COMMANDS } from './commands/text-commands.js';

// ── File Store ──────────────────────────────────────────────────────────────
export { fileStore, type FileNode } from './explorer/file-store.js';

// ── Keybindings ─────────────────────────────────────────────────────────────
export { DEFAULT_KEYMAP, parseKeybinding, type Keybinding } from './keybindings/keymap.js';
