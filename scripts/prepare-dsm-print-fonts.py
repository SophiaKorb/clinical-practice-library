#!/usr/bin/env python3
"""Prepare OFL-licensed static DSM review-book fonts from Google Fonts sources.

Never copy these fonts to public site assets. The PDF generator embeds only
the glyph subsets. Sources: google/fonts (OFL-1.1), see docs/qa/dsm-editorial-type.md.
Run from repo root. Network required only when not already cached.
"""
from pathlib import Path
from urllib.request import urlopen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from io import BytesIO
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"build/fonts"
BASE="https://raw.githubusercontent.com/google/fonts/main/ofl"
SOURCES={
    "baskerville":("librebaskerville/LibreBaskerville%5Bwght%5D.ttf",{}),
    "serif":("sourceserif4/SourceSerif4%5Bopsz%2Cwght%5D.ttf",{"opsz":11}),
    "serif_italic":("sourceserif4/SourceSerif4-Italic%5Bopsz%2Cwght%5D.ttf",{"opsz":11}),
    "sans":("sourcesans3/SourceSans3%5Bwght%5D.ttf",{}),
}
TARGETS=[
    ("baskerville","LibreBaskerville-Regular.ttf",400),
    ("baskerville","LibreBaskerville-Bold.ttf",700),
    ("serif","SourceSerif4-Regular.ttf",400),
    ("serif","SourceSerif4-Bold.ttf",700),
    ("serif_italic","SourceSerif4-Italic.ttf",400),
    ("serif_italic","SourceSerif4-BoldItalic.ttf",700),
    ("sans","SourceSans3-Regular.ttf",400),
    ("sans","SourceSans3-Bold.ttf",700),
]
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    source_bytes={}
    for key,(name,axes) in SOURCES.items():
        if all((OUT/target).is_file() and (OUT/target).stat().st_size>10000
               for k,target,_ in TARGETS if k==key):
            continue
        url=BASE+"/"+name
        with urlopen(url,timeout=45) as r:
            data=r.read()
        if len(data)<10000:
            raise RuntimeError("Incomplete font data: "+name)
        source_bytes[key]=data
    for key,target,weight in TARGETS:
        path=OUT/target
        if path.is_file() and path.stat().st_size>10000:
            continue
        font=TTFont(BytesIO(source_bytes[key]))
        if "fvar" not in font:
            raise RuntimeError("Expected a variable font: "+key)
        axes=dict(SOURCES[key][1],wght=weight)
        instantiateVariableFont(font,axes,inplace=True)
        font.save(str(path))
        font.close()
    print(json.dumps({"prepared":[p for _,p,_ in TARGETS],
                      "license":"SIL Open Font License 1.1"},indent=2))

if __name__=="__main__":
    main()
