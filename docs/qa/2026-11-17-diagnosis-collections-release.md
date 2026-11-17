# CPL diagnosis collections — owner-authorized release reconciliation

Date: November 17, 2026  
Parent production baseline: `7dd9ec3b97ebd79a1795d510282e9650722a306d` (PR #52).  
Candidate source: reviewed, separately preserved draft [PR #54](https://github.com/SophiaKorb/clinical-practice-library/pull/54) at `15a518d74807abff6e9328d454fcc4dc66241be8`.

## Exact scope

User authorized reconciling CPL work and deploying **larger collections for each diagnosis**. Release only diagnosis index/navigation and the substantial Adult ADHD guide, not unrelated draft search, referral, eligibility, PDF or clinical-content changes. PR #54 stays preserved; this release branch is derived from its exact passing checkpoint.

- Full 14-category diagnosis/clinical-topic **index of all directly tagged records** in the existing 615-entry finder. It is **not** a claim that every possible cross-diagnostic resource or independently certified treatment is listed.
- Preserve all 615 original records, 77 publisher entries, 24 direct school/family/clinical guides, original topic collections and source clinical bodies. No third-party provider age/contact or eligibility changes.
- Comprehensive Adult ADHD page spans assessment/differential, prescriber boundaries, multimodal care, functioning, home/work/relationships, outcomes and 19 direct ADHD records + 12 carefully labeled related cross-diagnostic supports. Other 13 topic pages are full **resource indexes**, not yet 13 new comprehensive clinical manuals.
- Homepage 8 diagnosis cards and an explicit "browse all 14" link; clinical topic collection index also links to the complete diagnosis catalog. All original 24 guide routes link back to full indexes.
- Draft-specific `noindex,nofollow` removed **only** from the two owner-authorized new release pages. The wording of the related-support section is diagnosis-neutral, not misleadingly ADHD-specific.
- Canonical resource finder and classic finder left intact. New diagnosis hubs do not require merging draft [PR #53](https://github.com/SophiaKorb/clinical-practice-library/pull/53) or [PR #55](https://github.com/SophiaKorb/clinical-practice-library/pull/55). Their 108 page-specific indexing corrections, Spanish duplicate handling and search UX improvements remain review-only; both may need future rebasing and source conflict review. Other open visual/clinical/rights draft branches also remain unmerged.

## Clinical and evidence boundaries

Original Adult ADHD educational references independently checked against live official sources: [CDC, October 9, 2026](https://www.cdc.gov/adhd/about/adhd-in-adults.html), [NIMH](https://www.nimh.nih.gov/health/publications/attention-deficit-hyperactivity-disorder-what-you-need-to-know), [NICE NG87](https://www.nice.org.uk/guidance/ng87/chapter/recommendations), [AADPA guideline](https://adhdguideline.aadpa.com.au/), [JAN](https://askjan.org/disabilities/Attention-Deficit-Hyperactivity-Disorder-AD-HD.cfm). These primary pages support major themes but independent full specialty clinical validation, legal/accommodation applicability and current medication contraindication review remain human gates; no specific treatment advice is inferred from a mere catalog tag.

## Exact-head release QA

- `tests/diagnosis-resource-hubs.cjs`: 14 source facets; ADHD 19/19, related 12; original 24 guides; eight home diagnosis cards; local link/anchor integrity.
- `tests/diagnosis-release-reconciliation.cjs`: no draft-only robots tags; explicit 14-category navigation, diagnosis-neutral language, immutable existing 615/77 source records.
- `scripts/qa/diagnosis-hubs-rendered.cjs`: existing desktop/mobile/keyboard/axe/print CSS/forced-colors and ADHD/autism checks.
- `scripts/qa/diagnosis-all14-rendered.cjs`: **all 14** source-tag categories at 1280/390/320 CSS px, each exact set of source URLs, group counts, absence of overflow/JS errors; homepage and clinical topics entry links.
- Existing site, school-guide parity, age/role clinical finder and historic resource link suites must remain green.

## Still open (not implied by deployment)

User owner authorized the *publication of the diagnosis collections*. This does not constitute completed independent specialty clinical review, bilingual linguistic review, publisher rights re-clearance, source-by-source program eligibility verification, native NVDA/VoiceOver/TalkBack, actual browser 200%/400% zoom, physical grayscale print, tagged PDF/PDF-UA or approval to merge unrelated drafts. Handle corrections to these areas in isolated review branches and obtain appropriate approval before expanding published clinical claims.

## Postrelease verification required

Require exact-GitHub-main SHA match to Vercel production READY target and alias `clinical-practice-library.vercel.app`; verify live new routes, each of 14 topic queries, at least all 8 home cards and main guide, and record any limited independent HTTP checks without claiming more.
