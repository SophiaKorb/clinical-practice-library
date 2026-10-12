# DSM Foundations — Excellence QA, round 1 (2026-10-12)

## Scope and baseline
Review of the Colorful branch's DSM Foundations course (`resources/training/dsm-from-zero.html`) and dual-experience assets. Baseline inspection found 11 lessons, 80 practice questions (72 single-answer and 8 select-all), 33 four-step worked examples, 11 authored instructional diagrams, 33 glossary entries, and distinct Studio/Clarity modes. These are source-level counts, not proof of browser behavior or clinical validity.

## Top-of-field benchmarks
1. **American Psychiatric Association — DSM-5-TR educational resources:** https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources
   *Transferable standard:* clinical authority, assessment context, cultural formulation, and proper limits of classifications.
2. **APA Publishing — Learning DSM-5-TR by Case Example:** https://psychiatryonline.org/doi/10.1176/appi.books.9798894551883.fm02
   *Transferable standard:* progressive, interpretive case-based diagnosis rather than fact-recitation alone.
3. **Osmosis — Why Osmosis:** https://www.osmosis.org/why-osmosis
   *Transferable standard:* visually explained ideas, smaller learning units, active recall, and revisiting after feedback.

Comparison is by disclosed learning approach and publicly described materials, not a head-to-head user study or formal expert ranking.

## Findings and integrated revisions
- **Ambiguous independent quiz item (Q4):** It referred to 'this example' although the all-questions view extracts practice sections from their explanatory paragraphs. Revised with a self-contained travel-photo scenario.
- **Misaligned answer (Q68):** A question about missing diagnostic evidence offered an answer conflating evidence sufficiency and assessor expertise. Reworded the prompt and correct option to address incomplete/conflicting evidence directly.
- **Learning progression could be clearer:** Added a compact **Explore → Apply → Recall** panel connecting the first lesson, worked cases, and the all-questions review. It encourages answering before reading feedback and investigating alternatives.
- **Consistent visual grammar across modes:** The new panel uses an editorial dark treatment in Studio and a restrained, high-contrast treatment in Clarity; it includes responsive, forced-color, and print rules.
- **Regression safeguards:** Added source-level assertions for the standalone question, evidence-quality answer, and learning-loop markup/styles.

## Checks completed
- Source-level preflight before push: **PASS** (11 lessons, 80 quizzes, 33 worked examples; 3–4 answer controls per question).
- Branch comparison against `cpl-2-colorful-helpful`: focused changes to course HTML, CSS, and one test file; base remains untouched.
- Vercel preview creation triggered automatically by the pushed commits.
- Existing test suite is reviewed but full Node/browser execution has **not** yet been independently completed for this branch.

## Outstanding gate before merging or calling QA complete
- Confirm final-commit Vercel preview is READY and serves HTML/CSS/JS.
- Run `node tests/dsm-foundations.cjs` and the related site suite in a checked-out working tree or CI.
- Signed-in/authorized real-browser screenshot QA: desktop + Android width; Studio/Clarity toggle, 80-answer feedback, all-questions display, link navigation, glossary filtering, contrast, keyboard navigation, and overflow.
- Peer clinical review of a representative sample of diagnostic and SUD reasoning items; formal DSM manual remains the criterion authority.
- Review the changed panel visually in both modes before promotion.

## Release boundary
This branch is a QA candidate. Keep simple and enhanced modes intact. Do not merge or promote to production based solely on static assertions or a READY build.
