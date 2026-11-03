# CPL visual-access replacements — controlled review (24 October 2026)

## Branch and release boundary
- Branch: `review/line-art-visual-tools-2026-10-24` (created from `main`)
- Review page: `resources/therapy/communication-line-art-review.html`
- **Standalone draft; no production page, routing, data, treatment plan, existing branch, or deployment modified.**
- Do not merge, deploy, link into production navigation, or replace existing clinical content without explicit approval.

## First-wave replacement deliverables (17 printable supports)
1. Supported Communication Options
2. Repair the Message
3. What Helps Me?
4. First → Then → Next
5. Change Board — Usually / Today
6. Visual Dictionary (conversation scaffold, **not** an AAC system)
7. Barrier → Support Matcher
8. Getting Started
9. Try → Notice → Tell
10. Routine Map
11. When Things Feel Too Much
12. Notice Early Signs
13. Words That Help
14. Two Perspectives
15. Choice and Assent Support
16. Supported Consent — Information Map
17. Reusable Picture Cards

## Design standard
- Adult-respectful, child-accessible black line art; no exaggerated characters, decorative emoji, or misleading abstract graphics.
- 42 simple shared vector symbol definitions and 99 illustrated occurrences. Symbol *meaning* remains paired with a written label.
- Same core symbol reused across tools (for example school/home/playground/doctor; help/break/change).
- Action-oriented contrast: `USUALLY → TODAY` shows a **changed activity**, distinct from `FIRST → THEN → NEXT` ordering.
- US Letter, white background, gray rules, generous vertical spacing; no large ink-heavy panels.
- Printable directly from the draft HTML with its Print button. Selectable text and scalable native inline SVG graphics.
- The examples demonstrate options, not diagnostic, evaluative, or compliance judgments; respect communication methods, refusal and autonomy.

## Verification completed in working environment
- Review HTML structurally checked: 17 `.worksheet` sections and 99 inline SVG drawings.
- Compiled PDF rendered to **exactly 17 US Letter pages** using the review-page print styles.
- All PDF pages contain selectable text and words fall within page boundaries.
- Grayscale-compatible line artwork inspected on representative pages, including communication routes, change board, choice/assent, consent and cut-out symbols.
- Checked use of `aria-hidden` on decorative SVGs paired with text labels.
- Confirmed the GitHub branch contains the review HTML; no changes to main or to existing CPL visual tool pages.

## Remaining human verification before adoption
- Clinician and SLP review for acquired aphasia, supported consent, communication access and accessibility assumptions.
- Independent label-to-picture comprehension checks, particularly **point/gesture, help, pause, together, quiet, and abstract states**; offer personal photos or the user's established AAC vocabulary when better.
- Browser QA at mobile widths, high contrast, screen reader reading order, large-print conditions, and actual office-printer grayscale copies.
- Test whether particular boards are too dense or too sparse for intended users. The fixed-size example should never be treated as a universal communication board.
- Compare each replacement against the current CPL function; preserve any scenario-specific details or safety notes before replacing links.
- Crosswalk the rest of CPL's visual-reasoning, topic-level aphasia, autism and handout tools separately. **This is a first-wave set, not a claim that all CPL visual tools have been replaced.**

## Proposed controlled next steps
1. Review all 17 drafts and select which existing tools each one supersedes.
2. Revise mismatched symbols and age-neutrality issues based on comprehension/clinical feedback.
3. Add semantic one-to-one links from existing CPL tools to approved replacements on this branch only.
4. Run automated accessibility, print, mobile and navigation regressions, then request human approval.
5. Keep `main`, active production aliases, and experimental branches untouched until explicit release approval.
