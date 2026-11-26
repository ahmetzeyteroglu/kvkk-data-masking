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
function FIG(file, w, h, caption, note) {
  figNo++;
  figures.push(caption);
  const width = 600; // piksel (~15,9 cm)
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
  return new Paragraph({ spacing: { after: 40, line: 300 }, indent: { left: level === 2 ? 400 : 0 },
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_WIDTH, leader: 'dot' }],
    children: [new TextRun({ text, bold: level === 1, size: 24 }), new TextRun({ children: [new Tab(), page], size: 24 })] });
}
// H1/H2 çağrılarını kaydeden sarmalayıcılar
const h1 = (t) => { tocEntries.push([t, 1]); return H1(t); };
const h2 = (t) => { tocEntries.push([t, 2]); return H2(t); };

// ---------- Özet ----------
const ozet = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun('ÖZET')] }),
  P('Kurum çalışanlarının müşteri kayıtlarını, e-postalarını veya tablolarını üretken yapay zekâ (ÜYZ) araçlarına yapıştırması ve gerçek müşteri verisini test ortamlarında kullanması, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) bakımından giderek büyüyen bir uyum sorunudur. Kişisel Verileri Koruma Kurumu 2026 yılında bu kurumsal kontrol dışı kullanımı ("gölge yapay zekâ") ayrıca ele almıştır. Bu projede söz konusu iş akışı bir bilişim sistemi olarak incelenmiş; KVKK m.4, 6, 9 ve 12 ile AB Genel Veri Koruma Tüzüğü (GDPR) m.4(5), 5(1)(c), 25 ve 32 çerçevesinde sekiz hukuki risk belirlenmiş ve 5×5 olasılık-etki matrisiyle değerlendirilmiştir. Çözüm olarak, veri kurumdan çıkmadan önce yerel olarak çalışan, Python ve Streamlit ile geliştirilmiş bir tespit ve koruma aracı tasarlanmıştır. Araç; ad soyad, T.C. kimlik numarası, telefon, e-posta, IBAN, kredi kartı ve doğum tarihini kontrol hanesi algoritmalarıyla doğrulayarak bulmakta, maskeleme, takma adlandırma veya kaldırma uygulamakta ve özel nitelikli veri ipuçları için uyarı vermektedir. Cevap anahtarı bilinen 200 sentetik belgede duyarlılık %100, kesinlik %94,9 bulunmuş; büyük harfle yazılmış ve sözlükte olmayan adlarda ise tespit oranı %0 kalmıştır. Risk değerlendirmesinde "çok yüksek" düzeydeki iki risk orta düzeye inmiş, ancak özel nitelikli veri ve dolaylı tanımlayıcılara ilişkin riskler sürmüştür. Sonuç olarak maskeleme ve takma adlandırmanın anonimleştirme olmadığı, aracın tek başına uyum sağlamadığı ve kurumsal politika ile insan denetimiyle birlikte kullanılması gereken bir teknik tedbir olduğu gösterilmiştir.'),
  new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: 'Anahtar Kelimeler: ', bold: true }), new TextRun('KVKK, kişisel veri maskeleme, takma adlandırma, anonimleştirme, üretken yapay zekâ, veri minimizasyonu, Privacy by Design')] }),
];

// ---------- Gövde ----------
const body = [];
const add = (...x) => x.flat().forEach((e) => body.push(e));

add(h1('1. GİRİŞ'));
add(h2('1.1. Konunun Önemi'));
add(P('Üretken yapay zekâ araçları kısa sürede yazışma hazırlama, metin özetleme, tablo düzenleme ve yazılım hatası ayıklama gibi günlük ofis işlerinin parçası hâline gelmiştir. Bu araçların büyük bölümü üçüncü taraf şirketlerce, çoğunlukla yurt dışındaki sunucularda işletilen bulut hizmetleridir. Bir müşteri hizmetleri çalışanının iade talebine yanıt hazırlamak için müşterinin e-postasını olduğu gibi bir sohbet aracına yapıştırması, teknik olarak birkaç saniyelik bir işlemdir; hukuki olarak ise kişisel verinin üçüncü bir kişiye ve çoğu zaman yurt dışına aktarılması anlamına gelir.'));
add(P('Benzer bir sorun yazılım geliştirme süreçlerinde de yaşanır. Gerçek müşteri verisinin "gerçekçi test" gerekçesiyle test veya geliştirme ortamlarına kopyalanması, verinin toplanma amacıyla bağdaşmayan ve daha zayıf güvenlik önlemleri altındaki bir ortamda işlenmesi demektir. Kişisel Verileri Koruma Kurumu (KVK Kurumu) 2025 ve 2026 yıllarında yayımladığı belgelerde üretken yapay zekânın kişisel veri risklerini ve iş yerlerinde kurumsal kontrol dışı kullanımını ayrıca ele almıştır (KVK Kurumu, 2025b, 2026). Kamuoyunda bilinen bir örnek, 2023 yılında Samsung çalışanlarının şirket içi kaynak kodunu ChatGPT\'ye yüklemesi ve şirketin bunun ardından çalışanların üretken yapay zekâ kullanımını kısıtlamasıdır (Gurman, 2023). Bu olayda sızan bilgi ticari sır niteliğindedir; ancak aynı mekanizma kişisel veriler için de aynen geçerlidir.'));
add(h2('1.2. Projenin Amacı ve Kapsamı'));
add(P('Projenin amacı, kurum çalışanlarının kişisel veri içeren metin ve tabloları ÜYZ araçlarına veya test ortamlarına aktardığı iş akışını bir bilişim sistemi olarak incelemek, bu akışın KVKK ve GDPR bakımından doğurduğu hukuki riskleri belirlemek ve bu riskleri azaltan, veri kurumdan çıkmadan önce yerel olarak çalışan bir teknik tedbir tasarlayıp geliştirmektir. Geliştirilen araç; ad soyad, T.C. kimlik numarası (TCKN), cep telefonu, e-posta, IBAN, kredi kartı numarası ve doğum tarihini tespit etmekte, bunlara maskeleme, takma adlandırma veya kaldırma uygulamakta ve KVKK m.6 kapsamındaki özel nitelikli veri ipuçları için kullanıcıyı uyarmaktadır.'));
add(P('Kapsam Türkçe serbest metin ile CSV ve Excel dosyalarıyla sınırlıdır. Adres, plaka, sabit hat telefonu ve dolaylı tanımlayıcılar (yaş, meslek, şehir gibi) tespit kapsamı dışındadır. Projede gerçek kişilere ait hiçbir veri kullanılmamış; tüm örnekler doğrulama algoritmalarından geçen ancak gerçek bir kişiyle ilişkisi olmayan sentetik verilerden oluşturulmuştur.'));
add(h2('1.3. Yöntem'));
add(P('Çalışmada dört aşamalı bir yöntem izlenmiştir: (i) ilgili mevzuat, KVK Kurumu rehberleri, AB düzenlemeleri ve akademik literatürün resmî kaynaklardan doğrulanarak incelenmesi; (ii) incelenen iş akışının veri akışı ve teknik zayıflıklar bakımından analizi; (iii) belirlenen risklerin olasılık-etki matrisiyle değerlendirilmesi; (iv) önerilen aracın geliştirilmesi ve cevap anahtarı bilinen sentetik bir test kümesinde ölçülmesi. Aracın kaynak kodu, testleri ve ölçüm betiği proje deposunda yer almaktadır (bkz. Ek).'));

