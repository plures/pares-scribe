/**
 * Default keymap — VS Code-compatible keyboard shortcuts.
 */

export interface Keybinding {
	/** VS Code-style key combo (e.g. "ctrl+shift+p"). */
	key: string;
	/** Command ID to execute. */
	command: string;
	/** When condition (optional context). */
	when?: string;
}

export const DEFAULT_KEYMAP: Keybinding[] = [
	// ── File ────────────────────────────────────────────────────────────────
	{ key: 'ctrl+n', command: 'file.new' },
	{ key: 'ctrl+o', command: 'file.open' },
	{ key: 'ctrl+s', command: 'file.save' },
	{ key: 'ctrl+shift+s', command: 'file.saveAs' },
	{ key: 'ctrl+w', command: 'file.close' },

	// ── Edit ────────────────────────────────────────────────────────────────
	{ key: 'ctrl+z', command: 'edit.undo' },
	{ key: 'ctrl+shift+z', command: 'edit.redo' },
	{ key: 'ctrl+x', command: 'edit.cut' },
	{ key: 'ctrl+c', command: 'edit.copy' },
	{ key: 'ctrl+v', command: 'edit.paste' },
	{ key: 'ctrl+d', command: 'edit.addSelectionToNextFind' },
	{ key: 'ctrl+shift+k', command: 'edit.deleteLine' },
	{ key: 'alt+up', command: 'edit.moveLinesUp' },
	{ key: 'alt+down', command: 'edit.moveLinesDown' },
	{ key: 'alt+shift+up', command: 'edit.copyLinesUp' },
	{ key: 'alt+shift+down', command: 'edit.copyLinesDown' },
	{ key: 'ctrl+enter', command: 'edit.insertLineBelow' },
	{ key: 'ctrl+shift+enter', command: 'edit.insertLineAbove' },
	{ key: 'ctrl+/', command: 'edit.toggleComment' },
	{ key: 'ctrl+shift+a', command: 'edit.toggleBlockComment' },
	{ key: 'tab', command: 'edit.indent', when: 'editorHasSelection' },
	{ key: 'shift+tab', command: 'edit.outdent' },

	// ── Find ────────────────────────────────────────────────────────────────
	{ key: 'ctrl+f', command: 'find.open' },
	{ key: 'ctrl+h', command: 'find.replace' },
	{ key: 'ctrl+shift+f', command: 'find.inFiles' },
	{ key: 'f3', command: 'find.next' },
	{ key: 'shift+f3', command: 'find.previous' },

	// ── View ────────────────────────────────────────────────────────────────
	{ key: 'ctrl+shift+p', command: 'view.commandPalette' },
	{ key: 'ctrl+p', command: 'view.quickOpen' },
	{ key: 'ctrl+b', command: 'view.toggleSidebar' },
	{ key: 'ctrl+`', command: 'view.toggleTerminal' },
	{ key: 'ctrl+\\', command: 'view.splitEditor' },
	{ key: 'ctrl+shift+e', command: 'view.explorer' },
	{ key: 'ctrl+=', command: 'view.zoomIn' },
	{ key: 'ctrl+-', command: 'view.zoomOut' },
	{ key: 'ctrl+0', command: 'view.resetZoom' },

	// ── Go ──────────────────────────────────────────────────────────────────
	{ key: 'ctrl+g', command: 'go.toLine' },
	{ key: 'ctrl+shift+o', command: 'go.toSymbol' },
	{ key: 'ctrl+shift+m', command: 'go.toProblems' },
	{ key: 'f12', command: 'go.toDefinition' },
	{ key: 'alt+f12', command: 'go.peekDefinition' },

	// ── Selection ───────────────────────────────────────────────────────────
	{ key: 'ctrl+l', command: 'selection.expandLine' },
	{ key: 'ctrl+shift+l', command: 'selection.addCursorsToLineEnds' },
	{ key: 'ctrl+a', command: 'selection.selectAll' },

	// ── Text Manipulation ───────────────────────────────────────────────────
	{ key: 'ctrl+shift+u', command: 'text.toUpperCase' },
	{ key: 'ctrl+shift+l', command: 'text.toLowerCase' },
	{ key: 'ctrl+shift+j', command: 'text.joinLines' },
	{ key: 'ctrl+shift+d', command: 'text.sortLines' },
];

/**
 * Parse a VS Code-style key string into modifier flags + key.
 */
export function parseKeybinding(key: string): { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean; key: string } {
	const parts = key.toLowerCase().split('+');
	const mainKey = parts.pop() ?? '';
	return {
		ctrl: parts.includes('ctrl'),
		shift: parts.includes('shift'),
		alt: parts.includes('alt'),
		meta: parts.includes('meta') || parts.includes('cmd'),
		key: mainKey,
	};
}
