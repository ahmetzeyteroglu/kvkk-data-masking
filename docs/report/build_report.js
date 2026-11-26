// Akademik proje raporunu (.docx) üretir.
// Çalıştırma: node docs/report/build_report.js
// İçindekiler sayfa numaraları için iki geçiş yapılır: make_report.sh bunu otomatik yapar.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Footer,
  AlignmentType, HeadingLevel, PageNumber, WidthType, BorderStyle, ShadingType, LevelFormat,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  PageBreak, TabStopType, VerticalAlign, Tab, LineRuleType,
} = require('docx');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, 'Ahmet_Zeyt_Eroglu_Bilisim_Hukuku_Proje_Raporu.docx');
const PAGEMAP = path.join(__dirname, 'pagemap.json');
const pagemap = fs.existsSync(PAGEMAP) ? JSON.parse(fs.readFileSync(PAGEMAP, 'utf8')) : {};

const FONT = 'Times New Roman';
const TEXT_WIDTH = 9070; // A4 (11906) - 2 x 2,5 cm (1417)

// ---------- Yardımcılar ----------

// "<b>kalın</b>" ve "<i>italik</i>" işaretlerini TextRun listesine çevirir.
function runs(text, base = {}) {
  const out = [];
  const re = /(<b>[^<]+<\/b>|<i>[^<]+<\/i>)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith('<b>')) out.push(new TextRun({ text: t.slice(3, -4), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(3, -4), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const P = (text, opts = {}) => new Paragraph({ children: runs(text), alignment: AlignmentType.JUSTIFIED, ...opts });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const BULLET = (text) => new Paragraph({ children: runs(text), numbering: { reference: 'bullets', level: 0 }, alignment: AlignmentType.JUSTIFIED });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

let figNo = 0, tabNo = 0;
const figures = [], tables = [];

// Şekil: resim + altında "Şekil N. başlık" (kaynak notu isteğe bağlı)
function FIG(file, w, h, caption, note, px = 600) {
  figNo++;
  figures.push(caption);
  const width = px; // piksel (600 ≈ 15,9 cm)
  const height = Math.round(width * h / w);
  const out = [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60, line: 240, lineRule: LineRuleType.AUTO },
      children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(ROOT, file)), transformation: { width, height } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: note ? 0 : 200, line: 276 },
      children: [new TextRun({ text: `Şekil ${figNo}. `, bold: true, size: 22 }), new TextRun({ text: caption, size: 22 })] }),
  ];
  if (note) out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200, line: 276 }, children: [new TextRun({ text: note, italics: true, size: 20 })] }));
  return out;
}

const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: border, bottom: border, left: border, right: border };

// Tablo: başlık üstte ("Tablo N. başlık"), hücreler 10 punto, tek satır aralığı
function TAB(caption, headers, rows, props, note) {
  tabNo++;
  tables.push(caption);
  const total = props.reduce((a, b) => a + b, 0);
  const widths = props.map((p) => Math.floor(TEXT_WIDTH * p / total));
  widths[widths.length - 1] += TEXT_WIDTH - widths.reduce((a, b) => a + b, 0);
  const cell = (text, i, head) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: head ? { fill: 'E7E6E6', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: String(text).split('\n').map((line) => new Paragraph({ spacing: { before: 0, after: 0, line: 240 }, alignment: AlignmentType.LEFT,
      children: runs(line, { size: 19, bold: head || undefined }) })),
  });
  return [
    new Paragraph({ keepNext: true, spacing: { before: 120, after: 80, line: 276 }, alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `Tablo ${tabNo}. `, bold: true, size: 22 }), new TextRun({ text: caption, size: 22 })] }),
    new Table({ width: { size: TEXT_WIDTH, type: WidthType.DXA }, columnWidths: widths,
      rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
        ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))] }),
    new Paragraph({ spacing: { before: 60, after: 200, line: 240 }, children: note ? [new TextRun({ text: note, italics: true, size: 20 })] : [] }),
  ];
}

