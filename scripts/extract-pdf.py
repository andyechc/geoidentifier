# Dump a plonkit country PDF to text + images for curation.
# Usage: /tmp/pdfenv/bin/python scripts/extract-pdf.py "<pdf>" <slug>
# Output: .tmp/<slug>.txt and static/metas/<slug>/img-*.png|jpg
import os
import re
import sys

import pymupdf

pdf_path, slug = sys.argv[1], sys.argv[2]
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img_dir = os.path.join(base, "static", "metas", slug)
tmp_txt = os.path.join(base, ".tmp", f"{slug}.txt")
os.makedirs(img_dir, exist_ok=True)
os.makedirs(os.path.dirname(tmp_txt), exist_ok=True)

doc = pymupdf.open(pdf_path)
full = []
for i, page in enumerate(doc):
    full.append(f"\n===== PAGE {i + 1}/{len(doc)} =====\n")
    full.append(page.get_text())
    for n, img in enumerate(page.get_images(full=True)):
        xref = img[0]
        try:
            pix = pymupdf.Pixmap(doc, xref)
            ext = "png"
            if pix.n > 4:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            data = pix.tobytes("png")
            # skip tiny icons (<8KB) — page furniture, not clue photos
            if len(data) < 8000:
                continue
            out = os.path.join(img_dir, f"p{i + 1:02d}-{n:02d}.png")
            open(out, "wb").write(data)
        except Exception as e:
            print(f"warn: page {i + 1} img {n}: {e}", file=sys.stderr)

open(tmp_txt, "w").write("\n".join(full))
kept = sorted(os.listdir(img_dir))
print(f"{slug}: {len(doc)} pages, {len(kept)} images -> {tmp_txt}")
