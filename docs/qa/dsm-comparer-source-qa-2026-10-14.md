# DSM Foundations / Diagnosis Comparer — source QA checkpoint

Date: 2026-10-14
Branch: `feature/comparer-plain-language`
Baseline content commit: `0b104cfbc206ba88ea337dc036ac7b4f62eacb79`

## Source checks completed

- Parsed and enumerated all 80 quiz blocks and 249 answer choices.
- Verified 8 multi-select questions, each having at least two keyed-correct options; the remaining 72 have exactly one keyed-correct option.
- Verified every choice has a nonempty Plain Language label and feedback.
- Inspected multi-select JavaScript logic: an answer is correct only when there are no wrong selected options and no correct omissions; feedback explains wrong and missing choices.
- Examined the language-toggle implementation: it replaces question/choice copy and feedback data using the selected mode, and clears evaluated quiz results on changes.
- Parsed 31 Venn comparison data records; each has a unique unordered diagnosis pair and required comparison fields.
- Parsed source files for print media rules and print invocation. No print rendering was performed.

## Limitations / not passed

- This checkpoint is **not** an independently completed 249-choice clinical sign-off. A full semantic review of every stem, option, key, and explanation against authoritative diagnostic references remains necessary.
- The full repository test suite did not run in this connector-only environment.
- Chromium/mobile/keyboard/browser and actual print/PDF rendering tests did not run.
- Source inspection of interaction logic is not equivalent to executing browser tests.
- No deployment or merge was performed. No TinyFish was used.

## Required next gate

Run browser and repository tests in a checkout with available Node/Chromium, then have a qualified clinician independently resolve any clinical ambiguities and approve the material prior to publication.

## Follow-up verification — 2026-10-14 (from `f2da186`)

- Re-fetched the current branch files: quiz blob `34a1dc50d890e72f24712f8cb4736e32e65113ee`, comparer blob `01c333d6e551461a8b72bef88c4f254e086eaef3`.
- Independently extracted 80 individual question stems, 249 keyed answers, and their feedback. Confirmed no missing stems, labels, or feedback, and no duplicate Plain Language stems. Identified 8 multi-select questions; each has at least two keyed correct options; all other questions have one.
- Evaluated all 712 possible answer-selection masks across the 80 question structures, checking the multi-select exact-set truth rule against an independent equality calculation. No disagreement for multi-select masks. **This is a self-contained scoring-model simulation, not a DOM interaction test.**
- JavaScript parse check with `new Function` passed for all three inline script bodies across both pages. Source parsing is not equivalent to exercising runtime browser behavior.
- Parsed the 31 Venn data objects, verified unique unordered pairs and populated required fields. This validates structural integrity, not the complete clinical accuracy of their narrative claims.
- Inspected the language-toggle reset and print styles in source; no actual browser, accessibility, or print rendering validation occurred.
- Local tool discovery found Node, Chromium, and Playwright installed. However, the linked GitHub repository cannot be cloned in the container because the network cannot resolve GitHub, while connector-only file access does not mount a usable checkout. Therefore the full repository test suite and browser/print runs against actual repository files remain **not run**.
- A wording-based high-risk scan of correct Plain Language answers did not establish a new confirmed defect. **No clinical content was altered in this follow-up.** Clinical verification against authoritative criteria for every individual choice and Venn assertion remains an independent review requirement, not a completed sign-off.
- No merge, deployment, or TinyFish use.

## Follow-up — executable environment and Venn content sweep

- Verified again that the branch still references the same DSM Foundations and comparer content blobs as the preceding checkpoint. No content changes were made.
- Attempted `git ls-remote https://github.com/SophiaKorb/clinical-practice-library.git HEAD` in the container. It failed with `Could not resolve host: github.com`. `node` and `chromium` are installed, but without an executable checkout or an accessible source-file transfer, repository and true DOM/browser/print regression tests against these branch files were **not run**. Installation alone is not execution.
- Read the course's answer-selection structures and swept all 31 named Venn records, including course/duration and exclusion summaries. This does **not** amount to DSM-5-TR source-by-source verification of all narrative claims, or a signed clinical verdict on 249 answer choices.
- Outstanding: independently verify each keyed option and distractor against authoritative criteria, obtain repository checkout, run full project QA plus Playwright keyboard, responsive layout, language-switch, exact multi-select feedback and actual print/PDF output, and seek qualified clinical sign-off before merge/publication.
- No deployment, merge, or TinyFish use. No code changes were justified by evidence in this pass.

## CI failure investigation and confirmed fixes — October 14/15, 2026

GitHub Actions results from commit `c8174e1` were inspected directly (the runner did execute checks, although this local environment could not clone the repository):

