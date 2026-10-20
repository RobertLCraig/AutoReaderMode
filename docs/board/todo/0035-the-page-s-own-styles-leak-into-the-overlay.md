# The page's own styles leak into the overlay and wide content overflows it

## Why
**In dark mode on a site that sets `p { color: #222 }`, the overlay shows dark text on a dark
background.** The overlay in `src/content/reader.js` is a plain `div` in the page's DOM with no
shadow root and no reset, so the page's rules for `p`, `a`, `img`, `button`, `table`, `li` and
`figure` apply to the article and beat the colour set on `.arm-body`. The overlay's own CSS is
correctly scoped and does not leak out; the leak only goes inward.

**What it costs.** The overlay exists to give a clean, consistent page, and on sites with heavy
styling it inherits their typography and colours instead, sometimes unreadably. The layout has more
gaps in the same `STYLE` string and mount code:
- No rules for `table`, `video`, `iframe` or `svg`, and no `overflow-wrap`, so long URLs and wide
  content overflow sideways; only `pre` is handled.
- Every `img` is forced to block with 16px margins, which breaks inline icons, emoji images and maths.
- No `dir` or `lang` is set from the article, so Arabic and Hebrew articles render left to right, and
  the blockquote border sits on the wrong side. Readability returns `dir` and `lang`; both are ignored,
  as are `siteName` and `publishedTime`.
- The article keeps its `id`s, which repeat ids on the hidden page, so footnote and `#hash` links
  jump the hidden page, not the overlay.

**How it came to be this way.** The overlay was styled against well-behaved test pages; isolation
from the host page was never part of the design.

## Links

**Relates to**
- `0027` - the sanitising pass, which is the natural place to rewrite ids.
- `0034` - accessibility, in the same function.

## Not this card
- Font size, width or theme controls. PRD section 3 makes a typography UI a non-goal.

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN the page styles `p` with a dark colour and the system is in dark mode, THE APP SHALL render article text in the overlay's own colour. proves: `layout: page styles do not reach the article`
- [ ] WHEN the article contains a 2,000-pixel-wide table or a long unbroken URL, THE APP SHALL not scroll the overlay sideways. proves: `layout: wide content stays inside`
- [ ] WHEN Readability reports `dir: rtl`, THE APP SHALL render the article right to left. proves: `layout: rtl articles render right to left`
- [ ] WHEN a footnote link in the article is clicked, THE APP SHALL scroll the overlay to the footnote. proves: `layout: hash links stay in the overlay`
<!-- AC:END -->

## Tasks
- [ ] Mount the overlay inside a shadow root (or, at minimum, apply an `all: revert` reset under the overlay id).
- [ ] Add max-width and overflow rules for tables, media and embeds, and `overflow-wrap: anywhere` on the body; limit block image styling to standalone and figure images.
- [ ] Set `dir` and `lang` from the article and switch to logical CSS properties; show `siteName` and `publishedTime` under the title.
- [ ] Prefix the article's ids and rewrite its hash links to match.

## Plan
`C:\Dev\AutoReaderMode\src\content\reader.js`, function `mountOverlay` and the `STYLE` string. A shadow
root changes how `tests/acceptance.mjs` finds `#auto-reader-mode-overlay #arm-body`; Playwright CSS
selectors pierce open shadow roots, so keep it open. Add the checks as `record('layout', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run.
