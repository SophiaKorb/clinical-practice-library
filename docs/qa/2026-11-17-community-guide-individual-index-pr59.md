# CPL community guide individual indexing — PR #59

**Status:** Review-only, unmerged, undeployed. Exact review branch: `review/community-guides-individual-search-20261117`.

## Source boundaries
- Original October 23, 2026 Family & Parenting Guide: 170 numbered entries, some cross-references; source text companion `resources/community/family-community-guide-text.html`.
- Original October 25, 2026 Youth & Transition-Age Guide: 27 independently headed navigator entries; source text companion `resources/community/youth-community-guide-text.html`.
- Approved original designed PDFs remain unchanged in the source archive. No third-party source texts or new provider links were synthesized.

## Implementation
- 197 indexed records appended after the immutable original 615-item catalog; 812 total.
- Stable fragment targets in both source text companions, with one link per indexed listing.
- Individual result titles, source-specific descriptions, and controlled search keywords.
- Two optional filters in live finder: community collection (family/transition-age), and exact place named in the listing.
- Locality is attached only when the entry's title/description explicitly names the place; unclassified locations are not assigned to Tucson or Pima/Pinal County.
- School-age and adult discovery are not a certification of program eligibility; birth-to-five tags and select 18+ youth entries are narrowed using stated source scopes.
- Original classic finder and published 615 records remain byte-preserved as a prefix. No changes to original PDF masters.

## Verification
- Source reconciliation: 170/170 numbered family entries, 27/27 youth headings, 197/197 matching anchors, zero duplicate catalog URLs, original 615-record JSON prefix unchanged.
- Test coverage `tests/community-guide-individual-index.cjs`: title and anchor parity, metadata scope, search journeys, source-grounded collection/location filters, adult/teen age examples.
- Full static QA and rendered keyboard/axe/responsive/print CI must pass on the **same final head**. Never reuse a prior successful workflow result as if it certified subsequent modifications.
- Previous fully passing comparison head `198d81a4a28d81043e7186be6ac0ba115446994e`: site QA run 44151715392 SUCCESS; rendered run 44151715328 SUCCESS, including 150 inherited checks, 209 combined checks, no violations at sampled 1280/390/320 viewport sizes and the 14 diagnosis hub samples. Subsequent changes require new exact-head verification.

## Review gates
- **Clinical/program eligibility:** titles, broad stage labels, cost/coverage, referral contacts, actual age limits, transportation, current service areas and provider intake must not be treated as verified until checked with official current provider records.
- **Accessible use:** automated axe and responsive screenshots are not a substitute for native screen-reader and keyboard assistive technology review, true whole-page zoom, or physical grayscale print.
- **Rights:** original PDF permissions remain separate from index metadata and source-linked fragments.
- **Owner release:** explicit merge/deploy authorization required. Do not publish based on machine-only QA.
