# ROADMAP — pares-editor

## v0.1.0 — MVP (Current)
- [x] Plugin manifest and registration
- [x] Command registry with search
- [x] Text manipulation commands (20+ operations)
- [x] VS Code-compatible default keymap (60+ bindings)
- [x] File system abstraction with language detection
- [x] File tree builder
- [ ] Monaco Editor integration (EditorPane.svelte)
- [ ] Editor tabs with dirty indicators
- [ ] File explorer sidebar panel
- [ ] Command palette UI

## v0.2.0 — Core Editing
- [ ] Split editor (horizontal/vertical)
- [ ] Diff viewer (side-by-side and inline)
- [ ] Find & replace with regex
- [ ] Go to line / Go to symbol
- [ ] Breadcrumb navigation
- [ ] Auto-save (afterDelay, onFocusChange)
- [ ] Format on save (Prettier integration)

## v0.3.0 — Developer Experience
- [ ] Custom keybinding configuration
- [ ] Snippet support
- [ ] Bracket pair colorization theming
- [ ] Multi-cursor editing enhancements
- [ ] Emmet abbreviation expansion
- [ ] Code folding improvements

## v0.4.0 — Integration
- [ ] Terminal integration (reuse pares-bastion terminal)
- [ ] Git integration (status, diff, stage, commit)
- [ ] Problem panel (lint errors, type errors)
- [ ] Extension marketplace (language servers, themes)

## Non-Goals
- Full IDE (no debugger, no project templates)
- Replacing VS Code for heavy development
- TUI support (Monaco requires DOM)
