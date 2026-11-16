# Southern Arizona community guide integration — November 16, 2026

## Approval, originals and preservation
The owner explicitly approved inclusion of the two original October 2026 guides on November 16, 2026. The original PDF files have not been edited or regenerated.

| Approved original PDF | Pages | Original SHA-256 | Size |
|---|---:|---|---:|
| `Tucson_Regional_Family_Resource_Guide_QA_Revised_2026.pdf` | 38 | `fd7bfedde58146778780356ce65189d48b87196d055bb3dbba8c3491eeaf8230` | 619,841 bytes |
| `Southern_Arizona_Youth_Transition_Resources_REVIEW_2026-10-25.pdf` | 9 | `aec9739a256278e37d2dbe95e2d520f2afd1134c040ec821d2639cf0184e5edc` | 170,613 bytes |

The exact PDF originals remain in the private working archive and owner Library. This review branch includes complete **text companions** at `resources/community/family-community-guide-text.html` and `resources/community/youth-community-guide-text.html`; these are not byte-identical PDF downloads and do not preserve all embedded PDF links, bookmarks, typography, diagrams or page geometry. The original binary PDF files must be uploaded to the public CPL download directory before this feature can be considered complete. Do not represent the text companions as a substitute for the approved PDFs.

The family guide has 170 numbered entries, **including cross-references**, not 170 unique organizations. It also contains an accessible-playground/water-play finder. The youth guide has program-specific eligibility; ages about 14–24 are descriptive, not an all-program enrollment rule.

## Original QA limitations to preserve
- Family guide: source review on 2026-10-23 verified selected municipal details and 15 provider-advertised ESA claims, but not every provider contact, fee, availability or eligibility. 205 PDF annotations point to 137 unique destinations. No exhaustive live-HTTP check.
- Youth guide: controlled-review copy dated 2026-10-25. Approval to distribute the copy is not a fresh factual re-verification of all service details.
- Confirm current program openings, identity and age eligibility, costs, coverage, legal rules, transport, and confidentiality before individual referrals.
- Do not automatically involve parents or schools when youth disclosure or privacy is uncertain.

## LGBTQ+ additions
Independent provider source pages consulted 2026-11-16:
- STARS `https://starstogether.org/`
- STARS name/gender documentation `https://starstogether.org/name-gender-change/`
- STARS updates after changing records `https://starstogether.org/name-updates/`
- Eon `https://saaf.org/services/thornhill-lopez-center-on-4th/eon-youth-lounge-at-thornhill-lopez-center-on-4th/`
- University of Arizona Pride Student Space `https://ccc.arizona.edu/pride-student-space`
- Fluxx `https://fluxxproductions.org/`
- Fluxx clinic `https://fluxxproductions.org/name-change-clinic`
- Fluxx community health `https://fluxxproductions.org/community-health-project`

Avoid freezing dated clinic, ID/marker or passport requirements; STARS and Fluxx are community-navigation sources rather than controlling court/agency policy.

## QA completed
- Finder controlled-vocabulary validation for all 512 source entries: **0 invalid facet values**.
- Finder resource URL uniqueness: **0 duplicate URLs**.
- Both source document text companions cover 38 and 9 original page markers respectively.
- Every new finder entry points to a distinct section anchor in `resources/community/index.html`.
- Original PDF hashes were calculated from materialized Library originals (see table), not from reconstructed text.

## Required before merge/deploy
- Put the original, approved PDF binaries at stable public URLs and verify their hashes unchanged.
- Run repository CI and rendered browser QA, keyboard navigation, mobile overflow, print layout, semantic accessibility and tested links from index, homepage and filtered finder.
- Independently verify priority local referral details (particularly historical advice on gender markers/passports) and ensure no implication that a specific identity is a diagnosis.
- Confirm all relevant discovery combinations: children + caregiver/clinician/school; teen + youth/program; adult + identity documentation; staff/case management + referral/coordination.
- Resolve any open publication, translation, clinical, accessibility and release gates explicitly. No automatic production deployment.
