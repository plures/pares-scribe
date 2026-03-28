/**
 * Command registry — central place to register and lookup editor commands.
 * Commands are actions invokable via command palette, keybindings, or menus.
 */

export interface EditorCommand {
	id: string;
	label: string;
	/** Category for command palette grouping. */
	category: 'file' | 'edit' | 'view' | 'selection' | 'text' | 'go' | 'debug' | 'terminal';
	/** Keyboard shortcut (VS Code format). */
	keybinding?: string;
	/** Execute the command. */
	execute: () => void | Promise<void>;
}

const commands = new Map<string, EditorCommand>();

export function registerCommand(cmd: EditorCommand): void {
	commands.set(cmd.id, cmd);
}

export function getCommand(id: string): EditorCommand | undefined {
	return commands.get(id);
}

export function getAllCommands(): EditorCommand[] {
	return [...commands.values()];
}

export function getCommandsByCategory(category: EditorCommand['category']): EditorCommand[] {
	return [...commands.values()].filter((c) => c.category === category);
}

export function executeCommand(id: string): void {
	const cmd = commands.get(id);
	if (cmd) cmd.execute();
}

/**
 * Search commands by label (fuzzy match for command palette).
 */
export function searchCommands(query: string): EditorCommand[] {
	const lower = query.toLowerCase();
	return getAllCommands()
		.filter((c) => c.label.toLowerCase().includes(lower) || c.id.toLowerCase().includes(lower))
		.sort((a, b) => {
			// Exact prefix match first
			const aStarts = a.label.toLowerCase().startsWith(lower) ? 0 : 1;
			const bStarts = b.label.toLowerCase().startsWith(lower) ? 0 : 1;
			if (aStarts !== bStarts) return aStarts - bStarts;
			return a.label.localeCompare(b.label);
		});
}
