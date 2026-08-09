/**
 * File system abstraction for the editor plugin.
 * Files are stored in partition-scoped storage via pares-radix platform APIs.
 */

export interface EditorFile {
	/** Unique file path within the partition. */
	path: string;
	/** File name (last segment of path). */
	name: string;
	/** File content (loaded on demand). */
	content: string;
	/** Language ID for syntax highlighting. */
	languageId: string;
	/** Whether the file has unsaved changes. */
	dirty: boolean;
	/** Last saved timestamp. */
	savedAt: number;
	/** Last modified timestamp (in-memory). */
	modifiedAt: number;
}

/** A node in the file explorer tree — either a file or a directory. */
export interface FileNode {
	name: string;
	path: string;
	type: 'file' | 'directory';
	/** File content, loaded on demand (files only). */
	content?: string;
	/** Whether this file has unsaved changes (files only). */
	modified?: boolean;
	children?: FileNode[];
}

export interface FileTreeNode {
	name: string;
	path: string;
	type: 'file' | 'directory';
	children?: FileTreeNode[];
	expanded?: boolean;
}

/**
 * Detect language from file extension.
 */
export function detectLanguage(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? '';
	const LANGUAGE_MAP: Record<string, string> = {
		ts: 'typescript',
		tsx: 'typescriptreact',
		js: 'javascript',
		jsx: 'javascriptreact',
		svelte: 'svelte',
		rs: 'rust',
		py: 'python',
		rb: 'ruby',
		go: 'go',
		java: 'java',
		kt: 'kotlin',
		swift: 'swift',
		c: 'c',
		cpp: 'cpp',
		h: 'c',
		hpp: 'cpp',
		cs: 'csharp',
		css: 'css',
		scss: 'scss',
		less: 'less',
		html: 'html',
		vue: 'vue',
		json: 'json',
		jsonc: 'jsonc',
		yaml: 'yaml',
		yml: 'yaml',
		toml: 'toml',
		xml: 'xml',
		md: 'markdown',
		mdx: 'mdx',
		sql: 'sql',
		sh: 'shellscript',
		bash: 'shellscript',
		zsh: 'shellscript',
		fish: 'shellscript',
		ps1: 'powershell',
		dockerfile: 'dockerfile',
		docker: 'dockerfile',
		nix: 'nix',
		lua: 'lua',
		zig: 'zig',
		tf: 'terraform',
		hcl: 'hcl',
		bicep: 'bicep',
		graphql: 'graphql',
		gql: 'graphql',
		proto: 'protobuf',
		ini: 'ini',
		conf: 'ini',
		env: 'dotenv',
		gitignore: 'ignore',
		makefile: 'makefile',
	};
	return LANGUAGE_MAP[ext] ?? 'plaintext';
}

/**
 * Build a file tree from a flat list of paths.
 */
export function buildFileTree(paths: string[]): FileNode[] {
	const root: FileNode = { name: '', path: '', type: 'directory', children: [] };

	for (const p of paths.sort()) {
		const parts = p.split('/');
		let current = root;

		for (let i = 0; i < parts.length; i++) {
			const name = parts[i];
			const path = parts.slice(0, i + 1).join('/');
			const isFile = i === parts.length - 1;

			if (isFile) {
				current.children!.push({ name, path, type: 'file' });
			} else {
				let dir = current.children!.find((c) => c.name === name && c.type === 'directory');
				if (!dir) {
					dir = { name, path, type: 'directory', children: [], expanded: false } as FileNode;
					current.children!.push(dir);
				}
				current = dir;
			}
		}
	}

	return root.children ?? [];
}

/**
 * Reactive file-tree store used by the FileExplorer/EditorLayout components.
 * Backed by an in-memory list of paths + contents; a future increment wires
 * this to pares-radix's partition-scoped storage APIs.
 */
class FileStore {
	tree = $state<FileNode[]>([]);
	selectedPath = $state<string | null>(null);

	#files = new Map<string, FileNode>();

	/** Replace the whole tree from a flat list of paths (and optional contents). */
	load(paths: string[], contents: Record<string, string> = {}): void {
		this.tree = buildFileTree(paths);
		this.#files.clear();
		this.#indexFiles(this.tree, contents);
	}

