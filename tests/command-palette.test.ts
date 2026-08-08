import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import CommandPalette from '../src/editor/CommandPalette.svelte';
import { commandRegistry } from '../src/commands/registry.js';

describe('CommandPalette', () => {
	beforeEach(() => {
		commandRegistry.clear();
		cleanup();
	});

	it('renders nothing when closed', () => {
		render(CommandPalette, { props: { open: false } });
		expect(screen.queryByRole('listbox')).toBeNull();
	});

	it('shows all registered commands when opened with empty query', async () => {
		commandRegistry.register({ id: 'test.alpha', title: 'Alpha', handler: () => {} });
		commandRegistry.register({ id: 'test.beta', title: 'Beta', handler: () => {} });

		render(CommandPalette, { props: { open: true } });

		expect(screen.getByText('Alpha')).toBeTruthy();
		expect(screen.getByText('Beta')).toBeTruthy();
	});

	it('filters commands via registry.search() when typing', async () => {
		commandRegistry.register({ id: 'file.save', title: 'Save File', category: 'File', handler: () => {} });
		commandRegistry.register({ id: 'edit.undo', title: 'Undo', category: 'Edit', handler: () => {} });

		render(CommandPalette, { props: { open: true } });

		const input = screen.getByLabelText('Command search');
		await fireEvent.input(input, { target: { value: 'save' } });

		expect(screen.getByText('Save File')).toBeTruthy();
		expect(screen.queryByText('Undo')).toBeNull();
	});

	it('shows "No matching commands" when search returns nothing', async () => {
		commandRegistry.register({ id: 'a', title: 'Alpha', handler: () => {} });

		render(CommandPalette, { props: { open: true } });

		const input = screen.getByLabelText('Command search');
		await fireEvent.input(input, { target: { value: 'zzzzz' } });

		expect(screen.getByText('No matching commands')).toBeTruthy();
	});

	it('executes command on Enter and closes', async () => {
		let executed = false;
		commandRegistry.register({ id: 'test.run', title: 'Run Test', handler: () => { executed = true; } });

		const closeFn = vi.fn();
		render(CommandPalette, { props: { open: true, onclose: closeFn } });

		const input = screen.getByLabelText('Command search');
		await fireEvent.keyDown(input, { key: 'Enter' });

		await waitFor(() => expect(executed).toBe(true));
		await waitFor(() => expect(closeFn).toHaveBeenCalled());
	});

	it('closes on Escape', async () => {
		commandRegistry.register({ id: 'a', title: 'A', handler: () => {} });

		const closeFn = vi.fn();
		render(CommandPalette, { props: { open: true, onclose: closeFn } });

		const input = screen.getByLabelText('Command search');
		await fireEvent.keyDown(input, { key: 'Escape' });

		expect(closeFn).toHaveBeenCalled();
	});
});
