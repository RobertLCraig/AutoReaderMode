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

**Why it needs you** This is **a risk you own**, which is one of the four things that make an answer
a person's rather than an agent's. The privacy position on a public store listing is yours to stand
behind, and no amount of reading settles it. It is also the one entry in the PRD's risk table left
open rather than mitigated, and shipping a listing on an unconfirmed privacy position is the wrong
order.

## Why
**The two curated lists go stale and nothing says how they are kept current.**
`src/data/paywalls.json` and `src/data/ad-heavy.json` are bundled inside the extension. A site that
starts putting up a paywall stays undetected until somebody edits those files, and nothing anywhere
records who does that or when.

**What it costs.** The answer changes the permissions the extension asks for and the privacy notice
on the store listing, so a listing written before it is settled has to be rewritten. It is also the
one entry in the PRD's risk table left open rather than mitigated, and no submission can go out with
it open.

**How it came to be this way.** The PRD raised it as an open question and nothing since has forced
it, because the extension has never been submitted anywhere.

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