	#indexFiles(nodes: FileNode[], contents: Record<string, string>): void {
		for (const node of nodes) {
			if (node.type === 'file') {
				node.content = contents[node.path] ?? '';
				this.#files.set(node.path, node);
			} else if (node.children) {
				this.#indexFiles(node.children, contents);
			}
		}
	}

	selectFile(path: string): void {
		this.selectedPath = path;
	}

	getFile(path: string): FileNode | undefined {
		return this.#files.get(path);
	}

	setModified(path: string, modified: boolean): void {
		const node = this.#files.get(path);
		if (node) node.modified = modified;
	}

	/** Update file content in the store. */
	updateContent(path: string, content: string): void {
		const node = this.#files.get(path);
		if (node) {
			node.content = content;
			node.modified = true;
		}
	}

	/** Create a new file at the given path. Returns true if created. */
	createFile(path: string, content = ''): boolean {
		if (this.#files.has(path) || this.#findNode(this.tree, path)) return false;

		const parts = path.split('/');
		const name = parts[parts.length - 1];
		const newNode: FileNode = { name, path, type: 'file', content, modified: false };

		this.#insertNode(parts, newNode);
		this.#files.set(path, newNode);
		this.tree = [...this.tree]; // trigger reactivity
		return true;
	}

	/** Create a new directory at the given path. Returns true if created. */
	createDirectory(dirPath: string): boolean {
		// Check if directory already exists in the tree
		const existing = this.#findNode(this.tree, dirPath);
		if (existing) return false;

		const parts = dirPath.split('/');
		const name = parts[parts.length - 1];
		const newNode: FileNode = { name, path: dirPath, type: 'directory', children: [] };

		this.#insertNode(parts, newNode);
		this.tree = [...this.tree];
		return true;
	}

	/** Delete a node (file or directory) at the given path. Returns true if deleted. */
	deleteNode(path: string): boolean {
		const removed = this.#removeNode(this.tree, path);
		if (removed) {
			// Remove all indexed files under this path
			for (const key of [...this.#files.keys()]) {
				if (key === path || key.startsWith(path + '/')) {
					this.#files.delete(key);
				}
			}
			if (this.selectedPath === path || this.selectedPath?.startsWith(path + '/')) {
				this.selectedPath = null;
			}
			this.tree = [...this.tree];
		}
		return removed;
	}

	/** Rename a node. The newName parameter is the new filename segment (last path component). Returns true if renamed. */
	renameNode(oldPath: string, newName: string): boolean {
		const node = this.#findNode(this.tree, oldPath);
		if (!node) return false;

		const parts = oldPath.split('/');
		parts[parts.length - 1] = newName;
		const newPath = parts.join('/');

		// Check for conflict
		if (node.type === 'file' && this.#files.has(newPath)) return false;
		if (node.type === 'directory' && this.#findNode(this.tree, newPath)) return false;

		// Update node
		this.#updatePaths(node, oldPath, newPath);
		node.name = newName;
		node.path = newPath;

		// Re-index files
		for (const key of [...this.#files.keys()]) {
			if (key === oldPath || key.startsWith(oldPath + '/')) {
				const fileNode = this.#files.get(key)!;
				this.#files.delete(key);
				this.#files.set(fileNode.path, fileNode);
			}
		}

		if (this.selectedPath === oldPath) {
			this.selectedPath = newPath;
		} else if (this.selectedPath?.startsWith(oldPath + '/')) {
			this.selectedPath = newPath + this.selectedPath.slice(oldPath.length);
		}

		this.tree = [...this.tree];
		return true;
	}

	#findNode(nodes: FileNode[], path: string): FileNode | undefined {
		for (const node of nodes) {
			if (node.path === path) return node;
			if (node.children) {
				const found = this.#findNode(node.children, path);
				if (found) return found;
			}
		}
		return undefined;
	}

	#insertNode(parts: string[], newNode: FileNode): void {
		let siblings = this.tree;
		for (let i = 0; i < parts.length - 1; i++) {
			const dirPath = parts.slice(0, i + 1).join('/');
			let dir = siblings.find((c) => c.path === dirPath && c.type === 'directory');
			if (!dir) {
				dir = { name: parts[i], path: dirPath, type: 'directory', children: [] };
				siblings.push(dir);
			}
			if (!dir.children) dir.children = [];
			siblings = dir.children;
		}
		siblings.push(newNode);
	}

	#removeNode(nodes: FileNode[], path: string): boolean {
		const idx = nodes.findIndex((n) => n.path === path);
		if (idx !== -1) {
			nodes.splice(idx, 1);
			return true;
		}
		for (const node of nodes) {
			if (node.children && this.#removeNode(node.children, path)) {
				return true;
			}
		}
		return false;
	}

	#updatePaths(node: FileNode, oldPrefix: string, newPrefix: string): void {
		if (node.children) {
			for (const child of node.children) {
				const childOld = child.path;
				child.path = newPrefix + child.path.slice(oldPrefix.length);
				if (child.children) {
					this.#updatePaths(child, childOld, child.path);
				}
			}
		}
	}

	/** Remove all files/selection. Mainly useful for tests. */
	clear(): void {
		this.tree = [];
		this.selectedPath = null;
		this.#files.clear();
	}
}

/** Singleton file-tree store shared across the editor plugin. */
export const fileStore = new FileStore();
