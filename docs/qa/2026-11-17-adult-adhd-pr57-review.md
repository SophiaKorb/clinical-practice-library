# Adult ADHD collection — PR #57 review evidence (2026-11-17)

## Scope
Review branch `review/adult-adhd-depth-20261117`. No merge, deployment, PHI, credentials, publication or access changes. This document records **static source checks**, not human clinical approval or rendered browser QA.

## Added resources
- `resources/diagnoses/adult-adhd-collection/index.html` — collection navigation.
- `assessment.html` — interview, impairment, differential and test boundaries.
- `psychotherapy.html` — flexible eight-part ADHD-focused CBT educational sequence with evidence distinction.
- `everyday-life.html` — adult-facing practical supports in eight functional areas.
- `treatment-planning.html` — fictional goal/intervention/outcome examples.
- `interactive-barrier-map.html` — client-controlled in-page task/barrier/support visualization.
- `printable-worksheets.html` — printable three-part worksheet page.
- `adult-adhd-support-experiment.txt` — plain-text downloadable worksheet.
- `style.css` — readable responsive and print styling.
- Existing ADHD hub, clinical-depth companion, task-start toolkit and diagnosis-hub navigation link to collection.
- Eight new adult-specific records integrated into the canonical single JSON assignment of `clinical-finder-data.js`, preserving 615 original records. New expected total is 623; do not conflate indexed format records with 623 distinct interventions.

## Source evidence, verified 2026-11-17
1. NICE NG87, https://www.nice.org.uk/guidance/ng87/chapter/recommendations — specialist diagnosis, consideration of structured supportive psychological intervention focused on ADHD, medication and monitoring (UK context).
2. AADPA 4.2, https://adhdguideline.aadpa.com.au/non-pharmacological/cognitive-behavioural-interventions/ — cognitive-behavioural approaches may target functioning/wellbeing; evidence and modality vary.
3. AADPA 3.1, https://adhdguideline.aadpa.com.au/treatment-and-support/multimodal-treatment-support/ — shared treatment choices considering preference, feasibility, medical conditions and comorbidities.
4. NIMH, https://www.nimh.nih.gov/health/publications/adhd-what-you-need-to-know — adult symptoms, diagnostic and therapy overview.
5. JAN, https://askjan.org/disabilities/Attention-Deficit-Hyperactivity-Disorder-AD-HD.cfm — accommodations, not automatic ADA eligibility.

Sources inform clinical statements; no CPL worksheet is claimed to be validated or evidence-equivalent to medication or manualized CBT.

## Static checks performed on branch
- Refetched all nine new collection files; seven HTML pages contain full HTML skeleton, viewport and skip navigation.
- Checked fragment targets and unique IDs across seven pages: zero detected errors.
- Checked 108 HTML anchors and available linked companion filenames: zero detected errors in this bounded static check.
- Validated all five input/output pairs in the interactive map, and checked source for network and persistence calls: none found.
- Parsed original finder data (615 existing records) and eight added JSON entries; checked ADHD + Adult population tags and destination filenames: zero detected errors.
- Four existing entry points were updated to point to the collection. Legacy static count wording was corrected to avoid claiming only 19 total tagged entries.

## Limits and human gates
- **Not yet done:** instrumented Chromium/mobile 320–400px, full 200%/400% browser reflow, native screen reader, physical print, interactive keyboard walkthrough and runtime finder search assertions. Source inspection is not a substitute.
- **Not yet done:** clinician source-line/content endorsement, DSM-5-TR criteria audit by licensed reviewer, rights and accessibility approval, PDF/UA or accessible-tagged downloadable PDF generation.
- Current print-to-PDF option uses browser print styles; standalone PDF is not authored or tested.
- Live external links and actual hosted path responses must be checked after a permitted preview deployment; no production claim is made.
- Clinical information remains educational and must not be construed as an individualized protocol or prescriber decision.
- **All owner merge/deploy/publication gates remain closed.**

## CI regression discovered and corrected
The first finder-index implementation appended executable JavaScript after the canonical JSON assignment. Existing `tests/online-lgbtq-resources.cjs` parses the assignment as JSON and therefore failed at commit `996feb5e`. The dataset was reconstructed as one canonical `globalThis.CPLFinderData = <JSON>;` assignment at commit `efbf9983` with exactly 623 distinct URL records. This addresses the **identified parse failure only**. CI must be rerun and its final status verified; other regressions remain possible.
