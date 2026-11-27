// Proje sunumunu (.pptx) üretir: node docs/presentation/build_deck.js
// Gereken paket: pptxgenjs (npm install pptxgenjs); bulunamazsa NODE_PATH ile gösterin.
const path = require('path');
const pptxgen = require('pptxgenjs');
const SKILL = '/root/.claude/skills/synced/fc67202f-ad2d-431e-ae46-4d880a6b57ba_950b8da5-9a91-44e2-8257-242e77027c00/pptx';
const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js'));

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, 'Ahmet_Zeyt_Eroglu_Bilisim_Hukuku_Proje_Sunumu.pptx');

const THEME = {
  name: 'KVKK Maskeleme',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1F2A2B', lt1: 'FFFFFF', dk2: '0F3D3E', lt2: 'E8F1F0',
    accent1: '0F6B6E', accent2: 'D99A00', accent3: 'B3261E', accent4: '2E7D4F',
    accent5: '5B6B73', accent6: 'C9E2E0', hlink: '0F6B6E', folHlink: '5B6B73',
  },
};
// Risk düzeyi renkleri (rapordaki matrisle aynı)
const RISK = { L: 'CFE8D4', M: 'FFF0B3', H: 'F8C48F', V: 'EF9A9A' };
const lvl = (s) => (s <= 4 ? RISK.L : s <= 9 ? RISK.M : s <= 16 ? RISK.H : RISK.V);

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13,33" x 7,5"
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'Ahmet Zeyt Eroğlu';
pres.title = 'Bilişim Hukuku Proje Sunumu';
const C = pres.SchemeColor;

// ---------- Düzenler ----------
pres.defineSlideMaster({
  title: 'KOYU',
  background: { color: C.text2 },
  objects: [],
});
pres.defineSlideMaster({
  title: 'ICERIK',
  background: { color: C.background1 },
  margin: [0.4, 0.6, 0.5, 0.6],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.85, fontFace: THEME.headFontFace, fontSize: 32, bold: true, color: C.text2, valign: 'middle', margin: 0 }, text: '' } },
    { text: { text: 'Bilişim Hukuku (HUK319) · Ahmet Zeyt Eroğlu', options: { x: 0.6, y: 7.05, w: 8, h: 0.3, fontSize: 11, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.5, h: 0.3, fontSize: 11, color: C.accent5, align: 'right' },
});

