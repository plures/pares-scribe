import { describe, it, expect, beforeEach } from 'vitest';
import { commandRegistry } from '../src/commands/registry.js';

describe('commandRegistry', () => {
	beforeEach(() => {
		commandRegistry.clear();
	});

	it('registers and retrieves a command', () => {
		commandRegistry.register({ id: 'test.cmd', title: 'Test Command', handler: () => {} });
		expect(commandRegistry.get('test.cmd')?.title).toBe('Test Command');
	});

	it('lists all registered commands', () => {
		commandRegistry.register({ id: 'a', title: 'A', handler: () => {} });
		commandRegistry.register({ id: 'b', title: 'B', handler: () => {} });
		expect(commandRegistry.list().map((c) => c.id).sort()).toEqual(['a', 'b']);
	});

	it('executes a registered command handler', async () => {
		let called = false;
		commandRegistry.register({ id: 'test.exec', title: 'Exec', handler: () => { called = true; } });
		await commandRegistry.execute('test.exec');
		expect(called).toBe(true);
	});

	it('executing an unknown command is a no-op, not a throw', async () => {
		await expect(commandRegistry.execute('does.not.exist')).resolves.toBeUndefined();
	});

	it('unregister removes a command', () => {
		commandRegistry.register({ id: 'gone', title: 'Gone', handler: () => {} });
		commandRegistry.unregister('gone');
		expect(commandRegistry.get('gone')).toBeUndefined();
	});

	it('search matches by title, id, and category (case-insensitive)', () => {
		commandRegistry.register({ id: 'file.save', title: 'Save File', category: 'File', handler: () => {} });
		commandRegistry.register({ id: 'edit.undo', title: 'Undo', category: 'Edit', handler: () => {} });

		expect(commandRegistry.search('save').map((c) => c.id)).toEqual(['file.save']);
		expect(commandRegistry.search('FILE').map((c) => c.id)).toEqual(['file.save']);
		expect(commandRegistry.search('undo').map((c) => c.id)).toEqual(['edit.undo']);
	});

	it('search with empty query returns all commands', () => {
		commandRegistry.register({ id: 'a', title: 'A', handler: () => {} });
		commandRegistry.register({ id: 'b', title: 'B', handler: () => {} });
		expect(commandRegistry.search('').length).toBe(2);
	});

	it('search sorts title-prefix matches before substring matches', () => {
		commandRegistry.register({ id: 'x', title: 'Zoom Save', handler: () => {} });
		commandRegistry.register({ id: 'y', title: 'Save As', handler: () => {} });
		const results = commandRegistry.search('save');
		expect(results[0].id).toBe('y');
	});
});
