<!-- @component
  FileExplorer — Tree-view file browser for the editor sidebar.
  
  Shows directory structure with expand/collapse, file icons,
  and selection highlighting.
-->
<script lang="ts">
	import { fileStore, type FileNode } from '../explorer/file-store.js';

	interface Props {
		/** Called when a file is selected */
		onselect?: (node: FileNode) => void;
	}

	let { onselect }: Props = $props();

	let expandedDirs = $state<Set<string>>(new Set());

	function toggleDir(path: string): void {
		const next = new Set(expandedDirs);
		if (next.has(path)) {
			next.delete(path);
		} else {
			next.add(path);
		}
		expandedDirs = next;
	}

	function handleFileClick(node: FileNode): void {
		if (node.type === 'directory') {
			toggleDir(node.path);
		} else {
			fileStore.selectFile(node.path);
			onselect?.(node);
		}
	}

	function fileIcon(node: FileNode): string {
		if (node.type === 'directory') {
			return expandedDirs.has(node.path) ? '📂' : '📁';
		}
		const ext = node.name.split('.').pop()?.toLowerCase() ?? '';
		const icons: Record<string, string> = {
			ts: '🔷', tsx: '🔷', js: '🟡', jsx: '🟡',
			rs: '🦀', py: '🐍', go: '🔵',
			json: '📋', yaml: '📋', yml: '📋', toml: '📋',
			md: '📝', txt: '📄',
			svelte: '🔥', html: '🌐', css: '🎨', scss: '🎨',
			sh: '🐚', bash: '🐚',
			sql: '🗃️', xml: '📰', svg: '🖼️',
			lock: '🔒', gitignore: '👁️',
		};
		return icons[ext] ?? '📄';
	}

	function renderLevel(nodes: FileNode[], depth: number): FileNode[] {
		return nodes;
	}
</script>

<div class="file-explorer">
	<div class="explorer-header">
		<span class="header-label">EXPLORER</span>
	</div>

	<div class="tree" role="tree">
		{#snippet fileTree(nodes: FileNode[], depth: number)}
			{#each nodes as node}
				<div
					class="tree-item"
					class:selected={fileStore.selectedPath === node.path}
					class:directory={node.type === 'directory'}
					style="padding-left: {depth * 16 + 8}px"
					role={node.type === 'directory' ? 'treeitem' : 'treeitem'}
					tabindex="0"
					aria-expanded={node.type === 'directory' ? expandedDirs.has(node.path) : undefined}
					onclick={() => handleFileClick(node)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFileClick(node); } }}
				>
					<span class="icon">{fileIcon(node)}</span>
					<span class="name">{node.name}</span>
					{#if node.modified}
						<span class="modified-dot">●</span>
					{/if}
				</div>

				{#if node.type === 'directory' && expandedDirs.has(node.path) && node.children}
					{@render fileTree(node.children, depth + 1)}
				{/if}
			{/each}
		{/snippet}

		{@render fileTree(fileStore.tree, 0)}
	</div>
</div>

<style>
	.file-explorer {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-bg, #1a1b26);
		color: var(--color-text-secondary, #a9b1d6);
		font-size: 0.8125rem;
		user-select: none;
	}

	.explorer-header {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-secondary, #565f89);
		border-bottom: 1px solid var(--color-border, #3b4261);
	}

	.tree {
		flex: 1;
		overflow-y: auto;
		padding: 0.25rem 0;
	}

	.tree-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.1875rem 0.5rem;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tree-item:hover {
		background: var(--color-bg-hover, #292e42);
	}

	.tree-item.selected {
		background: var(--color-bg-active, #33467c);
		color: var(--color-text, #c0caf5);
	}

	.icon {
		flex-shrink: 0;
		font-size: 0.875rem;
		width: 1.125rem;
		text-align: center;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.modified-dot {
		color: var(--color-warning, #e0af68);
		font-size: 0.625rem;
		margin-left: auto;
	}
</style>
