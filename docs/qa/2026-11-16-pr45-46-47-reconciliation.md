# CPL PR #45 + #46 + #47 — review-only exact-source reconciliation

**Prepared November 16, 2026.** No production release, merge, Vercel deployment, source PDF change, PHI, or clinical/legal/accessibility signoff. New isolated branch `review/cpl-pr45-46-47-reconciled-20261116` starting at exactly PR #47 passing `9d98b9313e2bb54a8e2e3c0bcd84492b327646dc`.

## Provenance
- PR #45 `dfcc1f73f3b68f658d606f2e6b0e234ea301e61b`: all 77 original link evidence rows, audited outcome classes, precise age/provider roles, revised CDC ADHD endpoint, language and `tests/provider-audit-77.cjs`.
- PR #46 `2a41ef7310bfdc913f258bd2f2bc5a29b7510d3d`: distinct 77-row explanatory source ledger, per-record `sourceAuditDate`, additional provider/role notes, and `tests/external-provider-eligibility-audit.cjs`.
- PR #47 `9d98b9313e2bb54a8e2e3c0bcd84492b327646dc`: CSS-only finder icon/zero axe incomplete, campus scope, STARS federal-passport caution, canonical Trans Lifeline, Scarleteen education vs age-13+ direct services, and `tests/community-referral-scope-qa.cjs`.
- All predecessor branches remain unchanged. The base is main `af79333d1317c1d4dbce0798aafe14df49644c34` containing 609 indexed entries; this is NOT a replacement for either predecessor branch.

## Conflict decisions
- **RecoverMe (#ext-05-04):** SAMHSA [About RecoverMe](https://www.samhsa.gov/substance-use/recovery/recoverme/about) defines the 18–25 population as **priority audience**, not proof of a restricted admission/reading boundary. Keep Adult developmental discovery and age-scope explanation; deliberately remove PR #46's `minimumAge:18` and `maximumAge:25`. Adapt PR #46 regression to enforce this distinction.
- **Child Mind tweens (#ext-02-04):** [Official publisher](https://childmind.org/topics/teens-young-adults/) explicitly includes tweens around **9–12**, teens and young adults. Carry early-childhood relevance on individually supported child education resources, adult discovery for the tween-to-young-adult hub and no unsupported 13+ threshold.
- **Eldercare (#ext-04-04):** choose PR #45's accessible title “older adults and families”; PR #46's more detailed age-scope note is consistent and retained as appropriate. School-only and child results must exclude.
- **VA AboutFace (#ext-05-08):** choose PR #46's clearer *PTSD tools for professionals* title, and PR #45's role-filter corrections; this is a provider resource, not client appointment intake.
- **IDEA Parent Centers (#ext-06-04–06):** choose PR #45's precise federal *program/grant* titles, not a false promise of direct local intake. U.S. Department of Education [parent-center program](https://www.ed.gov/grants-and-programs/grants-special-populations/grants-special-education-and-individuals-disabilities/special-education-parent-information-centers) and IDEA [§1471](https://sites.ed.gov/idea/statute-chapter-33/subchapter-iv/part-c/1471) support family relevance from birth through 26. Retain PR #46 service-audience annotations and review dates.
- **CDC ADHD (#ext-03-07):** both branches corroborate [publisher Free Materials on ADHD](https://www.cdc.gov/adhd/php/communication-resources/index.html); use the direct official `/adhd/php/` URL, sync audit JSON and directory, preserve comparison record of original URL without asserting a 403 is a dead public link.
- **Source record versus audit classification:** PR #45's audited 77 rows (68 readable, 8 restricted/index-supported, 1 interactive shell) are retained, including audit labels, with catalog title/age/role reconciliation synchronized. PR #46's independent provider ledger is separately retained; neither is relabeled as an individual service eligibility certification.
- **LGBT National Youth Talkline:** official [contact page](https://lgbthotline.org/contact/) says 25-and-under while the [Youth Talkline](https://lgbthotline.org/youth-talkline/) explicitly says callers of any age; retain contradiction rather than impose a numeric cap. Youth moderated chatroom is a separate service.
- **Scarleteen:** [direct services](https://www.scarleteen.com/ask) 13+ does not make all [free educational articles](https://www.scarleteen.com/about) age-gated.
- **PR #47 protections:** 13+ Eon/TrevorSpace, campus-focused University of Arizona listing, federal passport issuing authority versus outdated STARS guide, non-24/7 Trans Lifeline, and CSS caret unchanged.

## Audit preflight and automated scope
- Combined 609 URLs/77 external records; 77 matching directory cards and unique external links, metadata facets, child/teen/adult and clinician/caregiver/school/case management/trainee navigation preserved.
- All three predecessor regression suites and corresponding workflow steps retained, including `tests/provider-audit-77.cjs`, `tests/external-provider-eligibility-audit.cjs`, and `tests/community-referral-scope-qa.cjs`; no duplicated workflow steps. PR #46 test assertions re-scoped where audience age was incorrectly enforced as an intake eligibility gate or where chosen canonical titles differ.
- Preserve existing 150 inherited rendered checks, mobile/reflow/keyboard tests, axe WCAG 2.0/2.1 sampled checks, browser Letter PDF smoke checks and original screenshots/artifact lineage. **Exact new SHA and workflow links must be appended after execution; ancestor success is not final QA**.

## Human review: all gates open
- Qualified clinical, trauma-informed youth agency and safeguarding; minor privacy, portal visibility, disclosure/mandatory reporting and applicable legal signoff.
- Third-party provider real-world admission/eligibility, local operating hours, geographic scope, fees, current intake and referral contact verified by human.
- Native TalkBack/VoiceOver/NVDA/JAWS, actual browser 200%/400% zoom, high contrast, physical Letter grayscale, accessible PDF reading order, external source rights and independent owner approval.
- No original community guide PDF binary publication or replacement; do not merge or deploy without an explicit exact-SHA authorization.