add(h1('2. PROBLEM TANIMI VE İHTİYAÇ ANALİZİ'));
add(h2('2.1. Problem Tanımı'));
add(P('Problem, kişisel verinin <b>işin gerektirdiğinden fazla ve denetimsiz biçimde</b> kurum dışına veya amacına aykırı ortamlara çıkmasıdır. Bir iade e-postasını özetlemek için müşterinin adına, TCKN\'sine, IBAN\'ına ve sağlık durumuna ihtiyaç yoktur; ancak metin bütün olarak kopyalandığında bu bilgilerin tamamı ÜYZ hizmetine gönderilir. Çalışan çoğu zaman bunun hukuki sonucunun farkında değildir; kurum ise hangi verinin hangi araca gittiğini bilmez. KVK Kurumu bu durumu şöyle tarif etmektedir: "Kurumsal kontrol dışında kullanılan ÜYZ araçları ile kişisel verilerin paylaşılması, veri ihlali riskini artırabilmektedir. Bu tür kullanımlar, kişisel verilerin hukuka aykırı şekilde işlenmesi, yetkisiz kişilerce erişilebilir hâle gelmesi veya amaç dışı kullanılması gibi sonuçlara yol açabilmektedir." (KVK Kurumu, 2026, s. 9). Kurum aynı paragrafta, komutlarla paylaşılan kişisel verilerin üretilen çıktılara yansıyarak üçüncü kişilerce erişilebilir hâle gelmesi riskine de dikkat çekmektedir.'));
add(h2('2.2. Etkilenen Taraflar'));
add(BULLET('<b>İlgili kişiler (müşteriler):</b> Verileri bilgileri dışında yurt dışındaki bir hizmet sağlayıcıya gider; dolandırıcılık, kimlik hırsızlığı ve özel nitelikli verilerin ifşası riskiyle karşılaşırlar.'));
add(BULLET('<b>Veri sorumlusu (kurum):</b> KVKK m.12 kapsamındaki veri güvenliği yükümlülüğünü ihlal etmiş olabilir; 2026 yılı için 256.357 TL ile 17.092.242 TL arasında idari para cezası (m.18/1-b) ve itibar kaybı söz konusudur.'));
add(BULLET('<b>Çalışanlar:</b> Kişisel verileri hukuka aykırı olarak bir başkasına veren kişi bakımından TCK m.136 kapsamında cezai sorumluluk gündeme gelebilir.'));
add(BULLET('<b>Yazılım geliştiriciler:</b> Gerçek veriyle çalışılan test ortamları, üretim ortamından daha zayıf erişim kontrolüne sahip olduğundan ihlal noktası hâline gelir.'));
add(h2('2.3. İhtiyaç Analizi ve Gereksinimler'));
add(P('Problemi yasaklama yoluyla çözmek (örneğin tüm ÜYZ araçlarını engellemek) verimlilik kaybına yol açar ve çalışanları kişisel cihazlara yönelterek kontrolü daha da azaltabilir. Bu nedenle ihtiyaç, ÜYZ kullanımını engellemeden veriyi kurumdan çıkmadan önce azaltan bir ara katmandır. Bu ihtiyaçtan şu gereksinimler türetilmiştir:'));
add(TAB('Gereksinimler ve hukuki dayanakları', ['No', 'Gereksinim', 'Gerekçe / dayanak'], [
  ['G1', 'Veri kurum dışına hiç çıkmadan, yerel makinede işlenmelidir.', 'Aracın kendisi yeni bir aktarım yaratmamalı (KVKK m.9, m.12)'],
  ['G2', 'Türkiye\'ye özgü tanımlayıcılar (TCKN, TR IBAN, TR telefon) doğrulanarak bulunmalıdır.', 'Yanlış alarmların azaltılması; kullanılabilirlik'],
  ['G3', 'Kullanım amacına göre farklı koruma yöntemleri sunulmalıdır.', 'Ölçülülük ve veri minimizasyonu (m.4/2-ç; GDPR m.5/1-c)'],
  ['G4', 'Özel nitelikli veri ipuçları ayrıca işaretlenmelidir.', 'KVKK m.6 kapsamındaki daha sıkı rejim'],
  ['G5', 'Takma adlandırmada eşleme tablosu korunmuş veriden ayrı tutulmalıdır.', 'GDPR m.4(5): ek bilginin ayrı saklanması'],
  ['G6', 'Aracın başarımı ölçülebilir ve sınırlılıkları açıkça belirtilmiş olmalıdır.', 'Hesap verebilirlik; yanlış güven duygusunun önlenmesi'],
], [1, 6, 5]));

