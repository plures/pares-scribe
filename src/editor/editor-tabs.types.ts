/**
 * Type definitions for the editor tab system.
 *
 * @module editor-tabs.types
 */

/** Represents a single open editor tab. */
export interface EditorTab {
	/** Unique tab identifier. */
	id: string;
	/** File path within the workspace. */
	path: string;
	/** Display name (typically the filename). */
	name: string;
	/** Current in-memory content. */
	content: string;
	/** Language ID for syntax highlighting. */
	language: string;
	/** Whether the tab has unsaved changes. */
	dirty: boolean;
	/** The content at last save (used for dirty comparison). */
	originalContent: string;
}

/** Options for opening a new tab. */
export interface OpenTabOptions {
	/** File path (used as dedup key). */
	path: string;
	/** Display name; defaults to last segment of path. */
	name?: string;
	/** Initial content. */
	content?: string;
	/** Language ID; defaults to 'plaintext'. */
	language?: string;
}
