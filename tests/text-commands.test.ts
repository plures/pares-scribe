import { describe, it, expect } from 'vitest';
import {
	sortLinesAsc,
	sortLinesDesc,
	removeDuplicateLines,
	toCamelCase,
	toSnakeCase,
	toKebabCase,
	encodeBase64,
	decodeBase64,
	trimTrailingWhitespace,
	removeBlankLines,
	TEXT_COMMANDS,
} from '../src/commands/text-commands.js';

describe('text-commands', () => {
	it('sorts lines ascending/descending', () => {
		expect(sortLinesAsc('c\na\nb')).toBe('a\nb\nc');
		expect(sortLinesDesc('a\nb\nc')).toBe('c\nb\na');
	});

	it('removes duplicate lines while preserving first occurrence order', () => {
		expect(removeDuplicateLines('a\nb\na\nc')).toBe('a\nb\nc');
	});

	it('transforms case', () => {
		expect(toCamelCase('hello-world_test')).toBe('helloWorldTest');
		expect(toSnakeCase('helloWorld')).toBe('hello_world');
		expect(toKebabCase('helloWorld')).toBe('hello-world');
	});

	it('encodes/decodes base64 round-trip', () => {
		const original = 'pares-scribe rocks';
		expect(decodeBase64(encodeBase64(original))).toBe(original);
	});

	it('trims trailing whitespace per line', () => {
		expect(trimTrailingWhitespace('a  \nb\t\n')).toBe('a\nb\n');
	});

	it('removes blank lines', () => {
		expect(removeBlankLines('a\n\nb\n  \nc')).toBe('a\nb\nc');
	});

	it('TEXT_COMMANDS exposes a registrable command for every operation, each with a unique id', () => {
		expect(TEXT_COMMANDS.length).toBeGreaterThan(10);
		const ids = TEXT_COMMANDS.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const cmd of TEXT_COMMANDS) {
			expect(cmd.category).toBe('Text');
			expect(typeof cmd.handler).toBe('function');
		}
	});
});
