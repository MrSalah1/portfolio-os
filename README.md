# SalahOS

A browser-based operating system that is also a developer portfolio, for
**Ahmed Salah** — computer science undergraduate at Cairo University, working
across machine learning, backend development and desktop applications.

The site boots, shows a desktop, and hands the visitor a set of applications:
windows you can open, move, minimize, maximize and stack, a command prompt that
answers real questions about the portfolio, and the project sources behind them.
The visual language is Windows 1.x and early graphical user interfaces, drawn
entirely with CSS.

---

## Contents

- [What it does](#what-it-does)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [Deployment](#deployment)
- [Notes for maintainers](#notes-for-maintainers)

---

## What it does

**Boot.** A short POST-style sequence runs on load, and any key press skips it.

**Desktop.** Eight applications, arranged in a cascade so an unopened desktop
stays readable. Every icon is drawn from a 16×16 pixel map as merged SVG
rectangles, with no image assets. Icons open on a single click, and a right
click opens a context menu. `View ▸ Arrange Icons` sorts and upper-cases them
the way a real desktop does.

**Windows.** Open, close, minimize, restore, maximize, drag, and raise on
focus. Windows cannot be dragged somewhere their title bar cannot be grabbed
again. Dialogs are deliberately **not** modal: the desktop stays usable behind
an open message box, and `Escape` closes it.

**Command bar.** `SYSTEM`, `File`, `View`, `Run`, `Help`, with a
portal-rendered menu panel, full arrow-key navigation, separators, a checkable
item, and a disabled item when the action does not apply.

**Terminal.** A real prompt with 13 commands: `help`, `whoami`, `about`,
`projects`, `skills`, `experience`, `contact`, `github`, `dir`, `clear` (alias
`cls`), `date`, `version` and `exit`. Commands are case-insensitive and answer
from the same data the windows render, so `dir` and the desktop can never
disagree about which programs exist. Scrollback history works with `ArrowUp` /
`ArrowDown`.

**Task bar and status bar.** Task buttons for every open window, the clock, and
the social links (LinkedIn, GitHub, Codeforces). There is no theme toggle: the
palette is a deliberate six-colour system with a single light scheme.

**Content.** Profile, education, skills, experience, projects and contact
details, all sourced from `src/data/` so the terminal, the windows and the
README cannot drift apart.

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Build | Vite 8 | `tsc -b && vite build` |
| UI | React 19 + TypeScript | strict mode |
| Styling | One hand-written stylesheet | `src/index.css`, ~1 700 lines, BEM-style `salahos-*` classes and CSS custom properties |
| Tailwind | v4, **preflight only** | installed and active, but see [Notes for maintainers](#notes-for-maintainers) |
| Unit tests | Vitest | node environment, no DOM |
| Browser tests | Playwright | Chromium + Firefox |
| Linting | ESLint | flat config |

There is no router, no state library, no animation library and no CSS
framework. Application state is a single `useReducer` in
`src/hooks/useWindowManager.ts`.

## Getting started

**Prerequisites:** Node.js 20.19+ or 22.12+, which is what Vite 8 requires
(validated on 24.14.0), and npm.

```bash
npm install
npm run dev         # http://localhost:5173
```

Production build and local preview of that build:

```bash
npm run build       # type-checks, then emits dist/
npm run preview
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with fast refresh |
| `npm run build` | Type-check the whole project, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint over the repo |
| `npm test` | Vitest unit suite, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:browser` | Playwright suite; builds and previews automatically |

## Testing

**Unit tests** (`npm test`) — 142 tests across 5 files, plain node
environment, no DOM and no testing library:

| File | Covers |
| --- | --- |
| `src/features/terminal/terminalParser.test.ts` | whitespace, casing, arguments, quotes |
| `src/features/terminal/terminalHistory.test.ts` | recall boundaries, repeats, round-tripping |
| `src/hooks/useWindowManager.test.ts` | every reducer action and the invariants between them |
| `src/features/terminal/terminalCommands.test.ts` | the command registry, `dir` layout, unknown input |
| `src/features/desktop/desktopIconPixels.test.ts` | 16×16 grids, palette, bounds, caching |

**Browser tests** (`npm run test:browser`) — 173 tests across 8 specs in
`tests/browser/`, run against a real build in Chromium and Firefox:

| Spec | Covers |
| --- | --- |
| `boot.spec.ts` | the sequence, skipping, reduced motion |
| `desktop.spec.ts` | icons, labels, artwork, context menu, arranging |
| `windows.spec.ts` | lifecycle, focus, stacking, dragging, dialogs, show desktop |
| `menus.spec.ts` | contents of every menu, dismissal, keyboard navigation |
| `terminal.spec.ts` | prompt, commands, history, clearing, exit |
| `keyboard.spec.ts` | tab order, focus rings, the documented shortcuts |
| `responsive.spec.ts` | desktop, tablet, mobile and narrow-phone layouts |
| `a11y.spec.ts` | names, roles, live regions, reduced motion |

First run needs the browsers:

```bash
npx playwright install chromium firefox
```

## Project structure

```text
src/
  app/AppShell.tsx        window manager wiring, application registry
  data/                   the portfolio, as typed data
  features/
    apps/                 portfolio and system application content
    boot/                 the boot sequence
    desktop/              desktop surface, icons, command bar, status bar
    menu/                 menu definitions and the menu panel
    salah/                the Salah.exe landing application
    terminal/             prompt, parser, history, command registry
    window/               the window frame and its controls
  hooks/                  useWindowManager, useDraggableWindow
  types/                  shared types
  utils/
tests/browser/            Playwright specs and shared helpers
```

Data flows one way: `src/data/` holds the content, features render it, and the
terminal queries the same modules. Nothing in `src/data/` imports React.

## Accessibility

- Every window, control, icon and menu item has an accessible name.
- Windows are `role="group"`, message boxes are `role="dialog"` and are
  intentionally **not** `aria-modal`, because the desktop stays usable.
- Terminal output is a polite `role="log"` region covering the transcript only,
  so typing in the prompt is not announced as log activity.
- Icon artwork and the scanline overlay are `aria-hidden`.
- Focus is visible everywhere, and the focus ring changes colour on dark
  surfaces so it never disappears.
- `prefers-reduced-motion: reduce` removes the scanline and cursor animations
  outright instead of merely shortening them.
- Tab order, `Shift+Tab`, `Enter`, `Escape` and the arrow keys all work; the
  five shortcuts the system documents are covered by tests.

There is no automated axe pass in the suite; the checks above are hand-written
assertions about decisions the code already makes.

## Browser support

Verified by the browser suite: **Chromium** (153) and **Firefox** (155). The
layout is a flex column with absolute window positions and no browser-specific
APIs beyond standard CSS, so current versions of Chrome, Safari and Edge are
expected to work.

## Deployment

The build is a fully static site: `dist/` is HTML, one hashed JS bundle, one
hashed CSS file and the favicon. There is no server component, no runtime
configuration and no client-side router.

```bash
npm run build      # emits dist/
```

Deploy the contents of `dist/` to any static host — GitHub Pages, Netlify,
Vercel, Cloudflare Pages, or a plain object store behind a CDN. No rewrite
rules are needed, because there is no router: every path is served as built.

**Deploying to a sub-path.** `vite.config.ts` sets no `base`, so assets are
emitted as absolute `/assets/...`. Hosting the site at something like
`https://example.com/portfolio-os/` needs:

```ts
export default defineConfig({
  base: "/portfolio-os/",
  plugins: [react(), tailwindcss()],
})
```

`og:url` and `og:image` are intentionally absent from `index.html`: they need
a real domain and a share image, which do not exist yet. Add them once the site
has an address.

## Notes for maintainers

**Tailwind is installed but unused.** `src/index.css` starts with
`@import "tailwindcss"`, and no component uses a single Tailwind utility class.
All styling is hand-written. What Tailwind currently contributes is its
preflight base layer — and the stylesheet deliberately overrides part of it (see
the `RESET` block, which restores list markers). The `@theme` block also
duplicates tokens already declared in `:root`.

Removing it is a real cleanup, but it is a visual-risk change: preflight
normalises more than the project currently overrides. If you remove it, diff the
built CSS and check every list, button, input and heading.

**A `date` command exists.** The terminal's `date` command is intentionally
hard-coded, so a stale build can never show the wrong build date.

**Two projects are forks.** `Masroofy-SaaS` and `RecipeFinder2` were built on
top of other students' open-source projects. `src/data/projects.ts` says so in
the description. Keep it that way: those repositories are public, and a
reviewer who finds the upstream first will not give credit for the silence.

---

Built with React, TypeScript and Vite.