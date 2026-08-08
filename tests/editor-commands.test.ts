import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	openFind,
	openFindReplace,
	findNext,
	findPrevious,
	goToLine,
	goToSymbol,
	formatDocument,
	EDITOR_COMMANDS,
} from '../src/commands/editor-commands.js';
import { setActiveEditor, getActiveEditor } from '../src/editor/active-editor.js';

describe('editor-commands', () => {
	beforeEach(() => {
		setActiveEditor(undefined);
	});

	it('EDITOR_COMMANDS has unique ids and correct categories', () => {
		expect(EDITOR_COMMANDS.length).toBeGreaterThanOrEqual(7);
		const ids = EDITOR_COMMANDS.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const cmd of EDITOR_COMMANDS) {
			expect(typeof cmd.handler).toBe('function');
			expect(cmd.category).toBeTruthy();
		}
	});

	it('commands are no-ops when no active editor', () => {
		// Should not throw when there is no active editor
		expect(() => openFind()).not.toThrow();
		expect(() => openFindReplace()).not.toThrow();
		expect(() => findNext()).not.toThrow();
		expect(() => findPrevious()).not.toThrow();
		expect(() => goToLine()).not.toThrow();
		expect(() => goToSymbol()).not.toThrow();
		expect(() => formatDocument()).not.toThrow();
	});

	it('delegates to Monaco actions when editor is available', () => {
		const mockRun = vi.fn();
		const mockGetAction = vi.fn().mockReturnValue({ run: mockRun });
		const mockEditor = { getAction: mockGetAction } as any;
		setActiveEditor(mockEditor);

		openFind();
		expect(mockGetAction).toHaveBeenCalledWith('actions.find');
		expect(mockRun).toHaveBeenCalled();

		mockGetAction.mockClear();
		mockRun.mockClear();

		openFindReplace();
		expect(mockGetAction).toHaveBeenCalledWith('editor.action.startFindReplaceAction');

		mockGetAction.mockClear();
		goToLine();
		expect(mockGetAction).toHaveBeenCalledWith('editor.action.gotoLine');

		mockGetAction.mockClear();
		goToSymbol();
		expect(mockGetAction).toHaveBeenCalledWith('editor.action.quickOutline');

		mockGetAction.mockClear();
		formatDocument();
		expect(mockGetAction).toHaveBeenCalledWith('editor.action.formatDocument');
	});

	it('handles missing actions gracefully', () => {
		const mockGetAction = vi.fn().mockReturnValue(null);
		const mockEditor = { getAction: mockGetAction } as any;
		setActiveEditor(mockEditor);

		// Should not throw when action is null
		expect(() => openFind()).not.toThrow();
		expect(() => goToLine()).not.toThrow();
		expect(() => formatDocument()).not.toThrow();
	});

	it('includes expected command ids', () => {
		const ids = EDITOR_COMMANDS.map((c) => c.id);
		expect(ids).toContain('find.open');
		expect(ids).toContain('find.replace');
		expect(ids).toContain('find.next');
		expect(ids).toContain('find.previous');
		expect(ids).toContain('go.toLine');
		expect(ids).toContain('go.toSymbol');
		expect(ids).toContain('editor.formatDocument');
	});
});