// ---------- Yardımcılar ----------
const box = (s, x, y, w, h, fill, opts = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: opts.line || fill, width: opts.lineW || 1 }, ...(opts.shadow ? { shadow: { type: 'outer', color: '000000', opacity: 0.15, blur: 6, offset: 2, angle: 90 } } : {}) });
const txt = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, valign: 'top', fontSize: 18, color: C.text1, ...o });
const circle = (s, x, y, d, fill, label, color = C.background1, size = 18) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
  txt(s, label, { x, y, w: d, h: d, align: 'center', valign: 'middle', fontSize: size, bold: true, color });
};
const arrow = (s, x, y, w, color = C.accent5) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2.5, endArrowType: 'triangle' } });
const content = (title, section, notes) => {
  const s = pres.addSlide({ masterName: 'ICERIK', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  if (notes) s.addNotes(notes);
  return s;
};

// ============ 1. Kapak ============
pres.addSection({ title: 'Giriş' });
{
  const s = pres.addSlide({ masterName: 'KOYU', sectionTitle: 'Giriş' });
  txt(s, 'İstanbul Ticaret Üniversitesi · Mühendislik Fakültesi · İngilizce Bilgisayar Mühendisliği', { x: 0.7, y: 0.6, w: 12, h: 0.4, fontSize: 16, color: C.accent6 });
  txt(s, 'Üretken Yapay Zekâ Araçlarına ve Test Ortamlarına Aktarılan Verilerde KVKK Uyumu', { x: 0.7, y: 1.5, w: 7.4, h: 2.2, fontFace: THEME.headFontFace, fontSize: 36, bold: true, color: C.background1, valign: 'bottom' });
  txt(s, 'Kişisel Veri Tespit ve Maskeleme Aracı Tasarımı', { x: 0.7, y: 3.85, w: 7.4, h: 0.6, fontSize: 24, color: C.accent2 });
  txt(s, [
    { text: 'Ahmet Zeyt Eroğlu · 23lbim023', options: { bold: true, breakLine: true } },
    { text: 'Bilişim Hukuku (HUK319) · Prof. Dr. Agah Tuğrul KORUCU', options: { breakLine: true } },
    { text: '2026–2027 Güz Yarıyılı' },
  ], { x: 0.7, y: 5.3, w: 7.4, h: 1.3, fontSize: 18, color: C.background1, paraSpaceAfter: 4 });
  // Motif: maskelenmiş veri kartı
  box(s, 8.7, 1.6, 4.0, 4.2, C.background1, { shadow: true });
  const rows = [['Fatma Yılmaz', 'F*** Y***'], ['0532 123 45 67', '532***4567'], ['53321819608', 'TCKN_1'], ['TR53 0011 1086 …', '[REMOVED]']];
  rows.forEach(([a, b], i) => {
    const y = 1.95 + i * 0.95;
    txt(s, a, { x: 9.0, y, w: 3.4, h: 0.35, fontSize: 16, color: C.accent5, fontFace: 'Courier New' });
    txt(s, '→ ' + b, { x: 9.0, y: y + 0.38, w: 3.4, h: 0.4, fontSize: 20, bold: true, color: C.accent1, fontFace: 'Courier New' });
  });
  s.addNotes('Merhaba. Projemde, çalışanların müşteri verilerini ChatGPT gibi araçlara veya test ortamlarına aktarmasının KVKK açısından doğurduğu riskleri inceledim ve bu riski azaltan bir araç geliştirdim. Sağdaki kart aracın yaptığını özetliyor: kişisel veriyi bulup gizliyor.');
}

// ============ 2. Konunun önemi ============
{
  const s = content('Bir kopyala-yapıştır, bir veri aktarımıdır', 'Giriş',
    'Bir çalışan iade e-postasını özetletmek için metni olduğu gibi bir yapay zekâ aracına yapıştırdığında, müşterinin kimlik, telefon ve banka bilgileri yurt dışındaki bir şirkete gider. KVK Kurumu bu kullanımı 2026 yılında "gölge yapay zekâ" olarak ayrıca ele aldı. Samsung 2023te benzer bir olay yaşadı, orada sızan bilgi ticari sırdı. Kurum için risk, veri güvenliği yükümlülüğünün ihlali nedeniyle 17 milyon TLye varan idari para cezasıdır.');
  const steps = [['Müşteri e-postası', 'ad, TCKN, IBAN, sağlık notu', C.background2], ['Çalışan yapıştırır', 'ÜYZ aracının web sayfası', C.background2], ['Yurt dışı sunucu', 'üçüncü taraf, kayıt ve saklama', 'FDECEA']];
  steps.forEach(([t, d, f], i) => {
    const x = 0.6 + i * 2.55;
    box(s, x, 1.7, 2.1, 1.9, f);
    txt(s, t, { x: x + 0.15, y: 1.85, w: 1.8, h: 0.8, fontSize: 18, bold: true, color: C.text2 });
    txt(s, d, { x: x + 0.15, y: 2.65, w: 1.8, h: 0.85, fontSize: 14, color: C.accent5 });
    if (i < 2) arrow(s, x + 2.12, 2.65, 0.4);
  });
  txt(s, 'Kurum, hangi verinin hangi araca gittiğini bilmiyor.', { x: 0.6, y: 4.0, w: 7.3, h: 0.5, fontSize: 20, italic: true, color: C.accent3 });
  txt(s, 'Aynı sorun yazılımda da var: gerçek müşteri verisi "gerçekçi test" için test ortamlarına kopyalanıyor.', { x: 0.6, y: 4.7, w: 7.3, h: 1.0, fontSize: 18 });
  const stats = [['2026', 'KVK Kurumu, iş yerlerinde "gölge yapay zekâ" belgesini yayımladı'], ['2023', 'Samsung çalışanları şirket kodunu ChatGPT\'ye yükledi'], ['17,09 mn TL', 'Veri güvenliği ihlalinde 2026 üst sınırı (KVKK m.18/1-b)']];
  stats.forEach(([n, d], i) => {
    const y = 1.6 + i * 1.75;
    box(s, 8.6, y, 4.1, 1.55, C.background2);
    txt(s, n, { x: 8.85, y: y + 0.15, w: 3.7, h: 0.65, fontSize: 32, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
    txt(s, d, { x: 8.85, y: y + 0.82, w: 3.7, h: 0.65, fontSize: 15, color: C.text1 });
  });
}

// ============ 3. Problem ve amaç ============
{
  const s = content('Problem ve projenin amacı', 'Giriş',
    'Problem, verinin işin gerektirdiğinden fazla ve kontrolsüz biçimde dışarı çıkması. Kurumun kendi ifadesini okuyorum. Projenin üç hedefi var: riskleri belirlemek, riski azaltan yerel bir araç geliştirmek ve bu aracın ne kadar başarılı olduğunu, nerede yetersiz kaldığını ölçmek.');
  box(s, 0.6, 1.5, 6.0, 5.2, C.text2);
  txt(s, 'Problem', { x: 0.95, y: 1.75, w: 5.3, h: 0.5, fontSize: 22, bold: true, color: C.accent2 });
  txt(s, 'Kişisel veri, işin gerektirdiğinden fazla ve kontrolsüz biçimde kurum dışına çıkıyor.', { x: 0.95, y: 2.3, w: 5.3, h: 1.1, fontSize: 20, color: C.background1 });
  txt(s, '"Kurumsal kontrol dışında kullanılan ÜYZ araçları ile kişisel verilerin paylaşılması, veri ihlali riskini artırabilmektedir."', { x: 0.95, y: 3.6, w: 5.3, h: 1.9, fontSize: 18, italic: true, color: C.accent6 });
  txt(s, 'KVK Kurumu (2026a, s. 9)', { x: 0.95, y: 5.7, w: 5.3, h: 0.4, fontSize: 14, color: C.accent6 });
  txt(s, 'Hedefler', { x: 7.1, y: 1.6, w: 5.6, h: 0.5, fontSize: 22, bold: true, color: C.text2 });
  [['Veri akışının hukuki risklerini belirlemek', 'KVKK, GDPR, KVK Kurumu rehberleri'],
   ['Riski azaltan yerel bir araç geliştirmek', 'veri bilgisayardan çıkmadan gizlenir'],
   ['Aracı ölçmek ve sınırlarını göstermek', '200 sentetik belge, cevap anahtarı']].forEach(([t, d], i) => {
    const y = 2.3 + i * 1.45;
    circle(s, 7.1, y, 0.7, C.accent1, String(i + 1), C.background1, 22);
    txt(s, t, { x: 8.05, y: y - 0.02, w: 4.7, h: 0.45, fontSize: 19, bold: true });
    txt(s, d, { x: 8.05, y: y + 0.45, w: 4.7, h: 0.4, fontSize: 16, color: C.accent5 });
  });
}

// ============ 4. Temel kavramlar ============
{
  const s = content('Dört kavram, tek bir fark', 'Giriş',
    'Sunumun geri kalanı bu ayrıma dayanıyor. Maskeleme verinin bir kısmını gizler, takma ad veriyi bir kodla değiştirir ve kodun kime ait olduğu ayrı bir tabloda kalır, kaldırma veriyi siler. Anonimleştirme ise kişinin başka bilgilerle birleştirilse bile bulunamamasıdır. İlk üç yöntem tek başına bunu sağlamaz, bu yüzden veri çoğu durumda hâlâ kişisel veridir.');
  const cards = [['Maskeleme', 'F*** Y***\n532***4567', 'Verinin bir kısmı gizlenir', C.background2],
    ['Takma ad', 'Person_1\nPhone_1', 'Kod verilir; kod tablosu ayrı saklanır', C.background2],
    ['Kaldırma', '[REMOVED]', 'Veri tamamen silinir', C.background2],
    ['Anonimleştirme', 'Bu üç yöntemle\ntek başına olmaz', 'Başka bilgilerle birleşse bile kişi bulunamaz', 'FFF4D6']];
  cards.forEach(([t, ex, d, f], i) => {
    const x = 0.6 + i * 3.08;
    box(s, x, 1.55, 2.8, 3.6, f);
    txt(s, t, { x: x + 0.2, y: 1.75, w: 2.4, h: 0.5, fontSize: 22, bold: true, color: C.text2 });
    txt(s, ex, { x: x + 0.2, y: 2.4, w: 2.4, h: 1.1, fontSize: 20, bold: true, color: C.accent1, fontFace: 'Courier New' });
    txt(s, d, { x: x + 0.2, y: 3.75, w: 2.4, h: 1.2, fontSize: 16, color: C.text1 });
  });
  box(s, 0.6, 5.5, 12.1, 1.15, C.text2);
  txt(s, [{ text: 'Maskeleme ve takma ad ≠ anonimleştirme. ', options: { bold: true, color: C.accent2 } }, { text: 'Riski azaltırlar, ama veri çoğu durumda hâlâ kişisel veridir ve KVKK koruması sürer.', options: { color: C.background1 } }],
    { x: 0.9, y: 5.6, w: 11.5, h: 0.95, fontSize: 20, valign: 'middle' });
}

// ============ 5. KVKK mevzuatı ============
pres.addSection({ title: 'Mevzuat ve literatür' });
{
  const s = content('İlgili Türk mevzuatı: 6698 sayılı KVKK', 'Mevzuat ve literatür',
    'Altı madde önemli. m.3 anonimleştirme için çok yüksek bir eşik koyuyor ve KVKKda takma adlandırmanın tanımı yok. m.4 ölçülülük ilkesi: özet için kimlik numarası gerekmez. m.6 sağlık, sendika gibi hassas veriler. m.9 yurt dışı aktarım, 7499 sayılı Kanunla değişti, 1 Haziran 2024te yürürlüğe girdi. m.12 veri güvenliği, aracımız buradaki teknik tedbirin bir örneği. m.18 cezalar. Ayrıca TCK 135-138 suç tanımları.');
  const tiles = [['m.3', 'Tanımlar', 'Anonimleştirme eşiği çok yüksek; takma ad tanımlanmamış'],
    ['m.4', 'Ölçülülük', 'Özet için kimlik numarası gönderilmez'],
    ['m.6', 'Hassas veri', 'Sağlık, sendika, din, ceza mahkûmiyeti'],
    ['m.9', 'Yurt dışı aktarım', '7499 s. Kanunla değişti; yürürlük 01.06.2024'],
    ['m.12', 'Veri güvenliği', 'Teknik ve idari tedbir yükümlülüğü'],
    ['m.18', 'İdari para cezası', '18/1-b: 256.357 – 17.092.242 TL (2026)']];
  tiles.forEach(([m, t, d], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.55 + Math.floor(i / 3) * 2.45;
    box(s, x, y, 3.85, 2.2, C.background2);
    circle(s, x + 0.25, y + 0.3, 1.0, C.accent1, m, C.background1, 18);
    txt(s, t, { x: x + 1.45, y: y + 0.35, w: 2.25, h: 0.9, fontSize: 20, bold: true, color: C.text2, valign: 'middle' });
    txt(s, d, { x: x + 0.25, y: y + 1.4, w: 3.4, h: 0.75, fontSize: 16 });
  });
  txt(s, 'Ayrıca: Silme ve Anonimleştirme Yönetmeliği (RG 28.10.2017) · Yurt Dışına Aktarım Yönetmeliği (RG 10.07.2024) · TCK m.135–138', { x: 0.6, y: 6.5, w: 12.1, h: 0.4, fontSize: 14, color: C.accent5 });
}

// ============ 6. AB ve literatür ============
{
  const s = content('AB hukuku ve literatür ne diyor?', 'Mevzuat ve literatür',
    'GDPR takma adlandırmayı tanımlıyor ve güvenlik tedbiri sayıyor, KVKK tanımlamıyor; bu Türk hukukunda bir boşluk. AB Adalet Divanının 2025 tarihli EDPS v SRB kararı, takma adlı verinin kodu çözemeyen alıcı için kişisel veri sayılmayabileceğini söylüyor. Literatür ise kimlik bilgilerini silmenin yetmediğini gösteriyor: Rocher ve arkadaşlarına göre 15 demografik bilgiyle insanların yüzde 99,98i yeniden bulunabiliyor.');
  const rows = [['', 'KVKK', 'GDPR'], ['Takma ad', 'Tanımsız', 'Tanımlı (m.4/5)'], ['Anonim veri', 'Hiçbir surette (m.3)', 'Makul araçlar (Gerekçe 26)'], ['Privacy by Design', 'Açık hüküm yok', 'Zorunlu (m.25)'], ['Yaptırım', 'İdari para cezası + TCK', 'Ciro %4 / 20 mn € (m.83)']];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: i === 0 ? C.background1 : C.text1, fill: { color: i === 0 ? C.accent1 : (j === 0 ? C.background2 : C.background1) } } }))),
    { x: 0.6, y: 1.55, w: 6.6, colW: [1.9, 2.2, 2.5], fontSize: 17, border: { type: 'solid', color: 'C9D6D5', pt: 1 }, rowH: 0.75, valign: 'middle', margin: 0.08 });
  box(s, 7.6, 1.55, 5.1, 2.4, 'FFF4D6');
  txt(s, 'AB Adalet Divanı · EDPS v SRB (04.09.2025)', { x: 7.85, y: 1.7, w: 4.6, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
  txt(s, 'Takma adlı veri, kodu çözme imkânı olmayan alıcı için kişisel veri sayılmayabilir. Türk Kurulu\'nun bu görüşü benimseyip benimsemeyeceği belirsiz.', { x: 7.85, y: 2.2, w: 4.6, h: 1.65, fontSize: 17 });
  box(s, 7.6, 4.2, 5.1, 2.5, C.background2);
  txt(s, '%99,98', { x: 7.85, y: 4.3, w: 4.6, h: 0.8, fontSize: 40, bold: true, color: C.accent3, fontFace: THEME.headFontFace });
  txt(s, '15 demografik bilgiyle yeniden tanımlanabilen kişi oranı (Rocher vd., 2019). Kimlik bilgisini silmek yetmez (Sweeney, 2002; Ohm, 2010).', { x: 7.85, y: 5.15, w: 4.6, h: 1.45, fontSize: 16 });
  txt(s, 'Kaynak: KVKK; GDPR; C-413/23 P; EDPB (2025)', { x: 0.6, y: 5.6, w: 6.6, h: 0.4, fontSize: 14, color: C.accent5 });
}

// ============ 7. İncelenen sistem ============
pres.addSection({ title: 'Sistem ve riskler' });
{
  const s = content('İncelenen sistem: verinin izlediği yol', 'Sistem ve riskler',
    'İncelediğim sistem tek bir yazılım değil, bir e-ticaret şirketinde verinin izlediği yol. Bugün veri doğrudan yapay zekâ aracına gidiyor. Önerilen durumda önce yerel araçtan geçiyor, kod tablosu kurumda kalıyor. Alttaki dört madde mevcut sistemin teknik zayıflıkları.');
  const flow = (y, label, items, color) => {
    txt(s, label, { x: 0.6, y: y - 0.45, w: 4, h: 0.4, fontSize: 18, bold: true, color });
    const w = (12.1 - (items.length - 1) * 0.5) / items.length;
    items.forEach(([t, f], i) => {
      const x = 0.6 + i * (w + 0.5);
      box(s, x, y, w, 0.95, f);
      txt(s, t, { x: x + 0.1, y, w: w - 0.2, h: 0.95, fontSize: 18, bold: true, align: 'center', valign: 'middle', color: C.text2 });
      if (i < items.length - 1) arrow(s, x + w + 0.04, y + 0.48, 0.42);
    });
  };
  flow(1.85, 'Bugün', [['Müşteri kaydı (CRM, e-posta, Excel)', C.background2], ['Çalışan kopyalar', C.background2], ['ÜYZ aracı · yurt dışı sunucu', 'FDECEA']], C.accent3);
  flow(3.6, 'Önerilen', [['Müşteri kaydı', C.background2], ['Yerel maskeleme aracı', C.accent6], ['Korunmuş metin + insan kontrolü', C.background2], ['ÜYZ aracı veya test ortamı', 'FFF4D6']], C.accent4);
  txt(s, 'Kod tablosu kurumda, ayrı saklanır; dışarı gönderilmez.', { x: 3.75, y: 4.65, w: 6, h: 0.4, fontSize: 16, italic: true, color: C.accent4 });
  [['Kayıt yok', 'Kopyala-yapıştır iz bırakmaz'], ['Sözleşme yok', 'Kişisel hesaplar kullanılıyor'], ['Saklama belirsiz', 'Model eğitiminde kullanılabilir'], ['Çıktıya yansıma', 'Veri üçüncü kişilere ulaşabilir']].forEach(([t, d], i) => {
    const x = 0.6 + i * 3.08;
    box(s, x, 5.35, 2.85, 1.35, C.background1, { line: 'C9D6D5' });
    txt(s, t, { x: x + 0.15, y: 5.45, w: 2.55, h: 0.45, fontSize: 18, bold: true, color: C.accent3 });
    txt(s, d, { x: x + 0.15, y: 5.9, w: 2.55, h: 0.7, fontSize: 15 });
  });
}

// ============ 8. Risk tablosu ============
{
  const s = content('Hukuki risk analizi: 8 risk', 'Sistem ve riskler',
    'Her risk için olasılık ve etkiyi 1 ile 5 arasında puanladım, skor ikisinin çarpımı. Önlem olmadan iki risk çok yüksek: kimlik bilgilerinin araca girilmesi ve yurt dışı aktarım. Son iki risk aracın kendisinin yarattığı yeni riskler. Puanlar benim senaryoya dayalı değerlendirmem, ölçülmüş sıklık değil.');
  const R = [['R1', 'Kimlik bilgilerinin ÜYZ aracına girilmesi', 'm.4, m.12', 20, 6], ['R2', 'Hukuka aykırı yurt dışı aktarım', 'm.9', 20, 6], ['R3', 'Hassas (özel nitelikli) veri', 'm.6', 15, 10], ['R4', 'Test ortamında gerçek veri', 'm.4, m.5', 12, 3], ['R5', 'Verinin model çıktısına yansıması', 'm.12', 12, 4], ['R6', 'Dolaylı bilgilerle kişinin bulunması', 'm.3', 9, 9], ['R7', 'Yeni: aracın kaçırdığı veri', 'm.12', null, 9], ['R8', 'Yeni: kod tablosunun sızması', 'm.12', null, 8]];
  const head = ['No', 'Risk', 'KVKK', 'Önce', 'Sonra'].map((t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent1 } } }));
  const body = R.map(([n, r, m, a, b]) => [
    { text: n, options: { bold: true } }, { text: r }, { text: m },
    { text: a === null ? '–' : String(a), options: { align: 'center', bold: true, fill: { color: a === null ? 'FFFFFF' : lvl(a) } } },
    { text: String(b), options: { align: 'center', bold: true, fill: { color: lvl(b) } } }]);
  s.addTable([head, ...body], { x: 0.6, y: 1.45, w: 8.9, colW: [0.7, 4.7, 1.5, 1.0, 1.0], fontSize: 16, rowH: 0.58, valign: 'middle', border: { type: 'solid', color: 'C9D6D5', pt: 1 }, margin: 0.06 });
  txt(s, 'Skor = olasılık × etki (1–5)', { x: 9.9, y: 1.5, w: 2.8, h: 0.4, fontSize: 16, bold: true, color: C.text2 });
  [['Çok yüksek', '20–25', RISK.V], ['Yüksek', '10–16', RISK.H], ['Orta', '5–9', RISK.M], ['Düşük', '1–4', RISK.L]].forEach(([t, r, f], i) => {
    const y = 2.05 + i * 0.6;
    s.addShape(pres.shapes.RECTANGLE, { x: 9.9, y, w: 0.45, h: 0.42, fill: { color: f }, line: { color: f } });
    txt(s, `${t} (${r})`, { x: 10.5, y, w: 2.2, h: 0.42, fontSize: 16, valign: 'middle' });
  });
  txt(s, 'Önce: hiçbir önlem yok. Sonra: araç + idari önlemler.', { x: 9.9, y: 4.6, w: 2.8, h: 1.2, fontSize: 16, color: C.accent5 });
}

