---
not_for_the_loop: every check is a person clicking through a browser, which no unattended session can do
---

# The twelve manual checks nobody has run since v1.2

## Why
Twelve hand-run checks used to sit in `HANDOVER.md` under "Testing checklist", and every box was
empty. They cover the parts of this extension only a person can see: the popup opening, a site being
added and then firing on the next visit, the two keys that leave the reader, dark mode. Nothing in
this repository covers any of it automatically, because this repository has no test runner at all.

They were deleted on 2026-08-10 in commit `e0e107f`, on the understanding that they would move onto
the acceptance pass as its eighth criterion. They never arrived. From that day until this card they
existed only inside that commit's diff, so the last recorded state of all twelve is "unrun" on a
codebase that has since been rewritten from v1.2 to v2.0.

## Links

**Relates to**
- `0001` - PRD section 11 criterion 8 is this checklist, so run these in the same browser sitting as
  the acceptance pass rather than making a person load the extension twice.
- `0002` - that card took the checklist out of the handover, and this file is where it landed.

## Not this card
Fixing whatever fails, and the seven PRD criteria. A failure earns its own card, because one card
called "fix v2" is one nobody can finish. The seven criteria are `0001`.

## Plan
Load the extension unpacked from the `src/` folder of this repository, following
[INSTALL.md](../../../INSTALL.md), Option A. Do it once in Chrome and once in Edge; the two browsers
take different code paths and nine of the twelve checks are Chrome's.

The reader overlay is Chrome's path only. On Edge the extension navigates the tab to a
`read://https_<host>/?url=...` address instead, so an Edge check passes when the address bar shows
`read://` and fails when the overlay appears.

Write each verdict into `## Comments` as a dated entry, one line per number. A bare "all fine" is a
fail, because a named failure says where to look next and "all fine" says nothing.

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 WHEN the extension is loaded unpacked in Chrome, THE POPUP SHALL open and show the domain of
      the current tab. proves: manual
- [ ] #2 WHEN the extension is loaded unpacked in Edge, THE POPUP SHALL open and show the domain of
      the current tab. proves: manual
- [ ] #3 WHEN a site is set to Always in the Chrome popup, THE OVERLAY SHALL appear on the next visit
      to that site. proves: manual
- [ ] #4 WHEN a site is set to Always in the Edge popup, THE TAB SHALL navigate to the `read://`
      address on the next visit to that site. proves: manual
- [ ] #5 WHEN the Open Reader Mode button is clicked in Chrome, THE OVERLAY SHALL open on the current
      page. proves: manual
- [ ] #6 WHEN the Open Reader Mode button is clicked in Edge, THE TAB SHALL navigate to the `read://`
      address. proves: manual
- [ ] #7 WHEN Esc is pressed with the Chrome overlay open, THE OVERLAY SHALL close. proves: manual
- [ ] #8 WHEN Alt+R is pressed with the Chrome overlay open, THE OVERLAY SHALL close. proves: manual
- [ ] #9 WHEN the popup button reading Exit Reader Mode is clicked, THE OVERLAY SHALL close.
      proves: manual
- [ ] #10 WHEN a site set to Always is set back to Default, THE POPUP SHALL drop that host from the
      saved-site count and show the Default state. proves: manual
- [ ] #11 WHEN the popup is opened on `chrome://newtab`, THE POPUP SHALL show its unavailable state
      and say why. proves: manual
- [ ] #12 WHEN the operating system is set to dark mode, THE CHROME OVERLAY SHALL render in dark
      colours. proves: manual
<!-- AC:END -->

## Tasks
- [ ] Load unpacked in Chrome and work criteria 1, 3, 5, 7, 8, 9, 10, 11, 12
- [ ] Load unpacked in Edge and work criteria 2, 4, 6
- [ ] Record all twelve verdicts in `## Comments`, one line each

## Comments

**2026-08-29** WRITTEN AFTER THE WORK in one narrow sense only: the twelve criteria are the twelve
lines recovered from `HANDOVER.md` as it stood before commit `e0e107f`, not criteria drafted for
this card. Every box is open, because none of the twelve has ever been recorded as run.

One line was reworded for v2 and it is number 10. The v1 checklist said "Remove site - site removed
from list, toggle reflects new state", and v1's popup had a toggle. v2 replaced it with an
Always / Default / Never control, and `src/popup.js` drops the host from `readerSites` when the rule
goes back to Default, so that is what number 10 now asks for. The other eleven are unchanged in
substance.
