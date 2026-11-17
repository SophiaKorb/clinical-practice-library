# ADHD companion format presentation — isolated review
Date: 2026-11-17
Branch: `review/group-adhd-companion-formats-20261117`

## Problem and intended hierarchy
The static Adult ADHD guide presented the topic-starts collection, care-partner guide, workbook, formulation guide, interactive case, progress review, visual map and PDF as eight visually equal cards. They are **one toolkit with companion formats**, not eight unrelated programs.

## Implementation
- `resources/diagnoses/adult-adhd.html`: one prominent full-width "Task starts & external scaffolds" toolkit card, containing seven shorter companion-format links in a labelled navigation area. Preserve **all eight exact original URLs** and the original nineteen ADHD-tagged source links.
- `resources/diagnoses/adult-adhd.css`: compact nested links with deliberate typographic hierarchy, keyboard focus, narrow-screen stacking, high-contrast print.
- `resources/diagnoses/diagnosis-hubs.js`: group exactly the same eight original URLs in one toolkit card in the dynamic ADHD diagnosis index; include the PDF alongside the HTML tools rather than separating it into a generic worksheet card. Keep the independently searchable records untouched.
- `resources/diagnoses/diagnosis-hubs.css`: matching responsive bundled-card layout; other diagnoses remain unchanged.
- `tests/diagnosis-resource-hubs.cjs`: assert eight unique original companion links within one static card, preserving all nineteen unique source URLs.
- `scripts/qa/diagnosis-hubs-rendered.cjs`: verify static directory has twelve top-level cards and nineteen links; dynamic ADHD index has forty-three top-level cards and fifty links, including eight grouped companion URLs; keyboard access and existing responsive/axe checks.

## Data and clinical boundaries
No changes to the canonical 813-record catalog, the thirty-one supplementary ADHD index records, clinical guidance, program eligibility, treatment materials, PDFs, or resource destinations. This is a presentation-only adjustment: source entries remain individually retrievable by relevant searches. Clinical, rights and native assistive-technology review gates are unchanged.

## Verification
The initial source head `bd6c91c3` passed [site QA](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44171787393) and [rendered keyboard/print QA](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44171787410). Reviewed rendered screenshots at 1280px and 390px: single card and contextual companion navigation confirmed, no serious/critical automated axe findings, keyboard focus visible. Noticed the inherited `.article li{max-width:80ch}` constrained the static card to a shorter width; corrected with an explicit full-width override and a browser regression assertion. **Final post-refinement exact-head QA must be checked before release**. Keep this draft branch isolated until authorized to merge and deploy.