// ============ 9. Risk matrisi ============
{
  const s = content('Önlemlerden önce ve sonra risk', 'Sistem ve riskler',
    'Matris aynı riskleri önce ve sonra gösteriyor. Çok yüksek risk sayısı ikiden sıfıra indi, toplam skor 88den 55e düştü. Ama hassas veri riski R3 hâlâ yüksek ve dolaylı bilgi riski R6 hiç değişmedi. Bu, aracın her şeyi çözmediğini gösteriyor.');
  s.addImage({ path: path.join(ROOT, 'docs/report/figures/sekil3_risk_matrisi.png'), x: 0.5, y: 1.4, w: 8.9, h: 8.9 * 982 / 2200, altText: 'Önce ve sonra risk matrisi' });
  [['2 → 0', 'çok yüksek risk'], ['88 → 55', 'toplam risk skoru'], ['R3 = 10', 'hassas veri hâlâ yüksek']].forEach(([n, d], i) => {
    const y = 1.5 + i * 1.75;
    box(s, 9.8, y, 2.9, 1.55, i === 2 ? 'FDECEA' : C.background2);
    txt(s, n, { x: 10.0, y: y + 0.12, w: 2.5, h: 0.7, fontSize: 32, bold: true, color: i === 2 ? C.accent3 : C.accent1, fontFace: THEME.headFontFace });
    txt(s, d, { x: 10.0, y: y + 0.85, w: 2.5, h: 0.55, fontSize: 16 });
  });
}

