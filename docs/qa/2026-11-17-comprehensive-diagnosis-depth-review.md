# CPL comprehensive diagnosis-depth expansion — review evidence

Updated November 17, 2026. **Review-only PR #58.** No clinical approval, rights clearance, public release, merge, deploy, provider contact or access changes.

## Source lineage and separation

- This work starts from the protected `main` branch and is isolated at `review/diagnosis-comprehensive-guides-20261117`.
- **Adult ADHD PR #57 is separate.** Its deeper expanded clinical companion and eight-entry overlay are not silently absorbed here; any eventual integration needs explicit source conflict reconciliation and separate owner authorization.
- Canonical finder `resources/clinical-finder-data.js` is byte-exact at published Git blob `93105c462d65d0b7766cc84564264ed345379fb7` and contains 615 entries. Neither source catalog age/role tags nor original school/family clinical pages were edited.
- Existing 14 diagnosis-facet categories are discovery containers, not automatically 14 independent DSM diagnoses. The conditions in composites are differentiated explicitly. `Persistent conflict` and `Grief / bereavement` must not imply a diagnosis merely by appearing as discovery categories.

## Completed authored pages

One collection index plus 16 new substantive HTML guides:

1. Autism — developmental pattern, communication access, co-occurring conditions, autonomy
2. Anxiety/OCD — GAD, social anxiety, panic, OCD/ERP and health-anxiety differential
3. Depression — severity, bipolar differential, safety and evidence-based therapy
4. Trauma/dissociation — PTSD, complex dissociation, safety and trauma-focused versus coping interventions
5. Learning disorders — literacy, mathematics, written expression, instruction and educational evaluation
6. Psychosis/bipolar — episodes, mania, psychotic presentation and integrated psychiatric/recovery care
7. Substance use — withdrawal/overdose safety, motivation, harm reduction and Part 2
8. Persistent conflict — diagnosis distinction, child voice, functional hypothesis, developmental context and safety
9. Eating disorders — restrictive/ARFID, binge, purging, nutritional/medical care and specialist treatment
10. Tics/repetitive behavior — tic disorders, BFRB, compulsions, functional tic-like patterns and CBIT
11. Intellectual disability — intellectual/adaptive functioning, communication, supported consent and rights
12. Sleep conditions — CBT-I, apnea, circadian differences and mood activation
13. Grief/bereavement — ordinary loss, prolonged grief, PTSD, depression, cultural and family context
14–16. Separate dyslexia, dyscalculia and dysgraphia/written expression assessment, explicit instruction, accommodations and printable planning guides

Adult ADHD routes to its previously authored substantial guide in `main`; PR #57 remains the independent deep-expansion workstream.

Each new guide contains substantial assessment, differential, evidence-informed selection, functional support, case-reasoning/plan and a printable, non-validated educational worksheet. The 13 main non-ADHD category guides now also contain 5 distinct clinical decision cards to prevent collapsing multiple presentations into one intervention.

## Clinical primary-source ledger (source pages checked November 17)

- Autism: NICE CG142 adult assessment/management; CG128 under-19 recognition; CG170 under-19 management.
- Anxiety and OCD: NICE CG113 GAD/panic and CG31 OCD/BDD including ERP.
- Depression and self-harm: NICE NG222 and NG225, including the limit on prediction from risk scales.
- PTSD: VA/DoD 2023 guideline and National Center for PTSD evidence overview, particularly CPT, PE and EMDR.
- Learning: U.S. IES foundational reading `PracticeGuide/21`, mathematics `/26`, writing `/17` and `/22`; IDA 2025 dyslexia definition paper (published 2026).
- Bipolar and psychosis: NICE CG185 and CG178.
- Substance use: SAMHSA treatment, integrated co-occurring care, confidentiality and current statutes/regulations.
- Persistent conflict/disruptive behavior: NICE CG158 and CDC behavior therapy/parent training.
- Eating disorders: NICE NG69, including emergency medical indicators and stabilization.
- Tics: CDC Tourette diagnosis and CBIT treatment pages.
- Intellectual disability: AAIDD 12th edition definition, adaptive behavior and positive behavioral support.
- Sleep: AASM 2021 multicomponent CBT-I clinical practice guideline and NIH/NHLBI sleep-apnea diagnosis.
- Grief: APA prolonged grief disorder and DSM-5-TR sources.

Direct verified source URLs are retained on the corresponding authored pages. These are educational summaries and need qualified clinical/rights review; **guideline citation is not validation of CPL's original visual worksheets or case examples**.

## Engineering and design

- `resources/diagnoses/comprehensive/guide.css` establishes clear type hierarchy, 17px base, responsive cards, visible keyboard focus, no external fonts, reduced motion, forced colors and print-specific styles.
- Navigation is plain HTML and works without JavaScript. The existing diagnosis picker now displays a dedicated guide link for all 14 indexed categories and an entry to the full collection.
- Practical three-step support structures communicate a meaningful decision pathway (observation, chosen adjustment, outcome review) rather than visually decorated prose alone.
- Each page has a skip link, one primary heading, named section anchors, visible evidence sources, an appropriately scoped printable worksheet and safety boundaries.
- Browser print-to-PDF samples are **not** tagged PDF/UA resources. No standardized forms, copyrighted assessment items or patient data were copied into the repo.

