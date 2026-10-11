# Static CPL top navigation — October 10, 2026

## Scope and design
The Colorful branch now has an accessible, non-collapsing, no-JavaScript top navigation on all **454 current HTML pages** (count from the synchronizing GitHub Action). The retaining `legacy/` directory and independent production branch remain unchanged. The nav sits in normal page flow at the top, not as an overlay. Its horizontal link strip remains visible and scrollable at 320–390px phone widths; it does not collapse into a menu. It is hidden in print to reserve room for clinical diagrams and worksheets. The localized Spanish navigation uses Spanish link labels on `lang="es"` pages.

Global destinations: Home; Browse; Find resources; Clinical topics; Visual tools; Communication; Treatment plans; Assessment; Learning; Español. Existing page-specific controls and in-page navigations remain in place.

## Reproducibility
`scripts/site-navigation.py` is the source of truth for the static HTML/CSS link injection and supports `--apply` and `--check`. `scripts/build-topic-expansion.py` invokes it for regenerated topic pages. A protected synchronization action applied the panel to 454 current pages, without altering legacy. The site QA workflow checks navigation consistency and source-generated HTML parity.

## Outstanding
Source-level checks do not establish device rendering, screen-reader usefulness, scrolling ergonomics or print-dialog equivalence. Inspect on actual 320, 390, 768 and desktop viewports, including keyboard focus, zoom, long localized link labels and print. Confirm clinical clarity and that the top panel does not obscure any skip link, consent control or decision aid. Retain all qualified clinical review gates.

## Mobile simplification

In response to phone density, keep desktop's full link strip but show only `CPL` (Home), Find, Topics and Visual Tools as compact text actions on phones, plus a native `More` disclosure for other destinations. At widths 360px and below, Topics remains available inside More instead of crowding the first row. The More list is not rendered until expanded; links are labeled in Spanish on Spanish pages. A redundant original link-only header is hidden on phone for known home, topic, finder and flagship pages, but print/action headers remain. The top bar remains in normal document flow and never becomes sticky. The app does not store menu state or require scripting.

## Current decision-first navigation revision
The earlier description of mobile `Find · Topics · Tools · More` is a historical checkpoint. The current phone bar shows **CPL (Home) · Start · Find · More**, while Tools, Topics, Communication, Assessment, Learning, the complete historical directory and language resources remain accessible via More or the Start page. Desktop uses **Start here** before Find. The `resources/start-here.html` page is the primary task-intent route; generated clinical-topic index links to it through `scripts/build-topic-expansion.py`. The static generator remains the source of truth and syncs all current HTML outside retained `legacy/`.
