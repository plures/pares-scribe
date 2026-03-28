# pares-scribe

[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)

**Lightweight code editor plugin for [pares-radix](https://github.com/plures/pares-radix)** — a VS Code-inspired editing experience that runs inside the Pares platform.

> The base platform (pares-radix) already provides layout, navigation, settings, and the plugin runtime. This plugin adds the text editing capabilities that developers need.

## What This Provides

### Core Editing
- **Monaco Editor** integration (the same editor engine as VS Code)
- Syntax highlighting for 50+ languages
- Multi-cursor editing
- Find & replace (regex support)
- Code folding
- Minimap
- Bracket matching and auto-close

### File Management
- File explorer tree (sidebar panel)
- File tabs with dirty indicator
- Create / rename / delete files and folders
- Drag-and-drop file organization
- Recent files list

### Developer Features
- **Command palette** (Ctrl/Cmd+Shift+P)
- Keyboard shortcuts (VS Code-compatible defaults)
- Split editor (horizontal/vertical)
- Diff viewer (side-by-side and inline)
- Go to line / Go to symbol
- Breadcrumb navigation

### Text Manipulation
- Sort lines (ascending/descending/unique)
- Transform case (upper/lower/title/camel/snake/kebab)
- Join/split lines
- Remove duplicates
- Trim whitespace
- Encode/decode (Base64, URL, HTML entities)
- Format document (Prettier integration)

### Integration with Pares Platform
- Uses pares-radix plugin API for registration, settings, and lifecycle
- Stores settings via platform settings system
- Files stored in partition-scoped storage
- Respects design-dojo theming

## Architecture

```
src/
├── index.ts              # Plugin entry point (pares-modulus manifest)
├── editor/
│   ├── EditorPane.svelte     # Monaco wrapper component
│   ├── EditorTabs.svelte     # Tab bar with dirty indicators
│   ├── DiffViewer.svelte     # Side-by-side diff
│   └── editor-state.svelte.ts  # Editor state management
├── explorer/
│   ├── FileTree.svelte       # File explorer sidebar
│   ├── FileNode.svelte       # Individual tree node
│   └── file-store.svelte.ts  # File system abstraction
├── commands/
│   ├── palette.svelte.ts     # Command palette state
│   ├── registry.ts           # Command registration
│   └── text-commands.ts      # Text manipulation commands
├── keybindings/
│   ├── keymap.ts             # Default VS Code-compatible bindings
│   └── handler.ts            # Keyboard event dispatcher
└── settings/
    └── editor-settings.ts    # Editor configuration schema
```

## Plugin Manifest

```typescript
// Registered in pares-modulus as:
{
  id: 'pares-scribe',
  name: 'Pares Editor',
  version: '0.1.0',
  description: 'Lightweight code editor with VS Code-inspired features',
  author: 'Plures',
  license: 'BSL-1.1',
  platforms: ['gui'],  // Monaco requires DOM — no TUI support
  panels: [
    { id: 'file-explorer', location: 'sidebar', icon: '📁', label: 'Explorer' },
  ],
  pages: [
    { id: 'editor', path: '/editor', label: 'Editor', icon: '✏️' },
    { id: 'diff', path: '/editor/diff', label: 'Diff', icon: '📊' },
  ],
  commands: 120+,  // Full command palette
  keybindings: 80+,  // VS Code-compatible defaults
}
```

## Development

```bash
npm install
npm run dev       # Dev server with hot reload
npm run build     # Production build
npm run lint      # ESLint
npm run check     # TypeScript check
npm test          # Vitest
```

## License

[BSL 1.1](LICENSE) — personal/non-commercial use free, commercial requires license.
Converts to Apache 2.0 on March 28, 2030.