add(h1('3. LİTERATÜR ARAŞTIRMASI VE HUKUKİ MEVZUAT İNCELEMESİ'));
add(P('Bu bölümde kullanılan tüm mevzuatın güncel hâli Mevzuat Bilgi Sistemi, Resmî Gazete, KVK Kurumu ve EUR-Lex üzerinden kontrol edilmiştir.'));
add(h2('3.1. Türk Mevzuatı'));
add(P('<b>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)</b> projenin temel dayanağıdır. KVKK m.3/1-d kişisel veriyi "kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi" olarak, m.3/1-b ise anonim hâle getirmeyi kişisel verilerin "başka verilerle eşleştirilerek dahi hiçbir surette kimliği belirli veya belirlenebilir bir gerçek kişiyle ilişkilendirilemeyecek hâle getirilmesi" olarak tanımlar. Bu tanım çok yüksek bir eşik koyar: verinin bir kısmını gizleyen maskeleme veya geri döndürülebilir takma adlandırma, bu tanımı kural olarak karşılamaz. KVKK\'da takma adlandırmanın ayrı bir tanımı bulunmamaktadır.'));
add(P('<b>KVKK m.4/2</b>, kişisel verilerin işlendikleri amaçla bağlantılı, sınırlı ve ölçülü olmasını (ç bendi) ve belirli, açık ve meşru amaçlar için işlenmesini (c bendi) öngörür. Bir metni özetlemek için gereksiz kimlik bilgilerinin de gönderilmesi bu ilkeyle doğrudan çelişir. <b>KVKK m.6</b> sağlık, sendika üyeliği, din, ceza mahkûmiyeti, biyometrik ve genetik veriler gibi özel nitelikli kişisel verileri sayar; bu maddenin işleme şartları 7499 sayılı Kanunun 33. maddesiyle yeniden düzenlenmiştir.'));
add(P('<b>KVKK m.9</b>, yurt dışına aktarımı düzenler. Madde, 12.03.2024 tarihli ve 32487 sayılı Resmî Gazete\'de yayımlanan 7499 sayılı Kanunun 34. maddesiyle değiştirilmiş ve değişiklik 01.06.2024 tarihinde yürürlüğe girmiştir. Yeni düzende aktarım; yeterlilik kararına, yeterlilik kararı yoksa standart sözleşme, bağlayıcı şirket kuralları gibi uygun güvencelere veya sınırlı arızi hâllere dayanabilir. Uygulamanın ayrıntıları Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik ile belirlenmiştir (RG 10.07.2024, S. 32598). Bir çalışanın kurumun haberi olmadan yurt dışı sunuculu bir ÜYZ hizmetine veri girmesi, bu güvencelerin hiçbirine dayanmadığından hukuka aykırı aktarım riski taşır.'));
add(P('<b>KVKK m.12</b>, veri sorumlusuna kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek için "uygun güvenlik düzeyini temin etmeye yönelik gerekli her türlü teknik ve idari tedbirleri" alma yükümlülüğü getirir. Önerilen araç, bu maddedeki teknik tedbirlerin somut bir örneği olarak konumlandırılmıştır. <b>KVKK m.7</b> ve <b>Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik</b> (RG 28.10.2017, S. 30224) ise anonimleştirmenin usulünü düzenler. <b>KVKK m.18</b> idari para cezalarını belirler; 2026 yılı için yeniden değerleme oranıyla güncellenen tutarlar Tablo 2\'de verilmiştir. Son olarak <b>5237 sayılı Türk Ceza Kanunu m.135–138</b>, kişisel verilerin hukuka aykırı kaydedilmesini, bir başkasına verilmesini veya ele geçirilmesini ve süresi geçen verilerin yok edilmemesini suç olarak düzenler.'));
add(TAB('KVKK m.18 kapsamındaki 2026 yılı idari para cezaları', ['Bent', 'Yükümlülük', 'Alt sınır', 'Üst sınır'], [
  ['18/1-a', 'Aydınlatma yükümlülüğü (m.10)', '85.437 TL', '1.709.200 TL'],
  ['18/1-b', 'Veri güvenliği yükümlülüğü (m.12)', '256.357 TL', '17.092.242 TL'],
  ['18/1-c', 'Kurul kararlarının yerine getirilmemesi (m.15)', '427.263 TL', '17.092.242 TL'],
  ['18/1-ç', 'Veri Sorumluları Siciline kayıt ve bildirim (m.16)', '341.809 TL', '17.092.242 TL'],
  ['18/1-d', 'Standart sözleşmenin Kurum\'a bildirilmemesi (m.9/5)', '90.308 TL', '1.806.177 TL'],
], [1.3, 5, 2, 2.2], 'Kaynak: KVK Kurumu (2026b). 18/1-d bendi yalnızca bildirim yükümlülüğünün cezasıdır; bu projedeki senaryoyla en ilgili bent 18/1-b\'dir.'));
add(h2('3.2. KVK Kurumu Rehberleri'));
add(P('KVK Kurumu\'nun <b>Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Rehberi</b> (2018), anonimleştirme yöntemlerini sınıflandırır ve maskelemeyi bu yöntemler arasında tanımlar (s. 13). Rehber, yöntemin tek başına değil, verinin başka verilerle birleştirilme ihtimali de dikkate alınarak değerlendirilmesi gerektiğini vurgular. <b>Yapay Zekâ Alanında Kişisel Verilerin Korunmasına Dair Tavsiyeler</b> (KVK Kurumu, 2025a) tasarımdan itibaren gizlilik yaklaşımını, <b>Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi (15 Soruda)</b> (KVK Kurumu, 2025b) ise ÜYZ sistemlerinin yaşam döngüsü boyunca kişisel veri risklerini ele alır. Projenin doğrudan çıkış noktası, Kurum\'un <b>İş Yerlerinde Üretken Yapay Zekâ Araçlarının Kullanımı</b> başlıklı belgesidir (KVK Kurumu, 2026a). Bu belge, çalışanların kurum politikası olmadan ÜYZ araçlarını kullanmasını "gölge yapay zekâ" olarak adlandırmakta, bunun veri güvenliği ve hesap verebilirlik sorunları doğurduğunu belirtmekte ve kurumlara açık bir kullanım politikası oluşturmalarını önermektedir.'));
add(h2('3.3. Avrupa Birliği Düzenlemeleri ve İçtihat'));
add(P('<b>GDPR</b> (Regulation (EU) 2016/679) m.4(5), takma adlandırmayı kişisel verinin "ek bilgi kullanılmadan belirli bir ilgili kişiye atfedilemeyecek şekilde işlenmesi" olarak tanımlar ve bu ek bilginin ayrı tutulmasını ve teknik ve idari tedbirlerle korunmasını şart koşar. Gerekçe (Recital) 26\'ya göre takma adlandırılmış veri, ek bilgi kullanılarak bir kişiye atfedilebildiği sürece kişisel veri sayılır; anonim veri ise tüzüğün kapsamı dışındadır ve bu ayrımda "makul olarak kullanılması muhtemel tüm araçlar" dikkate alınır. GDPR m.5(1)(c) veri minimizasyonu ilkesini, m.25 tasarımdan ve varsayılan olarak veri korumayı, m.32(1)(a) ise "kişisel verilerin takma adlandırılması ve şifrelenmesini" uygun güvenlik tedbirleri arasında açıkça sayar.'));
add(P('Avrupa Veri Koruma Kurulu (EDPB), <b>Guidelines 01/2025 on Pseudonymisation</b> belgesini 16 Ocak 2025\'te kabul etmiş ve kamuoyu görüşüne açmıştır; belgenin nihai sürümü bu raporun yazıldığı tarihte henüz yayımlanmamıştır. Belge, takma adlandırmanın riskleri azaltan bir tedbir olduğunu ancak verinin kişisel veri niteliğini kendiliğinden ortadan kaldırmadığını vurgular (EDPB, 2025).'));
add(P('Avrupa Birliği Adalet Divanı\'nın 04.09.2025 tarihli <b>EDPS v SRB</b> kararı (C-413/23 P, ECLI:EU:C:2025:645) bu tartışmaya önemli bir boyut eklemiştir. Divan, takma adlandırılmış verinin, yeniden tanımlama için makul araçlara sahip olmayan bir <b>alıcı</b> bakımından kişisel veri sayılmayabileceğini kabul etmiş; bununla birlikte veriyi toplayan veri sorumlusunun aydınlatma yükümlülüğünün, verinin toplandığı andaki duruma göre değerlendirileceğini belirtmiştir. Literatürde bu karar, kişisel veri kavramına "göreli" bir yaklaşımın teyidi olarak okunmaktadır (Stalla-Bourdillon, 2025).'));
add(P('<b>Yapay Zekâ Tüzüğü</b> (Regulation (EU) 2024/1689) m.10, yüksek riskli yapay zekâ sistemlerinin eğitim verileri için veri yönetişimi şartları getirir. Yüksek riskli sistemlere ilişkin yükümlülüklerin uygulama tarihleri (AB) 2026/1744 sayılı Tüzük ile değiştirilmiş; Ek-III sistemleri için 02.12.2027, Ek-I kapsamındaki ürünlere gömülü sistemler için 02.08.2028 tarihine ertelenmiştir. Bu projede geliştirilen araç, yalnızca geliştiricinin tanımladığı kurallarla (düzenli ifadeler ve doğrulama algoritmaları) çalıştığı için Tüzük\'ün yapay zekâ sistemi tanımının kapsamı dışında kaldığı değerlendirilmektedir (Gerekçe 12); buna karşın aracın önünde konumlandığı ÜYZ hizmetleri Tüzük\'ün genel amaçlı yapay zekâ modellerine ilişkin hükümlerinin konusudur.'));
add(h2('3.4. KVKK ve GDPR\'ın Karşılaştırılması'));
add(P('Tablo 3, projeyle ilgili kavramlar bakımından iki düzenlemeyi karşılaştırmaktadır. En önemli fark, GDPR\'ın takma adlandırmayı tanımlayıp bir güvenlik tedbiri olarak açıkça anması, KVKK\'nın ise bu ara kategoriyi tanımlamamasıdır.'));
add(TAB('Proje kapsamındaki kavramlar bakımından KVKK ve GDPR karşılaştırması', ['Konu', 'KVKK', 'GDPR', 'Projeye etkisi'], [
  ['Kişisel veri', 'm.3/1-d: kimliği belirli veya belirlenebilir kişiye ilişkin her türlü bilgi', 'm.4(1); belirlenebilirlik için Recital 26\'daki "makul araçlar" ölçütü', 'Maskelenmiş veri, kalan parçalarla kişi belirlenebiliyorsa kişisel veridir'],
  ['Anonim hâle getirme', 'm.3/1-b: başka verilerle eşleştirilerek dahi ilişkilendirilememe', 'Recital 26: anonim veri kapsam dışında; makul araçlar ölçütü', 'Araç "anonimleştirme yapıyor" iddiasında bulunmaz'],
  ['Takma adlandırma', 'Tanımlanmamış', 'm.4(5) tanımlı; ek bilginin ayrı tutulması şartı; m.32(1)(a)\'da tedbir', 'Eşleme tablosu ayrı tutulur (G5); Türk hukukunda kavramsal boşluk'],
  ['Veri minimizasyonu', 'm.4/2-ç: amaçla bağlantılı, sınırlı ve ölçülü olma', 'm.5(1)(c)', 'Aracın temel gerekçesi'],
  ['Tasarımdan itibaren gizlilik', 'Kanunda açık hüküm yok; Kurum tavsiyelerinde yer alır', 'm.25 açık yükümlülük', 'Koruma, veri dışarı çıkmadan önce uygulanır'],
  ['Özel nitelikli veri', 'm.6 (7499 s. K. ile değişik); kılık kıyafet de sayılır', 'm.9', 'Risk raporunda ayrı uyarı'],
  ['Yurt dışına aktarım', 'm.9 (7499 s. K. ile değişik); yeterlilik, uygun güvenceler, arızi hâller', 'Bölüm V (m.44–49)', 'Yerel işleme ile aktarılan veri azaltılır'],
  ['Yaptırım', 'İdari para cezası (m.18) ve TCK m.135–138', 'Cironun %4\'üne veya 20 milyon avroya kadar (m.83)', 'Etki puanlamasında dikkate alınır'],
], [2, 3, 3, 3]));
add(h2('3.5. Akademik Literatür'));
add(P('Anonimleştirmenin sınırlarına ilişkin literatür, projenin temel varsayımlarını doğrudan etkiler. Sweeney (2002), yalnızca ad ve kimlik numarası gibi doğrudan tanımlayıcıları silmenin yeterli olmadığını, kamuya açık başka veri kümeleriyle birleştirme yoluyla kişilerin yeniden tanımlanabileceğini göstermiş ve buna karşı k-anonimlik modelini önermiştir. Ohm (2010), bilgisayar bilimindeki yeniden tanımlama çalışmalarının, hukukun "anonimleştirilmiş veri zararsızdır" varsayımını çürüttüğünü ileri sürmüştür. Rocher, Hendrickx ve de Montjoye (2019), 15 demografik özellik kullanılarak Amerikalıların %99,98\'inin herhangi bir veri kümesinde doğru biçimde yeniden tanımlanabileceğini hesaplamış ve örnekleme yoluyla anonimleştirmenin GDPR standartlarını karşılamasının zor olduğunu göstermiştir.'));
add(P('Hukuki literatürde Finck ve Pallas (2020), anonimleştirmede her zaman bir artık risk kaldığını ve kişisel veri ile kişisel olmayan veri arasındaki sınırın belirsiz olduğunu ortaya koymuştur. Mourby ve diğerleri (2018), GDPR\'daki takma adlandırma tanımının kişisel veri kavramını genişletmediğini, belirleyici ölçütün Recital 26\'daki makul araçlar testi olduğunu ve bir kurumda takma adlandırılmış verinin üçüncü bir taraf için anonim olabileceğini savunmuştur. Bu görüş, yukarıda anılan EDPS v SRB kararıyla büyük ölçüde örtüşmektedir. Stalla-Bourdillon (2025) ise EDPB\'nin 2025 rehberini ve Adalet Divanı içtihadını değerlendirerek AB\'de tanımlanabilirliğin bir risk kavramı olarak ele alındığını vurgulamıştır.'));
add(P('Metin anonimleştirmenin değerlendirilmesi konusunda Pilán ve diğerleri (2022), 1.268 Avrupa İnsan Hakları Mahkemesi kararından oluşan bir derlem (Text Anonymization Benchmark) hazırlamış ve klasik "önceden tanımlı kategorileri bulma" yaklaşımının ötesine geçen, gizlilik ve veri faydasını birlikte ölçen metrikler önermiştir. Bu projedeki ölçüm yöntemi (cevap anahtarına göre kesinlik ve duyarlılık), bu literatürdeki temel yaklaşımın sadeleştirilmiş bir uygulamasıdır.'));
add(h2('3.6. Mevcut Teknolojik Çözümler'));
add(P('Piyasada kişisel veri tespiti için açık kaynaklı araçlar bulunmaktadır; bunların en yaygınlarından biri, kural tabanlı tanıyıcılar ile varlık ismi tanıma (NER) modellerini birleştiren Microsoft Presidio\'dur (Microsoft, t.y.). Ancak bu araçlar ağırlıklı olarak İngilizce ve ABD\'ye özgü tanımlayıcılar (ör. sosyal güvenlik numarası) için hazırlanmıştır; TCKN\'nin kontrol hanesi algoritması, Türk IBAN yapısı ve Türkçe bağlam ifadeleri ("doğumlu", "Sayın") varsayılan olarak desteklenmez. Ticari veri kaybı önleme (DLP) ürünleri ise kurumsal lisans ve merkezi altyapı gerektirir. Bu boşluk, Türkiye\'ye özgü tanımlayıcılara odaklanan, hafif ve yerel çalışan bir aracın geliştirilmesini gerekçelendirmektedir.'));

