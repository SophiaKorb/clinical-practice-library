# Phase 8 – Structural visual QA and clinical review gate

Updated October 10, 2026. Working branch: `cpl-2-colorful-helpful`. Legacy production is intentionally unchanged.

## Accomplished

The expansion ledger lists 150 distinct resources across 25 clinical topics and six authored purposes per topic; the 25 PDF companions and 25 collection pages do not inflate that count. The existing publication and link-integrity audits are retained. A subsequent visual-structure pass replaced generic five-card layout for 13 topic map/index pairs, plus the existing parallel learning-access map. Types of spatial reasoning now include feedback/alternative-response loops, access channels considered jointly, ABC observation versus hypothesis and support, paired medical/psychosocial assessment, functional load/budget and attention allocation, and explicit protective-versus-voluntary routes for sibling harm. Map labels and accessible explanatory text communicate uncertainty and avoid using these visual heuristics as diagnostic instruments.

The HTML source generator, published map pages, mobile/print rules, and regression checks were updated together. CI now compiles the Python generators, reproduces all 150 pages and collection indexes, and rejects uncommitted generated-source drift. PDF companions were not regenerated in this visual pass and continue to require layout and accessibility review.

## Reviewer sign-off gate

Do not mark any resource clinically approved based on CI, successful deployment, readable source code, or a well-drawn diagram. Each resource is `qualifiedClinicalReview: pending` in the Phase 8 ledger. Assign a qualified reviewer and version/date; record: source and access limitations, diagnostic/differential omissions, age/communication appropriateness, consent and autonomy, emergency and referral thresholds, scope-of-practice clarity, potential harm of literal use, and consistency between clinician guidance, case reasoning, client wording and printable companion. Note evidence strength and where an original diagram expresses a clinical hypothesis rather than a proven causal pathway.

Treat the following as high-priority review before unrestricted clinical sharing: acute activation/psychosis and safety; restrictive eating and urgent medical stability; dissociation/trauma; child aggression and sibling coercion; supported choice/capacity; OCD/ERP; BFRB treatment claims; and any crisis/medical pathway. Other resources still require review, not a rubber stamp. Fix critical safety, role, consent or unsupported-evidence defects before approving a topic set.

## Rendered usability gate

At 320, 390, 768 and desktop widths, inspect actual heading hierarchy, scroll and clipping, diagram direction and branch interpretation, keyboard order/focus, screen reader labels and live feedback, reset and print interactions, grayscale printing, text zoom and contrast. Test at least one representative page per new visual model and every high-risk topic and printable. Check whether a viewer can state the main concept with most explanatory prose covered: if not, redesign the graphic. Confirm blank worksheets, no PHI persistence and printable equivalence; do not claim WCAG conformance from a source scan.

## Outstanding limitations

No qualified clinical review, formal tool validation, full source retrieval for restricted references, or complete rendered-browser/assistive-technology/print-dialog review is documented. Resource counts are not a measure of evidence quality or independent clinical suitability. Deployment and automated regression checks demonstrate technical availability, not clinical approval. Continue to hold all review flags open until evidence is recorded.

## Source-access correction during QA

NICE NG69 recommendations 1.2 (identification/referral), 1.10 (medical risk/monitoring) and 1.11 (level-of-care decisions) were independently available for inspection on October 10, 2026. The Phase 8 eating-care source metadata and all seven generated topic entry/resources have been updated from the former 403 retrieval report. NG69 does not establish a complete ARFID, pica or rumination pathway; formal medical/nutritional and clinical review remains pending. No absolute weight/BMI threshold is used to infer stability or level of care. Original tools are not validated clinical instruments.
