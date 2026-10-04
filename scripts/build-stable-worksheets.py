"""Build three public web/PDF worksheets from one content file.

Requires ReportLab and pypdf. Existing download names remain stable. Public fields are blank.
"""
import json
import math
from html import escape
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
import reportlab
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DecodedStreamObject, DictionaryObject, FloatObject, NameObject, NumberObject

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/stable-worksheets.json').read_text())
INK = HexColor('#17221b')
GREEN = HexColor('#245c4c')
LINE = HexColor('#a8b2ab')
PALE = HexColor('#f1f7f4')
BLUE = HexColor('#edf1f8')
GOLD = HexColor('#faf5e9')
ROSE = HexColor('#faf0f2')
M, W = 35, 542
DATE = 'October 3, 2026'
FONT_DIR = Path(reportlab.__file__).parent / 'fonts'
pdfmetrics.registerFont(TTFont('Worksheet', str(FONT_DIR / 'Vera.ttf')))
pdfmetrics.registerFont(TTFont('WorksheetBold', str(FONT_DIR / 'VeraBd.ttf')))


def embed_form_font(target):
    """Keep typed responses independent of a viewer's standard-font substitutions."""
    writer = PdfWriter()
    writer.clone_document_from_reader(PdfReader(target))
    face = pdfmetrics.getFont('Worksheet').face
    font_bytes = (FONT_DIR / 'Vera.ttf').read_bytes()
    stream = DecodedStreamObject()
    stream.set_data(font_bytes)
    stream[NameObject('/Length1')] = NumberObject(len(font_bytes))
    descriptor = DictionaryObject({
        NameObject('/Type'): NameObject('/FontDescriptor'),
        NameObject('/FontName'): NameObject('/CPLWorksheetFields'),
        NameObject('/Flags'): NumberObject(32),
        NameObject('/FontBBox'): ArrayObject([FloatObject(v) for v in face.bbox]),
        NameObject('/ItalicAngle'): NumberObject(0),
        NameObject('/Ascent'): FloatObject(face.ascent),
        NameObject('/Descent'): FloatObject(face.descent),
        NameObject('/CapHeight'): FloatObject(face.capHeight),
        NameObject('/StemV'): NumberObject(face.stemV),
        NameObject('/FontFile2'): writer._add_object(stream),
    })
    widths = []
    for code in range(32, 256):
        character = bytes([code]).decode('cp1252', errors='replace')
        widths.append(FloatObject(face.charWidths.get(ord(character), face.charWidths[32])))
    font = DictionaryObject({
        NameObject('/Type'): NameObject('/Font'),
        NameObject('/Subtype'): NameObject('/TrueType'),
        NameObject('/BaseFont'): NameObject('/CPLWorksheetFields'),
        NameObject('/Encoding'): NameObject('/WinAnsiEncoding'),
        NameObject('/FirstChar'): NumberObject(32),
        NameObject('/LastChar'): NumberObject(255),
        NameObject('/Widths'): ArrayObject(widths),
        NameObject('/FontDescriptor'): writer._add_object(descriptor),
    })
    font_ref = writer._add_object(font)
    writer.root_object['/AcroForm']['/DR']['/Font'][NameObject('/Helv')] = font_ref
    for page in writer.pages:
        for ref in page.get('/Annots', []):
            widget = ref.get_object()
            if widget.get('/FT') == '/Tx':
                widget['/AP']['/N']['/Resources']['/Font'][NameObject('/Helv')] = font_ref
    with target.open('wb') as output:
        writer.write(output)


def html_field(item, hint='', rows=2):
    name, label = item[:2]
    detail = f'<small>{escape(hint)}</small>' if hint else ''
    return (f'<label class="tool-field" for="{name}">{escape(label)}{detail}'
            f'<textarea id="{name}" name="{name}" rows="{rows}"></textarea></label>')


def html_choices(group):
    name, title, choices = group
    return (f'<fieldset class="tool-group"><legend>{escape(title)}</legend><div class="choice-board">' +
            ''.join(f'<label class="tool-choice"><input type="checkbox" name="{name}-{i}">'
                    f'<span>{escape(label)}</span></label>' for i, label in enumerate(choices)) +
            '</div></fieldset>')


