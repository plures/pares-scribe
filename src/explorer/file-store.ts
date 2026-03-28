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
export function buildFileTree(paths: string[]): FileTreeNode[] {
	const root: FileTreeNode = { name: '', path: '', type: 'directory', children: [] };

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
					dir = { name, path, type: 'directory', children: [], expanded: false };
					current.children!.push(dir);
				}
				current = dir;
			}
		}
	}

	return root.children ?? [];
}