## QA checkpoint and current gates

- At exact expansion checkpoint `4952231f849adfbd8149512cd94fa5b20bb857b1`: **CPL site QA success** (run 44146578290), **CPL rendered keyboard and print QA success** (run 44146578210). Rendered included 390px/1280px page opens for 17 new pages, horizontal overflow, keyboard skip focus, axe serious/critical, screenshot artifacts and a browser-printed learning guide; inherited page routes also tested 320/640px.
- The 13 deeper diagnosis-specific decision-aid additions occurred **after** checkpoint 4952231f, so these are not yet covered by that passing exact-head result. Verify both workflows again at the final commit.
- Test `tests/comprehensive-diagnosis-guides.cjs` protects the exact 615-record catalog, all 14 facet routes, 16 topic files, links and print/explanatory sections.
- **Open human gates:** independent clinical and cultural review, medical safeguarding/mandated reporting, diagnosis-specific scope, child/youth participation, rights and redistribution, true NVDA/JAWS/VoiceOver/TalkBack, actual 200%/400% whole-page zoom, physical black-and-white print, tagged accessible PDF/UA and owner release approval.
- No merge, deployment, publication, PHI, access changes or clinician-only implied endorsement.

## Next integration decision

PR #58 and PR #57 both touch diagnosis navigation. Do not assume merging one after the other is conflict-free. If release is later explicitly approved, reconcile to an exact combined branch, re-run all finder, child/role, diagnosis, rendered, print and accessibility tests, and seek separate clinical/rights/owner approvals.

## Final substantive-content QA checkpoint — November 17, 2026

At **exact passing content/CSS head `c0c6f7bdff15fca16f49d0c63b225a9ceb798c3b`**, both independently run GitHub Actions workflows completed **SUCCESS**:

- [Site QA run 44148255940](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44148255940) — passed all repository static/link/behavior/finder, original guide, parity and new diagnosis-depth regression checks.
- [Rendered keyboard/print QA run 44148255843](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44148255843) — success. Inherited 150 checks, 0 failures; combined 209 checks, 0 failures. Finder and classic finder rendering checks passed at 1280/390/320. Diagnosis hub rendering passed at 1280, 640, 390 and 320 with 0 horizontal overflow and 0 serious axe findings. New comprehensive pages were loaded and checked at 390 and 1280 for scroll overflow, focusable skip link and serious/critical automated axe issues, with screenshots and a browser-print sample. [Rendered screenshots, axe reports and browser-print artifact](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44148255843/artifacts/14357243058) (scheduled expiry 2026-12-01).
- Final source review included the additional 13 five-card differential decision aids and 44px touch target improvement, which were not in the earlier 4952231f run. The latest tested source files match the above exact content/CSS checkpoint.
- The documentation-only commit recording this result does not change site HTML/CSS/JS or the protected finder. Any subsequent source change needs new exact-head QA.

**Evidence boundary:** automated axe findings and headless browser/print samples are neither native screen-reader verification nor WCAG certification, clinical validation, physical print QA, 200%/400% browser zoom QA, or accessible tagged PDF approval. Those human gates remain open. Do not merge or deploy.

## Case-management extension — November 17, 2026 (new source, re-QA required)

- Created `resources/diagnoses/comprehensive/case-management/index.html` and **14 category-aware case-management working sheets** linked from the main comprehensive diagnosis index. Each describes person-chosen access goals, five concrete coordination or practical support actions, a three-step collaborative visual, an original blank printable service worksheet, and domain-specific reasons to refer or escalate to qualified care.
- The broad fourteen-category taxonomy remains a *discovery taxonomy*, not fourteen formally diagnosed disorders. In particular, persistent conflict and ordinary grief are not automatically diagnoses; psychosis/bipolar, anxiety/OCD and tics/BFRBs have different specialist pathways.
- Each case-management sheet points to its corresponding clinical-depth guide and its primary references. The ADHD case-management sheet on this branch is a standalone short signpost; the independently deeper adult and youth ADHD case-management toolkit remains isolated in **draft PR #57**, not bundled here.
- Preserved the published canonical finder SHA `93105c462d65d0b7766cc84564264ed345379fb7`, and did not modify its indexed 615 records or original school guides. These additions are discoverable from the comprehensive diagnosis index, but are **not new canonical finder records** on this review branch.
- Added `tests/condition-case-management.cjs` to the site QA workflow, checking fourteen destinations, print/skip/HTML scaffolds, links, role boundaries and exact canonical finder preservation. Extended `scripts/qa/diagnosis-hubs-rendered.cjs` to visit fifteen case-management pages at 390/1280 CSS pixels with keyboard, reflow, selected automated axe checks and a browser print sample.
- **Do not misstate the earlier passing checkpoint** `c0c6f7bd` as validating these new materials. Final exact-head CI and clinical/source review must be verified separately before claiming a passing candidate.
- Human gates: condition-specific service eligibility, safeguards, consent, clinical scope, physical printing, native screen readers, 200%/400% browser zoom, rights and release authorization remain open. No PHI, merge, deployment, publication or access change.
