# Phase 8B — Substantive clinical gap audit and implementation register
**Branch:** `cpl-2-colorful-helpful` · **Audit:** 2026-10-10 · **Scope:** current CPL, including pre-Phase-8 originals, assessment and therapy shelves, school and Spanish resources, not solely 150 generated pages.

## Finding
The library's widest deficit is **what happens between orientation and qualified clinical action**: complex differentials, intervention-selection decisions, specialized accommodations, meaningful functional measures, handoffs and treatment troubleshooting. Existing broad diagnosis/tool shelves are important; they do not eliminate these gaps. Never count six presentation formats as six separate clinical competencies.

**Classification:** `absent-dedicated` means no dedicated route identified, not no applicable guidance; `thin` means an orientation exists but decision depth is limited; `partial` means some necessary stages exist; `fragmented` means content exists across pages without dependable clinical handoffs; `missing-approval` is a release gate. Priorities P0 safety/access/governance; P1 high-impact specialty/lifespan gaps. Machine-readable source: [`data/phase-8b-gap-matrix.json`](../data/phase-8b-gap-matrix.json).

## Audited gap matrix
| Priority | Area | Coverage | Essential next clinical content |
| --- | --- | --- | --- |
| P0 | Self-harm, suicide, acute safety and care transitions | fragmented | Clinician decision path separating immediate physical safety, psychosocial formulation and named handoff; Nuanced distinctions among suicidal thoughts, self-harm function and medical lethality without a scoring shortcut; Longitudinal review after event/transition, capacity/access, changing context, safety-plan practicality |
| P0 | DID, complex dissociation, memory and disability | thin | Differentiate PTSD subtype, DID/OSDD, detachment, amnesia, medical/neurological and other explanations; Structured, non-leading functional memory/time/identity observation and disability domains; Longitudinal treatment choice, supervision, stabilization, trauma-work adaptation and function separate from subjective integration |
| P1 | Complex personality, attachment and relational therapy | thin | Comparative DBT/GPM/MBT/TFP/schema indications, clinician training and treatment frame; Longitudinal shared formulation, rupture/repair, team dynamics, multiple risk behaviors and change in function; Case formulation for both abandonment and engulfment concerns without stereotyping |
| P1 | Autism, ADHD, intellectual disability and overlapping concerns | partial | Developmental versus acquired change, language/communication validity, adaptive profiles, masking, co-occurrence; Concrete consent/assent/access routes and alternative means of responding; From screening to integrated feedback and change in functioning, not diagnosis alone |
| P1 | Psychological and neuropsychological evaluation | partial | Referral question → battery selection/stop rules/validity/access → integrated interpretation; Report structure, source disagreements, multiple hypotheses and accessible feedback; Acquired aphasia evaluation and neuropsychological testing modifications; boundaries of normed scores |
| P1 | Psychosis, bipolar, serious mental illness | partial | Episode and medical/substance differential trajectories; relapse and recovery coordination; Negative/cognitive symptoms, early-psychosis treatment team roles, distress and autonomy; Complex medication-adjacent problems managed via appropriate prescriber handoff |
| P1 | Substance use, addiction and dual diagnosis | partial | Alcohol/opioid/stimulant/polysubstance differential, withdrawal red flags and level-of-care decisions; Structured psychosocial treatment planning including contingency management and concurrent care; Relapse/return-to-use with response to overdose risk and coordination |
| P1 | Child psychotherapy, caregivers, adoption and family systems | partial | Developmentally differentiated play-based treatment and dyadic/caregiver skill rehearsal; Adoption/kinship contexts, contact with unsafe adults, consent/safety and multidisciplinary pathways; Session scripts with observation, supported practice, fidelity and troubleshooting |
| P1 | Eating disorders and medical/psychiatric care | partial | Distinct anorexia/bulimia/ARFID/binge-eating/pica/rumination assessment and referral pathways; Medical and psychosocial coordination on parallel tracks; specialist and family approaches; Progress indicators accounting for body size, stigma, environment and access |
| P1 | Older adults, cognition and caregiver support | absent-dedicated | Depression vs delirium vs neurocognitive disorder vs substance/medication effects; Capacity, decision support, safeguarding, caregiver burden and functional changes; Referral to medical/neuropsych and community care pathways |
| P1 | Perinatal and postpartum mental health | absent-dedicated | Perinatal depression/anxiety, intrusive thoughts/OCD, bipolar activation and postpartum psychosis distinctions; Safety, medication/prescriber, infant-care, sleep and family coordination; Culturally responsive and trauma-informed reproductive care |
| P1 | Culture, multilingual care and communication access | fragmented | Language/interpretation decision rules and documentation of adapted administration; Translation vs validation vs norms and evidence transfer; Cross-cultural symptom meaning, disability and identity framing, co-design/user testing |
| P0 | Original visual toolkit and printable parity | partial | Eleven Phase 8 maps remain generic five-card models; Many client workbooks present writing boxes without supported-choice/AAC options; Twenty-five PDF companions not yet semantically equivalent to updated HTML loops, forks and parallel tracks |
| P0 | Clinical decision navigation and source of truth | fragmented | Authoritative starting point for each clinical question; duplicate route consolidation; Incomplete discovery tagging and unambiguous audience/scope labels; Consistent next-question, evidence, intervention, access and progress links |
| P0 | Clinical review, provenance and effectiveness evidence | missing-approval | Qualified reviewer names/version/signoff and scope of approval; Claim-level evidence strength plus local protocol applicability; Actual browser/keyboard/screen-reader/print evidence and feedback-driven updates |

