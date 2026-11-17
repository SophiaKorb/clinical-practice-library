# CPL finder UX laboratory — review-only QA
**Audit date:** November 16–17, 2026 (America/Phoenix)
**Production comparison base:** \`main\` at \`2f05c759b5ecbf9af392f2de32945d57f2869a7a\` (published PR #50; 615 finder entries)
**Candidate:** draft [PR #51](https://github.com/SophiaKorb/clinical-practice-library/pull/51), \`review/finder-plain-language-ux-lab-20261116\`. For exact current head, use the PR's **head SHA** and the CI runs attached to it.

## Boundary and architecture
- Original \`resources/clinical-resource-finder.html\`, \`resources/clinical-finder.js\`, \`resources/clinical-finder-data.js\`, 615 resource URLs, all resource content and homepage remain **unchanged**. No merge or deployment.
- Review-only route \`/resources/finder-lab.html\` has \`noindex,nofollow\` and is intentionally absent from site navigation. New engine, adapter and UI are separate assets.
- The adapter indexes **all 615 current entries** and never changes source objects. It infers resource format/type from title/path, and only derives age and audience information when existing tags, explicit titles or examined linked collection pages support them. Unknown age/role remains unknown; a combined \`Client / caregiver\` source tag is not silently treated as both direct client and caregiver. A narrowly audited IEP guide overlay reflects actual page introductions.
- Collection overviews borrow stage labels and available role choices from their **own linked topic resources**, with explicit aggregate provenance; individual unrelated entries remain untouched.
- "Across ages / adapt to person" no longer implies Birth–5 suitability. General CPL education tools may appear for school-age/teen/adult work with a visible adaptation caveat; external provider directories are not automatically cross-aged. An ElderCare-specific listing must not appear in Birth–5.
- The initial interface has an ordinary-language question, three optional filters (population, resource kind, intended user), and advanced original clinical facets. Result cards show title, one-sentence purpose, resource kind, evidence-bounded audience, language where available, and why the query matched.
- Clinical topic families collapse a large number of near-identical entries to one ranked collection card with keyboard-accessible links to related formats. The extras may not match selected filters and are explicitly marked as such.
- No analytics, AI diagnosis, external search API or patient-data processing has been introduced. Search terms are reflected in browser URLs; users are warned not to type identifiers.

## Quantitative search-journey comparison
36 *editorially curated fictional concise clinical queries* are paired with one existing expected URL each. Rank compares the unchanged baseline finder and candidate search engine using the **same exact 615-entry data**, with grouped family representative titles counted as top-level results. Measures are *not* real clinician task success, recall over a complete relevance corpus, independent evaluator ratings, or clinical certification.

| Measure | Published baseline | Isolated prototype |
| --- | ---: | ---: |
| Expected target rank 1 | 16/36 | 30/36 |
| Expected target rank ≤ 5 | 24/36 | 36/36 |
| Expected target absent | 8/36 | 0/36 |
| Mean reciprocal rank | 0.534 | 0.907 |

Selected repeatable cases:
- **IEP:** 327 baseline matches, of which highly prioritized generic toolkits outrank IEP pages; prototype returns about ten title-based IEP results, prioritizing English pages for English queries and Spanish pages for Spanish queries. The Arizona parent guide exemplar moves from rank 252 to rank 3.
- **School refusal:** 0 baseline matches; prototype leads with school-based anxiety/support guidance, using specific title/path evidence rather than broad "anxiety OR school" expansion.
- **Tantrums:** 0 baseline matches; prototype leads with child aggression/caregiver coaching.
- **Dissociation grounding:** 0 baseline matches; prototype offers grounding handouts and dissociation guides in distinct results.
- **Adult ADHD:** original topic collection outranks the generic external publisher resource; workbooks and related formats are grouped rather than consuming seven result cards.
- **Birth–5:** stage-filter coverage uses specifically grounded early-childhood metadata; original broad external/older-adult entries are not silently treated as eligible for preschoolers.

The current source still has **unsupported/incomplete metadata**; at the last metadata checkpoint the adapter reported 163 entries with no confidently differentiated audience and 181 with no specific population and no across-ages designation. This is an honest remaining curation workload, not evidence that the resources are clinically inappropriate. A dozen direct-child/teen/adult badges in the production finder are not the same as the broader role and developmental discovery tags.

## Extended conversational phrasing regression (18 additional cases)
Following an initial regression round, 18 longer searches exposed real deficiencies in the prototype, including sentence-length searches for school attendance, biting, hygiene, task initiation, peer safety, and communication access. Narrow, explicit concept-to-resource mappings and intent extraction were added; this **development-informed** set is a second regression suite, not an independent or blinded benchmark.

| Metric, 18 longer phrases | Current finder | Review prototype |
| --- | ---: | ---: |
| Designated target ranked first | 0/18 | 15/18 |
| Designated target in top five | 0/18 | 18/18 |
| Designated target missing | 18/18 | 0/18 |
| Mean reciprocal rank | 0.000 | 0.907 |

Examples: “my five year old keeps biting classmates” → child aggression/caregiver-coaching collection; “student won't enter school” → school-anxiety support guide; “family needs Spanish IEP guide” → Spanish Arizona IEP guidance; “nonverbal autistic child needs ways to choose” → Communication Supports Toolkit; “teen self harm worksheet” → Safety Planning Preparation Sheet (format intent prioritized without suppressing clinical safety guidance as a secondary result).

**Guardrails:** These are search prompts about fictional concerns, not patient data; no automatic clinical classification, definitive resource fit or treatment recommendation. Intent words like “child” or “caregiver” are soft relevance cues only; don't silently filter out professional school and family materials. Actual suitability and third-party eligibility require source-specific review. The new search engine remains deterministically local, not an AI diagnosis or clinical triage tool.

## QA, screenshots and bounds
- \`tests/finder-lab-ux.cjs\` checks 36 clinical journeys, expected top-five locations, regression metrics, exactly 615 retained URLs, 77 original external provider links, family grouping, explicit minimum-age exclusion, metadata provenance/ambiguity, known Birth–5 resources, cross-audience coverage and no accidental homepage promotion.
- Site QA additionally runs existing local-link, script, content, child-age, provider-source and other site regressions. Report the **exact current head** and corresponding Actions results before sign-off; an earlier failed QA run was a correctly surfaced overly strict caregiver test, repaired by reading the Birth–5 index's explicit family audience.
- Rendered QA runs Chromium at 320, 390 and 1280 CSS px, captures baseline and prototype for **IEP** and **tantrums**, verifies query persistence/reload, keyboard access to controls and topic-family disclosure, checks no sampled horizontal overflow, runs axe WCAG automated rules and retains a US Letter browser-print sample. Artifacts appear in the PR's \`CPL rendered keyboard and print QA\` run as \`cpl-pr43-human-review-artifacts\` (under \`finder-lab/\`).
- Visual examination of initial screenshots: production shows five pathway buttons, eight advanced facets and 24 sparse title-only results for IEP; prototype moves the question and three primary selectors to the top, gives reasons and previews, and yields a shorter IEP result set. Card descriptions and audience cues were refined after screenshot review, including source-verified Arizona IEP guides. Later screenshot runs must be checked again on their exact SHA.
- **Not verified** by Chromium/axe: native NVDA, VoiceOver or TalkBack; true physical 200%/400% browser zoom; physical US Letter or grayscale print; PDF/UA, all provider eligibility and rights, expert clinical safety, the usability of every resource, or actual staff/patient interactions.

## Unfinished high-value work
1. Independent clinical/relevance evaluation with representative clinicians, case managers, caregivers and school staff. Expand to realistic difficult queries, typos, bilingual searches, unfamiliar diagnoses, safeguarding/urgency, low-literacy queries and ambiguous client/caregiver intent. Record first useful click and failed searches, with **no identifiable client information**.
2. Human curation of remaining unclassified age/audience records and generic fallback result descriptions, with citation/age/role provenance; do not blanket-tag by filename or guess service eligibility.
3. Check no cross-role or jurisdiction overclaim: children vs teens, birth–five vs broad life-span tools, general teaching vs external referral, individual vs caregiver material, combined audience source tags.
4. Hands-on keyboard and native assistive technology, actual zoom/reflow, contrast and grayscale/physical print; explicitly retain unresolved clinical/legal/guardianship/Part 2/rights/source/owner gates.
5. Obtain explicit owner approval of one **exact new integration SHA** before any merge, navigation change, external publication or deployment.

**Disposition:** isolated prototype for review; passing automated tests do not authorize production release.
