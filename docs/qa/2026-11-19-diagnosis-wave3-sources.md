# CPL practice labs — Wave 3 independent source and safety ledger

Review date: 2026-11-19. New dependent review branch from frozen passing Wave 2 PR #91 source `937447f45d3033f1178e58b23d8d25f1bd280356`. Neither clinical validity nor rights/release clearance is implied.

## Intellectual disability: supported choice and communication

- [AAIDD definition](https://aaidd.org/intellectual-disability/definition/) (official current reference): intellectual functioning and adaptive behavior with onset before age 22, together with linguistic, cultural, environmental and support considerations. Do not infer formal ID from a visual exercise or limited communication.
- [AAIDD and The Arc 2021 joint statement](https://www.aaidd.org/news-policy/policy/position-statements-2/autonomy-decision-making-supports-and-guardianship): decisions remain person-centered, with communication aids and less restrictive supports; guardianship or medical/financial consent require actual local legal review. The law may differ by age, jurisdiction and individual order.
- [ACL supported decision-making program](https://acl.gov/programs/consumer-control/supported-decision-making-program) (official background). No claim that a pictured option establishes legal capacity or substitutes for a properly authorized decision.
- Novel visual meaning-making structure starts with a person-nominated decision, accessible genuine alternatives, chosen supporter role and revisit/rights. It is neither a capacity exam nor validated AAC instrument; consult qualified specialists as appropriate.

## Eating concerns: medical-first clinical support

- [NICE NG69](https://www.nice.org.uk/guidance/ng69/chapter/recommendations) recommends early assessment, physical and mental risk review, and age-appropriate specialist referral; it specifically cautions against use of a single BMI or illness duration as a referral determinant. NICE web page could not be fetched directly in this environment (403); recommendations were checked via official publisher-indexed excerpt and official downloadable guideline listing. This is **UK guidance**, not a local US protocol.
- [APA eating-disorders guideline (February 2023)](https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines/eating-disorders) and [APA official 2023 release](https://www.psychiatry.org/news-room/news-releases/apa-updated-guideline-on-eating-disorders): specialized assessment and medical review; age-sensitive family-based approaches for applicable adolescents. ARFID discussed but *not* given specific APA treatment recommendations given evidence limitations. Avoid suggesting the map identifies ARFID or chooses nutrition orders.
- [APA proposed severity-specifier corrections, September–October 2026](https://www.psychiatry.org/psychiatrists/practice/dsm/proposed-changes/) note a contemporaneous taxonomy issue; the new map does **not** implement DSM severity classification and must not imply a finalized September proposal.
- The four visual perspectives are **parallel with medical assessment first**, not a self-triage decision tree. No weight/thresholds, caloric targets, home withdrawal, medication doses, medical severity score or false reassurance. Refer to qualified medical/specialty teams with actual age, consent and safeguarding requirements.

## Index, age, role and rights

Two additional HTML records after 813 unchanged canonical + 31 ADHD + 4 Wave 1 + 20 Wave 2 = **870**. Each explicitly tagged to one appropriate category (ID or eating disorders), across ages **only with person-specific adaptation**, and clinician/client-caregiver roles; supported choice also permits school-team context. No unsupported diagnosis tag; no inference that all materials suit all users. All new pages carry `noindex` and no personal data entry, persistence, analytics or network submission.

Outstanding: qualified specialist/medical and developmental review, legal capacity/guardian rights, privacy, youth voice, cultural safety, sources and jurisdiction, true 200%/400% native browser zoom, NVDA/VoiceOver/TalkBack, physical grayscale printing, tagged PDF/UA and explicit owner release. No PHI, merge, deployment, publication or permissions changed.

## November 19 — role-specific finder correction and visual reflow QA

Original Wave 3 HTML labels both the person/caregiver and the facilitating professional as actual audiences. The older CPL live finder intentionally declines to guess whether a combined `Client / caregiver` tag means a direct client or a caregiver resource. We therefore added exact, narrowly scoped `AUDIENCE_EVIDENCE` for the two authored pages only, plus the `Staff / case manager` role because both lab instructions explicitly include authorized service-coordination steps. This is source-content indexing, not provider eligibility. Added real finder search checks for children and adults in the case-manager audience and separate caregiver filters. The cross-age facet means adaptable *discovery*, not child-facing clinical approval.

Visual QA found and fixed an overlap of the two collection cards at 390px; the previously passing overflow test alone did not detect their overlap. Browser QA now checks distinct, non-overlapping accessible lab cards. Printed working lines were increased after inspecting both original two-page PDF outputs and finding unused space; the new exact PDF page counts must be reverified after this change.