// ---------- Kapak ----------
const C = (text, size, bold, after = 0) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after, line: 276 }, children: [new TextRun({ text, size, bold })] });
const cover = [
  C('T.C.', 28, true), C('İSTANBUL TİCARET ÜNİVERSİTESİ', 28, true), C('MÜHENDİSLİK FAKÜLTESİ', 26, true),
  C('İNGİLİZCE BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ', 26, true, 1200),
  C('BİLİŞİM HUKUKU (HUK319)', 26, true), C('DÖNEM PROJESİ – AKADEMİK PROJE RAPORU', 24, false, 1000),
  C('ÜRETKEN YAPAY ZEKÂ ARAÇLARINA VE TEST', 30, true),
  C('ORTAMLARINA AKTARILAN VERİLERDE KVKK UYUMU:', 30, true),
  C('KİŞİSEL VERİ TESPİT VE MASKELEME', 30, true),
  C('ARACI TASARIMI', 30, true, 1400),
  C('Hazırlayan', 24, true), C('Ahmet Zeyt EROĞLU', 24, false), C('Öğrenci No: 23lbim023', 24, false, 600),
  C('Öğretim Üyesi', 24, true), C('Prof. Dr. Agah Tuğrul KORUCU', 24, false, 1000),
  C('2026–2027 Güz Yarıyılı', 24, false), C('İstanbul, Aralık 2026', 24, false),
];

// ---------- İçindekiler (sayfa numaraları pagemap.json'dan) ----------
const tocEntries = [];
function tocLine(text, level) {
  const page = pagemap[text] !== undefined ? String(pagemap[text]) : '';
  return new Paragraph({ spacing: { after: 20, line: 276 }, indent: { left: level === 2 ? 400 : 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH, leader: 'dot' }],
    children: [new TextRun({ text, bold: level === 1, size: 24 }), new TextRun({ children: [new Tab(), page], size: 24 })] });
}
// H1/H2 çağrılarını kaydeden sarmalayıcılar
const h1 = (t) => { tocEntries.push([t, 1]); return H1(t); };
const h2 = (t) => { tocEntries.push([t, 2]); return H2(t); };

// ---------- Özet ----------
const ozet = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun('ÖZET')] }),
  P(`Çalışanların müşteri bilgilerini ChatGPT gibi üretken yapay zekâ (ÜYZ) araçlarına yapıştırması ve gerçek müşteri verisini test ortamlarında kullanması, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) açısından giderek büyüyen bir sorundur. Kişisel Verileri Koruma Kurumu, kurumun bilgisi dışındaki bu kullanımı 2026 yılında "gölge yapay zekâ" olarak ayrıca ele almıştır. Bu projede söz konusu veri akışı bir bilişim sistemi olarak incelenmiş; KVKK m.4, 6, 9 ve 12 ile AB Genel Veri Koruma Tüzüğü (GDPR) çerçevesinde sekiz hukuki risk belirlenmiş ve 5×5 olasılık-etki matrisiyle puanlanmıştır. Çözüm olarak, veri bilgisayardan çıkmadan önce çalışan, Python ve Streamlit ile geliştirilmiş bir araç tasarlanmıştır. Araç; ad soyad, T.C. kimlik numarası, telefon, e-posta, IBAN, kredi kartı ve doğum tarihini kontrol hanesi algoritmalarıyla doğrulayarak bulmakta; bunlara maskeleme, takma ad verme veya kaldırma uygulamakta ve sağlık gibi hassas bilgiler için uyarı vermektedir. Cevabı bilinen 200 sentetik belgede duyarlılık %100, kesinlik %94,9 bulunmuş; ancak büyük harfle yazılmış ve sözlükte olmayan adlarda başarı %0 kalmıştır. Önlemlerden sonra "çok yüksek" düzeydeki iki risk orta düzeye inmiş, ancak hassas veri ve dolaylı bilgi riskleri sürmüştür. Sonuç olarak maskeleme ve takma adlandırmanın anonimleştirme olmadığı ve aracın tek başına uyum sağlamadığı, şirket politikası ve insan kontrolüyle birlikte kullanılması gereken bir teknik önlem olduğu gösterilmiştir.`),
  new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: 'Anahtar Kelimeler: ', bold: true }), new TextRun('KVKK, kişisel veri maskeleme, takma adlandırma, anonimleştirme, üretken yapay zekâ, veri minimizasyonu, Privacy by Design')] }),
];

