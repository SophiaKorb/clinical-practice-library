# Treatment planning menu — October 4, 2026

## Delivered
- Branch: cpl-2-colorful-helpful only. Production main remained at 27035be6f1b1466a1dbf28dc9c3f3d84b9666734.
- Implementation commit: 16f3079d4b477792237a305ed319bff6d28917ac.
- Preview deployment dpl_CbenzGcdexkhBkx12CNowkwum7tM confirmed READY; target is preview.
- Menu: /resources/therapy/treatment-plan-menu.html
- Entry points: colorful homepage Plan treatment, therapy resource shelves, searchable catalog.
- 28 diagnosis families/presentations; 57 original adaptable target sets.
- Each target includes need, functional goal, objective with baseline/criterion/date prompts, planned intervention and progress measure.
- Builder supports multiple diagnoses, editable targets, client priorities, strengths, access needs, service details, coordination/risk/referrals, review date, discharge criteria and participation.
- Copy draft wording, print/save PDF, clear plan and diagnosis deep links.
- No server submission or browser storage of entered plan text.

## Coverage
Depressive disorders; bipolar; GAD; panic/agoraphobia; social anxiety; specific phobia/separation anxiety; OCD; BDD; PTSD; adjustment/life transitions; grief; dissociation/DID; BPD; other enduring personality/relational patterns; psychosis; ADHD; autism; intellectual/adaptive support needs; ODD/conduct; anger/impulse-control presentations; SUD; anorexia/restriction; bulimia/BED; ARFID; insomnia; somatic/illness anxiety; chronic pain/health adjustment; neurocognitive/dementia.

This is major outpatient coverage, not an exhaustive DSM diagnosis catalog. Some entries are shared or adjunct presentations and are labeled accordingly. Other personality patterns, adjustment, anger, ARFID and health/access targets carry specific evidence limitations rather than being represented as a universal disorder-specific protocol.

## Clinical provenance
Original planning language, with official NICE, VA/DoD, NIMH, APA and ISSTD references. Example objectives are not guideline-prescribed thresholds. Adult/youth scope and specialist boundaries are stated per family. No proprietary assessment content, medication instructions or client information included.
NICE links are UK clinical references, not Arizona payer requirements. DID source is 2011 adult specialist consensus guidance. No claim of AthenaOne-native template fidelity.

## Verification completed
- Data validation: 28 unique families, 57 unique complete target sets; objective date prompts; all linked local guides exist.
- JavaScript syntax check passed.
- Existing school-guide parity checks passed for all eight domains.
- DOM simulation using jsdom passed: every family selection/removal, multiple diagnoses, edit preservation, copying, clipboard-denial fallback, print text, reset, deep link, failed-data-load state and no saved entries.
- Deployment state and branch/commit metadata confirmed via Vercel connector.

## Verification remaining / blocker
Actual browser visual review at phone/desktop sizes and paginated print review remain unverified. Localhost was blocked by the cloud browser. The protected Vercel preview redirected toward sign-in and automatic approval denied browser access because of possible account-page exposure. A subsequent purpose-built protected-preview fetch was also denied because it may create temporary authentication-bypass access without specific authorization. Do not repeat either action or circumvent the denial. Obtain explicit authorization for temporary preview access before browser review.
The menu exists and is deployed; responsive CSS and print content were implemented but are not represented as visually verified.

## Follow-up
- With specific preview-access authorization, review 320px, 390px and desktop; complete select/edit/copy/print flow in a real browser and inspect print pagination.
- Keep production and colorful work separate. Do not merge this into main without explicit authorization.
