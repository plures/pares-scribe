/**
 * Editor commands — find/replace, go-to-line/symbol, and formatting.
 *
 * Each command delegates to a built-in Monaco action on the active editor.
 */

import { getActiveEditor } from '../editor/active-editor.js';
import type { CommandEntry } from './registry.js';

/** Run a Monaco editor action by its built-in action id. */
function runAction(actionId: string): void {
	const editor = getActiveEditor();
	if (!editor) return;
	editor.getAction(actionId)?.run();
}

/** Open the find widget. */
export function openFind(): void {
	runAction('actions.find');
}

/** Open the find-and-replace widget. */
export function openFindReplace(): void {
	runAction('editor.action.startFindReplaceAction');
}

/** Find next match. */
export function findNext(): void {
	runAction('editor.action.nextMatchFindAction');
}

/** Find previous match. */
export function findPrevious(): void {
	runAction('editor.action.previousMatchFindAction');
}

/** Open the "Go to Line" dialog. */
export function goToLine(): void {
	runAction('editor.action.gotoLine');
}

/** Open the "Go to Symbol" quick-outline. */
export function goToSymbol(): void {
	runAction('editor.action.quickOutline');
}

/** Format the entire document. */
export function formatDocument(): void {
	runAction('editor.action.formatDocument');
}

/** Pre-built command entries for registration in the command registry. */
export const EDITOR_COMMANDS: CommandEntry[] = [
	{ id: 'find.open', title: 'Find', category: 'Find', handler: openFind },
	{ id: 'find.replace', title: 'Find and Replace', category: 'Find', handler: openFindReplace },
	{ id: 'find.next', title: 'Find Next', category: 'Find', handler: findNext },
	{ id: 'find.previous', title: 'Find Previous', category: 'Find', handler: findPrevious },
	{ id: 'go.toLine', title: 'Go to Line…', category: 'Go', handler: goToLine },
	{ id: 'go.toSymbol', title: 'Go to Symbol…', category: 'Go', handler: goToSymbol },
	{ id: 'editor.formatDocument', title: 'Format Document', category: 'Editor', handler: formatDocument },
];