add(h1('4. İNCELENEN BİLİŞİM SİSTEMİNİN TEKNİK ANALİZİ'));
add(h2('4.1. Sistem ve Veri Akışı'));
add(P('İncelenen sistem, tek bir yazılım değil; bir e-ticaret şirketinin müşteri hizmetleri ve yazılım geliştirme birimlerinde verinin izlediği yoldur. Şekil 1(a) mevcut durumu göstermektedir: Müşteri kayıtları müşteri ilişkileri yönetimi (CRM) sisteminde, e-posta kutularında ve dışa aktarılmış CSV/Excel dosyalarında bulunur. Çalışan, bir yanıt taslağı hazırlamak veya tabloyu düzenletmek için bu içeriği kopyalayıp bir ÜYZ aracının web arayüzüne yapıştırır. Geliştirici ise üretim veri tabanından alınan bir kopyayı test ortamına yükler.'));
add(FIG('docs/report/figures/sekil1_veri_akisi.png', 2200, 1216, 'Mevcut (a) ve önerilen (b) veri akışı', 'Kaynak: Yazar tarafından hazırlanmıştır.'));
add(h2('4.2. İşlenen Veri Kategorileri'));
add(P('Örnek iş akışında işlenen veriler üç gruba ayrılır: (i) doğrudan tanımlayıcılar: ad soyad, TCKN, telefon, e-posta; (ii) finansal veriler: IBAN ve kredi kartı numarası; (iii) bağlamsal ve özel nitelikli bilgiler: doğum tarihi, müşterinin serbest metinde belirttiği sağlık durumu veya sendika üyeliği. Üçüncü grup, yapılandırılmamış metnin içinde yer aldığı için en zor fark edilen ve hukuki açıdan en ağır sonuç doğuran gruptur.'));
add(h2('4.3. Teknik Zayıflıklar'));
add(BULLET('<b>Veri toplama ve aktarım:</b> Kopyala-yapıştır işlemi hiçbir kayıt bırakmaz; kurum hangi verinin hangi araca gittiğini denetleyemez. Aktarım HTTPS ile şifrelenmiş olsa da şifreleme yalnızca iletim sırasında korur; veri hizmet sağlayıcının sunucusunda açık hâlde işlenir.'));
add(BULLET('<b>Kimlik doğrulama ve erişim kontrolü:</b> Çalışanlar çoğu zaman kişisel hesaplarla oturum açar. Kurumsal sözleşme, veri işleme şartları ve yönetici denetimi bulunmaz.'));
add(BULLET('<b>Saklama ve silme:</b> Girilen içeriğin hizmet sağlayıcı tarafından ne kadar süre saklanacağı ve model geliştirmede kullanılıp kullanılmayacağı, hizmetin kullanım şartlarına bağlıdır ve kurumun kontrolünde değildir.'));
add(BULLET('<b>Üçüncü taraf ve çıktı riski:</b> Paylaşılan veri modelin ürettiği çıktılara yansıyabilir (KVK Kurumu, 2026a, s. 9).'));
add(BULLET('<b>Test ortamları:</b> Test ortamlarında erişim yetkileri genellikle daha geniştir, kayıtlar daha az izlenir ve yedekler kontrolsüz çoğalır.'));

