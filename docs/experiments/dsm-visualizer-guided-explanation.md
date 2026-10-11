# DSM Symptom Constellation: guided-explanation experiment

**Branch:** `dsm-visualizer-guided-explanation` (isolated from `main` and `cpl-2-colorful-helpful`)

**Direct interactive page path:** `/resources/therapy/dsm-structure-4d.html`

## Purpose

Keep the original 3D symptom constellation intact for discussion and demonstration while presenting a clearer educational interpretation for clinical learners. The 3D computation and canvas interaction script were copied unchanged from the original implementation at commit `935f1f5b5a467e949f1c419055997698585b3cd9`.

The branch adds a concise explanation before the map, then a layered reading guide with four interpretive principles, three suggested experiments, and expandable limitations and methodology.

## Reader goals

1. Recognize that hand-authored 0–3 ratings of 26 features for 38 example profiles generate the displayed positions, not measured patient data.
2. Understand that the 3D map displays patterns, that the smoothed terrain represents neither diagnostic boundaries nor prevalence, and that projected distance discards information.
3. Distinguish the normalized relative pattern from symptom intensity, and distinguish both from functional interference.
4. Avoid treating cosine-ranked examples as likely diagnoses; instead ask follow-up questions about onset, time course, episodes, developmental context, medical/substance causes, trauma and exclusions.
5. Use the original 3D controls, 2D mode, fictional case builder and comparison panel.

## Boundaries and QA

- This is an educational experiment, not a clinically validated or approved assessment tool.
- No patient information should be entered.
- Original JavaScript and geometric controls are unchanged; the editing pass adds HTML and CSS plus clarifies surrounding copy.
- Branch-local smoke checks: `node tests/dsm-structure-smoke.cjs`, triggered by `.github/workflows/dsm-visualizer-guided-qa.yml`.
- Browser rendering, screen-reader usability, mobile touch behavior, and clinical-review sign-off remain separate QA gates.
- No merge to `main` or `cpl-2-colorful-helpful` is intended without review.
