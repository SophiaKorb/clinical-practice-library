# Static CPL top navigation — October 10, 2026

## Scope and design
The Colorful branch now has an accessible, non-collapsing, no-JavaScript top navigation on all **454 current HTML pages** (count from the synchronizing GitHub Action). The retaining `legacy/` directory and independent production branch remain unchanged. The nav sits in normal page flow at the top, not as an overlay. Its horizontal link strip remains visible and scrollable at 320–390px phone widths; it does not collapse into a menu. It is hidden in print to reserve room for clinical diagrams and worksheets. The localized Spanish navigation uses Spanish link labels on `lang="es"` pages.

Global destinations: Home; Browse; Find resources; Clinical topics; Visual tools; Communication; Treatment plans; Assessment; Learning; Español. Existing page-specific controls and in-page navigations remain in place.

## Reproducibility
`scripts/site-navigation.py` is the source of truth for the static HTML/CSS link injection and supports `--apply` and `--check`. `scripts/build-topic-expansion.py` invokes it for regenerated topic pages. A protected synchronization action applied the panel to 454 current pages, without altering legacy. The site QA workflow checks navigation consistency and source-generated HTML parity.

## Outstanding
Source-level checks do not establish device rendering, screen-reader usefulness, scrolling ergonomics or print-dialog equivalence. Inspect on actual 320, 390, 768 and desktop viewports, including keyboard focus, zoom, long localized link labels and print. Confirm clinical clarity and that the top panel does not obscure any skip link, consent control or decision aid. Retain all qualified clinical review gates.