add(h1('5. HUKUKİ RİSK ANALİZİ VE MEVZUATA UYUM DEĞERLENDİRMESİ'));
add(h2('5.1. Yöntem ve Ölçek'));
add(P('Riskler, ilgili hukuki düzenleme, sistemdeki teknik uygulama, olası ihlal ve etkilenen taraf eşleştirilerek belirlenmiştir. Her risk için olasılık (O) ve etki (E) 1–5 arasında puanlanmış, risk skoru R = O × E olarak hesaplanmıştır. Skorlar 1–4 düşük, 5–9 orta, 10–16 yüksek ve 20–25 çok yüksek olarak sınıflandırılmıştır. Ölçeğin tanımı Tablo 4\'te verilmiştir.'));
add(TAB('Olasılık ve etki ölçeği', ['Puan', 'Olasılık (O)', 'Etki (E)'], [
  ['1', 'Çok düşük: olağan iş akışında beklenmez', 'Önemsiz: kişi belirlenemez, yaptırım beklenmez'],
  ['2', 'Düşük: istisnai durumlarda', 'Sınırlı: kısmi bilgi ifşası, zarar olasılığı düşük'],
  ['3', 'Orta: ara sıra (ayda birkaç kez)', 'Orta: tek bir kişinin doğrudan tanımlayıcıları ifşa olur'],
  ['4', 'Yüksek: düzenli olarak (haftalık)', 'Ciddi: finansal veri ifşası, m.18/1-b kapsamında ceza riski'],
  ['5', 'Çok yüksek: günlük iş akışının parçası', 'Çok ciddi: özel nitelikli veri ifşası, ayrımcılık riski, cezai sorumluluk'],
], [1, 5, 6]));
add(P('Puanlar, bölüm 4\'te tanımlanan senaryoya göre yazar tarafından verilmiştir ve ampirik bir sıklık ölçümüne dayanmamaktadır. Hukuki uyum sayısal bir skora indirgenemez: düşük puanlı bir risk de tek bir olayda ilgili kişinin temel haklarını ağır biçimde etkileyebilir. Matris, bu nedenle bir karar aracı değil, tedbirlerin önceliklendirilmesi için bir iletişim aracı olarak kullanılmıştır.'));
add(h2('5.2. Risk Tablosu'));
add(TAB('Hukuki risk değerlendirmesi (önce: tedbir yok; sonra: araç + idari tedbirler)', ['No', 'Risk ve ilgili hüküm', 'Etkilenen', 'Önce O×E', 'Tedbir', 'Sonra O×E'], [
  ['R1', 'Doğrudan tanımlayıcıların ÜYZ aracına girilmesi\nKVKK m.4/2-ç, m.12; GDPR m.5(1)(c)', 'Müşteri, kurum', '5×4 = <b>20</b>', 'Gönderimden önce tespit ve koruma; kullanım politikası', '2×3 = 6'],
  ['R2', 'Hukuka aykırı yurt dışına aktarım\nKVKK m.9; GDPR Bölüm V', 'Müşteri, kurum', '5×4 = <b>20</b>', 'Yalnız korunmuş veri gönderilir; sözleşmeli kurumsal araç', '2×3 = 6'],
  ['R3', 'Özel nitelikli verinin işlenmesi\nKVKK m.6; GDPR m.9', 'Müşteri', '3×5 = <b>15</b>', 'Anahtar kelime uyarısı; silme kararı insana bırakılır', '2×5 = <b>10</b>'],
  ['R4', 'Test ortamında gerçek veri kullanımı\nKVKK m.4/2-c, ç; m.5', 'Müşteri, geliştirici', '4×3 = <b>12</b>', 'Takma adlı, tutarlı test verisi (CSV/Excel)', '1×3 = 3'],
  ['R5', 'Verinin model çıktılarına yansıması\nKVKK m.12; KVK Kurumu (2026a)', 'Müşteri, üçüncü kişiler', '3×4 = <b>12</b>', 'Veri araca hiç ulaşmaz', '1×4 = 4'],
  ['R6', 'Dolaylı tanımlayıcılarla yeniden tanımlama\nKVKK m.3/1-b; GDPR Recital 26', 'Müşteri', '3×3 = 9', 'Kapsam dışı; kullanıcı uyarılır', '3×3 = 9'],
  ['R7', 'Aracın kaçırdığı veri, yanlış güven duygusu (yeni)\nKVKK m.12', 'Müşteri, kurum', '–', 'Sınırlılıkların bildirilmesi; insan kontrolü', '3×3 = 9'],
  ['R8', 'Takma ad eşleme tablosunun sızması (yeni)\nKVKK m.12; GDPR m.4(5)', 'Müşteri', '–', 'Tablonun ayrı ve yerel tutulması', '2×4 = 8'],
], [0.7, 4.2, 1.8, 1.5, 3.3, 1.5]));
add(h2('5.3. Mevzuata Uyum Değerlendirmesi'));
add(P('Mevcut iş akışı, KVKK m.4/2-ç\'deki ölçülülük ilkesine ve m.12\'deki veri güvenliği yükümlülüğüne uygun değildir. Yurt dışı sunuculu bir hizmete kurum adına bir sözleşme veya uygun güvence olmadan veri girilmesi m.9 bakımından da sorun yaratır. Önerilen araç, aktarılan veri miktarını azaltarak bu risklerin olasılığını ve etkisini düşürür; ancak uyumu tek başına sağlamaz. Bunun üç nedeni vardır.'));
add(P('<b>Birincisi, maskelenmiş veri çoğu durumda hâlâ kişisel veridir.</b> Maskeleme, örneğin kart numarasının son dört hanesini, doğum yılını, ad soyadın baş harflerini ve e-posta alan adını bilinçli olarak korur. Bu parçalar metindeki diğer bilgilerle (sipariş tarihi, şehir, şikâyet konusu) birleştiğinde kişi belirlenebilir; bu durum KVKK m.3/1-b\'deki anonimleştirme tanımının karşılanmadığı anlamına gelir (Sweeney, 2002; Rocher ve diğerleri, 2019).'));
add(P('<b>İkincisi, takma adlandırılmış verinin niteliği tartışmalıdır.</b> Eşleme tablosu kurumda kaldığı için veri, kurum bakımından açıkça kişisel veridir. ÜYZ hizmet sağlayıcısı bakımından ise EDPS v SRB kararının göreli yaklaşımına göre, sağlayıcının yeniden tanımlama için makul araçları yoksa verinin kişisel veri sayılmayabileceği ileri sürülebilir. Ancak bu sonuç, metinde dolaylı tanımlayıcı ve özel nitelikli bilgi kalmamasına bağlıdır; Bölüm 8\'deki senaryoda görüldüğü gibi araç bu bilgileri metinden çıkarmamaktadır. Ayrıca bu karar AB hukukuna ilişkindir ve KVKK uygulamasında Kurul\'un aynı yaklaşımı benimseyip benimsemeyeceği belirsizdir. Bu nedenle ihtiyatlı yorum, takma adlı verinin de kişisel veri kabul edilmesi ve m.9 şartlarının buna göre değerlendirilmesidir.'));
add(P('<b>Üçüncüsü, araç yeni riskler yaratır.</b> Aracın bulamadığı veriler (R7) kullanıcıda "metin temizlendi" yanılgısı oluşturabilir; takma ad eşleme tablosu ise tek başına bütün kimlikleri geri açabilen yeni bir hassas varlıktır (R8). Bu riskler, aracın kurumsal politika ve insan kontrolüyle birlikte kullanılmasını zorunlu kılar.'));

