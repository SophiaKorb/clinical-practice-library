# DSM Foundations complete print-book — QA checkpoint
**Date:** 2026-10-13
**Status:** New **83-page technical review candidate**, not a released/clinically signed-off publication.
**Branch:** \`cpl-2-colorful-helpful\`. Source generator: \`scripts/build-dsm-foundations-book.py\`. Workflow: \`.github/workflows/dsm-foundations-book.yml\`. Canonical curriculum: \`resources/training/dsm-from-zero.html\`. Original 50-page print draft and 19-page workbook remain unchanged.

## Actual deliverable
The build creates an intentionally typeset, US Letter **83-page** educational book, *not a browser print of the website*. It includes:
- **11 complete course chapters** with lesson prose and contextual explanations (including expandable educational sections transcribed into print).
- **33 named, four-stage worked cases** with interpretations and takeaways. Each of the 132 four-stage case bodies matched the source in a passage-level extraction test.
- **11 ink-friendly relationship concept maps** (45 named node labels and 45 explanatory node texts, adapted from the course HTML).
- **33 glossary terms and 33 definitions**.
- **80 question stems, 249 answer options**, two lines of writing space for each question, eight explicitly marked select-all items, and a **separate instructor answer-key section** with every correct response's source feedback.
- Diagnosis-related functional documentation worksheet and sources/release boundary page.

## Print QA actually performed
- **PASS**: 83 pages, US Letter 612×792 pt, readable/searchable text on every page, 130 outline/bookmark entries, no out-of-page text bounding boxes and no near-empty page (defined here as <150 extracted characters).
- **PASS**: Source/print parity: 33 case titles, 132 case-step paragraphs, 45 concept node titles, 45 concept text nodes, 33 vocabulary terms, 33 definitions, all 80 stems, all 249 answer options, six Maya/Eli context statements, and relevant nested personality-disorder and SUD safety wording. One introductory personality paragraph did not match a *literal first-45-character substring* because inline emphasis changed spacing; the actual teaching paragraph is visually present.
- **PASS**: Contact sheets covering every page were examined, along with higher-resolution spot checks; after eliminating a blank page and consolidating short closing notes, final page 83 was rerendered and checked visually. No text clipping or obvious visual collisions found in these checks.
- **PASS**: PDF opens in PyMuPDF; not scanned; no encryption; no XFA. Minimum size in sampled text runs is approximately 9.3 pt; source text is retained as actual text rather than flattening to images.
- **Local review PDF SHA-256:** \`a591e9a22e6364c7c8e2612ccfc46825fdc999cac40b9d955391f6f26668b161\`.
- **Automated regression available:** \`tests/dsm-print-book-parity.py\` checks core textual completeness; the dedicated workflow also checks counts, page bounds, and bookmarks. The workflow has been committed to the development branch, **but its latest GitHub Actions execution result was not independently retrieved and should not be called CI green yet**.

## P0 omissions caught and repaired during the rebuild
The initial textbook generator lost nested content while passing simple chapter/case counts. The omission affected the chapter 4 personality-disorder teaching section, the chapter 5 six-question checklist, SUD criteria, severity and overdose/withdrawal safety material in chapter 7, Maya/Eli contextual learning content in chapter 8, and the in-depth chapter 10 diagnosis-versus-identity and usefulness discussion. Rebuilt using a generic nested-content renderer, then added a passage-level regression gate so a simple count cannot mask future loss.

## Remaining non-technical publication gates
1. **Independent qualified DSM-5-TR clinical editorial signoff** for every chapter, scenario and question (including current criteria, exceptions, differential context and safety, not just a source-text parity check).
2. **PDF accessibility release:** This candidate has selectable text and bookmarks, but the PDF is **untagged** (\`/StructTreeRoot\` absent), is not PDF/UA certified, and has not received real human screen-reader/assistive-technology testing. The full HTML course is a separate alternative, not a linked or verified accessible replacement for this PDF.
3. **Human print proof at actual scale**, checking legibility, contrast, ink, double-sided binding/gutter, page breaks, link usability, and consistency. Contact-sheet inspection plus programmatic geometry checks are not final signoff.
4. **Preserve production stability**: no public deployment and no replacement of published downloads has occurred. Release needs separate approval.

The earlier short print draft was **not** silently overwritten. A corrected 19-page written-response workbook from a previous QA pass also remains available as a separate companion; the new PDF contains the canonical interactive 80-question set with justification space and its own key.
