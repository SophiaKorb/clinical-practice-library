# CPL Phases 1–3 checkpoint — October 9, 2026 (Phoenix)

## Completed scope

Colorful branch only: `cpl-2-colorful-helpful`. No changes pushed to `main` or legacy production. This is a substantial initial expansion batch, not completion of the requested major library expansion or clinical approval.

### Audit and restoration

- Repeatable inventory covers 555 HTML/document resources, all 11 fetched branch-tip refs, SHA-256 duplicate groups, and hyperlink reachability. 552 are reachable after adding the complete resource directory; three isolated layout-preview pages are intentionally excluded. Dynamic destinations require separate behavioral checks.
- 21 exact duplicate groups are retained; many are deliberate legacy counterparts. No content deleted.
- All eight original diagnosis collections / 24 clinical, family, and homeschool links remain prominent. Existing regression tests verify them and 292 paired supports.
- Seven Spanish older-branch pages restored in full with version notices and current-topic links. Crosswalk preserves original paths, counterpart paths, and text comparisons. One has identical extracted text; others retain differences pending clinical/linguistic comparison. No translation approval claimed.
- Restored original two-page after-school reset PDF from retained production branch, linked from its current handout. Parsed both pages and extracted 2,092 text characters. Rendered appearance and physical print behavior remain unchecked in this session.
- Added complete searchable resource inventory, including previously unlinked current pages and downloads; legacy resources are a separate explicit filter. Deliberate legacy navigation remains labeled. Source search found no accidental CPL-host / legacy navigation in current resources.
- Existing thermometer regression confirms six independent levels. Existing 17-board toolkit redesign is preserved; no claim of a new rendered audit.

### Source research and crosswalk

13 resources annotated with organization, topic, evidence type, use, CPL connection, freshness, retrieval status, and checked date. Primary publisher retrieval or official search evidence is distinguished from blocked retrieval. The directory covers APA assessment, AACAP child/developmental guidance, NICE autism/ADHD, VA/DoD PTSD, ASHA aphasia/AAC, UNC AFIRM, NCTSN child welfare, SAMHSA family/SUD, IES reading/math, and rehabilitation-system TBI education.

Evidence is recommendation-specific. A guideline index is not a treatment recommendation; training and patient education are not interchangeable with guidelines. AACAP explicitly treats guidance older than five years as historical. NICE guidance needs adaptation from its UK service context. Source copyright and proprietary test restrictions are retained.

| Topic | Existing coverage | New contribution | Highest remaining gap |
| --- | --- | --- | --- |
| Autism / ADHD / access | Diagnosis guides, EF and communication toolkits | Competing-hypothesis lab; NICE/UNC/ASHA routes | Dedicated integrated autism assessment cases and outcome menu |
| Assessment / neuropsychology | Catalog, screening and referral materials | Question-to-feedback workflow, language/response validity layer | Differential case series, domain-to-decision worksheets and qualified review |
| Family / development | Parenting, early-childhood and sibling guides | Pattern experiment with safety gate, worked case, family planning sheet | Age-specific caregiver coaching series with implementation outcomes |
| Trauma / psychotherapy | Trauma, CBT, ACT, DBT, MI and other shelves | VA/DoD directory route and evidence-use framework | Recommendation-level freshness and claim audit across existing guides |
| Education | Detailed diagnosis/support pairings | IES reading and math evidence links | Worked instruction-versus-accommodation cases and school collaboration forms |
| Rehabilitation | SMI / functional support resources | ASHA and MSKTC directory routes | Integrated cognitive rehabilitation and acquired-disability case tools |
| Workforce training | Intern hub | Directory, supervised workflow, role-specific implementation guidance | Bachelor's-level observation/documentation curriculum and case-manager modules |

### Implemented expansion

