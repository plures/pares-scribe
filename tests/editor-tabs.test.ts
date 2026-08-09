import { describe, it, expect, beforeEach } from 'vitest';
import { editorTabs } from '../src/editor/editor-tabs.svelte.js';

describe('editorTabs', () => {
	beforeEach(() => {
		editorTabs.clear();
	});

	// ── Open / Activate ──────────────────────────────────────────────────

	it('opens a new tab and makes it active', () => {
		const id = editorTabs.open({ path: 'src/index.ts', content: 'hello' });
		expect(editorTabs.tabs).toHaveLength(1);
		expect(editorTabs.activeTabId).toBe(id);
		expect(editorTabs.activeTab?.path).toBe('src/index.ts');
		expect(editorTabs.activeTab?.content).toBe('hello');
		expect(editorTabs.activeTab?.dirty).toBe(false);
	});

	it('deduplicates by path and activates existing tab', () => {
		const id1 = editorTabs.open({ path: 'a.ts', content: 'v1' });
		editorTabs.open({ path: 'b.ts' });
		const id2 = editorTabs.open({ path: 'a.ts', content: 'v2' });
		expect(id2).toBe(id1);
		expect(editorTabs.tabs).toHaveLength(2);
		expect(editorTabs.activeTabId).toBe(id1);
	});

	it('derives name from last path segment when not provided', () => {
		editorTabs.open({ path: 'src/editor/Foo.svelte' });
		expect(editorTabs.activeTab?.name).toBe('Foo.svelte');
	});

	it('activate switches the active tab', () => {
		const id1 = editorTabs.open({ path: 'a.ts' });
		const id2 = editorTabs.open({ path: 'b.ts' });
		expect(editorTabs.activeTabId).toBe(id2);
		editorTabs.activate(id1);
		expect(editorTabs.activeTabId).toBe(id1);
	});

	it('activate is a no-op for unknown ids', () => {
		const id = editorTabs.open({ path: 'a.ts' });
		editorTabs.activate('nonexistent');
		expect(editorTabs.activeTabId).toBe(id);
	});

	// ── Content / Dirty ──────────────────────────────────────────────────

	it('updateContent marks tab dirty when content changes', () => {
		const id = editorTabs.open({ path: 'a.ts', content: 'original' });
		editorTabs.updateContent(id, 'modified');
		expect(editorTabs.activeTab?.dirty).toBe(true);
		expect(editorTabs.activeTab?.content).toBe('modified');
	});

	it('updateContent clears dirty when content reverts to original', () => {
		const id = editorTabs.open({ path: 'a.ts', content: 'original' });
		editorTabs.updateContent(id, 'changed');
		expect(editorTabs.activeTab?.dirty).toBe(true);
		editorTabs.updateContent(id, 'original');
		expect(editorTabs.activeTab?.dirty).toBe(false);
	});

	it('hasDirty returns true when any tab is dirty', () => {
		editorTabs.open({ path: 'a.ts', content: 'a' });
		const idB = editorTabs.open({ path: 'b.ts', content: 'b' });
		expect(editorTabs.hasDirty).toBe(false);
		editorTabs.updateContent(idB, 'modified');
		expect(editorTabs.hasDirty).toBe(true);
	});

	// ── Save ─────────────────────────────────────────────────────────────

	it('save clears dirty and updates originalContent', () => {
		const id = editorTabs.open({ path: 'a.ts', content: 'v1' });
		editorTabs.updateContent(id, 'v2');
		expect(editorTabs.activeTab?.dirty).toBe(true);
		editorTabs.save(id);
		expect(editorTabs.activeTab?.dirty).toBe(false);
		expect(editorTabs.activeTab?.originalContent).toBe('v2');
	});

	// ── Close ────────────────────────────────────────────────────────────

	it('close removes the tab and activates neighbour', () => {
		const id1 = editorTabs.open({ path: 'a.ts' });
		const id2 = editorTabs.open({ path: 'b.ts' });
		const id3 = editorTabs.open({ path: 'c.ts' });
		editorTabs.activate(id2);

		editorTabs.close(id2);
		expect(editorTabs.tabs).toHaveLength(2);
		expect(editorTabs.activeTabId).toBe(id3);
	});

	it('close the last tab sets activeTabId to null', () => {
		const id = editorTabs.open({ path: 'a.ts' });
		editorTabs.close(id);
		expect(editorTabs.tabs).toHaveLength(0);
		expect(editorTabs.activeTabId).toBeNull();
	});

	it('closeAll removes everything', () => {
		editorTabs.open({ path: 'a.ts' });
		editorTabs.open({ path: 'b.ts' });
		editorTabs.closeAll();
		expect(editorTabs.tabs).toHaveLength(0);
		expect(editorTabs.activeTabId).toBeNull();
	});

	it('closeOthers keeps only the specified tab', () => {
		editorTabs.open({ path: 'a.ts' });
		const keep = editorTabs.open({ path: 'b.ts' });
		editorTabs.open({ path: 'c.ts' });
		editorTabs.closeOthers(keep);
		expect(editorTabs.tabs).toHaveLength(1);
		expect(editorTabs.tabs[0].id).toBe(keep);
		expect(editorTabs.activeTabId).toBe(keep);
	});

	it('closeSaved removes only clean tabs', () => {
		const idA = editorTabs.open({ path: 'a.ts', content: 'a' });
		const idB = editorTabs.open({ path: 'b.ts', content: 'b' });
		editorTabs.open({ path: 'c.ts', content: 'c' });
		editorTabs.updateContent(idA, 'dirty-a');

		editorTabs.closeSaved();
		expect(editorTabs.tabs).toHaveLength(1);
		expect(editorTabs.tabs[0].id).toBe(idA);
		expect(editorTabs.activeTabId).toBe(idA);
	});

	// ── Queries ──────────────────────────────────────────────────────────

	it('getByPath finds an open tab', () => {
		editorTabs.open({ path: 'src/main.ts', content: 'code' });
		expect(editorTabs.getByPath('src/main.ts')?.content).toBe('code');
		expect(editorTabs.getByPath('nope')).toBeUndefined();
	});

	it('clear resets all state', () => {
		editorTabs.open({ path: 'a.ts' });
		editorTabs.clear();
		expect(editorTabs.tabs).toHaveLength(0);
		expect(editorTabs.activeTabId).toBeNull();
	});
});