// ============ 10. Uyum değerlendirmesi ============
{
  const s = content('Mevzuata uyum: araç tek başına yetmez', 'Sistem ve riskler',
    'Bugünkü iş akışı KVKK m.4 ve m.12ye uygun değil, m.9 açısından da sorunlu. Araç riski azaltıyor ama tek başına uyum sağlamıyor. Üç nedeni var: maskelenmiş veri hâlâ kişisel veri olabilir; takma adlı verinin durumu tartışmalı, en güvenli yorum onu da kişisel veri saymak; ve aracın kendisi iki yeni risk yaratıyor.');
  [['Maskelenmiş veri hâlâ kişisel veri olabilir', 'Kartın son 4 hanesi, doğum yılı, baş harfler kalır. Başka bilgilerle birleşince kişi bulunabilir (KVKK m.3).'],
   ['Takma adlı verinin durumu tartışmalı', 'SRB kararına göre alıcı için kişisel veri olmayabilir; ama Türk Kurulu\'nun görüşü belirsiz. En güvenli yorum: kişisel veri say.'],
   ['Araç yeni riskler yaratır', 'Kaçırılan veri "metin temiz" yanılgısı yaratır (R7). Kod tablosu tüm kimlikleri geri açabilir (R8).']].forEach(([t, d], i) => {
    const x = 0.6 + i * 4.1;
    box(s, x, 1.6, 3.85, 4.4, C.background2);
    circle(s, x + 0.3, 1.85, 0.75, C.accent3, String(i + 1), C.background1, 22);
    txt(s, t, { x: x + 0.3, y: 2.8, w: 3.3, h: 1.0, fontSize: 20, bold: true, color: C.text2 });
    txt(s, d, { x: x + 0.3, y: 3.9, w: 3.3, h: 2.0, fontSize: 17 });
  });
  txt(s, 'Sonuç: Araç bir teknik tedbirdir (m.12); idari tedbirler ve insan kontrolüyle birlikte kullanılmalıdır.', { x: 0.6, y: 6.25, w: 12.1, h: 0.5, fontSize: 18, bold: true, color: C.accent1 });
}

