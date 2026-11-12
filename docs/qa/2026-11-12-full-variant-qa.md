# CPL full same-title comparison and additional source-rights QA — November 12, 2026

## Verified boundary

**Parent:** draft PR #26 `26f9eacc0708ab6a8b82ff179554f66609638ccf`.  
**Review PR:** #27, branch `review/cpl-full-variant-provenance-20261112`.  
**Deployment:** branch inherited `git.deploymentEnabled:false` before any new commit.  
**Publication state:** draft, not merged or deployed. No PHI, clinical source text edits, new public navigation, permission changes, artwork edits, canonical redirects or deletion of duplicate-title versions.

## Reviewer deliverables

1. [Permanent 26-group index](2026-11-12-variant-review-index.md): all 54 paths, source and visible-main-text hashes, file sizes, words/language/roles, 26 per-group human review worksheets, clinical risk priorities, no implied canonical owner.
2. [Download the offline HTML comparison packet (GitHub Actions artifact)](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313116834/artifacts/13987101744): generated from the exact checkout, **410,410 bytes uncompressed HTML**, 26 groups with 54 complete extracted main-body texts, pairwise file matching and block differences. The source remains unchanged; only the review artifact contains the extra comparative display. **Artifact expires December 12, 2026** (the source generator and Markdown index remain in Git).
3. [Additional dated source/rights evidence](2026-11-12-provenance-rights-extension.json): ten new primary pages/policies mapped to the specific CPL materials they inform. All three top-level approvals—clinical, rights and publication—are `false`. Existing seven-record source ledger in PR #26 is preserved and not overwritten.
4. `scripts/qa/cpl-generate-variant-packet.cjs` builds the offline packet and JSON manifest without accessing external services; `scripts/qa/cpl-variant-packet-browser.cjs` tests keyboard, generated file semantics, axe-core, mobile overflow and print styles.

## Actual comparisons and interpretation

- **26 same-title groups, 54 source files**, of which **one file pair is byte-identical** and **eight additional pairs have identical normalized visible main text despite differing file bytes**. Comparisons use the source `<main>` region; they cannot establish that footers, print-specific elements, images or linked PDFs are equivalent.
- **P0 human review:** suicide-crisis and safety-plan Spanish variants; harm-reduction translations and emergency terminology. Same text can conceal rights/attribution or fillable PDF differences. None should be automatically redirected or reduced to one “master.”
- **P1:** remaining Spanish-language variants. Compare age appropriateness, accents/idiom, first-party versus translated authorship, PDF links, confidentiality instructions and navigation.
- **P2:** 12 toolkit/start-here English pairs and selected-resource route names. Their matching titles appear to serve different informational roles; equal titles are not a duplication defect by themselves.
- **No editorial decisions have been made.** A byte-identical file can still have multiple public source URLs; choice of canonical URL or historical preservation requires owner authorization.

## Dated primary-source and rights findings

| Evidence | Primary source date | Narrow finding / unresolved gate |
|---|---|---|
| CDC suicide risk and protective factors | May 26, 2026 on page | Multifactorial risk/protection; cannot infer a patient's acute suicide risk from a factor list; CPL patient-level risk thresholds still require clinical review. |
| VA/DoD PTSD guideline | 2023 guideline edition | Individual trauma-focused CPT, PE, EMDR are recommended options; does not authorize copying publisher manuals or select treatment for a particular patient. |
| IOCDF ERP page | No dated update confirmed | First-line psychological OCD treatment and need for willing, non-coerced participation; outside reproductions are not automatically licensed. |
| Stanley–Brown safety-plan *form* | Copyright 2008, 2021; filename contains 2024 date | Its PDF explicitly allows individual use, but requires written permission for alterations or its use in an EMR. The distinct CPL worksheets are **not found to be copies**, and derivative/rights status remains to investigate. |
| CDC agency-materials policy | Webpage last-updated date not confirmed | Most government material public domain, but contractor/third-party images and state materials may be restricted; CDC sets attribution, nonendorsement, non-modification, free-source requirements for direct reuse. |
| VA copyright policy | February 10, 2023 | Government-produced VA content lacks US copyright protection; third-party hosted resources may have different terms. |
| VA PCL-5 | VA source page updated October 1, 2026 | VA-created instrument is described as public domain for qualified professionals and researchers; Spanish translation edited/confirmed **not validated in published research**. |
| VA PC-PTSD-5 | VA source page updated September 16, 2026 | Same measure-specific public-domain/qualified-use and Spanish-translation validation caveats. Screening does not establish diagnosis. |
| NCTSN website-use policy | Publication/update date not independently confirmed | Downloading, no-fee distributing unmodified original documents with attribution/branding differs from adapting or relicensing; NCTSN directs adaptation requests to its own team. |
| SAMHSA rights FAQ | FAQ indexed last-updated November 4, 2024 | Most website content public domain but individual restrictions exist. Automated primary-source access may be denied; preserve uncertainty. |

