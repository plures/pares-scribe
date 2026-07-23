/**
 * Tracks the currently focused Monaco editor instance so that
 * global commands (text transforms, find/replace, etc.) can act on it.
 */
import type * as Monaco from 'monaco-editor';

let active: Monaco.editor.IStandaloneCodeEditor | undefined;

export function setActiveEditor(editor: Monaco.editor.IStandaloneCodeEditor | undefined): void {
	active = editor;
}

export function getActiveEditor(): Monaco.editor.IStandaloneCodeEditor | undefined {
	return active;
}

/** Replace the full text of the active editor's model, if any. */
export function transformActiveEditor(fn: (text: string) => string): void {
	const editor = getActiveEditor();
	if (!editor) return;
	const model = editor.getModel();
	if (!model) return;
	const selection = editor.getSelection();
	const hasSelection = selection && !selection.isEmpty();
	if (hasSelection && selection) {
		const text = model.getValueInRange(selection);
		editor.executeEdits('text-command', [{ range: selection, text: fn(text) }]);
	} else {
		editor.setValue(fn(model.getValue()));
	}
}