## Depth acceptance rubric (apply to each improved resource)
1. **Presentation**: phenomenology, timeline, function, developmental and contextual access; distinguish report, observation and hypothesis.
2. **Differentials**: plausible co-occurring and medical/sleep/substance alternatives. Name evidence that would change the plan.
3. **Assessment**: qualified interviewer/collateral/appropriate instruments, valid response conditions, consent and urgent red flags; no diagnostic shortcut.
4. **Selection**: realistic treatment options and why one might fit; scope/training/contraindications, specialist referral and client choice.
5. **Implementation**: at least one concrete clinician dialogue, session activity, access option or coordination plan. Avoid untested scoring algorithms.
6. **Monitoring**: actual participation and harms, not just symptom frequency; within-person baseline, context and decision to continue, adapt or reassess.
7. **Sources**: direct primary/authoritative citations with limits, year, clinical vs consensus evidence and review status.
8. **Tools**: visuals encode causal hypotheses vs observed relationships, branch choices, concurrency, and safety constraints; equivalent HTML/PDF semantics.
9. **Release**: technical tests + visual render + accessible interaction + qualified specialty review where indicated; all separately recorded.

## Immediate working slices
- 8B-1: clinician-facing *self-harm and continuity* pathway; integrates existing preparation handout and avoids risk-level scoring.
- 8B-2: clinician-facing *complex dissociation / DID / functional memory* pathway plus observation worksheet; connect existing PTSD and disability sources.
- 8B-3: decision-first **Clinical Depth** entry page linking old + improved pages; don't make another disconnected catalog.
- Next: personality longitudinal care and autism/neuropsych assessment before count-oriented expansion.

## Evidence checkpoint
- [NICE NG225 (2022), self-harm recommendations](https://www.nice.org.uk/guidance/ng225/chapter/recommendations): do not use risk stratification scores to predict individual suicide or decide discharge, undertake psychosocial formulation, collaborative care/safety plans and follow-up.
- [VA National Center for PTSD: Dissociative Subtype](https://www.ptsd.va.gov/professional/treat/essentials/dissociative_subtype.asp): depersonalization/derealization distinction; further treatment-outcome research needed.
- [ISSTD DID adult treatment guidelines (2011)](https://www.isst-d.org/publications-resources/resources-for-professionals/adult-treatment-guidelines/): specialty consensus guidance, not proof of any specific treatment's efficacy.
- [NICE NG116 (2018), PTSD recommendations](https://www.nice.org.uk/guidance/ng116/chapter/recommendations): validated/manualized trauma-focused interventions require trained clinicians; adapt care for complexity.

## Integrity and review gaps
A preceding CI run on the Colorful branch failed because `resources/training/dsm-from-zero.html` linked the shared navigation CSS twice. This is a **pre-existing structural defect**, not a Phase 8B clinical finding. It must be corrected and verified. Phase 8 published pages remain `qualifiedClinicalReview: pending`; do not label generated assets clinically approved or screen-reader conformant. Maintain [PDF spatial parity issue #5](https://github.com/SophiaKorb/clinical-practice-library/issues/5).

## Status
Audit established; first clinical deepening batch in progress. The audit is a prioritization instrument rather than evidence that each missing intervention has been approved or delivered.

## Implementation checkpoint, 2026-10-10
- First cross-linked clinical-decision route: `resources/clinical-depth/index.html` (no additional diagnosis shelf).
- P0 safety: `resources/clinical-depth/self-harm-safety-continuity.html`; concurrent physical/psychosocial responsibilities, individual formulation, handoff and follow-up.
- P0 complex dissociation: `resources/clinical-depth/complex-dissociation-functional-care.html` plus practical function map; PTSD subtype, DID and medical/neurological alternatives; no assumed memory recovery.
- P1 complex personality: `resources/clinical-depth/complex-personality-longitudinal-care.html`; structured modalities, rupture repair, differential and longitudinal outcomes. Links back to existing generalist and relational tools.
- Browser and qualified review statuses remain distinct and must be confirmed from CI/review logs, not inferred from existence of these pages.

- P1 neuropsych assessment: `resources/clinical-depth/neuropsych-evaluation-access-validity.html` and `resources/clinical-depth/assessment-decision-report-planner.html`; two fictional cases (acquired aphasia and developmental differences with school threat), valid-versus-descriptive score interpretation, and feedback. Review by qualified neuropsychology/SLP/cultural assessment clinicians remains pending.

## 8B child/family and integrated substance-use depth batch
- `resources/clinical-depth/child-caregiver-treatment-selection.html` with separate `resources/clinical-depth/caregiver-session-support-map.html`: development, disability/communication access, caregiver responsibilities, child safety, selected PCIT/CPP/other model boundaries and two fictional cases; no proprietary model protocol or protective-placement decision. Primary official references NCTSN PCIT/CPP and AAP 2019 ADHD guidance.
- `resources/clinical-depth/substance-use-cooccurring-care.html` with separate `resources/clinical-depth/substance-use-parallel-care-map.html`: assessment and integrated care for co-occurring mental health, opioid/alcohol/stimulant-specific referral boundaries, person-selected supports, closed-loop handoffs, and two cases; references SAMHSA TIP 63, SAMHSA co-occurring care and ASAM alcohol withdrawal guidance. No dosage instructions, detox protocols or reproduction of licensed ASAM criteria.
- Status is **materially deepened, not clinically approved**. Pediatric trauma, safeguarding, medical/addiction, disability access and lived-experience review remains pending. All routes require real render/keyboard/print verification after source and navigation integration.
