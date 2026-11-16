# CPL massive resource expansion — curated publisher-link QA

Date: 2026-11-16. Review branch `feature/cpl-expanded-curated-resources-20261116`, stacked on unmerged combined integration PR #43. Scope: **77 genuinely distinct external publisher destinations** (not 77 new original CPL clinical worksheets), six curated sections. This is intentionally source-navigation expansion, not automatic republishing, endorsement, diagnosis or qualified treatment guidance.

## Inventory and editorial decisions

| Section | New entries | Typical source publishers |
| --- | ---: | --- |
| Mental health publications | 13 | NIMH |
| Child, teen and caregiver guidance | 26 | Child Mind Institute |
| Development and parenting | 14 | CDC, Understood |
| Disability and independent living | 9 | ACL, ASHA, ILRU, Youth Voice |
| Treatment, recovery and crisis navigation | 9 | SAMHSA, 988, VA, NCTSN |
| Arizona and education navigation | 6 | AHCCCS, U.S. Department of Education |
| **Total** | **77** | distinct original HTTPS publisher links |

- Parent finder base (PR #43): 532 unique resource records. Expanded candidate: **609** entries; 77 unique new external publisher URLs, each associated with one local anchor destination in `resources/community/expanded-external-resources.html`.
- Reader-facing pages show straightforward grouped **titles and original-publisher links**, not taxonomy chips, inferred clinical indications, "Current Colorful" status or repetitive disclaimers. Existing homepage footer disclosure remains the only homepage disclaimer.
- The finder retains detailed fields behind the scenes (age/developmental coverage, audience/role, function, clinical task, query aliases and source URL). Resource labels are not proof of suitability. Only explicitly observed teen age limitations receive `minimumAge`; earlier PR #43 Eon/TrevorSpace age protections remain.
- Directly linked from both `resources/clinical-resource-finder.html` and `resources/community/index.html`. Full third-party text and downloadable licensed PDF materials have **not** been copied.

## Evidence provenance and limitations

Primary source hubs inspected through current publisher navigation include NIMH [brochures](https://www.nimh.nih.gov/health/publications), Child Mind Institute [Family Resource Center](https://childmind.org/resources/), CDC [child-development resource center](https://www.cdc.gov/child-development/resources/index.html), SAMHSA [find help](https://www.samhsa.gov/find-help), ACL [national resource centers](https://acl.gov/programs/strengthening-aging-and-disability-networks/national-resource-centers), AHCCCS [current crisis listing](https://www.azahcccs.gov/behavioralhealth/crisis.html), U.S. ED [parent centers](https://www.ed.gov/grants-and-programs/grants-special-populations/grants-special-education-and-individuals-disabilities/special-education-parent-information-centers), ASHA [AAC practice portal](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication) and Understood [Through My Eyes](https://www.understood.org/en/through-my-eyes). Links were transcribed from official source pages and examined as grouped publisher directories; not every individual destination received a separate, authenticated live-browser GET. Some SAMHSA and other official websites may rate-limit or block automated clients while public search-index pages still confirm their URL. **Do not represent URL syntax and source discovery as exhaustive live availability certification.**

A previously considered ACL-funded respite center link returned **HTTP 410 Gone**, and was excluded rather than introduced as a broken resource. Crisis service hours, ages and contact routes can change; use official sites for immediate referral decisions. National resource centers often serve professionals rather than patients directly. NIMH topics, Child Mind Institute family resources, and state/federal directory links have different evidence and legal scopes.

## Automated QA contract

- Updated `tests/combined-cpl-finder-qa.cjs`: validate all 609 resource URLs, existing role × child/teen/adult matrix, community anchors and homepage's single footer disclosure.
- Added `tests/expanded-external-resources.cjs`: validate 77 unique HTTPS original publisher links, 77 internal deep-link targets, external domain allowlist, six sections, absence of displayed internal labels, metadata validity and finder links.
- Both tests are wired into the site Actions workflow, along with the inherited PR #40 and #41 regression suites.
- The nonproduction rendered browser suite includes the new directory at 320, 390, 640 and 1280 CSS px, keyboard navigation, axe automated checks, print, and focus behavior. A first run found and corrected a print-only focus outline artifact. Exact passing run status must be captured on final reviewed SHA before any "ready" claim.

## Future improvements and human gates

Still open: independent live-browser provider-link spot checks (including geofencing/403), dated jurisdiction and age eligibility claims, source/rights review, native assistive technology and real zoom, print grayscale/physical paper, and qualified clinical content verification. This source navigation expansion does **not** certify the approximately 609 pages as clinically reviewed. Original October Southern Arizona family/youth PDF masters stay untouched and are not silently substituted.

**Release:** Draft stacked PR only; no merge, Vercel deployment, authorization change or user-data publication without explicit owner approval.