add(h1('6. ÖNERİLEN ÇÖZÜM, SİSTEM TASARIMI VE YÖNTEM'));
add(h2('6.1. Tasarım İlkeleri'));
add(P('Çözüm, GDPR m.25\'teki tasarımdan itibaren veri koruma ilkesine dayanır: koruma, veri kurumdan çıktıktan sonra değil, çıkmadan önce uygulanır (Şekil 1(b)). Tasarımda dört ilke benimsenmiştir: (i) <b>yerellik</b>: araç hiçbir dış servise bağlanmaz (G1); (ii) <b>doğrulama</b>: bir sayı yalnızca biçimi değil kontrol hanesi de doğruysa kişisel veri sayılır (G2); (iii) <b>seçilebilir koruma</b>: kullanım amacına göre en az bilgiyi bırakan yöntem seçilir (G3); (iv) <b>şeffaflık</b>: araç ne bulduğunu ve neyi bulamayabileceğini açıkça gösterir (G6).'));
add(h2('6.2. Sistem Mimarisi'));
add(P('Araç Python ile geliştirilmiş, arayüzü Streamlit ile hazırlanmıştır. Şekil 2\'de görüldüğü gibi sistem; arayüz ve girdi, tespit ve koruma ile raporlama olmak üzere üç katmandan oluşur. Metin sekmesinde kullanıcı serbest metin girer; dosya sekmesinde CSV veya Excel dosyası yükler ve korunmuş dosyayı aynı biçimde indirir.'));
add(FIG('docs/report/figures/sekil2_mimari.png', 2200, 1018, 'Aracın sistem mimarisi', 'Kaynak: Yazar tarafından hazırlanmıştır.'));
add(h2('6.3. Tespit Yöntemi'));
add(P('Her veri türü için önce düzenli ifadelerle adaylar bulunur, ardından türüne özgü doğrulama uygulanır. TCKN için 11 hane ve resmî kontrol hanesi algoritması, IBAN için "TR" ön eki ve ISO 13616 mod-97 kontrolü, kart numarası için Luhn algoritması kullanılır. Böylece "Sipariş no: 12345678951" gibi TCKN\'ye benzeyen ama kontrol hanesi tutmayan sayılar kişisel veri sayılmaz. Doğum tarihi, geçerli bir tarih olması ve aynı cümlede "doğum", "doğumlu", "D.T." gibi bir ifade geçmesi şartıyla işaretlenir; bu sayede fatura ve sipariş tarihleri ayrılır. Ad soyad tespiti, 157 Türkçe adı içeren bir sözlük ile "Sayın", "Ad Soyad:" gibi bağlam ipuçlarına dayanır. Aynı metin parçası birden fazla türe uyduğunda öncelik sırası (IBAN, kart, TCKN, telefon, doğum tarihi, e-posta, ad soyad) uygulanır. Özel nitelikli veri ipuçları için 10 kategoride 41 kelime kökü aranır; Türkçede ekler sona geldiği için "hasta" kökü "hastası", "hastanede" gibi çekimli biçimleri de yakalar.'));
add(h2('6.4. Koruma Yöntemleri'));
add(TAB('Koruma yöntemlerinin karşılaştırılması', ['Yöntem', 'Örnek çıktı', 'Geri döndürülebilirlik', 'Veri faydası', 'Hukuki nitelik', 'Uygun kullanım'], [
  ['Maskeleme', 'F*** Y***\n500***8908\n**** **** **** 1842', 'Araç içinde hayır; kalan parçalar ipucu verir', 'Orta: biçim korunur', 'Kalan parçalarla kişi belirlenebiliyorsa kişisel veri', 'Yazışmanın özetlenmesi, insan okuması'],
  ['Takma adlandırma', 'Person_1\nPhone_1\nIBAN_1', 'Evet, eşleme tablosuyla', 'Yüksek: aynı değere aynı ad, ilişkiler korunur', 'GDPR m.4(5) anlamında takma adlandırma; veri sorumlusu için kişisel veri', 'Test verisi, analiz, ÜYZ\'den gelen yanıtın geri eşlenmesi'],
  ['Kaldırma', '[REMOVED]', 'Hayır', 'Düşük', 'Doğrudan tanımlayıcılar açısından en güçlü; dolaylı tanımlayıcılar kalırsa anonim değil', 'Dış araca gönderim'],
], [1.6, 2, 2, 1.9, 2.6, 2]));
add(P('Maskelemede yıldız sayısı bilerek sabit tutulmuştur; gerçek uzunluğun gösterilmesi adın tahmin edilmesini kolaylaştırırdı. Takma adlandırmada aynı değer metnin veya tablonun her yerinde aynı takma adı alır; bu, verinin test ve analiz için tutarlılığını korur. Eşleme tablosu arayüzde korunmuş veriden ayrı bir bölümde, uyarı başlığıyla gösterilir (G5).'));
add(h2('6.5. Tamamlayıcı İdari Tedbirler'));
add(P('KVKK m.12 teknik ve idari tedbirleri birlikte arar. Araçla birlikte uygulanması önerilen idari tedbirler şunlardır:'));
add(BULLET('Hangi ÜYZ araçlarının hangi amaçla ve hangi veri türleriyle kullanılabileceğini belirleyen yazılı bir kurumsal politika (KVK Kurumu, 2026a).'));
add(BULLET('Kişisel hesap yerine, veri işleme şartları ve yurt dışı aktarım güvenceleri sözleşmeyle belirlenmiş kurumsal ÜYZ hesapları.'));
add(BULLET('Çalışanlara yönelik farkındalık eğitimi: maskelenmiş verinin hâlâ kişisel veri olabileceği ve aracın sınırlılıkları.'));
add(BULLET('Özel nitelikli veri uyarısı alan metinlerin dış araca gönderilmemesi veya ilgili bölümlerin elle çıkarılması.'));
add(BULLET('Takma ad eşleme tablolarının erişimi kısıtlı bir ortamda saklanması ve iş bitince silinmesi.'));
add(h2('6.6. Çözümün Gerekçesi ve Alternatiflerle Karşılaştırma'));
add(P('ÜYZ araçlarının tamamen yasaklanması en düşük teknik riski sağlar ancak verimlilik kaybına ve kişisel cihazlara kaçışa yol açar. Ticari DLP ürünleri ağ düzeyinde koruma sağlar ancak maliyetli ve merkezî bir altyapı gerektirir. Genel amaçlı açık kaynak araçlar Türkiye\'ye özgü tanımlayıcıları varsayılan olarak doğrulamaz. Önerilen araç ise ücretsiz, kurulumu kolay, tamamen yerel ve Türkiye\'ye özgü tanımlayıcılarda doğrulama yapan bir ara katmandır. Zayıf yanı, ad tespitinin sözlüğe bağlı olması ve dolaylı tanımlayıcıları ele almamasıdır.'));

add(h1('7. TEKNİK VE HUKUKİ UYGULANABİLİRLİK'));
add(P('<b>Teknik uygulanabilirlik:</b> Araç standart bir dizüstü bilgisayarda çalışır, internet bağlantısı gerektirmez ve üç yaygın kütüphaneye (Streamlit, pandas, openpyxl) dayanır. 113 birim testi ve sentetik veri üzerinde tekrarlanabilir bir ölçüm betiği bulunmaktadır.'));
add(P('<b>Ekonomik uygulanabilirlik:</b> Lisans maliyeti yoktur. Maliyet, kurulum ve çalışan eğitimiyle sınırlıdır; buna karşılık önlenen risk, m.18/1-b kapsamında 17.092.242 TL\'ye kadar ulaşabilen idari para cezası ve itibar kaybıdır.'));
add(P('<b>Operasyonel uygulanabilirlik:</b> Aracın kullanımı, metni ÜYZ aracına yapıştırmadan önce bir ek adım gerektirir. Bu adımın atlanması R1 ve R2\'nin kalan olasılığının başlıca nedenidir. Uzun vadede aracın tarayıcı eklentisi veya kurumsal ağ geçidi olarak iş akışına gömülmesi bu sürtünmeyi azaltır.'));
add(P('<b>Hukuki uygulanabilirlik:</b> Araç yeni bir veri işleme faaliyeti yaratmaz; veriyi yalnızca kullanıcının makinesinde, kullanıcının zaten erişebildiği içerik üzerinde işler. Bu nedenle ayrı bir hukuki dayanak veya yurt dışı aktarım gerektirmez. Aracın "anonimleştirme" yaptığı iddia edilmemesi, kurumun yanlış bir uyum beyanında bulunmasını önler.'));
add(P('<b>Sürdürülebilirlik:</b> Ad sözlüğü ve özel nitelikli veri kökleri ayrı metin dosyalarında tutulduğundan kod değiştirilmeden genişletilebilir. Yeni bir veri türü, desen ve doğrulama fonksiyonu eklenerek sisteme katılabilir. Mevzuat değişiklikleri (örneğin Kurul\'un takma adlandırmaya ilişkin bir karar vermesi) aracın teknik yapısını değil, hangi yöntemin hangi amaçla kullanılacağını belirleyen politikayı etkiler.'));

