# Phase 8 companion geometry audit — source-derived candidate inventory

Date: 2026-10-16. Branch: `qa/topic-pdf-nonsequence-label-20261016`.

## Scope and evidence

25/25 topics enumerated from `scripts/expansion-topics.py` (source blob `c66abf089b21587a44e91f9d985e778091a8d44f`). The generator `scripts/create-topic-pdfs.py` renders the topics as vertically stacked boxes, except for the explicit two-track exception for `learning-instruction-access`. The current development-only nonsequence caption is an interim risk reduction, not evidence of true spatial parity.

**No output PDF was rendered or visually inspected as part of this checkpoint.** Accordingly all 25 topics remain unverified for HTML/PDF relationship parity, clipping, accessibility, grayscale printing, clinical review, and publication.

## Topic audit queue

| # | Topic slug | Relationship audit | Rendered PDF | Human clinical review |
|---|---|---|---|---|
| 1 | `bipolar-episode-timeline` | Pending | Pending | Pending |
| 2 | `voices-collaborative-coping` | Pending | Pending | Pending |
| 3 | `sleep-loss-activation` | Pending | Pending | Pending |
| 4 | `panic-alarm-loop` | Pending | Pending | Pending |
| 5 | `social-anxiety-attention` | Pending | Pending | Pending |
| 6 | `ocd-mental-rituals` | Pending | Pending | Pending |
| 7 | `depression-activity-reward` | Pending | Pending | Pending |
| 8 | `trauma-cue-orientation` | Pending | Pending | Pending |
| 9 | `dissociation-function-orientation` | Pending | Pending | Pending |
| 10 | `child-grief-continuing-bonds` | Pending | Pending | Pending |
| 11 | `restrictive-eating-coordination` | Pending | Pending | Pending |
| 12 | `binge-eating-patterns` | Pending | Pending | Pending |
| 13 | `adult-autism-load-recovery` | Pending | Pending | Pending |
| 14 | `adult-adhd-task-starts` | Pending | Pending | Pending |
| 15 | `aphasia-communication-access` | Pending | Pending | Pending |
| 16 | `learning-instruction-access` | Pending | Pending | Pending |
| 17 | `intellectual-disability-supported-choice` | Pending | Pending | Pending |
| 18 | `tics-context-impact` | Pending | Pending | Pending |
| 19 | `bfrb-awareness-support` | Pending | Pending | Pending |
| 20 | `body-dysmorphia-checking` | Pending | Pending | Pending |
| 21 | `health-anxiety-medical-plan` | Pending | Pending | Pending |
| 22 | `chronic-pain-pacing` | Pending | Pending | Pending |
| 23 | `insomnia-cbti-readiness` | Pending | Pending | Pending |
| 24 | `child-aggression-caregiver-coaching` | Pending | Pending | Pending |
| 25 | `sibling-conflict-safety-repair` | Pending | Pending | Pending |

## Highest-risk relationships to review first

- `sibling-conflict-safety-repair`: protective/safeguarding pathway must not imply joint mediation or forced repair.
- `restrictive-eating-coordination`: medical and psychosocial assessment can run concurrently.
- `aphasia-communication-access` and `intellectual-disability-supported-choice`: accessible communication routes can be parallel, not capability rankings.
- `child-aggression-caregiver-coaching`: ABC observation generates hypotheses; it does not establish causality.
- `panic-alarm-loop`, `ocd-mental-rituals`, `health-anxiety-medical-plan`, `body-dysmorphia-checking`: potential maintenance cycles must not be flattened into assumed universal linear chains.

## Release controls

Do not publish or merge generated PDF changes until all 25 candidate outputs have been created, inspected at print resolution, compared with HTML geometry and reviewed for safety text, clipping, reading order and references. Qualified clinical review, accessibility testing, and publication authorization are separate human gates.