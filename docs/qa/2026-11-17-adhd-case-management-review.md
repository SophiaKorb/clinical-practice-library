# Adult ADHD case-management toolkit — review evidence
Date: November 17, 2026
Branch: `review/adult-adhd-depth-20261117`
Scope: additively expanding draft PR #57; no release.

## Problem addressed
The existing Adult ADHD diagnosis library prioritized clinician overviews and task initiation. Case managers need **client-facing, in-session work products** addressing actual service and everyday access barriers. These resources distinguish environmental support and authorized coordination from diagnosis, prescribing, psychotherapy, legal advice, crisis assessment, or eligibility adjudication.

## Deliverables
Under `resources/diagnoses/adult-adhd-collection/case-management/`:
- `index.html`: role-specific discovery, age and scope boundaries.
- Twelve full modules, each with barrier hypotheses, 5 concrete collaborative actions, blank print worksheet, follow-through guidance, observable outcomes and role cautions: `appointments`, `paperwork`, `time`, `tasks`, `home`, `medication`, `money`, `work`, `communication`, `relationships`, `crisis`, `shared-plan`.
- `practice-guide.html`: 25-minute session outline, safe handoffs, source-to-action boundaries and example progress documentation.
- `session-packet.html`: three large-print paper forms—barrier, one action, review.
- `session-choice-map.html`: twelve category-driven, three-step person-led visual selector; no text entry or storage.
- `youth-adhd-support.html`: youth voice, school access, CFT preparation, family collaboration, transition-age planning and youth-authored print page.
- Six additional youth-authored visual sequences with blank printable sheets: `youth-morning`, `youth-schoolwork`, `youth-transitions`, `youth-cft`, `youth-repair`, `youth-stepup`. Each starts with youth choice; school or caregiver communication is subject to consent/authorization and actual policy.
- `style.css`: scoped print, desktop, mobile, high readability.
- Existing adult ADHD collection index links to the case-management toolkit.

## Index and compatibility
- The protected `resources/clinical-finder-data.js` remains the canonical **615-record** published source, frozen blob SHA `93105c462d65d0b7766cc84564264ed345379fb7`.
- The existing `finder-overlay.js` adds 25 records at runtime: the 8 prior adult expansion records plus 16 case-management resources and one youth guide plus six youth activity sheets. Expected runtime count on live finder and dynamic diagnosis index is **640**, without affecting the classic finder or canonical file.
- The added records include case-management roles and adult or school-age stage tags. These are discovery categories, not indications or program eligibility.
- Regression tests and rendered diagnosis index assertions updated to the 646 / 50 ADHD resource counts (19 previously tagged + 25 supplementary).

## Primary sources checked
1. NICE NG87, https://www.nice.org.uk/guidance/ng87/chapter/recommendations — ADHD information, shared treatment planning, care coordination and environmental supports. Do not transpose UK legal rules.
2. AHRQ care coordination, https://www.ahrq.gov/ncepcr/care/coordination.html — coordinated services and patient/family involvement.
3. AHRQ shared care plan, https://integrationacademy.ahrq.gov/products/playbooks/behavioral-health-and-primary-care/implementing-plan/develop-shared-care-plan — patient-centered goals, action plans and case-management participation.
4. Job Accommodation Network, https://askjan.org/disabilities/Attention-Deficit-Hyperactivity-Disorder-AD-HD.cfm — functional workplace accommodations, not an automatic ADA eligibility determination.
5. CDC ADHD classroom, https://www.cdc.gov/adhd/treatment/classroom.html — educational accommodations and organizational training.
6. AHCCCS Youth Involvement Practice Tool, https://www.azahcccs.gov/PlansProviders/Downloads/GM/ClinicalGuidanceTools/YouthInvolvementChildrensBehavioralHealthSystemPracticeTool/YouthInvolvementChildrensBehavioralHealthSystemPracticeTool.pdf — youth voice and opportunity to participate in CFT.
7. AHCCCS CFT Practice Tool, https://www.azahcccs.gov/PlansProviders/Downloads/GM/ClinicalGuidanceTools/ChildFamilyTeam/ChildFamilyTeam.pdf — family-and-youth team process, participation and services.
8. AHCCCS Transition-Age Youth, https://www.azahcccs.gov/AHCCCS/HealthcareAdvocacy/TransitionAgeYouth.html — youth-directed transition planning.

