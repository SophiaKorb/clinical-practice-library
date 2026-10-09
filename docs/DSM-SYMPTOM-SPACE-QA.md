# DSM Symptom Constellation — QA checkpoint
Updated: 2026-10-09

## Scope
Standalone learning page: `/resources/therapy/dsm-structure-4d.html`. CPL legacy pages are unchanged.

## What it is
- 38 curated example diagnostic profiles described by 26 hand-authored ordinal symptom dimensions.
- PCA computes three visualization coordinates from normalized feature profiles. Coordinates are **not** assigned based on DSM chapter.
- Two nested 3D isosurfaces are derived from a smoothed union of Gaussian neighborhoods around the profile coordinates, using marching tetrahedra.
- Terrain smoothing modes (local, balanced, blended) demonstrate how modeling assumptions affect surface shapes.
- A separate, fourth dimension illustrates *fictional-case functional impairment* with a larger or smaller case marker. It is not a DSM severity score or a risk score.
- Nearest-profile comparison uses cosine similarity of the full 26-dimensional teaching vectors, **not** projected 3D distance or probability.

## QA and remediations
- Added volumetric terrain so the map forms a readable 3D landscape rather than only a cloud of dots.
- Closed clipped contour edges by enlarging the terrain bounding volume to ±400 model units.
- Kept triangle count bounded for all three smoothing modes (3,000, 4,432, 6,412 in the tested checkpoint).
- Stabilized wireframe lines so rotating the model does not cause depth-based flickering.
- Throttled pointer-drag frames with requestAnimationFrame where available.
- Added surface visibility and smoothing controls, a 2D fallback, keyboard navigation, and principal-component loadings.
- Replaced misleading “X% vector overlap” with a cosine index and qualitative shared-feature explanations.
- Split reduced need for sleep without fatigue from general sleep disruption, and eating-related loss of control from general impulsivity.
- Retained explicit distinction between client-facing questions and assessor follow-up.
- Expanded the JS smoke suite and performed 22 targeted simulated DOM/canvas interaction checks, all passing at this checkpoint.
- Public HTTP reachability and live deployment status checked separately; these do not establish browser visual QA.

## Publication and privacy boundaries
- No user or patient data sent to a server; fictional teaching profiles are local UI state.
- None of the point distances, symptom weights, surfaces, cosine values or 3D axes are published empirical DSM distances or probabilities.
- Shapes depend on included example profiles and smoothing settings. They must not be treated as diagnostic borders, prevalence regions or comorbidity frequencies.
- Formal diagnosis requires an authorized, current DSM-5-TR reference and qualified clinical judgment.

## Open clinical and release checks
1. Expert review of hand-authored feature weights and omissions before use as approved staff competency material.
2. Full real-browser accessibility testing (screen reader, keyboard, Android Chrome and desktop) and screenshot/layout review; simulated DOM tests do not substitute for this.
3. Validation against appropriately licensed empirical, de-identified symptom datasets if future versions are to claim evidence-based relationships, with explicit normalization and methodology.
4. Review of the staff assessment curriculum and competency standards independently of this visualization.

## References
- [American Psychiatric Association — DSM](https://www.psychiatry.org/psychiatrists/practice/dsm)
- [DSM published updates](https://www.psychiatry.org/psychiatrists/practice/dsm/updates-to-dsm)
- [HiTOP](https://www.hitop-system.org/the-framework)
- [NIMH RDoC](https://www.nimh.nih.gov/research/research-funded-by-nimh/rdoc/about-rdoc)
