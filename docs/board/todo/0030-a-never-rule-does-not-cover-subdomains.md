# A Never rule does not cover the site's subdomains, while every list does

## Why
**Setting Never on a site from the popup does not stop reader mode on the same site's other
hostnames.** `decideTrigger` in `src/lib/triggers.js` looks `siteOverrides` up by the exact hostname,
while `readerSites` and both curated lists match by suffix. So Never on `www.nytimes.com` does not
stop the curated `nytimes.com` entry firing on `nytimes.com` or `edition.nytimes.com`. PRD section 5
says Never "beats every other source", and on a subdomain it does not.

**What it costs.** The one-click Never is the PRD's whole mitigation for false positives. A user who
uses it and then lands on the bare domain or a regional edition sees reader mode again and concludes
the rule did not save. The popup makes the mismatch visible in two more places:
- Its rule control shows Always whenever a parent domain is in `readerSites`, and clicking Default
  removes only the exact host. The parent entry stays, the site keeps opening in reader mode, the
  toast says "Reset ... to default", and next time the popup shows Always again.
- Choosing Always writes both `siteOverrides[host]` and a `readerSites` entry, so the footer's count
  of manual sites grows with each Always and ignores Never rules.

**How it came to be this way.** Overrides were added in v2 as a plain map beside a list that already
matched by suffix, and the two were never given one scope.

## Links

**Relates to**
- `0029` - how entries are normalised before they are stored.
- `0031` - the options page's rule rows, which should show each rule's scope.

## Not this card
- Editing rules on the options page (`0031`).

## Acceptance
<!-- AC:BEGIN -->
- [ ] WHEN `www.example.com` has a Never rule and `example.com` is on a curated list, THE APP SHALL not fire on `edition.example.com` or `example.com`. proves: `scope: Never covers the registrable domain's hosts`
- [ ] WHEN the popup sets Default on a host covered by a parent `readerSites` entry, THE APP SHALL name the parent entry and either remove it or say the site will keep opening. proves: `scope: Default names the covering entry`
- [ ] WHEN the popup sets Always, THE APP SHALL store it in one place only. proves: `scope: Always is stored once`
<!-- AC:END -->

## Tasks
- [ ] Resolve overrides by walking up the hostname's labels, most specific first, in `decideTrigger`.
- [ ] Store Always only in `siteOverrides` (PRD section 5 already calls it equivalent to list membership), and count rules, not list entries, in the popup footer.
- [ ] In the popup, when a parent entry is what makes the site Always, say so ("via forbes.com in your sites list").

## Plan
`C:\Dev\AutoReaderMode`, files `src/lib/triggers.js` and `src/popup.js`. The walk up the labels
stops before a bare TLD. `tests/acceptance.mjs` can seed `siteOverrides` through `worker.evaluate`
and serve every host from one page with the existing `serve` helper. Add the checks as
`record('scope', ...)` lines.

## Comments

**2026-10-20** Raised by the shortcomings sweep. Read off the code; nothing here was run. Treated as
a fix, not a decision: the PRD already says Never beats every other source, and this makes the code
do that.