// ============ 11. Önerilen çözüm ============
pres.addSection({ title: 'Çözüm' });
{
  const s = content('Önerilen çözüm: yerel tespit ve koruma aracı', 'Çözüm',
    'Araç Python ve Streamlit ile yazıldı ve internet olmadan çalışıyor. Önce desenle aday buluyor, sonra doğruluyor: kimlik numarasında kontrol hanesi, IBANda mod-97, kartta Luhn algoritması. Böylece sipariş numarası gibi sayılar yanlışlıkla gizlenmiyor. Sonra kullanıcının seçtiği yöntemle koruyor ve hassas kelimeler için uyarı veriyor. Tasarım GDPR m.25teki tasarımdan itibaren gizlilik fikrine dayanıyor.');
  const cols = [['Girdi', ['Metin yapıştırma', 'CSV / Excel dosyası'], C.background2],
    ['Tespit + doğrulama', ['TCKN: kontrol hanesi', 'IBAN: mod-97', 'Kart: Luhn', 'Ad: 157 adlık sözlük', 'Doğum tarihi: "doğumlu"'], C.accent6],
    ['Koruma + rapor', ['Maskeleme / takma ad / kaldırma', 'Risk raporu', 'Hassas veri uyarısı (m.6)'], C.background2]];
  cols.forEach(([t, items, f], i) => {
    const x = 0.6 + i * 4.1;
    box(s, x, 1.5, 3.6, 3.6, f);
    txt(s, t, { x: x + 0.25, y: 1.65, w: 3.1, h: 0.5, fontSize: 21, bold: true, color: C.text2 });
    txt(s, items.map((it, k) => ({ text: it, options: { bullet: true, breakLine: k < items.length - 1 } })), { x: x + 0.25, y: 2.25, w: 3.15, h: 3.0, fontSize: 18, paraSpaceAfter: 6 });
    if (i < 2) arrow(s, x + 3.63, 3.3, 0.42);
  });
  [['Yerel', 'dışarı bağlantı yok'], ['Doğrulamalı', 'yanlış alarm az'], ['Seçilebilir', 'amaca göre yöntem'], ['Şeffaf', 'sınırlarını gösterir']].forEach(([t, d], i) => {
    const x = 0.6 + i * 3.08;
    circle(s, x, 5.75, 0.6, C.accent1, '✓', C.background1, 18);
    txt(s, t, { x: x + 0.75, y: 5.68, w: 2.2, h: 0.4, fontSize: 19, bold: true, color: C.text2 });
    txt(s, d, { x: x + 0.75, y: 6.08, w: 2.2, h: 0.4, fontSize: 15, color: C.accent5 });
  });
}