add(h1('8. UYGULAMA VE SENARYO ANALİZİ'));
add(h2('8.1. Senaryo'));
add(P('Bir e-ticaret şirketinin müşteri hizmetleri çalışanı, bir iade talebine yanıt hazırlamak için müşteri kaydını bir ÜYZ aracına yapıştırmak istemektedir. Kayıt; ad soyad, doğum tarihi, TCKN, iki farklı yazımla aynı telefon numarası, e-posta, IBAN, kart numarası, müşterinin diyabet hastası ve sendika üyesi olduğuna ilişkin bir not, ayrıca kişisel veri olmayan bir sipariş numarası ve fatura tarihi içermektedir. Tüm değerler sentetiktir ve proje deposundaki örnek dosyadan alınmıştır.'));
add(h2('8.2. Analiz ve Teknik Bulgular'));
add(P('Metin araca girildiğinde 8 kişisel veri bulunmuş ve risk raporunda üç özel nitelikli veri uyarısı (sağlık: "diyabet", "hastası"; üyelik: "sendika") verilmiştir. Tablo 7, her yöntemin aynı veriler üzerindeki çıktısını göstermektedir.'));
add(TAB('Senaryo metninde yöntemlerin çıktıları', ['Veri', 'Orijinal', 'Maskeleme', 'Takma ad'], [
  ['Ad soyad', 'Fatma Yılmaz', 'F*** Y***', 'Person_1'],
  ['Doğum tarihi', '28.06.2005', '**.**.2005', 'Date_1'],
  ['TCKN', '53321819608', '533******08', 'TCKN_1'],
  ['Telefon (1. yazım)', '0500 133 89 08', '500***8908', 'Phone_1'],
  ['Telefon (2. yazım)', '+90 500 133 89 08', '500***8908', 'Phone_1'],
  ['E-posta', 'fatma.yilmaz@example.com', 'f***@example.com', 'Email_1'],
  ['IBAN', 'TR53 0011 1086 3794 0265 4235 11', 'TR53 **** **** **** **** **35 11', 'IBAN_1'],
  ['Kart', '4615 5940 7816 1842', '**** **** **** 1842', 'Card_1'],
  ['Sağlık ve sendika notu', '"diyabet hastası", "sendika üyesi"', 'Değişmez (uyarı verilir)', 'Değişmez (uyarı verilir)'],
  ['Sipariş no (geçersiz TCKN)', '12345678951', 'Değişmez (doğru)', 'Değişmez (doğru)'],
  ['Fatura tarihi', '31.02.2024', 'Değişmez (doğru)', 'Değişmez (doğru)'],
], [2.4, 3.4, 3.2, 1.8], 'Kaldırma yönteminde bulunan 8 verinin tamamı [REMOVED] ile değiştirilmiştir.'));
add(FIG('docs/screenshots/text-masking.png', 1826, 627, 'Metin sekmesi: tespit edilen verilerin vurgulanması ve maskeleme', 'Kaynak: Uygulamanın ekran görüntüsü (sentetik veri).'));
add(FIG('docs/screenshots/risk-report.png', 1800, 742, 'Risk raporu ve özel nitelikli veri uyarıları', 'Kaynak: Uygulamanın ekran görüntüsü (sentetik veri).'));
add(P('Aynı yaklaşım tablo verisinde de denenmiştir. 11 satır ve 7 sütundan oluşan sentetik müşteri tablosunda 77 kişisel veri bulunmuş; takma adlandırmada her müşteri tüm sütunlarda tutarlı biçimde aynı numarayı almıştır (Şekil 5). Bu çıktı, gerçek veriye ihtiyaç duymadan test ortamında kullanılabilecek tutarlı bir veri kümesidir.'));
add(FIG('docs/screenshots/file-pseudonymization.png', 1763, 625, 'Dosya sekmesi: CSV/Excel tablosunda takma adlandırma', 'Kaynak: Uygulamanın ekran görüntüsü (sentetik veri).'));
add(h2('8.3. Hukuki Değerlendirme'));
add(P('Senaryo üç sonucu somut olarak göstermektedir. Birincisi, kontrol hanesi doğrulaması sayesinde sipariş numarası ve geçersiz fatura tarihi yanlış biçimde kişisel veri sayılmamış, böylece metnin iş için gerekli kısmı korunmuştur. İkincisi, takma adlandırmada aynı telefonun iki farklı yazımı aynı takma adı almıştır; ÜYZ aracından dönen yanıt, eşleme tablosuyla kurum içinde güvenle geri eşlenebilir. Üçüncüsü ve en önemlisi, korunmuş metinde "Person_1 ... diyabet hastası ... sendika üyesi" bilgisi kalmaktadır. Bu, takma adlı bir kişiye ilişkin özel nitelikli veridir ve KVKK m.6 kapsamında en sıkı korumayı gerektirir. Araç bu bilgiyi otomatik olarak silmez; çünkü aynı kelimeler başka bağlamda (ör. ürün açıklamasında) kişisel veri olmayabilir. Karar, uyarıyı gören insana bırakılmıştır. Önerilen iyileştirme, politika gereği uyarı alan metnin ilgili cümleleri çıkarılmadan dış araca gönderilmemesidir.'));

