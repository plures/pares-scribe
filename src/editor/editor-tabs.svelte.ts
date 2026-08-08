/**
 * Reactive tab store for the editor surface.
 *
 * Manages the full tab lifecycle: open, close, activate, dirty tracking,
 * save, and bulk operations (close all, close others, close saved).
 *
 * @module editor-tabs
 */

import type { EditorTab, OpenTabOptions } from './editor-tabs.types.js';

let _nextId = 0;

/** Generate a deterministic, unique tab id. */
function generateId(): string {
	return `tab-${++_nextId}`;
}

/**
 * Reactive editor-tab store backed by Svelte 5 runes.
 *
 * One instance is shared across the editor plugin via the exported
 * `editorTabs` singleton.
 */
class EditorTabStore {
	/** Ordered list of open tabs. */
	tabs = $state<EditorTab[]>([]);

	/** ID of the currently active (focused) tab, or `null`. */
	activeTabId = $state<string | null>(null);

	/** Derived: the currently active tab object, or `null`. */
	get activeTab(): EditorTab | null {
		return this.tabs.find((t) => t.id === this.activeTabId) ?? null;
	}

	// ── Open / Activate ──────────────────────────────────────────────────

	/**
	 * Open a file in a new tab, or activate it if already open.
	 * Returns the tab id.
	 */
	open(options: OpenTabOptions): string {
		const existing = this.tabs.find((t) => t.path === options.path);
		if (existing) {
			this.activeTabId = existing.id;
			return existing.id;
		}

		const content = options.content ?? '';
		const tab: EditorTab = {
			id: generateId(),
			path: options.path,
			name: options.name ?? options.path.split('/').pop() ?? options.path,
			content,
			language: options.language ?? 'plaintext',
			dirty: false,
			originalContent: content,
		};

		this.tabs = [...this.tabs, tab];
		this.activeTabId = tab.id;
		return tab.id;
	}

	/** Activate an existing tab by id. No-op if the id is not found. */
	activate(tabId: string): void {
		if (this.tabs.some((t) => t.id === tabId)) {
			this.activeTabId = tabId;
		}
	}

	// ── Content / Dirty ──────────────────────────────────────────────────

	/**
	 * Update the in-memory content of a tab.
	 * Automatically marks the tab dirty when content differs from the
	 * original (last-saved) snapshot.
	 */
	updateContent(tabId: string, content: string): void {
		this.tabs = this.tabs.map((t) =>
			t.id === tabId
				? { ...t, content, dirty: content !== t.originalContent }
				: t,
		);
	}

	/**
	 * Mark a tab as saved — clears the dirty flag and updates the
	 * original-content snapshot.
	 */
	save(tabId: string): void {
		this.tabs = this.tabs.map((t) =>
			t.id === tabId
				? { ...t, dirty: false, originalContent: t.content }
				: t,
		);
	}

	// ── Close ────────────────────────────────────────────────────────────

	/**
	 * Close a single tab by id.
	 * Activates the nearest sibling when closing the active tab.
	 */
	close(tabId: string): void {
		const index = this.tabs.findIndex((t) => t.id === tabId);
		if (index === -1) return;

		this.tabs = this.tabs.filter((t) => t.id !== tabId);

		if (this.activeTabId === tabId) {
			if (this.tabs.length === 0) {
				this.activeTabId = null;
			} else {
				this.activeTabId = this.tabs[Math.min(index, this.tabs.length - 1)].id;
			}
		}
	}

	/** Close all open tabs. */
	closeAll(): void {
		this.tabs = [];
		this.activeTabId = null;
	}

	/** Close every tab *except* the one with the given id. */
	closeOthers(tabId: string): void {
		this.tabs = this.tabs.filter((t) => t.id === tabId);
		if (!this.tabs.some((t) => t.id === this.activeTabId)) {
			this.activeTabId = this.tabs[0]?.id ?? null;
		}
	}

	/** Close all tabs that are **not** dirty. */
	closeSaved(): void {
		const wasActive = this.activeTabId;
		this.tabs = this.tabs.filter((t) => t.dirty);

		if (!this.tabs.some((t) => t.id === wasActive)) {
			this.activeTabId = this.tabs[0]?.id ?? null;
		}
	}

	// ── Queries ──────────────────────────────────────────────────────────

	/** Return the tab for a given file path, if open. */
	getByPath(path: string): EditorTab | undefined {
		return this.tabs.find((t) => t.path === path);
	}

	/** Whether any open tab has unsaved changes. */
	get hasDirty(): boolean {
		return this.tabs.some((t) => t.dirty);
	}

	// ── Housekeeping ─────────────────────────────────────────────────────

	/** Reset all state. Useful in tests. */
	clear(): void {
		this.tabs = [];
		this.activeTabId = null;
	}
}

/** Singleton tab store shared across the editor plugin. */
export const editorTabs = new EditorTabStore();
