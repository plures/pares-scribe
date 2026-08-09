import { describe, it, expect, beforeEach } from 'vitest';
import { fileStore, buildFileTree, detectLanguage } from '../src/explorer/file-store.svelte.js';

describe('detectLanguage', () => {
	it('maps common extensions', () => {
		expect(detectLanguage('main.ts')).toBe('typescript');
		expect(detectLanguage('lib.rs')).toBe('rust');
		expect(detectLanguage('README.md')).toBe('markdown');
	});

	it('falls back to plaintext for unknown extensions', () => {
		expect(detectLanguage('mystery.xyz')).toBe('plaintext');
	});
});

describe('buildFileTree', () => {
	it('nests files under directories', () => {
		const tree = buildFileTree(['src/index.ts', 'src/editor/EditorLayout.svelte', 'README.md']);
		const names = tree.map((n) => n.name).sort();
		expect(names).toEqual(['README.md', 'src']);

		const src = tree.find((n) => n.name === 'src')!;
		expect(src.type).toBe('directory');
		expect(src.children?.map((c) => c.name).sort()).toEqual(['editor', 'index.ts']);
	});
});

describe('fileStore', () => {
	beforeEach(() => {
		fileStore.clear();
	});

	it('loads a flat path list into a tree and indexes file contents', () => {
		fileStore.load(['a.txt', 'dir/b.txt'], { 'a.txt': 'hello', 'dir/b.txt': 'world' });
		expect(fileStore.getFile('a.txt')?.content).toBe('hello');
		expect(fileStore.getFile('dir/b.txt')?.content).toBe('world');
	});

	it('selectFile updates selectedPath', () => {
		fileStore.load(['a.txt']);
		fileStore.selectFile('a.txt');
		expect(fileStore.selectedPath).toBe('a.txt');
	});

	it('setModified flags the given file node', () => {
		fileStore.load(['a.txt']);
		fileStore.setModified('a.txt', true);
		expect(fileStore.getFile('a.txt')?.modified).toBe(true);
	});

	it('clear resets tree, selection, and index', () => {
		fileStore.load(['a.txt']);
		fileStore.selectFile('a.txt');
		fileStore.clear();
		expect(fileStore.tree).toEqual([]);
		expect(fileStore.selectedPath).toBeNull();
		expect(fileStore.getFile('a.txt')).toBeUndefined();
	});
});

describe('fileStore file operations', () => {
	beforeEach(() => {
		fileStore.clear();
	});

	it('createFile adds a file to the tree and index', () => {
		fileStore.load(['existing.txt']);
		const created = fileStore.createFile('newfile.txt', 'content');
		expect(created).toBe(true);
		expect(fileStore.getFile('newfile.txt')?.content).toBe('content');
	});

	it('createFile returns false for duplicate path', () => {
		fileStore.load(['a.txt'], { 'a.txt': 'hello' });
		expect(fileStore.createFile('a.txt')).toBe(false);
	});

	it('createFile creates intermediate directories', () => {
		fileStore.load([]);
		fileStore.createFile('src/lib/util.ts', '');
		expect(fileStore.getFile('src/lib/util.ts')).toBeDefined();
		const src = fileStore.tree.find((n) => n.name === 'src');
		expect(src?.type).toBe('directory');
	});

	it('createDirectory adds a directory to the tree', () => {
		fileStore.load([]);
		const created = fileStore.createDirectory('components');
		expect(created).toBe(true);
		expect(fileStore.tree.some((n) => n.name === 'components' && n.type === 'directory')).toBe(true);
	});

	it('createDirectory is idempotent for an existing directory path', () => {
		fileStore.load(['src/index.ts']);
		expect(fileStore.createDirectory('src')).toBe(true);
	});

	it('deleteNode removes a file', () => {
		fileStore.load(['a.txt', 'b.txt']);
		const deleted = fileStore.deleteNode('a.txt');
		expect(deleted).toBe(true);
		expect(fileStore.getFile('a.txt')).toBeUndefined();
		expect(fileStore.getFile('b.txt')).toBeDefined();
	});

	it('deleteNode removes a directory and its children', () => {
		fileStore.load(['src/a.ts', 'src/b.ts', 'README.md']);
		fileStore.deleteNode('src');
		expect(fileStore.getFile('src/a.ts')).toBeUndefined();
		expect(fileStore.getFile('src/b.ts')).toBeUndefined();
		expect(fileStore.getFile('README.md')).toBeDefined();
	});

	it('deleteNode clears selectedPath when the selected file is deleted', () => {
		fileStore.load(['a.txt']);
		fileStore.selectFile('a.txt');
		fileStore.deleteNode('a.txt');
		expect(fileStore.selectedPath).toBeNull();
	});

	it('deleteNode returns false for non-existent path', () => {
		fileStore.load(['a.txt']);
		expect(fileStore.deleteNode('nope.txt')).toBe(false);
	});

	it('renameNode renames a file', () => {
		fileStore.load(['a.txt'], { 'a.txt': 'content' });
		const renamed = fileStore.renameNode('a.txt', 'b.txt');
		expect(renamed).toBe(true);
		expect(fileStore.getFile('a.txt')).toBeUndefined();
		expect(fileStore.getFile('b.txt')?.content).toBe('content');
	});

	it('renameNode updates selectedPath', () => {
		fileStore.load(['a.txt']);
		fileStore.selectFile('a.txt');
		fileStore.renameNode('a.txt', 'b.txt');
		expect(fileStore.selectedPath).toBe('b.txt');
	});

	it('renameNode returns false for non-existent path', () => {
		fileStore.load(['a.txt']);
		expect(fileStore.renameNode('nope.txt', 'x.txt')).toBe(false);
	});

	it('renameNode returns false when target already exists', () => {
		fileStore.load(['a.txt', 'b.txt']);
		expect(fileStore.renameNode('a.txt', 'b.txt')).toBe(false);
	});

	it('updateContent sets content and marks modified', () => {
		fileStore.load(['a.txt'], { 'a.txt': 'original' });
		fileStore.updateContent('a.txt', 'changed');
		expect(fileStore.getFile('a.txt')?.content).toBe('changed');
		expect(fileStore.getFile('a.txt')?.modified).toBe(true);
	});
});