// ============ 12. Yöntemler ve idari önlemler ============
{
  const s = content('Hangi yöntem ne zaman? Ve teknik yetmez', 'Çözüm',
    'Üç yöntemin farkı: maskeleme insan okuması için, takma ad test verisi ve yapay zekâ yanıtını geri eşlemek için, kaldırma dışarı gönderim için en güvenli. Ama KVKK m.12 teknik ve idari tedbiri birlikte istiyor; bu yüzden şirket politikası, kurumsal hesap, eğitim ve insan kontrolü de gerekli.');
  const head = ['', 'Maskeleme', 'Takma ad', 'Kaldırma'].map((t, j) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: j === 0 ? C.text2 : C.accent1 } } }));
  const rows = [['Geri açılır mı?', 'Hayır (parçalar ipucu verir)', 'Evet, kod tablosuyla', 'Hayır'], ['İşe yararlık', 'Orta', 'Yüksek', 'Düşük'], ['Ne zaman?', 'Yazışma özetletirken', 'Test verisi, yanıtı geri eşleme', 'Dış araca gönderirken']]
    .map((r) => r.map((c, j) => ({ text: c, options: { bold: j === 0, fill: { color: j === 0 ? C.background2 : C.background1 } } })));
  s.addTable([head, ...rows], { x: 0.6, y: 1.5, w: 12.1, colW: [2.5, 3.2, 3.2, 3.2], fontSize: 18, rowH: 0.7, valign: 'middle', border: { type: 'solid', color: 'C9D6D5', pt: 1 }, margin: 0.1 });
  txt(s, 'Tamamlayıcı idari önlemler (KVKK m.12)', { x: 0.6, y: 4.65, w: 12, h: 0.5, fontSize: 21, bold: true, color: C.text2 });
  [['Yazılı ÜYZ politikası', 'KVK Kurumu, 2026a, s. 11'], ['Kurumsal hesap', 'sözleşmeli, kişisel değil'], ['Çalışan eğitimi', 'maskeli veri de kişisel veri'], ['İnsan kontrolü', 'uyarılı metin dışarı gitmez']].forEach(([t, d], i) => {
    const x = 0.6 + i * 3.08;
    box(s, x, 5.25, 2.85, 1.4, C.background2);
    txt(s, t, { x: x + 0.2, y: 5.38, w: 2.5, h: 0.45, fontSize: 18, bold: true, color: C.accent1 });
    txt(s, d, { x: x + 0.2, y: 5.85, w: 2.5, h: 0.7, fontSize: 15 });
  });
}