Source links and date semantics are kept with the individual entries in the ledger. These are page-level evidence checks, **not a verified source-by-source rights determination for every actual CPL asset**.

## Automated regressions, including failure history

At implementation commit `ce085a83bba8f8f27589c35a9eebc24a4df8a090`:

- [Full CPL site QA 43313116772](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313116772): **SUCCESS**.
- [Generated reviewer packet + axe-core 43313116834](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313116834): **SUCCESS** with **41 passed axe rules and zero reported violations** at **320/390/768/1280px**, one main landmark, 26 navigable groups, 54 expandable full-text panels, 26 decision records, keyboard first-tab skip, no horizontal overflow, print-safe navigation.
- [Existing rendered keyboard/print QA 43313117056](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313117056): result must be verified as completed before claiming exact-source full success.
- [Initial review test run 43312644268](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43312644268) failed on a **test assertion**, not content; corrected.
- [Subsequent run 43312886222](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43312886222) failed due to actual 320px **reviewer packet** overflow from a long underscore note; corrected and retested. Source clinical resources were never altered.

**Final documentation-only review-branch SHA** will require its own exact-head verification before this QA is closed; attach the final CI and packet artifact links in PR #27.

## Open reviewer gates (not approved)

- Clinical specialist: suicide, overdose, PTSD, OCD/ERP, assessment-use limitations, diagnosis/safety thresholds and intended populations.
- SLP and accessible communication: unapproved visual tools remain gated in PR #21/#24, not incorporated here.
- Spanish and cultural/developmental reviewers: meaning, user comprehension, source fidelity, high-stakes crisis wording, dialect and accessibility.
- Rights/provenance: original authorship, third-party images, exact status of Stanley–Brown form versus independently made worksheets, institutional work-for-hire claims, NCTSN/CDC conditions, assessment instrument version and translation rights.
- Accessibility: live native screen reader, alternative keyboard controls, browser/print physical checks, grayscale and CVI needs.
- Owner: no merge, public release, hosting, permission or production deployment without separate explicit authorization. Review-only Vercel `git.deploymentEnabled:false` must not merge into production unchanged.

**Engineering status:** reviewer evidence and bounded technical QA; **human/publication status:** held.

## Expanded final-head regression contract

The dedicated [review workflow](https://github.com/SophiaKorb/clinical-practice-library/blob/review/cpl-full-variant-provenance-20261112/.github/workflows/cpl-full-variant-review.yml) checks out the **exact PR head SHA**, runs the complete 26-group packet generation and axe/browser tests, **and reruns the existing three-route library-wide plus eleven-route source accessibility browser regressions** against that source, alongside the repository-wide site and separately triggered rendered checks. The permanent index test requires coverage of **every one of the 54 actual current duplicate-title URLs**, not merely 26 heading labels. Previous source branch QA may be skipped by branch filter and must not be counted as a pass on the new branch; this workflow provides the equivalent checks here.

**Final run evidence:** pending on this documentation and workflow commit; the action links and artifact ID will be added to PR #27 after confirmed results. These remain automated tests, not human approval.

## Final protected review-run evidence — implementation commit `cecb55b8a69a7ac6c79bf6de4da14c3c35bdcef5`

- [Full site QA 43313704414](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313704414): **SUCCESS**.
- [Existing rendered keyboard and print QA 43313704365](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313704365): **SUCCESS**.
- [Complete reviewer packet and exact-head multi-route Chromium QA 43313704424](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313704424): **SUCCESS**. The workflow explicitly checks out `github.event.pull_request.head.sha`, generated a **410,410-byte HTML packet** covering 26 groups and 54 files, and produced an indexed manifest. The packet had **zero axe-core violations**, with **41 passed rules at each** of 320, 390, 768 and 1280 pixels. All keyboard/skip/mobile/print-style tests passed, as did the rerun of the **3-route CPL finder/inventory** browser QA and **11-route high-stakes resource** axe/keyboard QA.
- [Review-only HTML packet and JSON manifest](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/43313704424/artifacts/13985819690) were confirmed uploaded as an Actions artifact, expiring **December 12, 2026**. This is review evidence, not a deployed webpage or publication authorization.
- The narrower source-accessibility workflow for PR #26's branch may be **SKIPPED** on this new branch because of its explicit branch filter; it is not counted as a pass. The new dedicated workflow independently runs both underlying browser regression scripts.

**Verification boundary:** Dated source and rights research is scoped to the ten new policy/instrument/source records and seven previously reviewed records. All source owner, licensed artwork, translation, training competence, clinical accuracy, actual screen-reader/physical print, and approval decisions remain open. This QA documentation update will be checked on a new exact head and its final artifact referenced in PR #27.

**Repo state at the time of this checkpoint:** no Vercel deployment was found for the code commit SHA, and the inherited branch-local deployment disable setting was active. No PR was merged; no external use/reproduction license was issued.
