# How the curated lists get refreshed

## What I need from you

**Pick 1, 2 or 3 below.** It decides whether the extension ever makes a network request, which is
the difference between a store listing that needs a privacy notice and one that does not.

My recommendation is **3**, which is the PRD's own option 1 with the escape hatch that is already
built named alongside it.

**Pass** is a number in this card. Agreeing with the PRD is a complete answer: say "3" and this
closes with no work attached.

**Fail** is deferring it until submission. The answer changes both the permissions the extension
asks for and the privacy notice on the listing, so settling it afterwards means rewriting the
listing rather than writing it once.

**Why it needs you** It is a privacy position rather than a technical call, and it is the one entry
in the PRD's risk table left open rather than mitigated. Shipping a store listing on an unconfirmed
privacy position is the wrong order, which is why it is on the board rather than assumed.

## Why
`src/data/paywalls.json` and `src/data/ad-heavy.json` are the curated lists, and the PRD names
their going stale as a risk with an open question attached: fetch them remotely, or update them
only when a release ships. It is the one question in the PRD's risk table that was left open rather
than mitigated, and it has to be settled before the extension is submitted anywhere, because the
answer changes both the permissions and the privacy notice.

## Options
1. **Release-bound.** The lists ship inside the extension and change only when a new version does.
   Cost: a newly paywalled site stays undetected until the next release, and releases are manual.
2. **Remote fetch.** The extension pulls the lists from a URL on a schedule. Cost: a new host
   permission, a privacy notice explaining what is requested and when, a host to serve the files
   and keep serving them, and a network dependency in a tool whose whole appeal is that it works on
   the page in front of you.
3. **Release-bound plus user additions.** As option 1, but the popup lets a user add a host to
   their own list, which `readerSites` already does. Cost: none beyond what exists; it is option 1
   with the existing escape hatch named in the store listing.

## Recommendation
Option 3, which is the PRD's recommendation with the part that is already built made explicit.
Release-bound keeps the extension free of any network request, which is the strongest possible
answer to the "paywall scrapers attract publisher complaints" risk in the same table: an extension
that never phones home is much easier to position as a reading view.

Option 2 is the one to avoid at this size. It buys freshness for a list of a few dozen hosts and
costs a permission, a privacy notice and a server that has to outlive interest in the project.

## Decided


**2026-08-16** 3
