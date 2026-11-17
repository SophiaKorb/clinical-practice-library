# CPL diagnosis resource hubs — review and release evidence
Date: 2026-11-17  
Scope: isolated `review/diagnosis-resource-hubs-20261117` / draft PR #54  
Frozen production parent: `7dd9ec3b97ebd79a1795d510282e9650722a306d`  
**Do not merge, deploy, publish or infer clinical approval.**

## Observed issue
The eight homepage diagnosis cards described school-access guides while a user reasonably expected a complete route to clinical, client, caregiver, visual, PDF and external reference materials. The Adult ADHD topic page was a useful but narrow task-start collection and omitted other major adult ADHD concerns.

## Source inventory and architecture
- Current finder: 615 resources, 14 diagnostic tags. No finder-data changes.
- ADHD directly tagged resources: **19**; all 19 are statically present in the comprehensive Adult ADHD page, and the query-driven diagnosis hub reads all 19 from the source data with no cap.
- The Adult ADHD comprehensive page additionally links **12 cross-diagnostic** tools with audience and relevance qualifiers. The general ADHD index provides **15** additional functional links, including the comprehensive guide; these are not silently reclassified as diagnostic treatments.
- Generic diagnosis index enumerates **all** entries for **all 14** current diagnosis-tag facets. It groups by topic collection, clinical/assessment, worksheets/PDFs, school/family and publisher references. The selection uses a source-catalog exact tag, not a relevance prediction.
- Homepage retains eight original diagnosis cards and all 24 original family/clinical/homeschool links while adding a prominent route to the full index for each; ADHD directly links the new comprehensive adult guide.
- All 24 original diagnosis guide destinations gain a backlink to the correct full resource index. This is navigational only; clinical support body text remains preserved and existing code/content parity tests remain active.
- Original Adult ADHD task-starts collection is retained as a focused toolkit and explicitly links to the comprehensive guide.
- New pages stay `noindex,nofollow` while draft-only; remove only as a separately authorized production-release step.

## Adult ADHD clinical content
Comprehensive overview: adult presentation, childhood developmental history, multi-setting impairment, co-occurrence and differential, medical/sleep/mood/substance conditions, psychoeducation, medication-prescriber boundaries and monitoring, structured CBT and psychosocial care, practical task initiation, time, working memory, daily living, relationships, workplace accommodation, participation and outcome tracking. Includes a problem → context → support experiment → review pathway with explicit limits and accessible functional map.

Original/primary sources checked: CDC ADHD in Adults (updated Oct 9, 2026), NIMH ADHD publication, NICE NG87, Australian ADHD Clinical Practice Guideline/AADPA, and JAN workplace accommodation guidance. These sources **support an educational framework**, not clinical endorsement of each CPL worksheet or proof of all source claims.

## QA required / status ledger
- `tests/diagnosis-resource-hubs.cjs`: 14 facets; 19/19 exact ADHD catalog URLs; 12 related cross-diagnostic links; 24 original guides; eight homepage cards; local link and anchor integrity; source list.
- Existing `scripts/check-school-guide-parity.js`, finder and site QA suites: must pass unchanged.
- `scripts/qa/diagnosis-hubs-rendered.cjs`: Chromium 1280/640/390/320 CSS px; generic ADHD/Autism hub counts 19/29; 14 topics; guide backlink; keyboard; axe, print; forced colors; screenshots.
- Initial static QA failure was an overly strict section regex in the new QA test and was corrected. Early rendered QA identified an **inherited** low-contrast original guide metadata/footer treatment; darkening `--muted` in the original guide CSS corrected it. Do not ignore genuine remaining regressions.
- 1280px screenshot review: adult guide is visually coherent; first two navigation card labels were shortened to prevent isolated wrapped arrows.
- Exact-head CI status must be recorded here and in canonical Notion after the final commit has been checked.

## Human approvals and independent verification still required
Representative clinician/caregiver/client reading and task testing; specialist adult ADHD clinical review; current medication/benefits/legal and provider eligibility verification; rights and medical/privacy/guardian/Part 2 approvals where relevant; actual NVDA/VoiceOver/TalkBack; genuine 200% and 400% browser zoom; physical black-and-white print and tagged PDF / PDF-UA review; owner authorization to merge/deploy. Keep PR #53 and all other isolated source lineages separate.

## Release discipline
Compare final SHA with production, inspect all changed paths, run all gates, preserve eight original diagnosis cards, 24 guide links, 615 finder records, external publisher sources, and draft provenance. No deployment without a new explicit user instruction.