// ---------- Gövde ----------
const body = [];
const add = (...x) => x.flat().forEach((e) => body.push(e));

require('./report_body.js')({ add, h1, h2, P, BULLET, TAB, FIG });

// ---------- Kaynakça ----------
const REF = (text) => new Paragraph({ children: runs(text), alignment: AlignmentType.LEFT, indent: { left: 567, hanging: 567 }, spacing: { after: 100, line: 300 } });
const kaynakca = [
  h1('KAYNAKÇA'),
  H2('Mevzuat, Resmî Belgeler ve Yargı Kararları'),
  REF('5237 sayılı Türk Ceza Kanunu. (2004). <i>Resmî Gazete</i> (Sayı: 25611, 12 Ekim 2004).'),
  REF('6698 sayılı Kişisel Verilerin Korunması Kanunu. (2016). <i>Resmî Gazete</i> (Sayı: 29677, 7 Nisan 2016).'),
  REF('7499 sayılı Ceza Muhakemesi Kanunu ile Bazı Kanunlarda Değişiklik Yapılmasına Dair Kanun. (2024). <i>Resmî Gazete</i> (Sayı: 32487, 12 Mart 2024).'),
  REF('Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik. (2017). <i>Resmî Gazete</i> (Sayı: 30224, 28 Ekim 2017).'),
  REF('Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik. (2024). <i>Resmî Gazete</i> (Sayı: 32598, 10 Temmuz 2024).'),
  REF('Case C-413/23 P, <i>European Data Protection Supervisor v Single Resolution Board</i>, ECLI:EU:C:2025:645 (Court of Justice of the European Union, 4 September 2025).'),
  REF('European Data Protection Board. (2025). <i>Guidelines 01/2025 on pseudonymisation</i> (Version 1.0, adopted – version for public consultation). https://www.edpb.europa.eu'),
  REF('Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (General Data Protection Regulation). <i>Official Journal of the European Union</i>, L 119, 4.5.2016, 1–88.'),
  REF('Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act). <i>Official Journal of the European Union</i>, L, 2024/1689, 12.7.2024.'),
  REF('Regulation (EU) 2026/1744 of the European Parliament and of the Council of 8 July 2026 amending Regulations (EU) 2024/1689, (EU) 2018/1139 and (EU) 2023/1230 (Digital Omnibus on AI). <i>Official Journal of the European Union</i>, L, 2026/1744, 24.7.2026.'),
  H2('Kurum Rehberleri'),
  REF('Kişisel Verileri Koruma Kurumu. (2018). <i>Kişisel verilerin silinmesi, yok edilmesi veya anonim hale getirilmesi rehberi</i>. https://www.kvkk.gov.tr'),
  REF('Kişisel Verileri Koruma Kurumu. (2025a). <i>Yapay zekâ alanında kişisel verilerin korunmasına dair tavsiyeler</i>. https://www.kvkk.gov.tr'),
  REF('Kişisel Verileri Koruma Kurumu. (2025b). <i>Üretken yapay zekâ ve kişisel verilerin korunması rehberi (15 soruda)</i>. https://www.kvkk.gov.tr/Icerik/8547'),
  REF('Kişisel Verileri Koruma Kurumu. (2026a). <i>İş yerlerinde üretken yapay zekâ araçlarının kullanımı</i>. https://www.kvkk.gov.tr/Icerik/8674'),
  REF('Kişisel Verileri Koruma Kurumu. (2026b). <i>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında idari para cezası tutarları</i>. https://www.kvkk.gov.tr/Icerik/8145'),
  H2('Akademik Kaynaklar ve Diğer Kaynaklar'),
  REF('Finck, M., & Pallas, F. (2020). They who must not be identified—distinguishing personal from non-personal data under the GDPR. <i>International Data Privacy Law, 10</i>(1), 11–36.'),
  REF('Gurman, M. (2023, 2 Mayıs). Samsung bans staff\'s AI use after spotting ChatGPT data leak. <i>Bloomberg</i>. https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak'),
  REF('Microsoft. (t.y.). <i>Presidio: Data protection and de-identification SDK</i> [Yazılım]. GitHub. https://github.com/microsoft/presidio'),
  REF('Mourby, M., Mackey, E., Elliot, M., Gowans, H., Wallace, S. E., Bell, J., Smith, H., Aidinlis, S., & Kaye, J. (2018). Are \'pseudonymised\' data always personal data? Implications of the GDPR for administrative data research in the UK. <i>Computer Law & Security Review, 34</i>(2), 222–233.'),
  REF('Ohm, P. (2010). Broken promises of privacy: Responding to the surprising failure of anonymization. <i>UCLA Law Review, 57</i>, 1701–1777.'),
  REF('Pilán, I., Lison, P., Øvrelid, L., Papadopoulou, A., Sánchez, D., & Batet, M. (2022). The Text Anonymization Benchmark (TAB): A dedicated corpus and evaluation framework for text anonymization. <i>Computational Linguistics, 48</i>(4), 1053–1101.'),
  REF('Rocher, L., Hendrickx, J. M., & de Montjoye, Y.-A. (2019). Estimating the success of re-identifications in incomplete datasets using generative models. <i>Nature Communications, 10</i>, Article 3069. https://doi.org/10.1038/s41467-019-10933-3'),
  REF('Stalla-Bourdillon, S. (2025). Identifiability, as a data risk: Is a uniform approach to anonymisation about to emerge in the EU? <i>European Journal of Risk Regulation, 16</i>(4), 1456–1474. https://doi.org/10.1017/err.2025.16'),
  REF('Sweeney, L. (2002). k-anonymity: A model for protecting privacy. <i>International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems, 10</i>(5), 557–570. https://doi.org/10.1142/S0218488502001648'),
];

