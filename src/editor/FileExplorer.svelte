<!-- @component
  FileExplorer — Tree-view file browser for the editor sidebar.
  
  Shows directory structure with expand/collapse, file icons,
  selection highlighting, and file operation context menus.
-->
<script lang="ts">
	import { fileStore, type FileNode } from '../explorer/file-store.svelte.js';

	interface Props {
		/** Called when a file is selected */
		onselect?: (node: FileNode) => void;
		/** Called when a file or directory is deleted */
		ondelete?: (path: string) => void;
	}

	let { onselect, ondelete }: Props = $props();

	let expandedDirs = $state<Set<string>>(new Set());

	/** Context menu state */
	let contextMenu = $state<{ x: number; y: number; node: FileNode | null } | null>(null);

	/** Inline rename state */
	let renamingPath = $state<string | null>(null);
	let renameValue = $state('');

	/** Inline new-file/new-folder creation */
	let creatingIn = $state<string | null>(null);
	let creatingType = $state<'file' | 'directory'>('file');
	let createName = $state('');

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

	function handleContextMenu(e: MouseEvent, node: FileNode): void {
		e.preventDefault();
		contextMenu = { x: e.clientX, y: e.clientY, node };
	}

	function closeContextMenu(): void {
		contextMenu = null;
	}

	function startRename(node: FileNode): void {
		renamingPath = node.path;
		renameValue = node.name;
		closeContextMenu();
	}

	function commitRename(): void {
		if (renamingPath && renameValue.trim()) {
			fileStore.renameNode(renamingPath, renameValue.trim());
		}
		renamingPath = null;
		renameValue = '';
	}

	function cancelRename(): void {
		renamingPath = null;
		renameValue = '';
	}

	function handleDelete(node: FileNode): void {
		closeContextMenu();
		const removed = fileStore.deleteNode(node.path);
		if (removed) {
			ondelete?.(node.path);
		}
	}

	function startCreate(parentPath: string, type: 'file' | 'directory'): void {
		closeContextMenu();
		creatingIn = parentPath;
		creatingType = type;
		createName = '';
		// Ensure parent is expanded
		if (parentPath) {
			const next = new Set(expandedDirs);
			next.add(parentPath);
			expandedDirs = next;
		}
	}

	function commitCreate(): void {
		if (creatingIn !== null && createName.trim()) {
			const newPath = creatingIn ? `${creatingIn}/${createName.trim()}` : createName.trim();
			if (creatingType === 'file') {
				fileStore.createFile(newPath);
			} else {
				fileStore.createDirectory(newPath);
			}
		}
		creatingIn = null;
		createName = '';
	}

	function cancelCreate(): void {
		creatingIn = null;
		createName = '';
	}

	/** Get the parent directory for a node, or '' for root. */
	function parentDir(node: FileNode): string {
		const idx = node.path.lastIndexOf('/');
		return idx === -1 ? '' : node.path.slice(0, idx);
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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="file-explorer" onclick={closeContextMenu} onkeydown={() => {}}>
	<div class="explorer-header">
		<span class="header-label">EXPLORER</span>
		<div class="header-actions">
			<button
				class="header-action"
				title="New File"
				aria-label="New File"
				onclick={(e) => { e.stopPropagation(); startCreate('', 'file'); }}
			>📄+</button>
			<button
				class="header-action"
				title="New Folder"
				aria-label="New Folder"
				onclick={(e) => { e.stopPropagation(); startCreate('', 'directory'); }}
			>📁+</button>
		</div>
	</div>

	<div class="tree" role="tree">
		{#snippet fileTree(nodes: FileNode[], depth: number)}
			{#each nodes as node}
				{#if renamingPath === node.path}
					<div class="tree-item rename-row" style="padding-left: {depth * 16 + 8}px">
						<span class="icon">{fileIcon(node)}</span>
						<!-- svelte-ignore a11y_autofocus -->
						<input
							class="inline-input"
							type="text"
							bind:value={renameValue}
							autofocus
							onblur={commitRename}
							onkeydown={(e) => {
								if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
								if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
							}}
						/>
					</div>
				{:else}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						class="tree-item"
						class:selected={fileStore.selectedPath === node.path}
						class:directory={node.type === 'directory'}
						style="padding-left: {depth * 16 + 8}px"
						role="treeitem"
						tabindex="0"
						aria-selected={fileStore.selectedPath === node.path}
						aria-expanded={node.type === 'directory' ? expandedDirs.has(node.path) : undefined}
						onclick={() => handleFileClick(node)}
						oncontextmenu={(e) => handleContextMenu(e, node)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFileClick(node); }
							if (e.key === 'F2') { e.preventDefault(); startRename(node); }
							if (e.key === 'Delete') { e.preventDefault(); handleDelete(node); }
						}}
					>
						<span class="icon">{fileIcon(node)}</span>
						<span class="name">{node.name}</span>
						{#if node.modified}
							<span class="modified-dot">●</span>
						{/if}
					</div>
				{/if}

				{#if node.type === 'directory' && expandedDirs.has(node.path)}
					{#if creatingIn === node.path}
						<div class="tree-item create-row" style="padding-left: {(depth + 1) * 16 + 8}px">
							<span class="icon">{creatingType === 'directory' ? '📁' : '📄'}</span>
							<!-- svelte-ignore a11y_autofocus -->
							<input
								class="inline-input"
								type="text"
								bind:value={createName}
								placeholder={creatingType === 'file' ? 'filename' : 'folder name'}
								autofocus
								onblur={commitCreate}
								onkeydown={(e) => {
									if (e.key === 'Enter') { e.preventDefault(); commitCreate(); }
									if (e.key === 'Escape') { e.preventDefault(); cancelCreate(); }
								}}
							/>
						</div>
					{/if}
					{#if node.children}
						{@render fileTree(node.children, depth + 1)}
					{/if}
				{/if}
			{/each}
		{/snippet}

		{#if creatingIn === ''}
			<div class="tree-item create-row" style="padding-left: 8px">
				<span class="icon">{creatingType === 'directory' ? '📁' : '📄'}</span>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="inline-input"
					type="text"
					bind:value={createName}
					placeholder={creatingType === 'file' ? 'filename' : 'folder name'}
					autofocus
					onblur={commitCreate}
					onkeydown={(e) => {
						if (e.key === 'Enter') { e.preventDefault(); commitCreate(); }
						if (e.key === 'Escape') { e.preventDefault(); cancelCreate(); }
					}}
				/>
			</div>
		{/if}

		{@render fileTree(fileStore.tree, 0)}
	</div>
</div>

<!-- Context menu -->
{#if contextMenu}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="context-overlay" onclick={closeContextMenu} onkeydown={() => {}}>
		<div
			class="context-menu"
			role="menu"
			style="left: {contextMenu.x}px; top: {contextMenu.y}px"
			onclick={(e) => e.stopPropagation()}
		>
			{#if contextMenu.node?.type === 'directory'}
				<button role="menuitem" onclick={() => startCreate(contextMenu!.node!.path, 'file')}>New File</button>
				<button role="menuitem" onclick={() => startCreate(contextMenu!.node!.path, 'directory')}>New Folder</button>
				<hr />
			{/if}
			<button role="menuitem" onclick={() => startRename(contextMenu!.node!)}>Rename</button>
			<button role="menuitem" class="danger" onclick={() => handleDelete(contextMenu!.node!)}>Delete</button>
		</div>
	</div>
{/if}

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
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-text-secondary, #565f89);
		border-bottom: 1px solid var(--color-border, #3b4261);
	}

	.header-actions {
		display: flex;
		gap: 0.25rem;
	}

	.header-action {
		background: none;
		border: none;
		color: var(--color-text-secondary, #565f89);
		cursor: pointer;
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		border-radius: 3px;
	}

	.header-action:hover {
		background: var(--color-bg-hover, #292e42);
		color: var(--color-text, #c0caf5);
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

	.inline-input {
		flex: 1;
		background: var(--color-bg-card, #1e2030);
		border: 1px solid var(--color-accent, #7aa2f7);
		color: var(--color-text, #c0caf5);
		font-size: 0.8125rem;
		padding: 0.0625rem 0.25rem;
		outline: none;
		min-width: 0;
	}

	.context-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
	}

	.context-menu {
		position: fixed;
		background: var(--color-bg-card, #1e2030);
		border: 1px solid var(--color-border, #3b4261);
		border-radius: 4px;
		padding: 0.25rem 0;
		min-width: 140px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		z-index: 1001;
	}

	.context-menu button {
		display: block;
		width: 100%;
		background: none;
		border: none;
		color: var(--color-text-secondary, #a9b1d6);
		font-size: 0.8125rem;
		padding: 0.375rem 0.75rem;
		text-align: left;
		cursor: pointer;
	}

	.context-menu button:hover {
		background: var(--color-bg-hover, #292e42);
		color: var(--color-text, #c0caf5);
	}

	.context-menu button.danger:hover {
		color: var(--color-error, #f85149);
	}

	.context-menu hr {
		border: none;
		border-top: 1px solid var(--color-border, #3b4261);
		margin: 0.25rem 0;
	}
</style>
