<!-- @component
  EditorLayout — Main editor layout composing sidebar, tab bar, editor, and command palette.
  
  VS Code-inspired layout with resizable sidebar, multi-tab editing,
  and keyboard-driven workflow.
-->
<script lang="ts">
	import MonacoEditor from './MonacoEditor.svelte';
	import FileExplorer from './FileExplorer.svelte';
	import CommandPalette from './CommandPalette.svelte';
	import { type FileNode } from '../explorer/file-store.svelte.js';
	import { commandRegistry } from '../commands/registry.js';
	import { TEXT_COMMANDS } from '../commands/text-commands.js';
	import { editorTabs } from './editor-tabs.svelte.js';

	let sidebarOpen = $state(true);
	let sidebarWidth = $state(240);
	let commandPaletteOpen = $state(false);

	// Register view commands
	commandRegistry.register({
		id: 'view.commandPalette',
		title: 'Command Palette',
		category: 'View',
		handler: () => { commandPaletteOpen = true; },
	});
	commandRegistry.register({
		id: 'view.toggleSidebar',
		title: 'Toggle Sidebar',
		category: 'View',
		handler: () => { sidebarOpen = !sidebarOpen; },
	});
	commandRegistry.register({
		id: 'file.close',
		title: 'Close Editor',
		category: 'File',
		handler: () => { if (editorTabs.activeTabId) editorTabs.close(editorTabs.activeTabId); },
	});
	commandRegistry.register({
		id: 'file.closeAll',
		title: 'Close All Editors',
		category: 'File',
		handler: () => { editorTabs.closeAll(); },
	});
	commandRegistry.register({
		id: 'file.closeOthers',
		title: 'Close Other Editors',
		category: 'File',
		handler: () => { if (editorTabs.activeTabId) editorTabs.closeOthers(editorTabs.activeTabId); },
	});
	commandRegistry.register({
		id: 'file.closeSaved',
		title: 'Close Saved Editors',
		category: 'File',
		handler: () => { editorTabs.closeSaved(); },
	});
	for (const cmd of TEXT_COMMANDS) {
		commandRegistry.register(cmd);
	}

	function openFile(node: FileNode): void {
		editorTabs.open({ path: node.path, name: node.name, content: node.content ?? '' });
	}

	function handleContentChange(value: string): void {
		if (editorTabs.activeTabId) {
			editorTabs.updateContent(editorTabs.activeTabId, value);
		}
	}

	function handleSave(value: string): void {
		if (editorTabs.activeTabId) {
			editorTabs.updateContent(editorTabs.activeTabId, value);
			editorTabs.save(editorTabs.activeTabId);
		}
		// TODO: Tauri command to write file
	}

	// Global keyboard handler
	function handleGlobalKeydown(e: KeyboardEvent): void {
		if (e.ctrlKey && e.shiftKey && e.key === 'P') {
			e.preventDefault();
			commandPaletteOpen = true;
		} else if (e.ctrlKey && e.key === 'b') {
			e.preventDefault();
			sidebarOpen = !sidebarOpen;
		} else if (e.ctrlKey && e.key === 'w') {
			e.preventDefault();
			if (editorTabs.activeTabId) editorTabs.close(editorTabs.activeTabId);
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="editor-layout">
	<!-- Sidebar -->
	{#if sidebarOpen}
		<div class="sidebar" style="width: {sidebarWidth}px">
			<FileExplorer onselect={openFile} />
		</div>
	{/if}

	<!-- Main area -->
	<div class="main-area">
		<!-- Tab bar -->
		{#if editorTabs.tabs.length > 0}
			<div class="tab-bar" role="tablist">
				{#each editorTabs.tabs as tab}
					<div
						class="tab"
						class:active={tab.id === editorTabs.activeTabId}
						role="tab"
						tabindex="0"
						aria-selected={tab.id === editorTabs.activeTabId}
						onclick={() => { editorTabs.activate(tab.id); }}
						onkeydown={(e) => { if (e.key === 'Enter') editorTabs.activate(tab.id); }}
					>
						<span class="tab-name">{tab.name}</span>
						{#if tab.dirty}
							<span class="tab-dirty" aria-label="Unsaved changes">●</span>
						{/if}
						<button
							class="tab-close"
							onclick={(e) => { e.stopPropagation(); editorTabs.close(tab.id); }}
							aria-label="Close {tab.name}"
						>×</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Editor content -->
		<div class="editor-content">
			{#if editorTabs.activeTab}
				<MonacoEditor
					value={editorTabs.activeTab.content}
					filePath={editorTabs.activeTab.path}
					onchange={handleContentChange}
					onsave={handleSave}
				/>
			{:else}
				<div class="welcome">
					<div class="welcome-inner">
						<h2>pares-editor</h2>
						<p>Open a file from the explorer or use the command palette.</p>
						<div class="shortcuts">
							<div class="shortcut-row">
								<kbd>Ctrl+Shift+P</kbd>
								<span>Command Palette</span>
							</div>
							<div class="shortcut-row">
								<kbd>Ctrl+P</kbd>
								<span>Quick Open File</span>
							</div>
							<div class="shortcut-row">
								<kbd>Ctrl+B</kbd>
								<span>Toggle Sidebar</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<CommandPalette bind:open={commandPaletteOpen} />

<style>
	.editor-layout {
		display: flex;
		height: 100%;
		background: var(--color-bg, #1a1b26);
		overflow: hidden;
	}

	.sidebar {
		flex-shrink: 0;
		border-right: 1px solid var(--color-border, #3b4261);
		overflow: hidden;
	}

	.main-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.tab-bar {
		display: flex;
		background: var(--color-bg-card, #1e2030);
		border-bottom: 1px solid var(--color-border, #3b4261);
		overflow-x: auto;
		flex-shrink: 0;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--color-text-secondary, #565f89);
		font-size: 0.8125rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.tab.active {
		color: var(--color-text, #c0caf5);
		border-bottom-color: var(--color-accent, #7aa2f7);
		background: var(--color-bg, #1a1b26);
	}

	.tab:hover {
		background: var(--color-bg-hover, #292e42);
	}

	.tab-dirty {
		color: var(--color-warning, #e0af68);
		font-size: 0.625rem;
	}

	.tab-close {
		background: none;
		border: none;
		color: transparent;
		font-size: 1rem;
		cursor: pointer;
		padding: 0 0.125rem;
		line-height: 1;
	}

	.tab:hover .tab-close {
		color: var(--color-text-secondary, #565f89);
	}

	.tab-close:hover {
		color: var(--color-error, #f85149) !important;
	}

	.editor-content {
		flex: 1;
		min-height: 0;
	}

	.welcome {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary, #565f89);
	}

	.welcome-inner {
		text-align: center;
	}

	.welcome h2 {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--color-text-secondary, #737aa2);
		margin-bottom: 0.5rem;
	}

	.welcome p {
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
	}

	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.8125rem;
	}

	.shortcut-row kbd {
		font-family: 'SF Mono', monospace;
		font-size: 0.75rem;
		background: var(--color-bg-card, #24283b);
		padding: 0.125rem 0.5rem;
		border-radius: 3px;
		border: 1px solid var(--color-border, #3b4261);
		min-width: 120px;
		text-align: center;
	}
</style>
