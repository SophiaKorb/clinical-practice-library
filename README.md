# Clinical Practice Library (CPL)

Clinical Practice Library is a browsable collection of therapist guides, functional and assessment supports, shareable family materials, clinical learning pathways, and interactive visual tools. The resources are educational decision supports. They do not replace individual assessment, current diagnostic criteria, professional training, or local safety procedures.

## Current branches

- **`main`**: retained legacy production. Keep it available and do not mix unfinished Colorful 2.0 changes into it.
- **`cpl-2-colorful-helpful`**: expanded Colorful 2.0 preview, including the DSM Foundations course and the Phase 8 / Phase 8B materials. Preview publication is **not** a claim of professional clinical review.

## Entry points

- [Home](index.html)
- [Browse all resources](resources/index.html)
- [Clinical resource finder](resources/clinical-resource-finder.html)
- [Clinical topics](resources/clinical-topics/index.html)
- [Clinical depth decision guides](resources/clinical-depth/index.html)
- [Visual reasoning toolkit](resources/therapy/visual-reasoning-toolkit.html)
- [Communication supports](resources/therapy/communication-supports-toolkit.html)
- [Treatment planning menu](resources/therapy/treatment-plan-menu.html)
- [Learning center](resources/training/workforce-learning-center.html)
- [DSM Foundations](resources/training/dsm-from-zero.html)
- [Assessment entry point](resources/assessment/assessment-start-here.html)

## Content structure

The repository contains current authored pages, generated clinical-topic pathways, Spanish-language supports, downloadable PDF companions, public resource metadata, and a preserved `legacy/` snapshot. Resource inventories differ by purpose: `data/library.json` is a selective catalog; `data/clinical-finder.json` indexes a broader searchable set; `data/topic-expansion-ledger.json` accounts for the Phase 8 expansion. Do not treat any one count as the total amount of independently clinically reviewed material.

Authoritative source/quality information and gap tracking live in `docs/qa/`, `data/topic-evidence-registry.json`, and `data/phase-8b-gap-matrix.json`.

## Testing

On every branch push, GitHub Actions runs [CPL site QA](.github/workflows/site-qa.yml), which checks generated content integrity, internal links and fragments, JavaScript syntax, navigation, basic accessibility, search, selected interactions, and other resource-specific regressions. [Rendered browser QA](.github/workflows/phase-8b-rendered-qa.yml) uses Chromium and printable output for selected high-traffic pages at phone, tablet, and desktop widths.

Source checks and automated browser tests are **not** a substitute for screen-reader testing, individual worksheet usability studies, systematic guideline appraisal, or qualified clinical review. High-stakes original material should remain review-gated until an appropriate expert has approved it.

## Privacy and intellectual property

No protected health information, completed assessment records, proprietary test manuals/items, or unauthorized copyrighted full-text documents belong in the public repository. See [privacy and copyright boundaries](docs/PRIVACY-AND-COPYRIGHT.md), [contribution guidance](CONTRIBUTING.md), and [project status](STATUS.md).

## Publishing rules

Keep changes intended for the redesign on `cpl-2-colorful-helpful`. Verify builds, local navigation, semantic labels, phone geometry, print output, and clinical warnings before publication. The retained live legacy version on `main` must stay untouched unless expressly requested.
