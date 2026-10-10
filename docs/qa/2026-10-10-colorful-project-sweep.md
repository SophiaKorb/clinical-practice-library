# Colorful 2.0: project-wide QA sweep

**Date:** October 10, 2026  
**Branch:** `cpl-2-colorful-helpful` only. The retained production `main` branch was not modified.  
**Scope:** Site structure, navigation and assets, front-end behavior, key desktop/mobile layout, generated clinical topics, learning resources, and PDF structure. This is **not** a claim that every resource has received individual editorial, clinical-specialist, screen-reader, or user acceptance review.

## Inventory and test basis

The October 10 branch tree contained approximately **467 nonlegacy HTML files**, including preview material, and **45 nonlegacy PDFs**. Inventory representations differ by purpose: 156 records in `data/library.json`, 501 searchable entries in `data/clinical-finder.json`, and 150 expansion entries in `data/topic-expansion-ledger.json`. These are not equivalent counts of independently approved clinical resources.

The regular [site QA workflow](../../.github/workflows/site-qa.yml) now runs generated-content consistency checks; JavaScript syntax; local links and fragment targets; navigation; catalog and school parity; homepage behavior; Phase 8B clinical depth; practice tools; clinical finder; topic expansion; DSM Foundations questions/cases/semantics; basic accessibility lint; and **structural PDF/form validation**. The latest checked run with the additional PDF gate completed successfully.

The [rendered Chromium workflow](../../.github/workflows/phase-8b-rendered-qa.yml) now runs at **320, 390, 768, and 1280 px** for 14 existing high-priority Phase 8B/home routes **and** 6 additional flagship routes (DSM Foundations, visual reasoning, communication supports, treatment menu, finder, clinical-topic index). This is **80 route-width combinations**, with screenshot evidence. It includes interactive checks of DSM feedback and glossary, visual scale selection, keyboard disclosure, selected clear buttons, and print/PDF smoke checks.

- [Passing rendered mobile and print workflow](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38094976372)
- [Passing static and PDF QA workflow](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38095051487)
- [DSM course regression test](../../tests/dsm-foundations.cjs)
- [Flagship rendered smoke test](../../tests/colorful-site-rendered.cjs)

## Concrete defects and fixes in this sweep

| Finding | Severity | Action / verification |
| --- | --- | --- |
| Flagship visual support scale extended to 361 px at a 320 px phone viewport | P1, real mobile defect | Updated shared `resources/practice-learning.css` to allow three flexible columns and readable wrapped labels on narrow screens; the subsequent Chromium overflow assertion passed |
| DSM course lacked a permanent regression gate for 11 lessons, 99 answers, 33 worked cases and 33 glossary terms | P1, test coverage | Added a build-blocking DSM integrity and semantics test |
| High-traffic Colorful routes were absent from routine rendered-browser coverage | P1, test coverage | Added six representative routes and phone/tablet/desktop assertions to the rendered workflow |
| PDF structure/form consistency could regress without failing site QA | P1, test coverage | Added `pypdf` form/structural audit to every regular site QA run |
| `README.md` described the small September scaffold rather than the current application | P2, misleading project metadata | Updated branch, entry-point, privacy, QA, and clinical review guidance |
| `vercel.json` sent a stale `X-CPL-Deploy` September 23 label on all responses | P2, misleading HTTP metadata | Replaced with stable `X-CPL-Site: clinical-practice-library` |

The first attempts at new QA tests exposed two different issues. One was a **test-only wording assumption** about alcohol withdrawal (corrected without weakening the safety criterion); the other was the **real 320 px overflow** described above. Both were resolved and checked again.

## What these results do not establish

1. **Qualified clinical review is still required**, especially for suicide and self-harm, crisis care, complex dissociation/DID, personality disorders, psychosis/bipolar differentials, substance withdrawal, and medications. The Phase 8B pages explicitly retain their professional-review gates. A passing test does not make clinical advice safe or evidence-complete.
2. **All-page visual QA is not complete.** Twenty representative routes were rendered at four widths; that is not the same as visually inspecting every HTML page and PDF. The user-facing visual-tool standard remains: spatial structure should communicate meaning even when most explanatory sentences are removed.
3. **Accessibility validation is partial.** Source lint catches some labels, headings, alt attributes, and duplicate IDs; the browser tests exercise some keyboard controls. Full assistive-technology, color-contrast, focus-order, zoom/reflow, cognitive accessibility, and PDF-tag review are still required.
4. **PDF integrity is not PDF usability.** The parser checks readability and form fields but not visual clipping, reading order, usable touch targets, or whether every worksheet is genuinely visual.
5. **Native Spanish-language review and legal/regulatory currency** remain human review tasks. Jurisdiction-specific education/disability guidance and time-sensitive diagnostic/billing references must be checked against current primary sources before external distribution.

## Priority follow-up review gates

**P0:** Clinically qualified safety/specialist sign-off for higher-stakes guides and their printable companions; review acute medical escalation and differential decisions before broad clinical sharing.

**P1:** Human review of the flagship visual toolkit and highest-used client worksheets, including actual 320 px phone use, printouts, assistive technology, and whether visual structure works without paragraphs. Review age/role language and semantic color systems across other toolkits.

**P1:** Source verification and bilingual review for Spanish, disability, IEP/504, jurisdiction-specific pathways, and medication/SUD topics.

**P2:** Expand browser coverage to more generated topic and PDF layouts based on use and risk; add automated contrast checks and explicit report/print acceptance criteria; resolve residual duplicative or stale material when discovered.

**Release assessment:** **Preview remains suitable for supervised internal review, not an all-clear for broad clinical publication.** CI passing means technical regressions have been tested within the scopes above. Keep `main` intact until the requested clinical/visual quality gates are deliberately completed.