- Authoritative resource directory with text/topic filters, use notes, evidence distinctions, access limits and source crosswalk data.
- Barrier Formulation Lab: six-stage clinical route, two competing hypotheses, discriminating evidence, support trial, outcome/review plan, fictional worked case, advanced causal-inference cautions, and links to original detailed guides. In-memory fields; example cannot overwrite existing entries.
- Assessment: Question to Feedback: integrated referral/decision matrix; consent/competence/norm/access/validity checks; neuropsychology and expressive-language layer; fictional prospective-memory case; feedback and role-specific handoff.
- Family Pattern Support Experiment: safety and power gate; interaction sequence, competing explanations, one-change experiment, printable client/caregiver sheet, and revision criteria.
- Homepage and intern hub feature these tools. Short barrier map links to the advanced layer rather than replacing rich clinical material.

### Second expansion batch

- Added Frontline Observation & Coordination: observation-versus-inference matrix, three fictional cases, scope-specific actions, risk escalation, and a printable closed-loop referral handoff.
- Added Functional Progress Review: five functional domains, paired baseline/review matrix, contextual supports, burden and agency, a worked case preserving ongoing support needs, and explicit limits on disability and standardized-score inferences.
- Linked both from the homepage and intern hub; assessment workflow and functional review are also accessible from the assessment start page and treatment menu.

## Validation

- New behavioral regression: combined directory filters, no-result state/reset, worked-case loading, prevention of overwriting entries, clearing, and inventory version/search filters.
- Local links: 523 pages, 3,656 local references, zero errors.
- Site JavaScript/event-handler syntax and JSON checks, catalog behavior, school support parity, homepage routes, and thermometer checks run for this batch; terminal results recorded before publication.
- New pages use labels, native controls/details, visible focus, responsive single-column layouts, text-plus-color distinctions, explicit light color scheme, and print rules. These are implementation checks, not WCAG certification.
- Supported browser control is unavailable in this managed environment. No rendered browser, screenshot, actual print-dialog, device matrix, or complete accessibility audit was performed. Do not describe these as passed.
- Clinical review is editorial synthesis and source-boundary checking, not independent clinical approval. The new tools are not validated instruments.

## Prioritized continuation backlog

1. Rendered Colorful QA: phone 320/390, desktop, keyboard, source/inventory filters, form reset, expanded advanced content, print pagination, restored PDFs.
2. Recommendation-level clinical freshness/source crosswalk across every existing guide; restricted-source manual verification.
3. Autism/ADHD/learning integrated assessment worked cases with qualified interpretation review; no proprietary items.
4. Diagnosis-specific treatment menus for underserved psychosis, bipolar, SUD, eating disorders, acquired neurological conditions, and complex developmental presentations, linked to functioning and outcomes.
5. Bachelor's-level staff curriculum: observation versus inference, risk escalation, documentation, role boundaries, referrals and follow-through; case-manager coordination sheets.
6. Visual and printable expansion: functional-domain maps, instruction/accommodation comparisons, family response sequences, and accessible progress dashboards. Preserve advanced reasoning in expandable layers.
7. Clinical/linguistic comparison of alternate Spanish versions; no automatic deletion or replacement.

## Deployment record

Publication target: preview deployment for Colorful branch under the existing Vercel project. Legacy production must retain its current branch/aliases. Record exact commit and terminal deployment state after publishing; READY does not establish browser rendering or clinical validity.

Initial expansion deployment verified: commit `4d9dbc65f808c2e9f88415721f85ac09a8a7c7b9`, deployment `dpl_GnZBPx2YLHsJ8X4Yofio3p93G4S6`, READY. Authenticated HTTP checks returned 200 for the formulation lab and directory and returned expected committed page content. Stable Colorful branch alias: https://clinical-practice-library-git-cpl-2-colorfu-f5f645-cohon-family.vercel.app . The second expansion batch requires its own terminal deployment verification.

## Latest continuation

Phase 3 continues with the integrated assessment casebook, learning/access two-track tool, two verified fillable PDFs, and a 15-source directory. See [assessment/school expansion checkpoint](2026-10-09-ASSESSMENT-SCHOOL-EXPANSION.md) for current metrics, corrected branch-ref scope, PDF visual verification, and remaining work.
