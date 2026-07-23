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
