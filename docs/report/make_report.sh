#!/bin/bash
# Raporu üretir: docx -> pdf -> başlık sayfalarını bul -> içindekilerle yeniden üret -> pdf
set -e
cd "$(dirname "$0")"
NAME=Ahmet_Zeyt_Eroglu_Bilisim_Hukuku_Proje_Raporu
rm -f pagemap.json
for pass in 1 2; do
  node build_report.js
  soffice --headless --convert-to pdf "$NAME.docx" >/dev/null 2>&1
  python3 - "$NAME.pdf" <<'PY'
import json, subprocess, sys
pdf = sys.argv[1]
heads = json.load(open('headings.json'))
n = int([l for l in subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout.splitlines() if l.startswith('Pages')][0].split()[-1])
pages = [subprocess.run(['pdftotext', '-layout', '-f', str(i), '-l', str(i), pdf, '-'], capture_output=True, text=True).stdout for i in range(1, n + 1)]
def has(page, h):
    lines = [l.strip() for l in page.splitlines() if l.strip()]
    return any(l == h or (j + 1 < len(lines) and l + ' ' + lines[j + 1] == h) for j, l in enumerate(lines))
# İçindekiler sayfalarını atla: gövde, son TOC girdisinin geçtiği ilk sayfadan sonra başlar
toc_end = next(i for i in range(n) if any(l.strip().startswith(heads[-1]) for l in pages[i].splitlines()))
result, start = {}, toc_end + 1
for h in heads:
    for i in range(start, n):
        if has(pages[i], h):
            result[h] = i  # kapak sayfa 1 (numarasız); gösterilen numara = pdf sayfası - 1
            start = i
            break
missing = [h for h in heads if h not in result]
json.dump(result, open('pagemap.json', 'w'), ensure_ascii=False)
print('sayfa:', n, '| bulunamayan başlık:', missing)
PY
done
