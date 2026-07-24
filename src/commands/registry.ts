/**
 * Command registry — central place to register and lookup editor commands.
 * Commands are actions invokable via command palette, keybindings, or menus.
 */

export type CommandHandler = () => void | Promise<void>;

/** Called when a command handler throws or rejects. Receives the command id and the thrown value. */
export type ExecuteErrorHandler = (id: string, err: unknown) => void;

export interface CommandEntry {
	/** Unique command id, e.g. "file.close". */
	id: string;
	/** Human-readable title shown in the command palette. */
	title: string;
	/** Optional category for grouping in the palette. */
	category?: string;
	/** Command implementation. */
	handler: CommandHandler;
}

class CommandRegistry {
	#commands = new Map<string, CommandEntry>();
	#onError: ExecuteErrorHandler = () => {};

	/**
	 * Register a handler for command execution errors.
	 * The host application can wire this to its telemetry/tracing pipeline.
	 * Replaces any previously registered handler.
	 */
	setErrorHandler(handler: ExecuteErrorHandler): void {
		this.#onError = handler;
	}

	/** Register (or replace) a command. */
	register(entry: CommandEntry): void {
		this.#commands.set(entry.id, entry);
	}

	/** Unregister a command by id. */
	unregister(id: string): void {
		this.#commands.delete(id);
	}

	/** Look up a single command by id. */
	get(id: string): CommandEntry | undefined {
		return this.#commands.get(id);
	}

	/** All registered commands, in registration order. */
	list(): CommandEntry[] {
		return [...this.#commands.values()];
	}

	/** Execute a command by id. No-op if not found. Handler errors are routed to the registered error handler rather than rejected, so fire-and-forget callers never produce unhandled rejections. */
	async execute(id: string): Promise<void> {
		const cmd = this.#commands.get(id);
		if (!cmd) return;
		try {
			await cmd.handler();
		} catch (err) {
			this.#onError(id, err);
		}
	}

	/** Fuzzy-search commands by title, id, or category. */
	search(query: string): CommandEntry[] {
		const q = query.toLowerCase().trim();
		if (!q) return this.list();
		return this.list()
			.filter((cmd) => {
				return (
					cmd.title.toLowerCase().includes(q) ||
					cmd.id.toLowerCase().includes(q) ||
					(cmd.category?.toLowerCase().includes(q) ?? false)
				);
			})
			.sort((a, b) => {
				const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
				const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
				if (aStarts !== bStarts) return aStarts - bStarts;
				return a.title.localeCompare(b.title);
			});
	}

	/** Remove all commands. Mainly useful for tests. */
	clear(): void {
		this.#commands.clear();
	}
}

/** Singleton command registry shared across the editor plugin. */
export const commandRegistry = new CommandRegistry();
