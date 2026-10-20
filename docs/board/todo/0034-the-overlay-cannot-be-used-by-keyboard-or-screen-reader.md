# The reading overlay cannot be used properly by keyboard or screen reader

## Why
**When the overlay opens, Space, Page Down and the arrow keys scroll the hidden page underneath, not
the article.** `mountOverlay` in `src/content/reader.js` appends the overlay and never moves focus
into it. It has no `role="dialog"`, no `aria-modal` and no label, the page behind is not made inert,
and focus is not kept inside it, so Tab leaves the Exit button straight for links on the hidden page
and a screen reader still reads the whole original page.

**What it costs.** Reader mode is, among other things, an accessibility tool, and these users get the
least from it. Keyboard users cannot scroll the article without clicking it first. More gaps on the
same path:
- Alt+R is matched with `e.key.toLowerCase() === 'r'`; on macOS Option+R produces "®", so the
  shortcut never fires there.
- The listener is a bubble-phase listener on `document`, so a page that stops propagation or handles
  Esc itself swallows or double-handles it.
- The exit keys are named only at the very bottom of the article, and the toolbar with the Exit
  button is not sticky, so on a long page both scroll out of view.
- The overlay has no `overscroll-behavior: contain` and the page's own scroll is not locked, so
  reaching the end of the article scrolls the page behind.

**How it came to be this way.** The overlay was built as a visual layer; keyboard and assistive
technology were never part of its brief.

## Links

**Relates to**
- `0035` - the overlay's layout and styles, in the same function.
- `0024` - the single teardown function every exit should go through, which must also restore focus and inert state.

## Not this card
- A keyboard shortcut that opens reader mode. PRD section 12 lists it as a follow-up.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the overlay mounts, THE APP SHALL move focus into it, and pressing Page Down SHALL scroll the article. proves: `a11y: focus moves into the overlay`
- [ ] WHEN the overlay is open, THE APP SHALL expose it as a modal dialog and make the rest of the page inert. proves: `a11y: overlay is a modal dialog`
- [ ] WHEN the overlay closes, THE APP SHALL return focus to the element focused before it opened. proves: `a11y: focus is restored on exit`
- [ ] WHEN Alt+R is pressed on a macOS layout, THE APP SHALL close the overlay. proves: `a11y: Alt+R matches by key code`
<!-- AC:END -->

## Tasks
- [ ] Give the overlay `role="dialog"`, `aria-modal="true"`, an `aria-label` and `tabindex="-1"`, and focus it on mount.
- [ ] Set `inert` on the page's other `body` children while open and remove it on close; remember and restore the previously focused element.
- [ ] Match Alt+R on `e.code === 'KeyR'` and listen in the capture phase on `window`.
- [ ] Make the toolbar sticky and put the key hint in it; add `overscroll-behavior: contain` and lock `html` overflow while open.

## Plan
`C:\Dev\AutoReaderMode\src\content\reader.js`, functions `mountOverlay` and `handleKey`, and the
`STYLE` string. Playwright's `page.keyboard` and `page.accessibility.snapshot()` cover the checks;
add them as `record('a11y', ...)` lines in `tests/acceptance.mjs`.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