- `CPL site QA` run `38685947812`, job `116260691085`: `tests/dsm-foundations.cjs` stopped at question 1 with `3 or 4 choices`. Root cause in test regex: it required a closing `>` immediately after `data-feedback`, but multilingual attributes follow it. Corrected the test regex to allow subsequent attributes (commit `96fcb4f`). The source still contains 80 quiz blocks and 249 choices.
- `DSM comparer Venn browser QA` run `38685947798`, job `116260690781`: table row count was 0 rather than 7. Source diagnosis found an undefined `renderIntersection(found)` invocation inside `renderVenn`, before table construction. The diagram's actual implementation uses an accessible HTML overlap button and panel; the call had no definition. Removed that invocation (commit `7afc318`), preserving 31 Venn records. Static JavaScript parsing passed, but **a passing browser retest remains unverified**.
- Updated the browser regression assertions for actual SVG labels and the documented style-change answer reset (commit `17da5b0`). These test updates have not yet been confirmed by a successful CI run.
- The CI run logs constitute **executed GitHub Actions evidence of failures**, not local execution. Do not mark site/diagram browser QA green until new workflow results actually pass.
- Current clinical gate: 80 questions, 249 answer choices and 31 Venn comparison records remain preserved. Full independent item-level diagnostic accuracy review still requires a qualified clinician and reference verification. No clinical sign-off is claimed.
- No merge, production deployment, or TinyFish use was performed.

## CI retest checkpoint — October 14/15, 2026

- Checked GitHub Actions for commit `fc14691`. `CPL site QA` run [38686276223](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686276223), job `static-and-behavior` (116261730564), completed with **success**. This is executed CI, not a locally run test.
- `DSM comparer Venn browser QA` run [38686276178](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686276178), job `diagram-browser` (116261730699), was **in progress at this checkpoint**. No pass or failure claimed until the job completes.
- Re-fetched the branch source and reconfirmed 80 quiz blocks, 249 answer choices, 31 Venn records. No content edits were warranted during this checkpoint.

### Qualified clinical reviewer checklist (pending technical green)

1. Inspect all 80 stems and each of the 249 answer choices; verify whether the keyed answer, each distractor, and each individual feedback explanation agree with current criteria and the literal question wording. Flag any equally defensible distractor.
2. Inspect all 31 Venn pairs for accurate diagnostic boundaries, durations, exclusions, trauma and medical/substance alternatives, distinctions between shared and defining features, and risks of falsely implying diagnoses are mutually exclusive.
3. Pay particular attention to mania versus hypomania and decreased need for sleep, OCD versus OCPD, PTSD exposure criteria, schizophrenia versus mood-related psychosis, substance use disorder severity and prescribed-medication exceptions, and eating-disorder thresholds.
4. Review respectful, person-centered Plain Language wording and alignment with Clinical mode. Confirm no wording implies that a screening example establishes diagnosis or recommends unsafe self-management.
5. Record reviewer credentials, item-specific decisions, corrections, and written sign-off. Do not merge or publish before both technical and clinical gates are satisfied.

## Final CI follow-up — October 14/15, 2026

- GitHub Actions `CPL site QA` run [38686276223](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686276223) completed **successfully**.
- GitHub Actions `DSM comparer Venn browser QA` run [38686276178](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686276178) completed **failure** in the browser viewport/print test. Job log identifies `locator('.venn-center').textContent(): Timeout 30000ms exceeded` at `tests/diagnosis-comparer-venn.cjs:35`. The current accessible implementation uses `#venn-message` for unsupported-pair status, not `.venn-center`. Updated that stale test assertion in commit `ef72438`; the browser workflow must be **rerun and pass** before marking technical QA green.
- This failure was in an obsolete DOM selector in the test, not a confirmed defect in the rendered comparison content. No production HTML or clinical content was changed.
- Preserved-content requirement remains 80 questions, 249 choices, and 31 Venn comparisons. Qualified-human clinical sign-off remains mandatory before publication.

## CI after `b30f578` — final verification checkpoint

- `CPL site QA` run [38686529807](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686529807): **passed**, job `116262532427`.
- `DSM comparer Venn browser QA` run [38686529834](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686529834): **in progress at observation**, executing the differential diagram viewport/print check. Passing status is not yet established.
- Branch source fetched after `b30f578`: **80 questions, 249 choices, 31 Venn pairs**. No production changes or additional verified defect in this checkpoint.
- Technical gate remains open until browser QA completes successfully; qualified clinical review remains pending. No merge, deployment, or TinyFish.

## Final technical QA result — clinical handoff authorized

- GitHub Actions [CPL site QA run 38686529807](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686529807): completed **success** on the content/test baseline `b30f578`.
- GitHub Actions [DSM comparer Venn browser QA run 38686529834](https://github.com/SophiaKorb/clinical-practice-library/actions/runs/38686529834): completed **success**. Diagram viewports and print passed; course-answer and automated WCAG checks for both text styles passed. These are executed GitHub CI tests, not local tests.
- The immediately preceding documentation-only commit `3d0c7c8` did not alter training HTML or test scripts. Verified protected content counts before handoff: 80 questions; 249 answer choices; 31 Venn pairs.
- **Technical gate: PASS for the scoped automated CI workflows. Clinical gate: PENDING qualified-human review.** See the qualified-reviewer checklist above. Automated accessibility does not supersede manual assistive-technology review or clinical accuracy approval.
- No merge, deployment, or TinyFish use. Do not make additional content changes without verified reasons; route to clinical review.