add(h1('9. BULGULAR, KARŞILAŞTIRMALI ANALİZ VE DEĞERLENDİRME'));
add(h2('9.1. Tespit Doğruluğu'));
add(P('Aracın doğruluğu, cevap anahtarı bilinen 200 sentetik belge üzerinde ölçülmüştür (sabit rastgele tohum: 2026). Her belge, yedi veri türünden birer örneği rastgele sırada ve rastgele yazım biçimleriyle içermekte; ayrıca kişisel veriye benzeyen altı tuzak içermektedir: kontrol hanesi bozuk TCKN, kart ve IBAN; fatura tarihi; geçersiz bir tarih; içinde ad geçen kurum veya sokak adı. Bir bulgu, ancak türü ve metindeki konumu cevap anahtarıyla birebir aynıysa doğru sayılmıştır. Kesinlik (precision) aracın "kişisel veri" dediklerinin ne kadarının gerçekten kişisel veri olduğunu, duyarlılık (recall) ise gerçek kişisel verilerin ne kadarının bulunduğunu gösterir.'));
add(TAB('Veri türlerine göre tespit doğruluğu (200 sentetik belge)', ['Veri türü', 'Metindeki', 'Doğru bulunan', 'Kaçırılan', 'Yanlış alarm', 'Kesinlik', 'Duyarlılık'], [
  ['Ad soyad', '200', '200', '0', '76', '%72,5', '%100,0'],
  ['TCKN', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['Telefon', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['E-posta', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['IBAN', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['Kredi kartı', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['Doğum tarihi', '200', '200', '0', '0', '%100,0', '%100,0'],
  ['<b>Toplam</b>', '<b>1400</b>', '<b>1400</b>', '<b>0</b>', '<b>76</b>', '<b>%94,9</b>', '<b>%100,0</b>'],
], [2.2, 1.4, 1.6, 1.4, 1.5, 1.4, 1.5], 'Kaynak: scripts/evaluate.py çıktısı (docs/evaluation_results.md).'));
add(P('Yanlış alarmların tamamı ad soyad türünde ve içinde Türkçe bir ad geçen iki ifadeden kaynaklanmıştır: "Deniz Kuvvetleri" (44) ve "Gül Sokak" (32). Doğrulama algoritması kullanılan dört sayısal türde (TCKN, IBAN, kart, telefon) bozuk kontrol haneli tuzakların hiçbiri kişisel veri sayılmamıştır.'));
add(P('Bu sonuçlar dikkatle yorumlanmalıdır. Test kümesini üreten betik 16 farklı ad kullanmakta ve bu adların tamamı aracın ad sözlüğünde bulunmaktadır; dolayısıyla ad soyad için %100 duyarlılık yalnızca sözlükteki adlar için geçerlidir. Ayrıca ölçüm sırasında bulunan iki hata (komşu cümledeki "doğumlu" ifadesinin fatura tarihini doğum tarihi yapması ve parantezli telefonların eksik bulunması) aynı test kümesine bakılarak düzeltilmiştir. Bu nedenle sonuçlar, gerçek belgeler için iyimser bir üst sınır olarak okunmalıdır.'));
add(h2('9.2. Korumadan Önce ve Sonra Maruz Kalma'));
add(TAB('Orijinal değeri çıktıda aynen kalan kişisel veri sayısı', ['Durum', 'Açıkta kalan tam değer', 'Oran'], [
  ['Koruma öncesi', '1400 / 1400', '%100,0'],
  ['Maskeleme sonrası', '0 / 1400', '%0,0'],
  ['Takma adlandırma sonrası', '0 / 1400', '%0,0'],
  ['Kaldırma sonrası', '0 / 1400', '%0,0'],
], [4, 4, 2], 'Not: Maskeleme bazı parçaları bilerek korur (kartın son 4 hanesi, doğum yılı, baş harfler, e-posta alan adı). %0, değerin hiçbir parçasının görünmediği anlamına gelmez.'));
add(h2('9.3. Zor Durumlar'));
add(P('Bilinen zayıflıkları görünür kılmak için üç zor durum ana ölçümden ayrı olarak, her biri 50 örnekle ölçülmüştür (Tablo 10).'));
add(TAB('Zor durumlarda tespit oranı', ['Durum', 'Örnek', 'Doğru bulunan', 'Oran'], [
  ['Büyük harfle yazılmış ad soyad (AHMET YILMAZ)', '50', '0', '%0,0'],
  ['Sözlükte olmayan ad, bağlam ipucu yok', '50', '0', '%0,0'],
  ['Alan kodu parantezli telefon ((0532) 123 45 67)', '50', '50', '%100,0'],
], [6, 1.3, 1.8, 1.3]));
add(P('İlk iki durumda tespit oranı %0\'dır. Resmî yazışmalarda ve formlarda adların büyük harfle yazılması yaygın olduğundan bu, aracın en önemli teknik sınırlılığıdır ve R7 riskinin somut kanıtıdır. Kaçırılan bir ad, metnin geri kalanı korunmuş olsa bile kişinin doğrudan tanımlanmasına yol açar.'));
add(h2('9.4. Çözüm Öncesi ve Sonrası Risk Değerlendirmesi'));
add(P('Şekil 6, Tablo 5\'teki risklerin araç ve idari tedbirler uygulanmadan önceki ve sonraki konumlarını göstermektedir. Çok yüksek düzeydeki iki risk (R1, R2) orta düzeye inmiş; test ortamı (R4) ve model çıktısı (R5) riskleri düşük düzeye gerilemiştir. Toplam risk skoru, yeni ortaya çıkan iki risk de dahil edildiğinde 88\'den 55\'e düşmüştür. Buna karşılık özel nitelikli veri riski (R3) yüksek düzeyde kalmış, dolaylı tanımlayıcı riski (R6) değişmemiştir.'));
add(FIG('docs/report/figures/sekil3_risk_matrisi.png', 2200, 982, 'Araç kullanılmadan önce (a) ve sonra (b) risk matrisi', 'Kaynak: Yazar tarafından Tablo 5\'teki puanlarla hazırlanmıştır.'));
add(h2('9.5. Değerlendirme'));
add(P('Bulgular, aracın tasarlandığı dar görevde, yani Türkiye\'ye özgü doğrudan tanımlayıcıların bulunmasında, sentetik veri üzerinde yüksek başarı gösterdiğini; ancak hukuki açıdan en ağır sonuçları doğuran iki alanda (özel nitelikli veri ve dolaylı tanımlayıcılar) sınırlı kaldığını göstermektedir. Bu tablo literatürle uyumludur: doğrudan tanımlayıcıların silinmesi gereklidir ancak yeterli değildir (Sweeney, 2002; Ohm, 2010). Hukuki uyum açısından en önemli bulgu, aracın kullanımının riskleri azaltırken iki yeni risk (R7, R8) yarattığı ve bu nedenle teknik tedbirin idari tedbirlerden bağımsız düşünülemeyeceğidir.'));

add(h1('10. SONUÇ VE ÖNERİLER'));
add(h2('10.1. Katkılar'));
add(P('Bu proje, ÜYZ araçlarının iş yerlerinde kontrolsüz kullanımını soyut bir mevzuat sorunu olarak değil, verinin izlediği somut bir yol olarak ele almıştır. Hukuki katkı, maskeleme ve takma adlandırmanın KVKK\'daki anonimleştirme tanımını karşılamadığının, KVKK\'da takma adlandırmaya ilişkin kavramsal bir boşluk bulunduğunun ve EDPS v SRB kararının bu boşluğu Türk hukuku bakımından henüz doldurmadığının gösterilmesidir. Teknik katkı, Türkiye\'ye özgü tanımlayıcıları kontrol hanesi algoritmalarıyla doğrulayan, tamamen yerel çalışan, test edilmiş ve başarımı ölçülmüş açık kaynaklı bir araçtır.'));
add(h2('10.2. Sınırlılıklar'));
add(BULLET('Ad tespiti sözlüğe bağlıdır; büyük harfle yazılmış ve sözlükte olmayan adlar bulunamamaktadır.'));
add(BULLET('Adres, plaka, sabit hat telefonu ve dolaylı tanımlayıcılar tespit edilmemektedir.'));
add(BULLET('Özel nitelikli veri yalnızca anahtar kelimeyle, bağlam anlaşılmadan işaretlenmektedir.'));
add(BULLET('Ölçüm sentetik ve aracın sözlüğüyle uyumlu bir veri kümesiyle yapılmıştır; gerçek belgelerdeki başarım daha düşük olabilir.'));
add(BULLET('Risk puanları yazarın senaryoya dayalı değerlendirmesidir ve ampirik sıklık verisine dayanmamaktadır.'));
add(BULLET('Excel dosyalarında yalnızca ilk sayfa işlenmektedir.'));
add(h2('10.3. Öneriler ve Gelecek Çalışmalar'));
add(BULLET('<b>Kurumlara:</b> ÜYZ kullanım politikası oluşturulmalı, kurumsal sözleşmeli araçlar tercih edilmeli ve bu tür bir ara katman zorunlu adım hâline getirilmelidir.'));
add(BULLET('<b>Düzenleyiciye:</b> KVK Kurumu\'nun takma adlandırmayı tanımlayan ve takma adlı verinin alıcı bakımından niteliğini açıklayan bir rehber yayımlaması hukuki belirliliği artıracaktır.'));
add(BULLET('<b>Teknik geliştirme:</b> Ad tespitinde büyük harf desteği ve Türkçe bir varlık ismi tanıma modeli eklenmesi; dolaylı tanımlayıcılar için k-anonimlik temelli bir risk göstergesi; aracın tarayıcı eklentisi olarak iş akışına gömülmesi.'));
add(BULLET('<b>Değerlendirme:</b> Gerçek belgelerden üretilmiş ve uygun biçimde anonimleştirilmiş, bağımsız bir Türkçe test kümesiyle ölçüm yapılması.'));

add(h1('11. YAPAY ZEKÂ ARAÇLARININ KULLANIMI BEYANI'));
add(P('Bu projede Claude (Anthropic) üretken yapay zekâ aracı; yazılımın geliştirilmesinde kod önerisi ve hata ayıklama, kaynak araştırmasının planlanması ve kaynakların ön taraması, rapor taslağının ve şekillerin hazırlanması aşamalarında destekleyici olarak kullanılmıştır. Rapordaki tüm kanun maddeleri, Resmî Gazete künyeleri, idari para cezası tutarları, KVK Kurumu belgelerinden yapılan alıntılar, AB düzenlemeleri, mahkeme kararı ve akademik kaynaklar öğrenci tarafından Mevzuat Bilgi Sistemi, Resmî Gazete, KVK Kurumu, EUR-Lex ve yayıncı sayfaları üzerinden tek tek doğrulanmıştır. Ölçüm sonuçları, proje deposundaki betik çalıştırılarak elde edilmiştir. Araçta veya testlerde gerçek kişilere ait veri kullanılmamış, yapay zekâ aracına gerçek kişisel veri girilmemiştir. Rapordaki hukuki değerlendirmeler kesin hukuki görüş niteliğinde değildir.'));

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
