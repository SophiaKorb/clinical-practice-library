# Clinical Practice Library

A searchable, shareable clinical resource catalog for clinicians, interns, trainees, patients, caregivers, and school-support work.

## Current build

This repository contains a working static web interface plus structured metadata for:

- 95 Clinical Research Core records
- 31 assessment and screening-tool records
- 126 indexed records total
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

1. 00 START HERE
2. FIND A RESOURCE
3. 01 Families & Children - Trauma
4. 02 Parent & Patient Education
5. 03 School - IEP & 504
6. 04 Clinical Practice - Therapist
7. 05 Intern & Trainee
8. 06 Assessments & Screening Tools
9. 07 Arizona
10. 08 California
11. 09 ESPAÑOL

## Repository map

- index.html: application shell
- styles.css: responsive styling
- app.js: search, filters, sorting, deep links, and export
- data/library.json: normalized public resource metadata
- data/taxonomy.json: library taxonomy
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
