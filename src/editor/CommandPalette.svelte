<!-- @component
  CommandPalette — VS Code-style command palette (Ctrl+Shift+P).
  
  Fuzzy-search across all registered commands and execute them.
-->
<script lang="ts">
	import { commandRegistry, type CommandEntry } from '../commands/registry.js';
	import { DEFAULT_KEYMAP } from '../keybindings/keymap.js';

	interface Props {
		/** Whether the palette is open */
		open?: boolean;
		/** Called when palette should close */
		onclose?: () => void;
	}

	let { open = $bindable(false), onclose }: Props = $props();

	let query = $state('');
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement;

	// Build keybinding lookup
	const keybindingMap = new Map<string, string>();
	for (const kb of DEFAULT_KEYMAP) {
		keybindingMap.set(kb.command, kb.key);
	}

	// Filter commands by query
	let filteredCommands = $derived.by(() => {
		const all = commandRegistry.list();
		if (!query.trim()) return all;
		const q = query.toLowerCase();
		return all
			.filter((cmd) => {
				const matchTitle = cmd.title.toLowerCase().includes(q);
				const matchId = cmd.id.toLowerCase().includes(q);
				const matchCategory = cmd.category?.toLowerCase().includes(q) ?? false;
				return matchTitle || matchId || matchCategory;
			})
			.sort((a, b) => {
				// Prefer title starts-with matches
				const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
				const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
				return aStarts - bStarts;
			});
	});

	function formatKeybinding(cmdId: string): string {
		const key = keybindingMap.get(cmdId);
		if (!key) return '';
		return key
			.split('+')
			.map((k) => k.charAt(0).toUpperCase() + k.slice(1))
			.join('+');
	}

	function handleSelect(cmd: CommandEntry): void {
		commandRegistry.execute(cmd.id);
		close();
	}

	function close(): void {
		open = false;
		query = '';
		selectedIndex = 0;
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const cmd = filteredCommands[selectedIndex];
			if (cmd) handleSelect(cmd);
		}
	}

	// Auto-focus input when opened
	$effect(() => {
		if (open && inputEl) {
			requestAnimationFrame(() => inputEl.focus());
		}
	});

	// Reset selection on query change
	$effect(() => {
		query; // dependency
		selectedIndex = 0;
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="palette-overlay" role="presentation" onclick={close}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="palette" role="listbox" onclick={(e) => e.stopPropagation()}>
			<div class="search-bar">
				<span class="search-icon">⌘</span>
				<input
					bind:this={inputEl}
					type="text"
					bind:value={query}
					placeholder="Type a command..."
					class="search-input"
					onkeydown={handleKeydown}
					aria-label="Command search"
				/>
			</div>

			<div class="results">
				{#each filteredCommands as cmd, i}
					<div
						class="result-item"
						class:selected={i === selectedIndex}
						role="option"
						aria-selected={i === selectedIndex}
						onclick={() => handleSelect(cmd)}
						onmouseenter={() => { selectedIndex = i; }}
					>
						<div class="result-left">
							{#if cmd.category}
								<span class="category">{cmd.category}:</span>
							{/if}
							<span class="title">{cmd.title}</span>
						</div>
						{#if formatKeybinding(cmd.id)}
							<kbd class="keybinding">{formatKeybinding(cmd.id)}</kbd>
						{/if}
					</div>
				{/each}

				{#if filteredCommands.length === 0}
					<div class="no-results">No matching commands</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		padding-top: 15vh;
		background: rgba(0, 0, 0, 0.3);
	}

	.palette {
		width: 560px;
		max-height: 400px;
		background: var(--color-bg-card, #24283b);
		border: 1px solid var(--color-border, #3b4261);
		border-radius: 8px;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border, #3b4261);
	}

	.search-icon {
		color: var(--color-text-secondary, #565f89);
		font-size: 1rem;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		color: var(--color-text, #c0caf5);
		font-size: 0.9375rem;
		outline: none;
		font-family: inherit;
	}

	.search-input::placeholder {
		color: var(--color-text-secondary, #565f89);
	}

	.results {
		flex: 1;
		overflow-y: auto;
		padding: 0.25rem 0;
	}

	.result-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.375rem 1rem;
		cursor: pointer;
		font-size: 0.8125rem;
	}

	.result-item:hover,
	.result-item.selected {
		background: var(--color-bg-hover, #292e42);
	}

	.result-left {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		overflow: hidden;
	}

	.category {
		color: var(--color-text-secondary, #565f89);
	}

	.title {
		color: var(--color-text, #c0caf5);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.keybinding {
		font-family: 'SF Mono', monospace;
		font-size: 0.6875rem;
		color: var(--color-text-secondary, #737aa2);
		background: var(--color-bg, #1a1b26);
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
		border: 1px solid var(--color-border, #3b4261);
		flex-shrink: 0;
	}

	.no-results {
		padding: 1rem;
		text-align: center;
		color: var(--color-text-secondary, #565f89);
		font-size: 0.875rem;
	}
</style>
