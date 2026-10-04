# Clinical Practice Library

A searchable, shareable clinical resource catalog for clinicians, interns, trainees, patients, caregivers, and school-support work.

## Current build

This repository contains a working static web interface plus structured metadata for:

- 95 Clinical Research Core records
- 31 assessment and screening-tool records
- 8 Arizona Barrier Support school-toolkit records
- 21 clinical handout collection records
- 155 indexed records total
- the established library architecture for clinical, family, school, trainee, assessment, Arizona, California, and Spanish-language resources

The site is designed to run directly from GitHub Pages without a build step.

## What belongs here

Public-facing metadata, legitimate source links, author-created shareable materials, navigation, clinical cautions, evidence notes, and resource indexes.

## What does not belong here

- PHI or client-specific documents
- completed protocols or scored client forms
- restricted test items, manuals, or proprietary scoring content
- copyrighted full-text PDFs unless redistribution is explicitly permitted
- unofficial copies of commercial measures

The research catalog preserves canonical filenames and retrieval status so the separate PDF collection can remain curated without placing the PDFs in a public repository.

## Library architecture

1. START HERE
2. FIND A RESOURCE
3. Families & Children - Trauma
4. Parent & Patient Education
5. School - IEP & 504
6. Clinical Practice - Therapist
7. Intern & Trainee
8. Assessments & Screening Tools
9. Arizona
10. California
11. ESPAÑOL

## Repository map

- index.html: stable audience/topic shelves and need-based entry points
- tools/index.html: searchable catalog
- resources/handouts: original web worksheets and guides
- data/stable-worksheets.json: shared content for Grief Map, Personal Care, and After-School Reset
- scripts/build-stable-worksheets.py: matching web and editable PDF generation
- scripts/check-library-links.py: local URL, asset, and fragment checks
- styles.css: responsive styling
- app.js: search, filters, sorting, deep links, and export
- data/library.json: normalized public resource metadata
- data/taxonomy.json: library taxonomy
- data/pathways.json: clinical-question decision-support pathways
- data/assessment-gaps.json: de-identified verification backlog
- STATUS.md: current build coverage and next content waves
- docs/METADATA-SCHEMA.md: field definitions
- docs/INGESTION-GUIDE.md: how to add resources safely
- docs/PRIVACY-AND-COPYRIGHT.md: publication boundary
- docs/DEPLOYMENT.md: GitHub Pages setup
- CONTRIBUTING.md: contribution rules

## Source-of-truth rules

The 95-item research core remains selective. Interesting new papers do not automatically enter the core. Canonical articles are not replaced with reviews unless explicitly designated as companion sources.

For assessments, possession of a file is not the same thing as authorization to copy, administer, score, or distribute it. The public catalog stores decision-support metadata and links, not protected test content.

## Status

Initial public catalog scaffold created September 22, 2026.

## Stable release checks

```sh
python scripts/check-library-links.py
node scripts/check-school-guide-parity.js --self-test
node --check navigation.js
node --check resources/visual-tools.js
```

To rebuild the three stable worksheet conversions, install ReportLab and pypdf, then run `python scripts/build-stable-worksheets.py`. The generator embeds its fonts, preserves existing Grief Map and Personal Care download names, and creates blank two-page templates. Run `python scripts/check-stable-worksheets.py` afterward; `--samples /path/to/scratch` also checks synthetic filled copies on both pages. Do not commit completed forms.

Production changes require explicit approval. Prepare stable fixes from `main` on a separate branch; keep `cpl-2-colorful-helpful` separate. P1.5 remains deferred.
