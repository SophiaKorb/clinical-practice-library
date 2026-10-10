# Phases 8–9 development checkpoint

## Wave 1 — built, publication verification pending

Wave 1: 30 original resources across five topics: bipolar episodes, voices/coping, sleep loss/activation, panic, social anxiety. Six distinct purposes each: clinician formulation, interactive fictional case, visual support map, client workbook, care-partner guide, functional progress review. Five original PDF companions and six collection/index pages are excluded from the count. Target remains 150.

Evidence registry: `data/topic-evidence-registry.json`; inventory/count ledger: `data/topic-expansion-ledger.json`. Source access is explicit: NIMH/AASM full retrieval, NICE index verification with limited full recommendations access. The OCD/BDD update remains a draft/in-development source and is not substituted for published guidance. All original examples/maps are unvalidated. Qualified clinical review pending.

Clinical repairs: personality toolkit now describes reliable, collaborative, proportionate crisis response, continued access to help, and clear provider responsibility without assigning motives or withholding support.

QA: 30 purposes, six types/topic, unique paths, citations, three distinct case options/topic, five map stages/topic, four monitoring indicators/topic and feedback selection state checked. Five one-page PDFs rendered and visually inspected; 41 total PDFs structurally valid. Existing regression suite must pass before publication. No browser/control-browser capability; no actual HTML rendering, mobile geometry, screen reader, real keyboard traversal or print-dialog verification claimed. Live HTTP verification follows deployment and does not substitute for these checks.

Legacy main SHA must remain `2b8c5ba1d66fa397548c9c10a006d764d8c1018b`. Publish only `cpl-2-colorful-helpful`.

Next waves: anxiety/depression/trauma/grief; eating/neurodevelopment/communication; learning/disability/tics/BFRB/BDD; health anxiety/pain/insomnia/behavior/family. Continue implementation without cosmetic count padding.

## Wave 1 — published and HTTP verified

Commit `277a6b4fa04d7ad558bb1aad52e047a1931caf58`; deployment `dpl_4SVeoLvTUnigGSoVUVVhqZkUCVfT` READY at https://clinical-practice-library-kmohtn7ms-cohon-family.vercel.app. All 30 resource URLs plus topic index, shared CSS/JS, finder and representative PDF returned HTTP 200 with expected content. See `docs/qa/phase-8-wave-1-live.json`. Production remains READY at original main SHA.

## Wave 2 — built, publication pending

Additional 30 distinct resources for OCD mental rituals, depression activation, trauma cues, dissociation/function and child grief. Total 60/150; ten PDF companions excluded. No memory-recovery, forced grounding, treatment exclusion based solely on dissociation, or diagnosis from intrusive content. Clinical peer review remains pending. 60-purpose regression, 46-file PDF integrity audit and 344-page source accessibility audit pass. Five new PDFs rendered for visual inspection.

## Wave 2 — published and HTTP verified

Commit `0f20fc60d0dda568753c39ea43fe222bac361417`; deployment `dpl_HUqYm8L4nzykFMyXn4hLEhdx9nTU`, READY at https://clinical-practice-library-rk35o6es8-cohon-family.vercel.app. All 30 new resource URLs and five new PDF downloads returned HTTP 200 with expected content. Evidence: `docs/qa/phase-8-wave-2-live.json`.

## Wave 3 — built, publication pending

30 more distinct resources: restrictive-eating coordination, binge-eating patterns, adult autism load/recovery, adult ADHD task starts, acquired aphasia communication access. Total 90/150; 15 PDF companions excluded. Medical stability is not inferred from body size; ARFID source-coverage limits are explicit. Aphasia does not imply incapacity. New discovery facets include eating, sleep, grief, intellectual disability, tics/repetitive behaviors and bodily concerns.

90-purpose regression, 51-file PDF integrity audit, 379-page source accessibility audit, finder scenarios and 6,346 local references pass. All five new PDFs rendered/visually inspected; qualified clinical and browser QA remain pending. PDF generation now uses deterministic metadata for reproducibility.

## Wave 3 — published and HTTP verified

