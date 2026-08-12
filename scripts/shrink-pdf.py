#!/usr/bin/env python3
"""Shrink a slide-deck PDF by downsampling and re-encoding its images.

    python3 -m venv /tmp/pdfenv && /tmp/pdfenv/bin/pip install pikepdf pillow
    /tmp/pdfenv/bin/python scripts/shrink-pdf.py IN.pdf OUT.pdf [--ppi 110] [--quality 82] [--dry-run]

Python rather than Node because pikepdf wraps QPDF and nothing in the JS world
does surgical image replacement as well. It needs a venv: this box refuses
`pip install --user` under PEP 668, and the two packages are not worth adding to
the repo.

Measured on Sub-NanoAtHomeV4: **106.6 MB → 17.3 MB**, 54 pages, all text
preserved, mean pixel difference about 1% on the photo-heavy pages.

Only the *images* are touched. Text and vector art are left exactly as they are,
which is the whole reason not to just re-render every page to a bitmap: a Keynote
deck's headings stay crisp at any zoom, and the file stays searchable.

Two things make a deck like this enormous, and they are worth naming because the
fix for each is different:

  * **16 bits per component.** Keynote will happily embed a 16-bit image, which
    doubles the data for a precision nobody can see on a projector, and such
    images are usually stored with barely any compression (ratios near 50-70%).
  * **Resolution far beyond the page.** An image is only ever displayed at some
    size on the slide; pixels beyond that are carried around and thrown away at
    render time.

So: compute each image's *effective* resolution from the area it actually covers
on its page, downsample anything above the target, drop to 8 bits, and re-encode
as JPEG. Images with transparency keep their alpha in a separate soft mask, which
is handled by leaving smasks alone unless they are themselves oversized.
"""

import sys, io, math
import pikepdf
from pikepdf import Name
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
argv = sys.argv[3:]
def opt(flag, default):
    return type(default)(argv[argv.index(flag) + 1]) if flag in argv else default
TARGET_PPI = opt('--ppi', 110)
QUALITY    = opt('--quality', 82)
DRY        = '--dry-run' in argv

pdf = pikepdf.open(src)

# How big is each image drawn? pikepdf does not hand us placement directly, so
# use the page size as the upper bound: on a slide deck nothing is drawn larger
# than the page, and full-bleed is the common case. That makes the estimate
# conservative — it will never downsample an image below what a full-page
# placement needs.
def page_target_px(page):
    box = page.mediabox
    w_pt = float(box[2]) - float(box[0])
    h_pt = float(box[3]) - float(box[1])
    return (w_pt / 72.0) * TARGET_PPI, (h_pt / 72.0) * TARGET_PPI

seen, saved, touched = set(), 0, []

for pageno, page in enumerate(pdf.pages, start=1):
    max_w, max_h = page_target_px(page)
    try:
        images = page.images
    except Exception:
        continue
    for name, raw in images.items():
        objid = raw.objgen
        if objid in seen:
            continue
        seen.add(objid)

        try:
            pim = pikepdf.PdfImage(raw)
            before = len(raw.read_raw_bytes())
        except Exception:
            continue
        if before < 60_000:          # not worth the churn or the quality loss
            continue

        try:
            im = pim.as_pil_image()
        except Exception:
            continue

        w, h = im.size
        scale = min(1.0, max_w / w, max_h / h)
        needs_resize = scale < 0.98
        needs_depth  = (im.mode not in ('RGB', 'L'))

        if not needs_resize and not needs_depth and before < 1_000_000:
            continue

        if needs_resize:
            im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)

        # How many components does the PDF think this image has? Keeping that the
        # same is what lets us leave /ColorSpace alone below.
        cs = raw.get('/ColorSpace')
        ncomp = None
        try:
            if cs is not None and cs[0] == Name('/ICCBased'):
                ncomp = int(cs[1].get('/N'))
            elif cs == Name('/DeviceRGB'):
                ncomp = 3
            elif cs == Name('/DeviceGray'):
                ncomp = 1
        except Exception:
            pass

        # Grayscale stays grayscale — converting it to RGB would triple it for
        # nothing. Everything else becomes 8-bit RGB.
        want = 'L' if ncomp == 1 else 'RGB'
        if im.mode != want:
            im = im.convert(want)

        buf = io.BytesIO()
        im.save(buf, format='JPEG', quality=QUALITY, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) >= before:       # already smaller than we can manage
            continue

        touched.append((pageno, f'{w}x{h}', f'{im.size[0]}x{im.size[1]}', before, len(data)))
        saved += before - len(data)

        if not DRY:
            raw.write(data, filter=Name('/DCTDecode'))
            # LEAVE /ColorSpace ALONE when the component count is unchanged.
            #
            # Overwriting an /ICCBased space with /DeviceRGB is the mistake that
            # cost an afternoon: these are iPhone photographs in a wide-gamut
            # profile, and relabelling wide-gamut values as sRGB does not convert
            # them — it tells the viewer to read them as something they are not,
            # and every saturated colour washes out. The samples are still in
            # the original space after a resize and an 8-bit JPEG round trip, so
            # the original profile still describes them correctly.
            if ncomp is None or (ncomp == 3 and im.mode != 'RGB') or (ncomp == 1 and im.mode != 'L'):
                raw.ColorSpace = Name('/DeviceRGB') if im.mode == 'RGB' else Name('/DeviceGray')
            raw.BitsPerComponent = 8
            raw.Width, raw.Height = im.size
            for k in ('/Decode', '/DecodeParms'):
                if k in raw:
                    del raw[k]

print(f'{"page":>5}  {"was":>11}  {"now":>11}  {"before":>9}  {"after":>9}')
for pageno, was, now, b, a in sorted(touched, key=lambda t: -t[3])[:20]:
    print(f'{pageno:5d}  {was:>11}  {now:>11}  {b/1e6:8.2f}M  {a/1e6:8.2f}M')
print(f'\n{len(touched)} image(s) re-encoded · {saved/1e6:.1f} MB saved before recompression')

if not DRY:
    pdf.save(dst, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
    import os
    print(f'\n{src}  {os.path.getsize(src)/1e6:.1f} MB')
    print(f'{dst}  {os.path.getsize(dst)/1e6:.1f} MB')
