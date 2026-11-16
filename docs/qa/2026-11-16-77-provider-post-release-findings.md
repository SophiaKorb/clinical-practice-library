# Post-release source audit — 77 external resource links

**Review date:** November 16, 2026. **Exact production baseline:** `af79333d1317c1d4dbce0798aafe14df49644c34`. Corrections are isolated on `review/cpl-publisher-verification-and-early-childhood-20261116` with no production writes. Keep publication and clinical approval separate.

## Method and evidence

All 77 URLs were submitted directly to the public web retrieval system, and each result was compared to the original provider's topic or program purpose. For destinations returning HTTP 403, an empty extracted body or a JavaScript-only shell, a second search for that **exact destination** in the publisher's official indexed material was performed. Sources without a confirmed replacement were **not** called dead or silently redirected. The structured audit `docs/qa/2026-11-16-all-77-provider-link-audit.json` has one entry per original publisher URL with date, status, program relevance and identified corrections.

| Access evidence | Count | Interpretation |
| --- | ---: | --- |
| Provider's exact page produced readable content | **68** | Publisher URL and title/purpose could be examined; future reachability not guaranteed |
| Direct URL inaccessible/unreadable; corroborated through official indexed page | **8** | Includes SAMHSA, U.S. Department of Education and FindSupport.gov; not confirmed broken |
| Interactive locator returned only a page shell | **1** | FindTreatment.gov is linked by SAMHSA and not treated as broken; search interaction not directly certified |
| **Total** | **77** | Every entry has an explicit source-verification status |

Primary publisher evidence includes [NIMH health publications](https://www.nimh.nih.gov/health/publications), [Child Mind Institute topic guides](https://childmind.org/resource-finder/), [CDC child development resources (updated January 29, 2026)](https://www.cdc.gov/child-development/resources/index.html), [CDC Essentials for Parenting (reviewed November 2, 2026)](https://www.cdc.gov/parents/essentials/index.html), [ACL National Resource Centers](https://acl.gov/programs/strengthening-aging-and-disability-networks/national-resource-centers), [Eldercare Locator (modified March 2, 2026)](https://eldercare.acl.gov/home), [SAMHSA's official Find Help index](https://www.samhsa.gov/find-help), [SAMHSA's official RecoverMe program description](https://www.samhsa.gov/substance-use/recovery/recoverme/about), [AHCCCS crisis hotline information](https://www.azahcccs.gov/behavioralhealth/crisis.html), and [Department of Education Parent Information Centers (reviewed February 13, 2026)](https://www.ed.gov/grants-and-programs/grants-special-populations/grants-special-education-and-individuals-disabilities/special-education-parent-information-centers). These citations establish each publisher's scope, not jurisdiction-specific clinical approval.

## Additional primary-source reconciliation — same review branch, no production change

- **Verified CDC replacement:** The old CDC ADHD communications page exposed no readable text. The directly inspected [CDC Free Materials on ADHD](https://www.cdc.gov/adhd/php/communication-resources/index.html) now replaces it; CDC explicitly lists **updated and expert-reviewed October 21, 2026**. The source-audit totals are therefore 68 directly readable, 8 access-restricted but independently indexed, and 1 JS-only treatment locator.
- **Accurate ages and roles:** The Child Mind Institute topic is actually *Tweens, Teens, & Young Adults*, so it is also indexed for young adults. Additional preschool-appropriate parent/child topics are indexed Early childhood; Eldercare is not school-targeted; VA and federally funded provider/agency resources retain professional-focused role tagging. Age mentions describe content coverage and primary campaign audiences, not proof of program admissions eligibility.
- **Specific agency navigation:** DIAL's current official title is *Disability Information and Access Locator* (modified August 13, 2026); the AHCCCS 988 cooperative-agreement page is labeled agency implementation information rather than a patient crisis line. The separate state crisis listing remains intact. The Youth Voice, Youth Choice project ended but its website's resource library continues.
- **Cross-checked provenance:** Reconciled every field in the machine-readable 77-record source ledger with the exact repository index and 77 published anchor cards. Preserved all 609 finder records, the single homepage caret disclosure and the original unhosted approved guide PDF masters.

## Corrected errors in the isolated branch

- **Early childhood indexing:** Ten Child Mind Institute resources whose provider pages explicitly address preschoolers/child development had not been discoverable under `Early childhood`. Added that population while retaining school-age discovery. Topics include screen time, behavior problems, autism, anxiety, milestones, parenting behavior, selective mutism, regulation and related guides.
- **Unsupported youth cutoff:** Child Mind Institute's `Tweens, Teens, & Young Adults` collection is not an age-restricted intake program. Removed the unsupported `minimumAge:13` which hid the collection from children/tweens.
- **Older-adult service:** [ACL Eldercare Locator](https://eldercare.acl.gov/home) is for older adults and families, not a general children's disability locator; changed to Adult.
- **Youth Voice archival scope:** The [funded Youth Voice, Youth Choice team published a farewell](https://youth-voice.org/farewell-from-the-cyvyc-project-team-goodbye-for-now-but-the-movement-continues/) after a five-year project. Resource library and stories remain accessible. Label now states `project concluded`, avoiding the impression of active program enrollment.
- **RecoverMe audience:** [SAMHSA RecoverMe program](https://www.samhsa.gov/substance-use/recovery/recoverme/about) is primarily designed for young adults **18–25**. Corrected Adult audience and title; this is a primary audience, not a confirmed provider-service eligibility restriction.
- **IDEA parent centers:** U.S. ED material describes family/youth support from **birth through age 26**. Enabled early-childhood, school/adolescent, and young-adult discovery. Renamed three entries to make clear that the pages describe **federal programs and grants**, not local intake providers.
- **Professional versus direct consumer resources:** ACL technical assistance centers and VA AboutFace professional guidance are not broadly patient-facing services. Removed inappropriate consumer-role tags on specialist directories.
- **CDC Essentials ages:** The CDC's page reviewed November 2, 2026 provides resources for ages **2–4** and **11–17**; recorded this as an age-scope explanation rather than claiming an infant curriculum.
- **AHCCCS crisis source:** [Current Arizona hotline page](https://www.azahcccs.gov/behavioralhealth/crisis.html) differentiates statewide, county, and tribal contacts; the existing link remains correctly to the statewide official directory. Do not substitute a specific county contact without the caller's service area.

## Not considered verified

- A 403 response is **not** proof of a dead public page. Eight entries were corroborated by official publisher indexing; preserve their source URLs pending live human checking.
- FindTreatment.gov loads an interactive application; one-line text extraction cannot establish functioning search controls.
- Online educational resources have *audience relevance*, not necessarily enforceable age eligibility rules. Do not treat group age tags as individual service admission criteria.
- Individual referral costs, treatment capacity, phone-answering times, benefit eligibility, active grants, policies, and legal requirements were not confirmed for every individual provider. Official program pages may become stale.
- Native screen-reader behavior, live 200%/400% zoom, external-website WCAG status and physical/grayscale printing remain separate QA gates. No PHI or user data was used.

## Quality controls and release gate

- `tests/provider-audit-77.cjs` validates all 77 audit records against their catalog URL, source domain, title, roles and age tags, safeguards corrected examples, counts the uncertain access classes, and prevents incorrectly labeling federal grant pages as direct intake.
- All 609 finder records are retained and current local site QA, population/search tests, keyboard and print tests must pass on the exact source head.
- **No merge/deploy authorized.** Review this PR and the audit before deciding whether to publish. Production commit `af79333d1317c1d4dbce0798aafe14df49644c34` must stay unchanged.
