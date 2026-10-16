# Clinical content QA register — October 15, 2026

## Reviewed in this cycle
Sampled and checked clinical risk/terminology of:
- `resources/handouts/making-a-suicide-crisis-safer.html`
- `resources/handouts/suspected-opioid-overdose.html`
- `resources/handouts/safety-planning-preparation-sheet.html`
- `resources/therapy/anxiety-exposure-ocd-start-here.html`
- `resources/therapy/trauma-ptsd-start-here.html`
- `resources/therapy/treatment-plan-menu.html`
- Prior work separately reviewed the 13 state IEP guides for presentation, terminology and navigation.

### Confirmed fixes
1. **Overdose response (active and legacy):** clarified rescue breathing / dispatcher directions if breathing absent, repeat naloxone according to product directions, emergency evaluation even after apparent recovery, and official CDC/SAMHSA source links. Standardized author attribution.
2. **Treatment planning menu:** revised privacy language to say *do not input identifiable client information* and avoid suggesting a browser can guarantee that entered/copied/printed information is not retained. Full author attribution applied.
3. **QA test infrastructure:** fixed malformed JavaScript in the IEP editorial regression test that caused a site-wide script-syntax check failure.

### Sources checked
- CDC: https://www.cdc.gov/stop-overdose/response/
- CDC/NIOSH: https://stacks.cdc.gov/view/cdc/77297
- SAMHSA: https://www.samhsa.gov/substance-use/treatment/overdose-prevention

### Outstanding — NOT clinically or legally cleared
- Human specialist review of crisis/suicide guidance, including emergency thresholds, locale-specific services, and intended audience.
- Detailed accuracy/source freshness review of all exposure/OCD, PTSD, trauma, family and treatment protocols (sampled, not exhaustive).
- Full-page review of all hundreds of HTML pages, legacy versions, Spanish translations, screening tool permissions, copyright and employer provenance.
- Accessibility and mobile browser field testing, and jurisdiction-specific professional limitations.
- Verify GitHub CI and Vercel preview for latest commit. Do not deploy or claim clinical endorsement from a green automated check.

This document is a sampled editorial and source review record, not evidence of medical safety certification or permission to use institutional content.
