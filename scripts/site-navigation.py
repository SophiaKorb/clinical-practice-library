#!/usr/bin/env python3
"""Give every current CPL HTML page a visible, no-JavaScript navigation panel.

Idempotent. Preserves the retained legacy/ tree; the production branch is
managed separately. Called again after topic resources are regenerated.
"""
from __future__ import annotations
import argparse
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="/resources/site-navigation.css">'
LINKS = (
    ("/", "Home", "Inicio"),
    ("/resources/index.html", "Browse", "Explorar"),
    ("/resources/clinical-resource-finder.html", "Find resources", "Buscar"),
    ("/resources/clinical-topics/index.html", "Clinical topics", "Temas clínicos"),
    ("/resources/therapy/visual-reasoning-toolkit.html", "Visual tools", "Herramientas visuales"),
    ("/resources/therapy/communication-supports-toolkit.html", "Communication", "Comunicación"),
    ("/resources/therapy/treatment-plan-menu.html", "Treatment plans", "Planes de tratamiento"),
    ("/resources/assessment/assessment-start-here.html", "Assessment", "Evaluación"),
    ("/resources/training/workforce-learning-center.html", "Learning", "Formación"),
    ("/#espanol", "Español", "Español"),
)
SKIP = re.compile(r'^\s*<a\b(?=[^>]*\bclass\s*=\s*["\'][^"\']*skip[^"\']*["\'])[^>]*>[\s\S]*?</a>', re.I)
NAV = re.compile(r'<nav\s+class=["\']cpl-static-nav["\'][^>]*>[\s\S]*?</nav>', re.I)


def page_section(path: str) -> str | None:
    if path in ("index.html", "preview/cpl2.html"):
        return "/"
    if path in ("resources/index.html", "library.html"):
        return "/resources/index.html"
    for prefix, link in (
        ("resources/es/", "/#espanol"),
        ("resources/clinical-topics/", "/resources/clinical-topics/index.html"),
        ("resources/therapy/visual-", "/resources/therapy/visual-reasoning-toolkit.html"),
        ("resources/therapy/communication-", "/resources/therapy/communication-supports-toolkit.html"),
        ("resources/therapy/treatment-plan-", "/resources/therapy/treatment-plan-menu.html"),
        ("resources/assessment/", "/resources/assessment/assessment-start-here.html"),
        ("resources/training/", "/resources/training/workforce-learning-center.html"),
    ):
        if path.startswith(prefix):
            return link
    return None


def navigation(path: str, spanish: bool) -> str:
    current = page_section(path)
    links = []
    for url, english, translated in LINKS:
        label = translated if spanish else english
        active = ' aria-current="page"' if url == current else ''
        links.append('<a href="' + url + '"' + active + '>' + html.escape(label) + '</a>')
    label = "Secciones de la Biblioteca de Práctica Clínica" if spanish else "Clinical Practice Library sections"
    # The phone panel shows only the essential actions. Everything remains
    # reachable through a native, keyboard-accessible details disclosure.
    # No JavaScript, sticky overlay or extra vertical navigation row.
    quick = (
        ("/resources/clinical-resource-finder.html", "Find", "Buscar"),
        ("/resources/clinical-topics/index.html", "Topics", "Temas"),
        ("/resources/therapy/visual-reasoning-toolkit.html", "Tools", "Visuales"),
    )
    quick_html = ''.join(
        '<a class="cpl-static-nav__quick cpl-static-nav__quick--' + str(i) +
        '" href="' + url + '"' +
        (' aria-current="page"' if url == current else '') + '>' +
        html.escape(es if spanish else en) + '</a>'
        for i, (url, en, es) in enumerate(quick)
    )
    # The menu also includes Topics and Visual tools for narrow phones where
    # one quick link is hidden. Its open/closed state uses native <details>.
    more_urls = (
        "/resources/index.html",
        "/resources/clinical-topics/index.html",
        "/resources/therapy/visual-reasoning-toolkit.html",
        "/resources/therapy/communication-supports-toolkit.html",
        "/resources/therapy/treatment-plan-menu.html",
        "/resources/assessment/assessment-start-here.html",
        "/resources/training/workforce-learning-center.html",
        "/#espanol",
        "/#diagnosis-guides",
    )
    labels = {url: (es if spanish else en) for url, en, es in LINKS}
    labels["/#diagnosis-guides"] = "Guías de diagnóstico" if spanish else "Diagnosis guides"
    more_links = ''.join(
        '<a href="' + url + '"' +
        (' aria-current="page"' if url == current else '') + '>' +
        html.escape(labels[url]) + '</a>' for url in more_urls
    )
    more_label = "Más secciones" if spanish else "More sections"
    compact = ('<div class="cpl-static-nav__mobile">' + quick_html +
               '<details class="cpl-static-nav__more"><summary>' +
               ('Más' if spanish else 'More') +
               ' <span aria-hidden="true">⌄</span></summary>' +
               '<div class="cpl-static-nav__menu" aria-label="' +
               more_label + '">' + more_links + '</div></details></div>')
    # Only suppress a genuinely duplicate, controls-free secondary header
    # on mobile. Other headers may contain print buttons or unique actions.
    redundant = (path in (
        "index.html", "resources/index.html",
        "resources/clinical-resource-finder.html",
        "resources/therapy/visual-reasoning-toolkit.html",
        "resources/therapy/communication-supports-toolkit.html",
        "resources/training/workforce-learning-center.html",
    ) or path.startswith("resources/clinical-topics/"))
    suppress = ' data-replaces-header="true"' if redundant else ''
    return ('<nav class="cpl-static-nav" aria-label="' + label + '"' + suppress + '>'
            '<a class="cpl-static-nav__brand" href="/" aria-label="Clinical Practice Library home">CPL</a>'
            '<div class="cpl-static-nav__links">' + ''.join(links) + '</div>' +
            compact + '</nav>')


