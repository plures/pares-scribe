/**
 * Text manipulation commands — the "Swiss Army knife" operations
 * that make an editor useful for developers.
 */

import type { CommandEntry } from './registry.js';

// ── Line Operations ─────────────────────────────────────────────────────────

export function sortLinesAsc(text: string): string {
	return text.split('\n').sort().join('\n');
}

export function sortLinesDesc(text: string): string {
	return text.split('\n').sort().reverse().join('\n');
}

export function removeDuplicateLines(text: string): string {
	return [...new Set(text.split('\n'))].join('\n');
}

export function reverseLines(text: string): string {
	return text.split('\n').reverse().join('\n');
}

export function shuffleLines(text: string): string {
	const lines = text.split('\n');
	for (let i = lines.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[lines[i], lines[j]] = [lines[j], lines[i]];
	}
	return lines.join('\n');
}

export function joinLines(text: string, separator = ' '): string {
	return text.split('\n').join(separator);
}

export function splitLine(text: string, separator: string): string {
	return text.split(separator).join('\n');
}

// ── Case Transformations ────────────────────────────────────────────────────

export function toUpperCase(text: string): string {
	return text.toUpperCase();
}

export function toLowerCase(text: string): string {
	return text.toLowerCase();
}

export function toTitleCase(text: string): string {
	return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function toCamelCase(text: string): string {
	return text
		.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
		.replace(/^[A-Z]/, (c) => c.toLowerCase());
}

export function toSnakeCase(text: string): string {
	return text
		.replace(/([A-Z])/g, '_$1')
		.replace(/[-\s]+/g, '_')
		.toLowerCase()
		.replace(/^_/, '');
}

export function toKebabCase(text: string): string {
	return text
		.replace(/([A-Z])/g, '-$1')
		.replace(/[_\s]+/g, '-')
		.toLowerCase()
		.replace(/^-/, '');
}

export function toPascalCase(text: string): string {
	return text.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^[a-z]/, (c) => c.toUpperCase());
}

export function toConstantCase(text: string): string {
	return toSnakeCase(text).toUpperCase();
}

// ── Encoding / Decoding ─────────────────────────────────────────────────────

export function encodeBase64(text: string): string {
	return btoa(text);
}

export function decodeBase64(text: string): string {
	return atob(text.trim());
}

export function encodeUrl(text: string): string {
	return encodeURIComponent(text);
}

export function decodeUrl(text: string): string {
	return decodeURIComponent(text);
}

export function encodeHtmlEntities(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

// ── Whitespace ──────────────────────────────────────────────────────────────

export function trimLines(text: string): string {
	return text.split('\n').map((l) => l.trim()).join('\n');
}

export function trimTrailingWhitespace(text: string): string {
	return text.split('\n').map((l) => l.replace(/\s+$/, '')).join('\n');
}

export function compressWhitespace(text: string): string {
	return text.replace(/[ \t]+/g, ' ');
}

export function removeBlankLines(text: string): string {
	return text.split('\n').filter((l) => l.trim().length > 0).join('\n');
}

// ── Wrap / Indent ───────────────────────────────────────────────────────────

export function indentLines(text: string, indent = '\t'): string {
	return text.split('\n').map((l) => indent + l).join('\n');
}

export function outdentLines(text: string, indent = '\t'): string {
	return text.split('\n').map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l)).join('\n');
}

export function wrapLines(text: string, width: number): string {
	return text.split('\n').map((line) => {
		if (line.length <= width) return line;
		const words = line.split(' ');
		const wrapped: string[] = [];
		let current = '';
		for (const word of words) {
			if (current.length + word.length + 1 > width) {
				wrapped.push(current);
				current = word;
			} else {
				current = current ? `${current} ${word}` : word;
			}
		}
		if (current) wrapped.push(current);
		return wrapped.join('\n');
	}).join('\n');
}

// ── Command Palette Registration ────────────────────────────────────────────

import { transformActiveEditor } from '../editor/active-editor.js';

function textCmd(id: string, title: string, fn: (text: string) => string): CommandEntry {
	return {
		id,
		title,
		category: 'Text',
		handler: () => transformActiveEditor(fn),
	};
}

/** All text-manipulation commands, ready to register with the command registry. */
export const TEXT_COMMANDS: CommandEntry[] = [
	textCmd('text.sortLinesAsc', 'Sort Lines Ascending', sortLinesAsc),
	textCmd('text.sortLinesDesc', 'Sort Lines Descending', sortLinesDesc),
	textCmd('text.removeDuplicateLines', 'Remove Duplicate Lines', removeDuplicateLines),
	textCmd('text.reverseLines', 'Reverse Lines', reverseLines),
	textCmd('text.shuffleLines', 'Shuffle Lines', shuffleLines),
	textCmd('text.toUpperCase', 'Transform to UPPERCASE', toUpperCase),
	textCmd('text.toLowerCase', 'Transform to lowercase', toLowerCase),
	textCmd('text.toTitleCase', 'Transform to Title Case', toTitleCase),
	textCmd('text.toCamelCase', 'Transform to camelCase', toCamelCase),
	textCmd('text.toSnakeCase', 'Transform to snake_case', toSnakeCase),
	textCmd('text.toKebabCase', 'Transform to kebab-case', toKebabCase),
	textCmd('text.toPascalCase', 'Transform to PascalCase', toPascalCase),
	textCmd('text.toConstantCase', 'Transform to CONSTANT_CASE', toConstantCase),
	textCmd('text.encodeBase64', 'Encode Base64', encodeBase64),
	textCmd('text.decodeBase64', 'Decode Base64', decodeBase64),
	textCmd('text.encodeUrl', 'Encode URL', encodeUrl),
	textCmd('text.decodeUrl', 'Decode URL', decodeUrl),
	textCmd('text.encodeHtmlEntities', 'Encode HTML Entities', encodeHtmlEntities),
	textCmd('text.decodeHtmlEntities', 'Decode HTML Entities', decodeHtmlEntities),
	textCmd('text.trimLines', 'Trim Lines', trimLines),
	textCmd('text.trimTrailingWhitespace', 'Trim Trailing Whitespace', trimTrailingWhitespace),
	textCmd('text.compressWhitespace', 'Compress Whitespace', compressWhitespace),
	textCmd('text.removeBlankLines', 'Remove Blank Lines', removeBlankLines),
];