Commit `0c3332bf87e8a813e2233e46ec1242548aab71e5`; deployment `dpl_34zMqTnuTMTyRZSjFNa8NX3yZqUu`, READY at https://clinical-practice-library-16i9sm7v6-cohon-family.vercel.app. All 30 new pages and five PDF download URLs returned HTTP 200 with expected content. See wave-3 live QA JSON.

## Wave 4 — built, publication pending

30 more resources: learning instruction/access, intellectual-disability supported choice, tics impact/CBIT referral, BFRB awareness/support and body-dysmorphic checking. Total 120/150; 20 PDF companions excluded. Original diagnosis collections retain all paired supports and gain clearly age-labeled extensions; new topic pages link back to originals. Full compact topic shelf added to subject index and both catalogs.

120-purpose regression, original-guide parity, homepage/catalog/finder tests, PDF structure, source-accessibility and local-link checks pass. All five new PDFs rendered/visually inspected. No automated clinical approval claimed.

Wave 4 repair: original-guide parity initially failed because it required the old author spelling. The assertion now accepts the current full byline and retained short form while still requiring exactly one. Rerun verifies all 292 paired supports. The learning diagram now places instruction/access on parallel branches, rather than implying sequential delivery.

## Wave 4 — published and HTTP verified

Commit `b0a102308dbc36dbe3cb9aa390e111bfa3faa9c2`; deployment `dpl_CGFHnFM3gVyCQMBcR59FmnvVLdW9`, READY at https://clinical-practice-library-ofmy1cupf-cohon-family.vercel.app. All 30 new pages and five PDF downloads returned HTTP 200 with expected content. Evidence: wave-4 live QA JSON.

## Wave 5 — built, final QA/publication pending

30 additional resources: health anxiety/medical plan, chronic pain/pacing, insomnia/CBT-I readiness, child aggression/caregiver support and sibling power/safety/repair. Total 150/150 distinct resources in 25 sets. Count excludes all 25 PDF companions, collection indexes, evidence/ledger files, shared assets, original-guide links and crisis-wording repairs.

Additional QA repairs: practice-option order varies deterministically to avoid a universal middle answer; clear now resets case choice/feedback and notes; intellectual-disability assessment-planning questions are explicitly for the interviewer/team. No case certifies clinical competence. Workforce center links to topic practice.

## Reproduction and review needs

Run `python scripts/create-topic-pdfs.py --waves 5`, `python scripts/build-topic-expansion.py --waves 5`, inventory, finder generator and inventory again. Sources are authored in `scripts/expansion-topics.py`; the ledger records every counted path, purpose, wave and sources. PDFs use deterministic metadata. Run site QA workflow checks and PDF audit locally.

Open: qualified clinical review of all new material, especially mood/psychosis, eating/medical coordination, dissociation, safeguarding, capacity/choice and treatment suitability. Source-access limitations include NICE recommendation retrieval restrictions and AAN CAPTCHA; these are not full systematic evidence reviews. No licensed clinical approval or instrument validation claimed. Browser rendering/mobile layout, real keyboard/screen-reader testing and print-dialog behavior remain unverified because control-browser is unavailable; Sites skill prohibits improvising another browser path here.

Future depth gaps: substance-use/addiction case sets, personality/complex longitudinal formulation, older-adult cognition, perinatal care, gender/sexual-health and culturally adapted multilingual client versions need dedicated research and qualified review. Existing resources in those areas remain preserved; this 150-resource wave does not claim exhaustive DSM coverage.

Final source check: NICE eating/panic PDF retrieval also returned 403. PubMed ComB abstract was retrieved: small adult hair-pulling trial, benefit on self-report with nonsignificant immediate interviewer-rated/diagnostic effects. Registry and BFRB pages now state those limits rather than treating a positive trial label as uniformly strong evidence.

Final local QA: all existing catalog/parity/homepage/scale/clinical expansion/assessment/practice-learning/finder tests plus 150-resource regression pass. 7,840 local references have zero broken links; 449 current HTML pages have zero source-audit findings; 61 PDFs have zero structural failures. Twenty-five new PDFs rendered and visually inspected across five waves; learning parallel-branch repair re-rendered separately. Script syntax audit result recorded after completion.

Final syntax audit: 538 shipped scripts/event handlers, zero errors. All regression commands passed; these results do not imply licensed clinical approval, browser rendering or full WCAG conformance.
