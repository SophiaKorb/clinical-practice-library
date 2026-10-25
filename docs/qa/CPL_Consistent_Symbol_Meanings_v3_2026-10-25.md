# CPL visual communication — semantic symbol QA v3

**Review only. Not approved for clinical use, merge, or deployment.** 2026-10-25.

### Canonical meanings
| Meaning | Standard representation | Must not be used for |
|---|---|---|
| YES | Check mark | Unchanged, finished, available |
| NO | X | Closed/unavailable, stop |
| NOT SURE | Question mark (?) | Asking for information, confused, what happened, unavailable |
| NEED MORE TIME | One clock face | Break, specific countdown, appointment time |
| NOT AVAILABLE | Slashed circle (∅-like) | Refusal, not now, uncertainty |
| REQUEST INFORMATION | Circled i | Not sure |
| BREAK | Two pause bars | Permanent stop, extra processing time |
| STOP | Stop-sign octagon | Not available or a negative answer |

### Edits in nine-page review
- Page 1: I NEED TIME = canonical clock; I'M NOT SURE = canonical ?.
- Page 2: GIVE ME TIME = same clock, not hourglass.
- Page 3: MORE TIME = same clock, not hourglass.
- Page 4: MORE INFORMATION = circled i, not ?.
- Page 5: NOT SURE retains the same ?, distinct from NO, BREAK and STOP.
- Page 7: NOT AVAILABLE = slashed circle with explicit CLOSED TODAY context, distinct from NO; I NEED TIME = single clock, no duplicate hourglass.
- Pages 6, 8, 9: layout and clinical wording preserved, with no unnecessary new symbols.

### QA
- Exact nine US Letter PDF pages, searchable text and visible footers; no text outside page bounds.
- Four clock instances, two uncertainty-symbol instances, one unavailable symbol.
- No remaining previous hourglass SVG instances.
- All embedded JPEGs converted to grayscale and all CSS color literals neutralized for genuinely grayscale PDF output.
- Visual proofs manually inspected on pages 1, 5 and 7, and the nine-page preview inspected for page-scale problems.
- All prior original CPL content and production navigation remain untouched.

### Remaining gates
Independent symbol comprehension checks with intended users, SLP/clinical safety review for assent and supported communication, mobile/keyboard/screen reader checks, actual printer proof, and explicit approval before replacing or linking originals. Changes have only been committed as a **separate new HTML review candidate** on the draft branch.