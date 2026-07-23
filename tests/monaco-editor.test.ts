import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import MonacoEditor from '../src/editor/MonacoEditor.svelte';
import { getActiveEditor } from '../src/editor/active-editor.js';

beforeAll(() => {
	// Monaco's editor.dispose() cancels internal delayed operations (e.g. the
	// WordHighlighter's debounce timer) via a "Canceled" rejection - this is
	// Monaco's own documented cancellation pattern (see base/common/errors.js
	// isCancellationError), not a real failure, but it surfaces as an unhandled
	// rejection in Node's test runner because the cancellation races past the
	// microtask queue our own onDestroy/dispose call is synchronous within.
	// Swallow only this specific, known-benign Monaco cancellation shape.
	process.on('unhandledRejection', (reason: unknown) => {
		const message = reason instanceof Error ? reason.message : String(reason);
		if (message === 'Canceled' || message.includes('Canceled: Canceled')) return;
		throw reason;
	});

	// jsdom has no ResizeObserver; Monaco's automaticLayout needs one.
	if (!('ResizeObserver' in globalThis)) {
		(globalThis as any).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
	}
	// jsdom doesn't implement matchMedia; Monaco's theme code queries it.
	if (!window.matchMedia) {
		window.matchMedia = ((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		})) as unknown as typeof window.matchMedia;
	}
	// jsdom doesn't implement the (largely obsolete, but still checked by Monaco's
	// clipboard feature-detection) execCommand query API.
	if (!document.queryCommandSupported) {
		(document as any).queryCommandSupported = () => false;
	}
	// jsdom has no canvas backend; Monaco probes canvas 2D context for devicePixelRatio
	// detection only - stub it to return a context-shaped object so that probe succeeds.
	(HTMLCanvasElement.prototype as any).getContext = () =>
		new Proxy(
			{},
			{
				get: (_target, prop) => {
					if (prop === 'webkitBackingStorePixelRatio') return 1;
					if (prop === 'canvas') return document.createElement('canvas');
					// Any 2D-context method Monaco probes (clearRect, beginPath, fillText, ...)
					// resolves to a no-op; any property it reads resolves to a harmless default.
					return () => ({});
				},
			}
		);
	// jsdom's navigator.clipboard is undefined (or a non-functional partial stub); Monaco's
	// clipboard service touches it on certain key combos even when our own onsave handler
	// is the one under test. Always (re)define it fully so both `write` and `writeText`
	// exist as real callable stubs, regardless of what jsdom itself already exposes.
	Object.defineProperty(navigator, 'clipboard', {
		value: { write: async () => {}, writeText: async () => {}, read: async () => [], readText: async () => '' },
		configurable: true,
		writable: true,
	});
	// jsdom has no ClipboardItem constructor; Monaco's WebKit clipboard workaround
	// constructs one on every container-add event regardless of browser, so it must
	// exist as a real constructible class or the workaround throws before ever
	// reaching our navigator.clipboard.write stub above.
	if (!('ClipboardItem' in globalThis)) {
		(globalThis as any).ClipboardItem = class ClipboardItem {
			constructor(public items: Record<string, unknown>) {}
		};
	}
});

describe('MonacoEditor (real monaco-editor, mounted in jsdom)', () => {
	it('mounts a real Monaco editor instance and reports readiness', async () => {
		const onready = vi.fn();
		render(MonacoEditor, { props: { value: 'const x = 1;', language: 'typescript', onready } });

		// Monaco's editor.create + worker setup resolves asynchronously via a dynamic import.
		await vi.waitFor(() => expect(onready).toHaveBeenCalledTimes(1), { timeout: 20000, interval: 100 });

		const editor = onready.mock.calls[0][0];
		expect(editor.getValue()).toBe('const x = 1;');
		expect(getActiveEditor()).toBe(editor);

		cleanup();
	});

	it('fires onchange with the new content when the model changes', async () => {
		const onready = vi.fn();
		const onchange = vi.fn();
		render(MonacoEditor, { props: { value: 'a', onready, onchange } });
		await vi.waitFor(() => expect(onready).toHaveBeenCalledTimes(1), { timeout: 20000, interval: 100 });

		const editor = onready.mock.calls[0][0];
		editor.setValue('b');
		flushSync();
		expect(onchange).toHaveBeenCalledWith('b');

		cleanup();
	});

	it('fires onsave when Ctrl+S keydown is dispatched on the editor DOM node', async () => {
		const onready = vi.fn();
		const onsave = vi.fn();
		render(MonacoEditor, { props: { value: 'save me', onready, onsave } });
		await vi.waitFor(() => expect(onready).toHaveBeenCalledTimes(1), { timeout: 20000, interval: 100 });

		const editor = onready.mock.calls[0][0];
		const domNode = editor.getDomNode();
		expect(domNode).toBeTruthy();

		// Monaco's keybinding service listens for keydown on its internal hidden
		// textarea (the real input target when a user types), not the outer
		// container div that getDomNode() returns - dispatch there to match
		// real browser behavior.
		const textarea = domNode!.querySelector('textarea')!;
		expect(textarea).toBeTruthy();
		// jsdom's KeyboardEvent constructor does not populate the legacy `keyCode`
		// field from the init dict (it's a deprecated, non-standard property), but
		// Monaco's keybinding extraction reads event.keyCode directly - define it
		// explicitly so the dispatched event matches what a real browser sends for 'S'.
		const evt = new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true, bubbles: true });
		Object.defineProperty(evt, 'keyCode', { get: () => 83 });
		textarea.dispatchEvent(evt);

		await vi.waitFor(() => expect(onsave).toHaveBeenCalledWith('save me'), { timeout: 2000 });

		cleanup();
	});
});