const ek = [
  h1('EK: UYGULAMA DOSYALARI'),
  P('Aracın kaynak kodu, birim testleri, ölçüm betiği, sentetik örnek veriler ve şekillerin kaynak dosyaları aşağıdaki depoda yer almaktadır: https://github.com/ahmetzeyteroglu/kvkk-data-masking'),
  P('Kurulum ve çalıştırma: "pip install -r requirements.txt" komutuyla bağımlılıklar kurulur; "streamlit run app.py" ile arayüz açılır; "pytest" ile 113 birim testi, "python -m scripts.evaluate" ile Bölüm 9\'daki ölçüm çalıştırılır.'),
];

// ---------- Belge ----------
const pageProps = { page: { size: { width: 11906, height: 16838 }, margin: { top: 1417, bottom: 1417, left: 1417, right: 1417, footer: 708 } } };
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 22 })] })] });

const toc = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun('İÇİNDEKİLER')] }),
  ...tocEntries.map(([t, l]) => tocLine(t, l)),
];

const doc = new Document({
  creator: 'Ahmet Zeyt Eroğlu',
  title: 'Bilişim Hukuku Proje Raporu',
  styles: {
    default: { document: { run: { font: FONT, size: 24 }, paragraph: { spacing: { before: 0, after: 120, line: 360 } } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 28, bold: true }, paragraph: { spacing: { before: 240, after: 120, line: 360 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { before: 120, after: 120, line: 360 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 567, hanging: 283 } } } }] }] },
  sections: [
    { properties: pageProps, children: cover },
    { properties: { ...pageProps, page: { ...pageProps.page, pageNumbers: { start: 1 } } }, footers: { default: footer },
      children: [...ozet, BREAK(), ...toc, BREAK(), ...body, BREAK(), ...kaynakca, ...ek] },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  fs.writeFileSync(path.join(__dirname, 'headings.json'), JSON.stringify(tocEntries.map(([t]) => t)));
  console.log('yazıldı:', OUT, '| şekil:', figNo, '| tablo:', tabNo);
});