// ============ 13. Senaryo ============
pres.addSection({ title: 'Uygulama ve bulgular' });
{
  const s = content('Uygulama senaryosu: iade talebi', 'Uygulama ve bulgular',
    'Senaryoda müşteri hizmetleri çalışanı bir iade kaydını yapay zekâ aracına yapıştırmak istiyor. Araç 8 kişisel veri buldu, sipariş numarasını doğru şekilde atladı ve aynı telefonun iki yazımına aynı takma adı verdi. En önemli bulgu: korunmuş metinde Person_1 diyabet hastası ve sendika üyesi bilgisi kalıyor. Bu KVKK m.6 kapsamında hassas veri. Araç bunu silmiyor, uyarı veriyor; karar insana kalıyor.');
  s.addImage({ path: path.join(ROOT, 'docs/screenshots/text-masking.png'), x: 0.6, y: 1.45, w: 7.3, h: 7.3 * 627 / 1826, altText: 'Metin sekmesi: bulunan veriler renkli, sağda maskelenmiş metin' });
  const ex = [['Orijinal', 'Maskeleme', 'Takma ad'], ['Fatma Yılmaz', 'F*** Y***', 'Person_1'], ['53321819608', '533******08', 'TCKN_1'], ['0500 133 89 08', '500***8908', 'Phone_1'], ['diyabet hastası', 'diyabet hastası', 'diyabet hastası']];
  s.addTable(ex.map((r, i) => r.map((c) => ({ text: c, options: { bold: i === 0, fontFace: i === 0 ? undefined : 'Courier New', color: i === 0 ? C.background1 : (i === 4 ? C.accent3 : C.text1), fill: { color: i === 0 ? C.accent1 : (i === 4 ? 'FDECEA' : C.background1) } } }))),
    { x: 0.6, y: 4.2, w: 7.3, colW: [2.6, 2.35, 2.35], fontSize: 16, rowH: 0.46, valign: 'middle', border: { type: 'solid', color: 'C9D6D5', pt: 1 }, margin: 0.06 });
  txt(s, 'Tüm veriler sentetiktir.', { x: 0.6, y: 6.65, w: 6, h: 0.3, fontSize: 12, italic: true, color: C.accent5 });
  [['✓', '8 kişisel veri bulundu; sipariş no doğru şekilde atlandı', C.accent4],
   ['✓', 'Aynı telefonun iki yazımı → Phone_1', C.accent4],
   ['!', '"Person_1 … diyabet hastası … sendika üyesi" metinde kalıyor (KVKK m.6)', C.accent3]].forEach(([ic, t, col], i) => {
    const y = 1.55 + i * 1.75;
    circle(s, 8.3, y, 0.6, col, ic, C.background1, 20);
    txt(s, t, { x: 9.05, y: y - 0.05, w: 3.7, h: 1.5, fontSize: 18, bold: i === 2, color: i === 2 ? C.accent3 : C.text1 });
  });
}

// ============ 14. Bulgular ============
{
  const s = content('Bulgular: güçlü yanlar ve zayıf noktalar', 'Uygulama ve bulgular',
    'Araç cevabı bilinen 200 sentetik belgede test edildi. Duyarlılık yüzde 100, yani 1400 verinin hepsi bulundu. Kesinlik yüzde 94,9; yanlış alarmların hepsi Deniz Kuvvetleri ve Gül Sokak gibi içinde ad geçen ifadelerden. Ama büyük harfle yazılmış adlar ve sözlükte olmayan adlar hiç bulunamadı. Ayrıca test adlarının hepsi sözlükte olduğu için bu sonuçlar iyimser bir üst sınır.');
  [['%100', 'Duyarlılık', '1400 verinin tamamı bulundu', C.accent1], ['%94,9', 'Kesinlik', '76 yanlış alarm ("Deniz Kuvvetleri", "Gül Sokak")', C.accent1], ['%0', 'Büyük harfli adlar', 'AHMET YILMAZ bulunamadı', C.accent3]].forEach(([n, t, d, col], i) => {
    const y = 1.5 + i * 1.7;
    box(s, 0.6, y, 5.2, 1.5, i === 2 ? 'FDECEA' : C.background2);
    txt(s, n, { x: 0.85, y: y + 0.2, w: 2.1, h: 1.1, fontSize: 40, bold: true, color: col, fontFace: THEME.headFontFace, valign: 'middle' });
    txt(s, t, { x: 3.0, y: y + 0.2, w: 2.7, h: 0.45, fontSize: 19, bold: true, color: C.text2 });
    txt(s, d, { x: 3.0, y: y + 0.68, w: 2.7, h: 0.75, fontSize: 15 });
  });
  s.addChart(pres.charts.BAR, [{ name: 'Tespit oranı', labels: ['Normal metin (200 belge)', 'Parantezli telefon', 'Sözlük dışı ad', 'Büyük harfli ad'], values: [100, 100, 0, 0] }], {
    x: 6.3, y: 1.45, w: 6.4, h: 4.5, barDir: 'bar', chartColors: [THEME.colors.accent1], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0"%"', dataLabelFontSize: 16, dataLabelFontFace: '+mn-lt',
    catAxisLabelFontSize: 16, catAxisLabelFontFace: '+mn-lt', catAxisLabelColor: THEME.colors.dk1, valAxisHidden: true, valAxisMaxVal: 115, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showTitle: true, title: 'Tespit oranı (%)', titleFontSize: 18, titleFontFace: '+mn-lt', titleColor: THEME.colors.dk2, showLegend: false, catAxisOrientation: 'maxMin',
  });
  txt(s, 'Dikkat: 16 test adının hepsi sözlükte → sonuçlar iyimser bir üst sınırdır.', { x: 6.3, y: 6.1, w: 6.4, h: 0.6, fontSize: 16, italic: true, color: C.accent3 });
}