def html_route(items):
    cards = [f'<div><h3>{escape(label)}</h3>{html_field([name, prompt], rows=1)}</div>'
             for name, label, prompt in items]
    return '<div class="four-step" role="group" aria-label="My route">' + \
        '<span class="path-arrow" aria-hidden="true">→</span>'.join(cards) + '</div>'


def build_html(kind, d):
    first = ''
    if kind == 'grief':
        first += '<div class="grief-map" aria-label="My loss and what surrounds it">'
        for i, (name, label, prompt) in enumerate(d['map']):
            first += f'<div class="{"map-center" if i == 2 else "map-zone"}">'
            first += html_field([name, label], prompt) + '</div>'
        first += '</div>'
        first += ''.join(map(html_choices, d['groups']))
    elif kind == 'care':
        first += '<div class="field-pair">' + ''.join(map(html_field, d['setup'])) + '</div>'
        first += html_choices(d['groups'][0]) + '<h2>Build the route</h2>' + html_route(d['route'])
        first += html_choices(d['groups'][1])
    else:
        first += html_route(d['route']) + ''.join(map(html_choices, d['groups']))
        first += '<h2>My running-out-of-room signs</h2><div class="field-pair">'
        first += ''.join(html_field([name, label], hint, rows=1) for name, label, hint in d['signals']) + '</div>'
        first += '<h2>My reset choices</h2>'
    first += '<div class="field-trio">' + ''.join(map(html_field, d['support'])) + '</div>'
    if 'success' in d:
        first += '<div class="point-card">' + html_field(d['success']) + '</div>'
    first += f'<div class="tool-note"><p>{escape(d["note"])}</p></div>'
    second = f'<h2>{escape(d["companion_title"])}</h2><p>{escape(d["companion_intro"])}</p>'
    second += '<h3>For a clinician or support person</h3><ul>' + \
        ''.join('<li>' + escape(x) + '</li>' for x in d['helper_points']) + '</ul>'
    second += '<h2>Choose one next step</h2><div class="field-pair">' + \
        ''.join(map(html_field, d['planning'])) + '</div>'
    second += '<h2>What should we watch next?</h2><div class="field-pair">' + \
        ''.join(map(html_field, d['review'])) + '</div>'
    second += f'<p><a href="{d["related"][0]}">{escape(d["related"][1])}</a></p>'
    second += ('<div class="tool-sources"><p><strong>About this worksheet.</strong> '
               'An original planning tool by the author named above. It is not a validated assessment '
               'or a reproduction of an outside worksheet. The sources below support the general guidance; '
               f'they do not validate this worksheet. Guidance checked {DATE}.</p><ul>')
    second += ''.join(f'<li><a href="{url}">{escape(label)}</a></li>' for label, url in d['sources'])
    second += '</ul></div>'
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{escape(d['title'])}: an original visual planning worksheet by Sophia Cohon, PhD.">
<title>{escape(d['title'])} | Clinical Practice Library</title>
<link rel="stylesheet" href="/resources/resource.css"><link rel="stylesheet" href="/resources/visual-tools.css">
<script src="/resources/visual-tools.js" defer></script></head><body class="visual-tool stable-worksheet">
<header class="resource-topbar"><a href="/">← Clinical Practice Library</a><button type="button" onclick="window.print()">Print / Save PDF</button></header>
<main class="resource-page"><p class="resource-kicker">{escape(d['kicker'])}</p><h1>{escape(d['title'])}</h1>
<p class="resource-byline">Original worksheet by Sophia Cohon, PhD</p><p class="resource-intro">{escape(d['intro'])}</p>
<form data-visual-tool autocomplete="off"><div class="tool-actions"><a href="/resources/downloads/{d['pdf']}">Open blank editable PDF</a><button type="reset">Clear this worksheet</button></div>
<p class="tool-privacy">Type, point, or write on paper. Web responses stay in this tab. Print to keep your work.</p>
<section class="worksheet-page" aria-label="My visual worksheet">{first}</section>
<section class="companion-page" aria-label="Planning and review with a clinician or support person">{second}</section>
</form></main><footer class="resource-footer">Clinical Practice Library · Noncommercial clinical and educational use</footer></body></html>
'''
    (ROOT / 'resources/handouts' / (d['slug'] + '.html')).write_text(html)


def paragraph(c, text, x, y, width, size=10, color=INK, bold=False):
    style = ParagraphStyle('text', fontName='WorksheetBold' if bold else 'Worksheet',
                           fontSize=size, leading=size * 1.25, textColor=color,
                           spaceBefore=0, spaceAfter=0)
    p = Paragraph(escape(text), style)
    _, height = p.wrap(width, 700)
    p.drawOn(c, x, 792 - y - height)
    return height


def field(c, item, x, y, width, height=32, hint=''):
    name, label = item[:2]
    used = paragraph(c, label, x, y, width, 9, bold=True)
    if hint:
        used += 3 + paragraph(c, hint, x, y + used + 3, width, 8)
    top = y + used + 5
    c.acroForm.textfield(name=name, tooltip=label, x=x, y=792-top-height,
        width=width, height=height, fontName='Helvetica', fontSize=10,
        borderWidth=.7, borderColor=LINE, fillColor=white, textColor=INK,
        fieldFlags='multiline', value='', forceBorder=True)
    return used + 5 + height


def pair_fields(c, items, y, columns=2, height=34):
    gap = 12
    width = (W-gap*(columns-1))/columns
    for start in range(0, len(items), columns):
        used = max(field(c, item, M+i*(width+gap), y, width, height)
                   for i, item in enumerate(items[start:start+columns]))
        y += used + 10
    return y


def heading(c, title, y):
    return y + paragraph(c, title, M, y, W, 12, bold=True) + 8


def choices(c, group, y):
    name, title, options = group
    y = heading(c, title, y)
    cols, gap, row = 3, 8, 26
    width = (W-gap*2)/3
    for i, label in enumerate(options):
        x = M+(i%cols)*(width+gap)
        top = y+(i//cols)*row
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(x, 792-top-22, width, 22, 4, stroke=1, fill=1)
        c.acroForm.checkbox(name=f'{name}-{i}', tooltip=label, x=x+6,
            y=792-top-16, size=10, borderWidth=.7, borderColor=LINE,
            fillColor=white, textColor=INK, checked=False, buttonStyle='check')
        paragraph(c, label, x+22, top+5, width-27, 8.5)
    return y+math.ceil(len(options)/cols)*row+8


def route(c, items, y):
    gap, width, height = 16, (W-48)/4, 83
    for i, (name, title, prompt) in enumerate(items):
        x = M+i*(width+gap)
        c.setFillColor([PALE,GOLD,BLUE,PALE][i]); c.setStrokeColor(LINE)
        c.roundRect(x, 792-y-height, width, height, 7, stroke=1, fill=1)
        paragraph(c, title, x+8, y+8, width-16, 12, GREEN, True)
        field(c, [name,prompt], x+8, y+28, width-16, 25)
        if i<3:
            ay=792-y-height/2
            c.setStrokeColor(GREEN); c.setFillColor(GREEN)
            c.line(x+width+3, ay, x+width+gap-3, ay)
            p=c.beginPath();p.moveTo(x+width+gap-3,ay);p.lineTo(x+width+gap-7,ay+3);p.lineTo(x+width+gap-7,ay-3);p.close();c.drawPath(p,fill=1,stroke=0)
    return y+height+14


def note(c, text, y):
    h = paragraph(c, text, M+10, y+8, W-20, 9)
    c.setStrokeColor(GREEN);c.setLineWidth(2)
    c.line(M,792-y,M,792-y-h-16)
    return y+h+22


def grief_map(c, items, y):
    outer, center, gap, height = 174, 174, 10, 162
    for i, (name, title, prompt) in enumerate(items):
        if i == 2:
            x, top, h = M+outer+gap, y, height
        else:
            x=M if i in (0,3) else M+2*(outer+gap)
            top=y if i in (0,1) else y+86
            h=76
        c.setFillColor(BLUE if i==2 else PALE);c.setStrokeColor(GREEN if i==2 else LINE)
        c.roundRect(x,792-top-h,center,h,7,stroke=1,fill=1)
        field(c,[name,title],x+9,top+8,center-18,56 if i==2 else 24,prompt)
    return y+height+14


def header(c, d, companion=False):
    paragraph(c,d['kicker'].upper(),M,32,W,9,GREEN,True)
    paragraph(c,d['companion_title'] if companion else d['title'],M,51,W,22)
    if companion:
        paragraph(c,'For a clinician or support person',M,82,W,10,GREEN,True)
        h=paragraph(c,d['companion_intro'],M,101,W,10)
    else:
        paragraph(c,'Original worksheet by Sophia Cohon, PhD',M,82,W,10,GREEN,True)
        h=paragraph(c,d['intro'],M,101,W,10)
    return 101+h+14


def footer(c):
    paragraph(c,'Clinical Practice Library | Noncommercial clinical and educational use',M,762,W,8)


def build_pdf(kind,d):
    target=ROOT/'resources/downloads'/d['pdf']
    c=canvas.Canvas(str(target),pagesize=(612,792))
    c.setTitle(d['title']); c.setAuthor('Sophia Cohon, PhD')
    y=header(c,d)
    if kind=='grief':
        y=grief_map(c,d['map'],y)
        for group in d['groups']: y=choices(c,group,y)
    elif kind=='care':
        y=pair_fields(c,d['setup'],y,height=26)
        y=choices(c,d['groups'][0],y)
        y=heading(c,'Build the route',y)
        y=route(c,d['route'],y)
        y=choices(c,d['groups'][1],y)
    else:
        y=route(c,d['route'],y)
        for group in d['groups']:y=choices(c,group,y)
        y=heading(c,'My running-out-of-room signs',y)
        # Hints stay on the web edition; short labels leave room to write on paper.
        y=pair_fields(c,[item[:2] for item in d['signals']],y,height=23)
        y=heading(c,'My reset choices',y)
    y=pair_fields(c,d['support'],y,columns=3,height=28)
    if 'success' in d:y=pair_fields(c,[d['success']],y,columns=1,height=25)
    y=note(c,d['note'],y)
    if y>752:raise ValueError(f'{d["slug"]}: first page too tall ({y})')
    footer(c);c.showPage();y=header(c,d,True)
    for point in d['helper_points']:
        y+=paragraph(c,'- '+point,M,y,W,10)+8
    y=heading(c,'Choose one next step',y+7)
    y=pair_fields(c,d['planning'],y,height=48)
    y=heading(c,'What should we watch next?',y+7)
    y=pair_fields(c,d['review'],y,height=48)
    y=heading(c,'About this worksheet',y+7)
    text=('Original planning tool; not a validated assessment or a reproduced outside worksheet. '
          f'The sources support the general guidance, not validation of this tool. Guidance checked {DATE}.')
    y+=paragraph(c,text,M,y,W,9)+10
    for label,url in d['sources']:
        h=paragraph(c,label,M,y,W,9,GREEN)
        c.linkURL(url,(M,792-y-h,M+W,792-y),relative=0,thickness=0)
        y+=h+6
    label=d['related'][1].replace(' · ',' | ')
    h=paragraph(c,label,M,y,W,9,GREEN)
    c.linkURL('https://clinical-practice-library.vercel.app'+d['related'][0],(M,792-y-h,M+W,792-y),relative=0,thickness=0)
    if y+h>752:raise ValueError(f'{d["slug"]}: second page too tall')
    footer(c);c.showPage();c.save()
    embed_form_font(target)
    print(target.name,'built; first and companion pages fit')


if __name__=='__main__':
    for kind,d in DATA.items():
        build_html(kind,d)
        build_pdf(kind,d)