def decorate(text: str, path: str) -> str:
    body = re.search(r'<body\b[^>]*>', text, re.I)
    head = re.search(r'</head\s*>', text, re.I)
    if not head or not body:
        raise ValueError("Expected complete HTML with head and body in " + path)
    spanish = bool(re.search(r'<html\b[^>]*\blang\s*=\s*["\']es(?:-[^"\']*)?["\']', text, re.I))
    nav_html = navigation(path, spanish)
    if NAV.search(text):
        text = NAV.sub(lambda _: nav_html, text, count=1)
    else:
        body = re.search(r'<body\b[^>]*>', text, re.I)
        pos = body.end()
        skip = SKIP.match(text[pos:])
        if skip:
            pos += skip.end()
        text = text[:pos] + '\n' + nav_html + '\n' + text[pos:]
    # Guard independently authored pages against a second shared CSS include.
    # Never duplicate the stylesheet when a page already included it manually.
    if text.count(STYLE) > 1:
        text = text.replace(STYLE, "")
    if STYLE not in text:
        text = re.sub(r'</head\s*>', lambda m: STYLE + m.group(0), text, count=1, flags=re.I)
    return text


def current_pages(root: Path, scope: str = "") -> list[Path]:
    pages = []
    for file in sorted(root.rglob("*.html")):
        rel = file.relative_to(root)
        if rel.parts[0] == "legacy" or any(p.startswith(".") for p in rel.parts):
            continue
        if scope and not rel.as_posix().startswith(scope):
            continue
        pages.append(file)
    return pages


def apply_to_files(root: Path = ROOT, scope: str = "", check: bool = False) -> tuple[int, int]:
    modified = 0
    pages = current_pages(root, scope)
    for file in pages:
        text = file.read_text(encoding="utf-8")
        new = decorate(text, file.relative_to(root).as_posix())
        if new != text:
            modified += 1
            if not check:
                file.write_text(new, encoding="utf-8")
    if check and modified:
        raise SystemExit(str(modified) + " current HTML pages need navigation synchronization")
    return len(pages), modified


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--apply", action="store_true")
    group.add_argument("--check", action="store_true")
    parser.add_argument("--scope", default="")
    args = parser.parse_args()
    count, changes = apply_to_files(ROOT, args.scope, args.check)
    print(f"Static CPL navigation: {count} current pages checked, {changes} " +
          ("outdated" if args.check else "updated") + "; retained legacy untouched")


if __name__ == "__main__":
    main()
