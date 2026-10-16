# DSM Foundations and Diagnosis Comparer — October 14, 2026 checkpoint

## State and scope

Continue `SophiaKorb/clinical-practice-library`, branch `feature/comparer-plain-language`, draft PR #12. Recovered application head: `fca8e87c08f19900ec99b09a84c49e44176b950f`. The existing PR targets `feature/dsm-diagnosis-comparer`; it is not merged. Deploy only to `clinical-practice-library-colorful` on team `cohon-family` (`prj_P8XvA5eKLDNuu7SaRj3WfoYCJSRT`). Production promotion and merging are not authorized.

This cycle completes the comparer's bilingual content coverage. It does **not** complete the course's full bilingual rewrite or independent clinical validation.

## Implemented

- All 26 existing diagnoses now have Clinical and Plain Language presentation, duration/course, functioning, assessment questions, alternative explanations, co-occurrence and cautions. Original diagnosis identities and selector choices remain.
- All 31 existing curated pairs now have their own bilingual overlaps, both distinctive sections, distinguishing questions, course/development, exclusions and co-occurrence. All 31 are selectable in the collapsible comparison list.
- Reversed selections swap the correct outer cards; the middle card remains pair-specific. Intersection labels and accessible SVG descriptions change with the selected pair and style. Conditional features have a visible asterisk explanation. Unsupported pairs explicitly decline an authored overlap; duplicate selections hide the diagram.
- Fixed cannabis/schizophrenia side assignment and distinguished cannabis use disorder from exposure, intoxication and cannabis-induced psychosis.
- Clarified psychosis during bipolar depression versus hypomania, major mood episode timing in schizophrenia, chronic MDD versus persistent depression, and adjustment disorder's distress **and/or** impairment requirement.
- Co-occurrence statements distinguish independently supported dual diagnoses from alternative classifications. In particular, bipolar I/II, MDD/bipolar depression and binge-eating disorder/bulimia must not be described as universally coexisting diagnoses for one syndrome.
- Added a readable print hierarchy, selected diagnoses/style header, repeated table headers and bounded cards. Shared theme font rules no longer override print typography.
- Corrected course Q09, Q25, Q29, Q30, Q36, Q41, Q53 and Q65 wording/feedback based on the prior audit. Other flagged safety and scope points were checked in current source. No answer key or option position changed.
- Fixed the course text-style label's contrast and removed the comparer's unused invalid ARIA container. Removed the course's learner-visible implementation-progress message.

## Verification completed locally

- Content integrity: 26 bilingual profiles and 31 bilingual pairs, all seven dimensions, supported-pair coverage and high-risk regression assertions.
- Actual Chromium interactions: 496 pair/style/order observations at 320, 390, 768 and 1280 px. No document overflow. Unsupported/duplicate cases, SVG labels, collapsible presets, keyboard controls and selected-diagnosis retention passed.
- Preference persists between the comparer and course. Switching text styles retains current course answer selection and lesson completion.
- All 80 course questions exercised in both modes; all 249 option positions retained. Single-choice scoring and multi-choice empty/correct/incorrect states passed.
- Axe 4.14.0 WCAG 2 A/AA and WCAG 2.1 AA checks at 390 px: zero reported violations on either page in either style. This is automated coverage, not a screen-reader usability certification.
- Source course integrity retains 11 lessons, 80 questions (72 single-choice and 8 multi-choice), 33 worked cases, 33 vocabulary entries and 11 concept diagrams.
- Whole-site local reference check: 721 pages, 18,918 references, zero errors. Whole-site JavaScript check: 563 scripts/handlers, zero errors.
- Desktop/mobile comparer screenshots and both four-page landscape print samples inspected. All print text is present and readable, with no observed clipping or overlap. PDF exports are untagged; they are QA samples, not certified accessible downloads.

Reproduce with `node tests/diagnosis-comparer-content-integrity.cjs`, `node tests/dsm-foundations.cjs`, `node tests/diagnosis-comparer-venn.cjs` and `node tests/dsm-text-style-browser.cjs`. Install the workflow's pinned Playwright and axe dependencies. Browser tests start their own local servers. Set `DSM_BASE_URL` to an actual staging origin for deployed tests, `CHROMIUM_PATH` only for a custom executable, `AXE_PATH` only for an external axe installation, and `DSM_QA_OUTPUT` for an alternate evidence directory.

## Recovered clinical audit

Read the current `DSM_Foundations_Comparer_Clinical_Audit_Register.pdf` and `DSM_Foundations_and_Comparer_QA_Report.pdf` (October 13). Their review covered 80 stems/key summaries and ten pairs, not all distractors/feedback or the later 26/31 expansion. Their blanket statement that every pair should permit both diagnoses is overbroad; this cycle corrects that distinction rather than carrying it forward.

The audit's independent review, course print synchronization and complete course narrative review remain open. Public references support an editorial review, not a claim that all licensed DSM-5-TR criteria have been checked.

## Reference checks and boundary

Original educational wording was checked against public professional references for high-risk duration, exclusion and safety distinctions, including:

- NIMH: https://www.nimh.nih.gov/health/publications/bipolar-disorder
- VA National Center for PTSD: https://www.ptsd.va.gov/professional/treat/essentials/dsm5_ptsd.asp
- NIAAA alcohol use/withdrawal: https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-alcohol-use-disorder
- SAMHSA TIP 63: https://library.samhsa.gov/product/tip-63-medications-opioid-use-disorder/pep21-02-01-002
- MSD professional references: schizophrenia, schizoaffective disorder, bipolar disorders, cyclothymic disorder, GAD, adjustment disorders, bulimia, illness anxiety and substance use disorders.
- APA authorized DSM-5-TR and updates remain the authority for complete criteria, specifiers and coding. Symptom-count rules and every exception are not reproduced in these educational anchors.

## Unfinished — do not mark the project complete

1. Adapt every remaining paragraph, heading, diagram/caption, example, definition, exercise, navigation message, question option and feedback string across all 11 lessons. Current course adaptation remains limited; the successful browser scoring tests do not establish bilingual editorial coverage.
2. Individually review all 80 full questions, all distractors and all feedback in both styles. This cycle checked known audit concerns and behavior; it is not a complete new clinical audit of all items.
3. Synchronize the existing Foundations print book and comparison atlas with the final online content; neither previously stored PDF was replaced here.
4. Complete systematic clinician review against an authorized DSM-5-TR source, including every new profile and pair; obtain qualified independent review for release acceptance as appropriate to the project.
5. Perform manual assistive-technology review and broader print sampling across pairs. Automated axe checks do not establish screen-reader quality.
6. Verify the exact new staging deployment after it reaches READY. Preserve commit identity, deployed source checks and browser test evidence in the deployment checkpoint.

## Next executable action

After exact-commit staging verification, finish lesson 1's full bilingual content (including all questions, choices and feedback) using a node-preserving translation mechanism. Ensure changing style updates already-displayed answer feedback without changing selections, scoring or completion. Continue through lessons 2–11, then synchronize print artifacts and review each completion criterion explicitly.