// ============ 15. Katkılar ve sınırlılıklar ============
{
  const s = content('Özgün katkılar ve sınırlılıklar', 'Uygulama ve bulgular',
    'Hukuki katkı: maskeleme ve takma adın KVKKdaki anonimleştirme tanımını karşılamadığını ve KVKKda takma ad boşluğu olduğunu gösterdim. Teknik katkı: Türkiyeye özgü verileri doğrulayan, internetsiz, test edilmiş ve ölçülmüş açık kaynaklı bir araç. Sınırlılıklar: büyük harf ve sözlük dışı adlar, adres ve dolaylı bilgiler, hassas verinin sadece kelimeyle aranması ve sentetik test.');
  const col = (x, title, items, f, tc) => {
    box(s, x, 1.5, 5.9, 4.6, f);
    txt(s, title, { x: x + 0.3, y: 1.7, w: 5.3, h: 0.5, fontSize: 22, bold: true, color: tc });
    txt(s, items.map((it, k) => ({ text: it, options: { bullet: true, breakLine: k < items.length - 1 } })), { x: x + 0.3, y: 2.35, w: 5.3, h: 4.2, fontSize: 18, paraSpaceAfter: 10 });
  };
  col(0.6, 'Katkılar', ['Hukuki: maskeleme ve takma ad, KVKK\'daki anonimleştirme tanımını karşılamaz', 'KVKK\'da takma adlandırma boşluğu tespit edildi', 'Teknik: Türkiye\'ye özgü verileri doğrulayan, internetsiz çalışan açık kaynaklı araç', 'Başarısı ölçülmüş ve 113 testle doğrulanmış'], C.background2, C.accent1);
  col(6.8, 'Sınırlılıklar', ['Büyük harfli ve sözlük dışı adlar bulunamıyor', 'Adres, plaka ve dolaylı bilgiler (yaş, şehir) kapsam dışı', 'Hassas veri yalnızca anahtar kelimeyle aranıyor', 'Test sentetik veriyle; risk puanları yazarın değerlendirmesi'], 'FFF4D6', C.accent3);
}

// ============ 16. Sonuç ============
pres.addSection({ title: 'Sonuç' });
{
  const s = pres.addSlide({ masterName: 'KOYU', sectionTitle: 'Sonuç' });
  txt(s, 'Sonuç ve öneriler', { x: 0.7, y: 0.5, w: 12, h: 0.7, fontFace: THEME.headFontFace, fontSize: 32, bold: true, color: C.accent2 });
  txt(s, 'Araç riski belirgin biçimde azaltır; ama KVKK uyumu ancak şirket politikası ve insan kontrolüyle birlikte sağlanır.', { x: 0.7, y: 1.4, w: 11.9, h: 1.4, fontFace: THEME.headFontFace, fontSize: 28, color: C.background1 });
  [['Şirketlere', 'ÜYZ politikası, kurumsal hesaplar ve zorunlu maskeleme adımı'], ['KVK Kurumu\'na', 'Takma adlandırmayı tanımlayan ve alıcı açısından durumunu açıklayan bir rehber'], ['Geliştirme için', 'Büyük harf desteği, Türkçe ad tanıma modeli, tarayıcı eklentisi, gerçekçi test seti']].forEach(([t, d], i) => {
    const x = 0.7 + i * 4.05;
    box(s, x, 3.3, 3.8, 2.9, C.background1);
    txt(s, t, { x: x + 0.25, y: 3.5, w: 3.3, h: 0.5, fontSize: 21, bold: true, color: C.accent1 });
    txt(s, d, { x: x + 0.25, y: 4.1, w: 3.3, h: 2.0, fontSize: 18 });
  });
  txt(s, 'Kod ve ölçüm: github.com/ahmetzeyteroglu/kvkk-data-masking', { x: 0.7, y: 6.6, w: 12, h: 0.4, fontSize: 16, color: C.accent6 });
  s.addNotes('Özetle: Maskeleme ve takma ad anonimleştirme değil. Araç riski azaltıyor ama tek başına uyum sağlamıyor; politika ve insan kontrolü şart. Şirketlere politika ve kurumsal hesap, KVK Kurumuna takma adlandırma rehberi, geliştirme için de büyük harf desteği ve ad tanıma modeli öneriyorum. Teşekkür ederim, sorularınızı alabilirim.');
}

// ============ 17. Kaynakça ============
{
  const s = content('Kaynakça', 'Sonuç', 'Kaynakların tamamı raporun kaynakçasında APA 7 biçiminde yer alıyor; mevzuat resmî kaynaklardan doğrulandı.');
  const left = ['6698 sayılı KVKK, RG 07.04.2016, S. 29677', '7499 sayılı Kanun, RG 12.03.2024, S. 32487', 'Silme ve Anonimleştirme Yönetmeliği, RG 28.10.2017, S. 30224', 'Yurt Dışına Aktarım Yönetmeliği, RG 10.07.2024, S. 32598', '5237 sayılı TCK, m.135–138', 'KVK Kurumu (2018; 2025a; 2025b; 2026a; 2026b)', 'Regulation (EU) 2016/679 (GDPR)', 'Regulation (EU) 2024/1689 (AI Act); 2026/1744', 'C-413/23 P, EDPS v SRB, ECLI:EU:C:2025:645', 'EDPB (2025). Guidelines 01/2025 on pseudonymisation'];
  const right = ['Finck, M., & Pallas, F. (2020). International Data Privacy Law, 10(1)', 'Gurman, M. (2023, 2 Mayıs). Bloomberg', 'Microsoft (t.y.). Presidio [Yazılım]', 'Mourby, M. vd. (2018). Computer Law & Security Review, 34(2)', 'Ohm, P. (2010). UCLA Law Review, 57', 'Pilán, I. vd. (2022). Computational Linguistics, 48(4)', 'Rocher, L. vd. (2019). Nature Communications, 10', 'Stalla-Bourdillon, S. (2025). European Journal of Risk Regulation, 16(4)', 'Sweeney, L. (2002). Int. J. of Uncertainty, Fuzziness and KBS, 10(5)'];
  const list = (x, items) => txt(s, items.map((it, k) => ({ text: it, options: { bullet: true, breakLine: k < items.length - 1 } })), { x, y: 1.5, w: 5.9, h: 5.3, fontSize: 14, paraSpaceAfter: 6, color: C.text1 });
  list(0.6, left);
  list(6.8, right);
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('yazıldı:', OUT);
})();
