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
