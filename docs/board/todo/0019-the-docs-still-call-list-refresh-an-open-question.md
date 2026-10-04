# The docs still call list refresh an open question

## Why
**The docs say how the curated lists get refreshed is undecided, and it is now decided.** The two
curated lists are the bundled files of known paywall sites and known ad-heavy sites. `HANDOVER.md`
("Curated lists are release-bound") calls remote fetching "an open question on the board". The PRD
section 9 risk row "Curated lists go stale" still reads "Open question". Card `0003` settled it on
2026-08-16 with option 3. The lists stay inside the extension and change only with a release. A user
who wants a site the lists miss adds it to their own site list.

**What it costs.** The next session reads the handover first. It will think remote fetching is still
possible, and it may reopen a question that sets the store permissions and the privacy notice.
Nothing written down says how somebody updates a list, so the `version` and `updated` fields at the
top of each file have no stated rule.

**How it came to be this way.** The PRD raised it as an open question. Card `0003` answered it on
the board, and no card carried the answer back into the docs.

## Links

**Relates to**
- `0003` - its answer (option 3) is the decision this card writes into the docs.

## Not this card
- Any change under `src/`, including the list contents and the popup.
- A remote-fetch path, telemetry, or any new permission. Option 3 rules these out.
- Writing the store listing. None exists yet. This card only writes the sentence it will reuse.

## Plan
Stand in the repository root of AutoReaderMode, on the branch the loop gives you. Three files to
edit, all at the root: `PRD.md`, `HANDOVER.md`, `README.md`. Nothing runs. Read each section before
you edit it.

1. **`PRD.md`, section 9, row "Curated lists go stale".** Replace the "Open question ... Recommend
   release-bound for v2." text with the outcome. Lists are bundled and change only on release.
   They are never fetched, so no network permission and no privacy notice is needed for them. A user
   adds any missing host to their own site list (`readerSites`) from the popup. Decided on card
   `0003`, 2026-08-16.
2. **`HANDOVER.md`, section "Curated lists are release-bound".** Replace the "open question"
   sentence with the same outcome. Then add how a list is refreshed, read off the files, not
   invented. Open `src/data/paywalls.json` and `src/data/ad-heavy.json`. Each has `version`,
   `updated` and `entries` at the top. Say: add or remove an entry, increase `version` by one, set
   `updated` to the date, and ship it in the next extension release (`version` in
   `src/manifest.json`). Before you write "increase `version`", grep `src/` for any code that reads
   that field (`grep -rn "\.version\|\.updated" src/`). If code reads it, say what it does with it.
   If nothing reads it, say it is for people only.
3. **`README.md`.** Add one sentence where the curated lists are described (the feature table, or
   the "Usage" step about curated lists). Say that the lists ship with the extension and update only
   with a new version, and that you add any site they miss to your own list from the popup. This is
   the sentence a future store listing copies. Card `0003` asked for the escape hatch to be named
   there, and the README is the only public text there is today.

It worked when `grep -n "open question" HANDOVER.md` gives no line about curated lists, and PRD row
"Curated lists go stale" no longer contains "Open question".

## Acceptance
<!-- AC:BEGIN -->
- [ ] #1 WHEN a reader opens PRD section 9, THE ROW "Curated lists go stale" SHALL state the lists are release-bound and never fetched, name the user's own list as the escape hatch, and cite card `0003`. proves: none - no suite in this repository reads prose
- [ ] #2 WHEN a reader opens HANDOVER "Curated lists are release-bound", IT SHALL state the decision and the steps to refresh a list, with what the `version` and `updated` fields are for. proves: none - no suite in this repository reads prose
- [ ] #3 WHEN a reader opens `README.md`, IT SHALL say the curated lists update only with a new version and that a missing site can be added to their own list from the popup. proves: none - no suite in this repository reads prose
<!-- AC:END -->

## Tasks
- [ ] Rewrite the PRD section 9 "Curated lists go stale" row
- [ ] Rewrite the HANDOVER "Curated lists are release-bound" section, with the refresh steps
- [ ] Add the escape-hatch sentence to README

## Comments
