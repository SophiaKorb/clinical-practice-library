# CPL full 12-tool visual review — rendering and semantic QA (25 October 2026)

**Artifact:** `resources/therapy/visual-access-12-tool-reference-review-2026-10-25.html` (standalone self-contained review page). **Status: draft reference edition, not approved to replace clinical content.**

## Source contents
Exactly **12 distinct tools**, in the user's approved reference order, across **13 US Letter sheets** because the Visual Dictionary has two pages:
1. Change Board — Usually / Today
2. Visual Dictionary — What happened / What I felt / What might help (two sheets)
3. Barrier → Support Matcher
4. Getting Started
5. Two Perspectives
6. First → Then → Next
7. What Helps Me?
8. Try → Notice → Tell
9. Routine Map
10. When Things Feel Too Much
11. Notice Early Signs
12. Words That Help (**once**, with corrected heading and example phrases; classified as a partner reference, not AAC)

## Improvements and semantics
- Canonical line drawings are defined once and reused across all occurrences in this page.
- **TODAY = calendar**, **MORE TIME = clock**, **WAIT = hourglass**, **BREAK = pause**, **STOP = octagonal stop**, **SAME = equals**, **NOT AVAILABLE = slashed circle**. These meanings are not interchanged.
- Corrected a literal `{icon(...)}` source-template error on the Routine Map before print.
- Corrected misleading drawings: **overwhelmed** is not an unrelated crossed shape, abdominal discomfort no longer uses a facial-confusion icon, **tense hands** is not an open waving hand, and **speak less** is distinct from an ordinary speech bubble.
- Change Board preserves both unchanged routine symbols and a visible before/after changed pair. It is separate from First → Then → Next.
- Visual Dictionary allows indicating multiple possibilities, and instructs the partner to verify meaning instead of diagnosing subjective states.
- Tools intentionally allow alternatives/refusal where applicable; partner-facing notes and client-facing selection supports remain distinct.

## Automated and rendered QA
- 13/13 US Letter color PDF pages rendered with selectable text and working SVG artwork. Every page has a footer and **no text bounding boxes outside page bounds**.
- 13/13 monochrome PDF pages generated **without flattening page text**; channel-equality test on pages 1,2,3,7,10,13 shows grayscale imagery.
- Tested screen widths **320, 375, 600, 768, 900, 1200, 1440 px** with no horizontal overflow or missing bitmap images.
- 67 interactive choice tiles; click selection and reset state verified.
- **12 separately printable PDFs** generated locally. Visual Dictionary is the one two-page tool.
- Full contact sheets inspected after output; no repeated 12th tool or garbled headings.

## Remaining approval gates
- Symbol recognition **without captions**, especially abstract meanings and paired alternatives, should be tested with intended users and preferred communication systems.
- Qualified clinician/SLP review of supported communication, assent, partner behavior, and trauma/sensory supports.
- Physical B&W print tests, independently assessed keyboard/screen-reader reading order, large-print/CVI variants, individualization of text/photos.
- Existing CPL has **17 separate communication-support tools**, some with distinct functions. This 12-tool set is an additional design/reference package and not a one-to-one replacement for that original inventory.

## Release restrictions
Do not merge, deploy, change production navigation, production aliases, `main`, D1 or experimental branches. Do not replace original CPL tools without explicit user approval.


## Subsequent technical QA addendum — November 11, 2026 (separate review branch)

**Branch:** `review/cpl-visual-accessibility-20261111` (forked from draft PR #21 at `b6f1e67167c00a2b162bcdd08dbdb96c393e7776`). This addendum is review-only and does not modify PR #21 or the published site.

Source inspection found 13 nested/repeated `<main class="pagebody">` landmarks and no first-tab skip link. It also found that the previous "Print current" implementation selected an individual *sheet* rather than a *tool*, omitting part of the two-page Visual Dictionary.

Technical changes:
- One page-wide `<main id="main-content" tabindex="-1">` with 13 internal `.pagebody` containers; visible skip-to-tools link before toolbar, hidden during printing.
- Twelve distinct keyboard-accessible tool selector options (the Visual Dictionary is labelled "2 pages"); selecting it scrolls to the first sheet.
- "Print current" selects both Visual Dictionary pages; "Print all" selects every sheet; afterprint resets selection. Reduced-motion preferences are respected for tool jumps.
- The 67 choice buttons and all existing SVG pictograms/images, labels, sheet order, and client/partner guidance are preserved.
- New static and local-rendered Chromium regression scripts check main/skip, keyboard interaction, viewport overflow, tool mapping, PDF page counts, print hiding and reset.

**Verification:** The source-level + rendered technical review at commit `ccd15de83852a91431bd113963e0d260ea1a0e09` passed [site QA 43158853504](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43158853504) and [Chromium QA 43158853478](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43158853478). The runner logged keyboard/selection checks at four widths and PDF counts 2 / 1 / 13; see `docs/qa/2026-11-11-visual-accessibility-qa.md` for failure/retest history and limitations. Any further commits require their own exact-head verification. A green job cannot clear manual screen-reader navigation, qualified clinician/SLP symbol comprehension, access method validation, physical monochrome printing, large-print/CVI, licensing/provenance, or publication authorization.

**Deployment:** new branch is created directly at a commit with `git.deploymentEnabled:false` so that no unguarded review-branch push can trigger a Vercel auto-preview. This branch-local control must not be merged into production without separate authorization.