## Source-level QA coverage
- `tests/adult-adhd-collection-qa.cjs` checks the original 615 source, overlay idempotence, exact 31 added records, generated local paths, IDs, fragment links, adult module and youth inclusion, role/stage indexing, no request/storage path in interactive map, and inbound linking.
- `scripts/qa/diagnosis-hubs-rendered.cjs` checks all 23 case-management pages at 1280, 640, 390, 320 CSS px for response, heading, scroll overflow and keyboard skip. It interacts with the choice map, runs axe on six selected pages at each width, prints sample PDF, checks the dynamic ADHD index count and confirms non-ADHD counts unchanged.
- These are source and automated checks; not native screen reader, actual 200%/400% zoom, physical print, PDF tagging, rights clearance or clinical supervision.

## Publication and clinical gates
- **No merge, deployment, public sharing, permission change or PHI**.
- Case-management service scope and billing must be checked against actual organizational policy, credentialing and applicable payer rules.
- School referral eligibility, safety protocols, 42 CFR Part 2, guardianship/consent and current AHCCCS CFT policies require independent qualified review.
- Human review must examine youth voice accuracy, accessibility with native assistive technology and true print readability; no standalone accessible-tagged PDF has been approved.
- Not independently validated ADHD treatment protocols or diagnostic measures.

## Verification status
Latest exact-head GitHub CI status must be appended after complete runs; do not mark as passing from earlier commits.

## Final current-main CI reconciliation and exact test checkpoint

While this review branch was under development, separate main-branch PR #59 published 198 new individually indexed community-guide records. The official current main finder became **813** records at exact Git blob `a17555746c8a76f41cb2d2b234e4586ee46e5465`. This branch's historical finder remains at the exact earlier **615** record blob `93105c462d65d0b7766cc84564264ed345379fb7`. Neither file was overwritten by this work. Pull-request workflows use a synthetic test merge with current main, so the new ADHD overlay has **31 additions** and produces **844 runtime records** when combined with current official 813, or **646** on the historical 615 source. The ADHD facet is **50 entries** in either case (19 baseline + 31 supplemental), while other thirteen facets stay unchanged. All parity scripts now verify this explicitly, rather than falsely expecting the historical 615 at a newer merge base.

**Exact verified code/test HEAD: `b93567405eba1c380b2343d3eb6c1251ad504fb1`.**
- [CPL site QA 44155548378 — SUCCESS](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44155548378) on current-main synthetic merge. Source checks, 31 supplementary ADHD records, youth/adult stage separation, preserved main finder and all original site tests passed.
- [CPL rendered keyboard/print QA 44155548343 — SUCCESS](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44155548343) on current-main synthetic merge. The four-width ADHD page, 23-case-manager-page flow, choice-map interaction, generated print samples, focus/overflow checks, focused skip-link print fix, and all-14 diagnosis index parity with 31 ADHD additions passed.
- [GitHub browser screenshots, axe output and print-sample artifact 14362100114](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/44155548343/artifacts/14362100114). This is a machine-generated review artifact, not a tagged PDF/UA or substitute for real-paper verification.

Earlier failures were investigated and corrected, including overflowing underscore lines, mobile headings, table reflow, printed focused skip links, browser print/media reset and historic finder parity expectations. Those intermediate failures remain visible in Actions history; they are not evidence of passing final tests.

**Outstanding human approval gates are unchanged:** independent clinical/case-management and safeguarding review, youth consent/CFT processes, current program eligibility and billing/scope, rights/redistribution, native assistive technologies, true 200%/400% browser zoom, physical Letter print, accessible tagged PDF and owner release authorization. No PHI, merge, deployment, publication or permission change.
