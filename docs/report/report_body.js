// Raporun gövde metni (Bölüm 1–11). build_report.js tarafından çağrılır.
// Biçim: <b>kalın</b>, <i>italik</i>. Şekil ve tablo numaraları sırayla otomatik verilir.
module.exports = ({ add, h1, h2, P, BULLET, TAB, FIG }) => {

// ------------------------------------------------------------------ 1
add(h1('1. GİRİŞ'));
add(h2('1.1. Konunun Önemi'));
add(P(`ChatGPT, Gemini ve Claude gibi üretken yapay zekâ (ÜYZ) araçları artık e-posta yazmak, metin özetlemek ve tablo düzenlemek için iş yerlerinde her gün kullanılıyor. Bu araçların çoğu, yurt dışındaki sunucularda çalışan üçüncü taraf hizmetlerdir. Bir çalışan müşterinin e-postasını olduğu gibi bu araca yapıştırdığında, müşterinin kişisel verilerini kurum dışındaki bir şirkete, çoğu zaman da yurt dışına göndermiş olur.`));
add(P(`Benzer bir sorun yazılım geliştirmede de görülür: Gerçek müşteri verisi "gerçekçi test" için test ortamlarına kopyalanır. Kişisel Verileri Koruma Kurumu (KVK Kurumu) bu konuya 2025 ve 2026 yıllarında ayrı rehberler ayırmıştır (KVK Kurumu, 2025b, 2026a). Bilinen bir örnek, 2023'te Samsung çalışanlarının şirket kodunu ChatGPT'ye yüklemesi ve şirketin ardından bu araçları yasaklamasıdır (Gurman, 2023). O olayda sızan bilgi ticari sırdı; ancak aynı şey kişisel veriler için de olabilir.`));
add(h2('1.2. Amaç, Kapsam ve Yöntem'));
add(P(`Bu projenin amacı, kişisel verilerin ÜYZ araçlarına ve test ortamlarına kontrolsüz gönderilmesini hukuki ve teknik açıdan incelemek ve bu riski azaltan bir araç geliştirmektir. Geliştirilen araç, metindeki yedi tür kişisel veriyi (ad soyad, T.C. kimlik numarası, telefon, e-posta, IBAN, kredi kartı, doğum tarihi) bulur, bunları gizler ve sağlık gibi hassas bilgiler için uyarı verir. Araç, veri bilgisayardan hiç çıkmadan çalışır.`));
add(P(`Çalışma dört adımda yapılmıştır: (1) mevzuat ve literatürün resmî kaynaklardan incelenmesi, (2) veri akışının analizi, (3) risklerin puanlanması, (4) aracın geliştirilmesi ve test edilmesi. Projede gerçek kişilere ait hiçbir veri kullanılmamış, tüm örnekler yapay (sentetik) verilerle hazırlanmıştır.`));
add(h2('1.3. Temel Kavramlar'));
add(P(`Raporun anlaşılması için dört kavramın farkı önemlidir. Tablo 1 bu kavramları aynı örnek üzerinden göstermektedir.`));
add(TAB('Temel kavramlar ve örnekleri', ['Kavram', 'Ne demek?', 'Örnek ("Fatma Yılmaz, 0532 123 45 67")'], [
  ['Maskeleme', 'Verinin bir kısmını yıldızla gizlemek', 'F*** Y***, 532***4567'],
  ['Takma adlandırma', 'Veriyi bir kod ile değiştirmek; kodun kime ait olduğu ayrı bir tabloda saklanır', 'Person_1, Phone_1'],
  ['Kaldırma', 'Veriyi tamamen silmek', '[REMOVED]'],
  ['Anonimleştirme', 'Kişinin başka bilgilerle birleştirilse bile hiçbir şekilde bulunamaması', 'Yalnızca yukarıdaki işlemlerle sağlanamaz'],
], [2, 5, 4]));
add(P(`Raporun ana fikri şudur: <b>Maskeleme ve takma adlandırma, anonimleştirme değildir.</b> Bu yöntemler riski azaltır ama veri çoğu durumda hâlâ "kişisel veri" olarak kalır ve kanunun koruması devam eder.`));

// ------------------------------------------------------------------ 2
add(h1('2. PROBLEM TANIMI VE İHTİYAÇ ANALİZİ'));
add(h2('2.1. Problem'));
add(P(`Problem, kişisel verinin <b>işin gerektirdiğinden fazla ve kontrolsüz biçimde</b> kurum dışına çıkmasıdır. Bir iade e-postasını özetlemek için müşterinin T.C. kimlik numarasına veya IBAN'ına gerek yoktur; ama metin bütün olarak kopyalanınca bunların hepsi araca gider. Kurum ise hangi verinin hangi araca gittiğini bilmez. KVK Kurumu bu durumu şöyle anlatır: "Kurumsal kontrol dışında kullanılan ÜYZ araçları ile kişisel verilerin paylaşılması, veri ihlali riskini artırabilmektedir. Bu tür kullanımlar, kişisel verilerin hukuka aykırı şekilde işlenmesi, yetkisiz kişilerce erişilebilir hâle gelmesi veya amaç dışı kullanılması gibi sonuçlara yol açabilmektedir." (KVK Kurumu, 2026a, s. 9). Kurum, kurumun bilgisi dışındaki bu kullanıma "gölge yapay zekâ" adını vermektedir.`));
add(h2('2.2. Etkilenen Taraflar'));
add(BULLET(`<b>Müşteriler:</b> Verileri haberleri olmadan başka bir şirkete gider; dolandırıcılık ve hassas bilgilerin ortaya çıkması riskiyle karşılaşırlar.`));
add(BULLET(`<b>Kurum (veri sorumlusu):</b> Veri güvenliği yükümlülüğünü ihlal etmiş olur. 2026 yılı için 256.357 TL ile 17.092.242 TL arası idari para cezası söz konusudur.`));
add(BULLET(`<b>Çalışan:</b> Kişisel veriyi hukuka aykırı olarak başkasına vermek Türk Ceza Kanunu m.136'da suç olarak düzenlenmiştir.`));
add(h2('2.3. İhtiyaç'));
add(P(`Bütün ÜYZ araçlarını yasaklamak verimliliği düşürür ve çalışanları kişisel telefonlarına yöneltebilir. Bu nedenle ihtiyaç, ÜYZ kullanımını engellemeden <b>veriyi kurumdan çıkmadan önce azaltan</b> bir ara adımdır. Bu adımın; veriyi dışarı göndermeden yerelde çalışması, Türkiye'ye özgü numaraları doğru tanıması, farklı kullanım amaçları için farklı gizleme yöntemleri sunması ve hassas bilgiler için uyarı vermesi gerekir.`));

// ------------------------------------------------------------------ 3
add(h1('3. LİTERATÜR ARAŞTIRMASI VE HUKUKİ MEVZUAT İNCELEMESİ'));
add(P(`Mevzuatın güncel hâli Mevzuat Bilgi Sistemi, Resmî Gazete, KVK Kurumu ve EUR-Lex üzerinden kontrol edilmiştir.`));
add(h2('3.1. Türk Mevzuatı'));
add(P(`Projenin temel dayanağı <b>6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)</b>'dur. Proje için önemli maddeler şunlardır:`));
add(BULLET(`<b>m.3 (Tanımlar):</b> Kişisel veri, "kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgi"dir. Anonim hâle getirme ise verinin "başka verilerle eşleştirilerek dahi" kişiyle ilişkilendirilememesidir. Bu çok yüksek bir eşiktir. KVKK'da takma adlandırmanın ayrı bir tanımı yoktur.`));
add(BULLET(`<b>m.4 (Genel ilkeler):</b> Veri, amaçla bağlantılı, sınırlı ve ölçülü işlenmelidir. Bir metni özetlemek için kimlik numarasını da göndermek bu ilkeye aykırıdır.`));
add(BULLET(`<b>m.6 (Özel nitelikli veriler):</b> Sağlık, sendika üyeliği, din, ceza mahkûmiyeti gibi bilgiler daha sıkı korunur. Madde, 7499 sayılı Kanunun 33. maddesiyle değiştirilmiştir.`));
add(BULLET(`<b>m.9 (Yurt dışına aktarım):</b> Veri yurt dışına ancak belirli şartlarla (yeterlilik kararı, standart sözleşme gibi güvenceler veya sınırlı istisnalar) gönderilebilir. Madde, 7499 sayılı Kanunla değiştirilmiş (RG 12.03.2024, S. 32487) ve 01.06.2024'te yürürlüğe girmiştir. Çalışanın kurumun haberi olmadan yurt dışındaki bir araca veri girmesi bu şartların hiçbirine dayanmaz.`));
add(BULLET(`<b>m.12 (Veri güvenliği):</b> Kurum, verinin hukuka aykırı işlenmesini ve erişilmesini önlemek için gerekli teknik ve idari tedbirleri almak zorundadır. Geliştirilen araç, bu maddede sözü edilen teknik tedbirlerin bir örneğidir.`));
add(BULLET(`<b>m.18 (İdari para cezaları):</b> 2026 yılı tutarları Tablo 2'de verilmiştir.`));
add(P(`Ayrıca <b>Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik</b> (RG 28.10.2017, S. 30224) anonimleştirmenin usulünü, <b>Yurt Dışına Aktarım Yönetmeliği</b> (RG 10.07.2024, S. 32598) m.9'un ayrıntılarını, <b>Türk Ceza Kanunu m.135–138</b> ise kişisel verilerle ilgili suçları düzenler.`));
add(TAB('KVKK m.18 kapsamındaki 2026 yılı idari para cezaları', ['Bent', 'Hangi yükümlülük?', 'Alt sınır', 'Üst sınır'], [
  ['18/1-a', 'Aydınlatma (m.10)', '85.437 TL', '1.709.200 TL'],
  ['18/1-b', '<b>Veri güvenliği (m.12)</b>', '<b>256.357 TL</b>', '<b>17.092.242 TL</b>'],
  ['18/1-c', 'Kurul kararlarına uymama (m.15)', '427.263 TL', '17.092.242 TL'],
  ['18/1-ç', 'VERBİS kaydı (m.16)', '341.809 TL', '17.092.242 TL'],
  ['18/1-d', 'Standart sözleşmeyi Kurum\'a bildirmeme (m.9/5)', '90.308 TL', '1.806.177 TL'],
], [1.3, 5, 2, 2.2], 'Kaynak: KVK Kurumu (2026b). Bu projedeki senaryo en çok 18/1-b bendiyle ilgilidir.'));
add(h2('3.2. KVK Kurumu Rehberleri'));
add(P(`KVK Kurumu'nun <b>Silme, Yok Etme ve Anonim Hale Getirme Rehberi</b> (2018) maskelemeyi bir yöntem olarak tanımlar (s. 13), ancak verinin başka bilgilerle birleştirilme ihtimalinin de değerlendirilmesini ister. <b>Yapay Zekâ Alanında Kişisel Verilerin Korunmasına Dair Tavsiyeler</b> (2025a) ve <b>Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi</b> (2025b) ÜYZ'nin genel risklerini ele alır. Projenin çıkış noktası ise <b>İş Yerlerinde Üretken Yapay Zekâ Araçlarının Kullanımı</b> belgesidir (2026a). Bu belge "gölge yapay zekâ" riskini tanımlar ve kurumlara şunu önerir: "ÜYZ araçlarının iş süreçlerinde kullanımına ilişkin olarak, doğru ve uygun kullanımın sınırlarını ortaya koyan açık bir kurumsal politika veya yönlendirme çerçevesinin oluşturulması önem taşımaktadır." (KVK Kurumu, 2026a, s. 11).`));
add(h2('3.3. Avrupa Birliği Düzenlemeleri ve KVKK ile Karşılaştırma'));
add(P(`AB'nin <b>Genel Veri Koruma Tüzüğü (GDPR)</b>, KVKK'dan farklı olarak takma adlandırmayı açıkça tanımlar (m.4/5) ve güvenlik tedbirleri arasında sayar (m.32/1-a). Ancak takma adlı veri, kodun kime ait olduğu bilindiği sürece kişisel veri sayılır (Gerekçe 26). Avrupa Veri Koruma Kurulu'nun (EDPB) 2025 tarihli <b>takma adlandırma rehberi</b> de aynı yaklaşımı benimser; rehberin nihai hâli henüz yayımlanmamıştır (EDPB, 2025).`));
add(P(`AB Adalet Divanı'nın 04.09.2025 tarihli <b>EDPS v SRB</b> kararı (C-413/23 P, ECLI:EU:C:2025:645) bu konuya yeni bir bakış getirmiştir: Takma adlı veri, kodu çözme imkânı olmayan <b>alıcı</b> açısından kişisel veri sayılmayabilir (Stalla-Bourdillon, 2025). AB <b>Yapay Zekâ Tüzüğü</b> (2024/1689) ise yüksek riskli sistemler için veri kuralları getirir; bu yükümlülükler 2026/1744 sayılı Tüzük ile 2027–2028'e ertelenmiştir. Geliştirilen araç yalnızca insanların yazdığı kurallarla çalıştığı için bu Tüzük anlamında bir yapay zekâ sistemi sayılmadığı değerlendirilmektedir (Gerekçe 12).`));
add(TAB('KVKK ve GDPR karşılaştırması (proje açısından)', ['Konu', 'KVKK', 'GDPR', 'Projeye etkisi'], [
  ['Takma adlandırma', 'Tanımlanmamış', 'Tanımlı (m.4/5), güvenlik tedbiri (m.32)', 'Türk hukukunda boşluk var'],
  ['Anonim veri', 'm.3: hiçbir surette ilişkilendirilememe', 'Gerekçe 26: makul araçlarla ilişkilendirilememe', 'Araç "anonimleştirme" iddia etmez'],
  ['Veri minimizasyonu', 'm.4: sınırlı ve ölçülü olma', 'm.5/1-c', 'Aracın temel gerekçesi'],
  ['Tasarımdan itibaren gizlilik', 'Kanunda açık hüküm yok', 'm.25 ile zorunlu', 'Koruma veri çıkmadan uygulanır'],
  ['Yurt dışına aktarım', 'm.9 (2024 değişikliği)', 'Bölüm V (m.44–49)', 'Yerel çalışma ile aktarım azalır'],
  ['Yaptırım', 'İdari para cezası + TCK', 'Cironun %4\'üne veya 20 milyon avroya kadar (m.83)', 'Risk etkisinde dikkate alınır'],
], [2.2, 3, 3.2, 3]));
add(h2('3.4. Akademik Literatür ve Mevcut Çözümler'));
add(P(`Akademik çalışmalar, sadece ad ve kimlik numarasını silmenin yetmediğini göstermektedir. Sweeney (2002), kimlik bilgileri silinmiş sağlık kayıtlarının başka veri kümeleriyle birleştirilerek kişilere bağlanabildiğini göstermiş ve buna karşı k-anonimlik modelini önermiştir. Ohm (2010), hukukun "anonim veri zararsızdır" varsayımının bu çalışmalarla çöktüğünü savunmuştur. Rocher ve diğerleri (2019) ise 15 demografik bilgiyle Amerikalıların %99,98'inin yeniden tanımlanabileceğini hesaplamıştır.`));
add(P(`Hukuki literatürde Finck ve Pallas (2020), anonimleştirmede her zaman bir artık risk kaldığını; Mourby ve diğerleri (2018) ise takma adlı verinin bir kurum için kişisel veri, başka bir taraf için anonim olabileceğini savunmuştur. Bu görüş EDPS v SRB kararıyla örtüşmektedir. Metin anonimleştirmenin nasıl ölçüleceği konusunda Pilán ve diğerleri (2022) bir test derlemi ve ölçütler önermiştir; bu projedeki ölçüm yöntemi bu yaklaşımın basitleştirilmiş bir uygulamasıdır.`));
add(P(`Mevcut açık kaynak araçlardan Microsoft Presidio (Microsoft, t.y.) yaygın kullanılmaktadır; ancak ağırlıklı olarak İngilizce ve ABD'ye özgü veriler için hazırlanmıştır ve T.C. kimlik numarası, Türk IBAN'ı gibi verileri varsayılan olarak doğrulamaz. Ticari veri kaybı önleme (DLP) ürünleri ise pahalıdır. Bu boşluk, Türkiye'ye özgü verilere odaklanan hafif bir aracın geliştirilmesini gerekçelendirmektedir.`));

// ------------------------------------------------------------------ 4
add(h1('4. İNCELENEN BİLİŞİM SİSTEMİNİN TEKNİK ANALİZİ'));
add(h2('4.1. Veri Akışı'));
add(P(`İncelenen sistem tek bir yazılım değil, bir e-ticaret şirketinde verinin izlediği yoldur. Şekil 1(a)'da görüldüğü gibi müşteri bilgileri CRM sisteminde, e-postalarda ve Excel dosyalarında bulunur. Çalışan bu içeriği kopyalayıp ÜYZ aracına yapıştırır; geliştirici ise gerçek veriyi test ortamına yükler. Şekil 1(b), önerilen çözümde verinin önce yerel araçtan geçtiğini göstermektedir.`));
add(FIG('docs/report/figures/sekil1_veri_akisi.png', 2200, 1216, 'Mevcut (a) ve önerilen (b) veri akışı', 'Kaynak: Yazar tarafından hazırlanmıştır.', 560));
add(h2('4.2. Teknik Zayıflıklar'));
add(BULLET(`<b>Kayıt yok:</b> Kopyala-yapıştır iz bırakmaz; kurum hangi verinin nereye gittiğini denetleyemez.`));
add(BULLET(`<b>Şifreleme yetersiz:</b> Bağlantı (HTTPS) şifrelidir ama veri karşı tarafın sunucusunda açık hâlde işlenir.`));
add(BULLET(`<b>Erişim kontrolü yok:</b> Çalışanlar çoğu zaman kişisel hesap kullanır; kurumla hizmet sağlayıcı arasında sözleşme yoktur.`));
add(BULLET(`<b>Saklama belirsiz:</b> Girilen verinin ne kadar saklanacağı ve model eğitiminde kullanılıp kullanılmayacağı kurumun kontrolünde değildir. Veri, modelin çıktılarına da yansıyabilir (KVK Kurumu, 2026a, s. 9).`));
add(BULLET(`<b>Test ortamları:</b> Erişim yetkileri geniştir ve kayıtlar daha az izlenir.`));

// ------------------------------------------------------------------ 5
add(h1('5. HUKUKİ RİSK ANALİZİ VE MEVZUATA UYUM DEĞERLENDİRMESİ'));
add(h2('5.1. Yöntem'));
add(P(`Her risk için <b>olasılık</b> (O) ve <b>etki</b> (E) 1 ile 5 arasında puanlanmış, risk skoru <b>O × E</b> olarak hesaplanmıştır. Skor 1–4 ise düşük, 5–9 orta, 10–16 yüksek, 20–25 çok yüksek kabul edilmiştir (Tablo 4).`));
add(TAB('Olasılık ve etki ölçeği', ['Puan', 'Olasılık (O)', 'Etki (E)'], [
  ['1', 'Neredeyse hiç olmaz', 'Kişi belirlenemez, yaptırım beklenmez'],
  ['2', 'Nadiren olur', 'Kısmi bilgi ortaya çıkar'],
  ['3', 'Ayda birkaç kez olur', 'Bir kişinin kimlik bilgileri ortaya çıkar'],
  ['4', 'Haftada bir olur', 'Finansal veri ortaya çıkar; m.18/1-b cezası'],
  ['5', 'Her gün olur', 'Sağlık gibi hassas veri ortaya çıkar; cezai sorumluluk'],
], [1, 5, 6]));
add(P(`Puanlar yazarın senaryoya dayalı değerlendirmesidir, ölçülmüş sıklıklar değildir. Ayrıca hukuka uygunluk tek bir sayıya indirgenemez: düşük puanlı bir risk bile bir kişiye ağır zarar verebilir. Bu nedenle tablo, önlemlerin önceliğini belirlemek için kullanılmıştır.`));
add(h2('5.2. Risk Tablosu'));
add(TAB('Hukuki risk değerlendirmesi (önce: önlem yok; sonra: araç + idari önlemler)', ['No', 'Risk ve ilgili madde', 'Etkilenen', 'Önce', 'Önlem', 'Sonra'], [
  ['R1', 'Kimlik bilgilerinin ÜYZ aracına girilmesi\n(KVKK m.4, m.12)', 'Müşteri, kurum', '5×4 = <b>20</b>', 'Göndermeden önce gizleme; kullanım politikası', '2×3 = 6'],
  ['R2', 'Hukuka aykırı yurt dışına aktarım\n(KVKK m.9)', 'Müşteri, kurum', '5×4 = <b>20</b>', 'Yalnız gizlenmiş veri gönderilir; sözleşmeli kurumsal araç', '2×3 = 6'],
  ['R3', 'Hassas (özel nitelikli) verinin işlenmesi\n(KVKK m.6)', 'Müşteri', '3×5 = <b>15</b>', 'Uyarı verilir; silme kararı insana bırakılır', '2×5 = <b>10</b>'],
  ['R4', 'Test ortamında gerçek veri\n(KVKK m.4, m.5)', 'Müşteri', '4×3 = <b>12</b>', 'Takma adlı test verisi', '1×3 = 3'],
  ['R5', 'Verinin model çıktılarına yansıması\n(KVKK m.12)', 'Müşteri, üçüncü kişiler', '3×4 = <b>12</b>', 'Veri araca hiç ulaşmaz', '1×4 = 4'],
  ['R6', 'Dolaylı bilgilerle (yaş, şehir, meslek) kişinin bulunması (KVKK m.3)', 'Müşteri', '3×3 = 9', 'Araç kapsamı dışında', '3×3 = 9'],
  ['R7', '<i>Yeni:</i> Aracın kaçırdığı veri, "metin temiz" yanılgısı (KVKK m.12)', 'Müşteri, kurum', '–', 'Sınırlılıkların bildirilmesi; insan kontrolü', '3×3 = 9'],
  ['R8', '<i>Yeni:</i> Takma ad tablosunun sızması\n(KVKK m.12; GDPR m.4/5)', 'Müşteri', '–', 'Tablonun ayrı ve yerel saklanması', '2×4 = 8'],
], [0.7, 4.3, 1.8, 1.4, 3.3, 1.4]));
add(h2('5.3. Mevzuata Uyum Değerlendirmesi'));
add(P(`Mevcut durumda iş akışı KVKK m.4'teki ölçülülük ilkesine ve m.12'deki veri güvenliği yükümlülüğüne uygun değildir; kurum adına sözleşme olmadan yurt dışındaki bir araca veri girilmesi m.9 bakımından da sorunludur. Araç bu riskleri azaltır, ancak <b>tek başına uyum sağlamaz</b>. Bunun üç nedeni vardır:`));
add(P(`<b>1. Maskelenmiş veri çoğu zaman hâlâ kişisel veridir.</b> Maskeleme kart numarasının son dört hanesini, doğum yılını ve baş harfleri bırakır. Bu parçalar metindeki diğer bilgilerle birleşince kişi bulunabilir (Sweeney, 2002; Rocher ve diğerleri, 2019). Bu durumda KVKK m.3'teki anonimleştirme tanımı karşılanmaz.`));
add(P(`<b>2. Takma adlı verinin durumu tartışmalıdır.</b> Kod tablosu kurumda kaldığı için veri kurum açısından kişisel veridir. ÜYZ sağlayıcısı açısından ise EDPS v SRB kararına göre, sağlayıcının kodu çözme imkânı yoksa veri kişisel veri sayılmayabilir. Ancak bu, metinde hassas ve dolaylı bilgi kalmamasına bağlıdır (Bölüm 8'de bu bilgilerin kaldığı görülecektir). Ayrıca bu bir AB kararıdır; Türk Kurulu'nun aynı görüşü benimseyip benimsemeyeceği bilinmemektedir. Bu nedenle en güvenli yorum, takma adlı veriyi de kişisel veri kabul etmektir.`));
add(P(`<b>3. Araç yeni riskler yaratır.</b> Aracın bulamadığı bir veri, kullanıcıda "metin temizlendi" yanılgısı yaratabilir (R7). Takma ad tablosu ise bütün kimlikleri geri açabilen yeni bir hassas dosyadır (R8). Bu yüzden araç, kurumsal politika ve insan kontrolüyle birlikte kullanılmalıdır.`));

// ------------------------------------------------------------------ 6
add(h1('6. ÖNERİLEN ÇÖZÜM, SİSTEM TASARIMI VE YÖNTEM'));
add(h2('6.1. Tasarım İlkeleri ve Neden Bu Çözüm?'));
add(P(`Çözüm, GDPR m.25'teki <b>tasarımdan itibaren gizlilik</b> (Privacy by Design) fikrine dayanır: Veri, kurumdan çıktıktan sonra değil, çıkmadan önce korunur. Tasarımda dört ilke izlenmiştir:`));
add(BULLET(`<b>Yerellik:</b> Araç hiçbir dış servise bağlanmaz; yeni bir veri aktarımı yaratmaz.`));
add(BULLET(`<b>Doğrulama:</b> Bir sayı, yalnızca biçimi değil kontrol hanesi de doğruysa kişisel veri sayılır. Böylece sipariş numarası gibi sayılar yanlışlıkla gizlenmez.`));
add(BULLET(`<b>Seçilebilir koruma:</b> Kullanıcı, amacına göre maskeleme, takma ad veya kaldırma seçer.`));
add(BULLET(`<b>Şeffaflık:</b> Araç neyi bulduğunu renkle gösterir ve neyi bulamayabileceğini açıkça belirtir.`));
add(P(`Alternatiflere göre bu çözüm ücretsizdir, kurulumu kolaydır, internet gerektirmez ve Türkiye'ye özgü verileri doğrular. Zayıf yanı, ad tespitinin bir sözlüğe bağlı olması ve dolaylı bilgileri ele almamasıdır.`));
add(h2('6.2. Sistem Mimarisi ve Çalışma Şekli'));
add(P(`Araç Python ile yazılmış, arayüzü Streamlit ile hazırlanmıştır (Şekil 2). Kullanıcı metni yapıştırır veya CSV/Excel dosyası yükler. Araç her veri türü için önce metinde uygun desenleri arar, sonra doğrulama yapar:`));
add(BULLET(`<b>T.C. kimlik no:</b> 11 hane ve resmî kontrol hanesi hesabı. <b>IBAN:</b> "TR" ile başlama ve uluslararası mod-97 kontrolü. <b>Kredi kartı:</b> Luhn algoritması.`));
add(BULLET(`<b>Doğum tarihi:</b> Geçerli bir tarih olmalı ve aynı cümlede "doğum", "doğumlu" gibi bir ifade geçmeli. Böylece fatura tarihleri ayrılır.`));
add(BULLET(`<b>Ad soyad:</b> 157 Türkçe adı içeren bir sözlük ve "Sayın", "Ad Soyad:" gibi ipuçları kullanılır.`));
add(BULLET(`<b>Hassas bilgi uyarısı:</b> Sağlık, din, sendika gibi 10 kategoride 41 kelime kökü aranır (örneğin "hasta" kökü "hastası", "hastanede" kelimelerini de yakalar).`));
add(FIG('docs/report/figures/sekil2_mimari.png', 2200, 1018, 'Aracın sistem mimarisi', 'Kaynak: Yazar tarafından hazırlanmıştır.', 560));
add(h2('6.3. Koruma Yöntemleri'));
add(TAB('Koruma yöntemlerinin karşılaştırılması', ['Yöntem', 'Geri açılabilir mi?', 'Verinin işe yararlığı', 'Hukuki durumu', 'Ne zaman kullanılır?'], [
  ['Maskeleme', 'Hayır, ama kalan parçalar ipucu verir', 'Orta', 'Kişi bulunabiliyorsa kişisel veri', 'Bir yazışmayı özetletirken'],
  ['Takma ad', 'Evet, kod tablosuyla', 'Yüksek: aynı kişiye hep aynı kod', 'GDPR\'a göre takma adlı veri; kurum için kişisel veri', 'Test verisi hazırlarken; ÜYZ yanıtını geri eşlerken'],
  ['Kaldırma', 'Hayır', 'Düşük', 'Doğrudan bilgiler açısından en güvenli', 'Dış araca gönderirken'],
], [1.6, 2.3, 2.2, 3, 2.9]));
add(P(`Maskelemede yıldız sayısı bilerek sabit tutulmuştur; gerçek uzunluk gösterilseydi adı tahmin etmek kolaylaşırdı. Takma ad tablosu arayüzde ayrı bir bölümde, uyarıyla gösterilir.`));
add(h2('6.4. Tamamlayıcı İdari Önlemler'));
add(P(`KVKK m.12 teknik ve idari önlemleri birlikte ister. Araçla birlikte şu önlemler önerilmektedir:`));
add(BULLET(`Hangi ÜYZ aracının hangi amaçla kullanılabileceğini belirleyen yazılı bir şirket politikası (KVK Kurumu, 2026a, s. 11).`));
add(BULLET(`Kişisel hesaplar yerine, veri koruma şartları sözleşmeyle belirlenmiş kurumsal hesaplar.`));
add(BULLET(`Çalışanlara, maskelenmiş verinin de kişisel veri olabileceğini anlatan kısa bir eğitim.`));
add(BULLET(`Hassas bilgi uyarısı alan metinlerin, ilgili cümleler çıkarılmadan dışarı gönderilmemesi.`));

// ------------------------------------------------------------------ 7
add(h1('7. TEKNİK VE HUKUKİ UYGULANABİLİRLİK'));
add(TAB('Çözümün uygulanabilirlik değerlendirmesi', ['Boyut', 'Değerlendirme'], [
  ['Teknik', 'Standart bir bilgisayarda internet olmadan çalışır. 113 otomatik test ve tekrarlanabilir bir ölçüm betiği vardır.'],
  ['Ekonomik', 'Lisans ücreti yoktur. Maliyet kurulum ve eğitimden ibarettir; önlenen risk 17 milyon TL\'ye varan idari para cezasıdır.'],
  ['Operasyonel', 'Çalışana bir ek adım getirir. Bu adımın atlanması R1 ve R2\'nin kalan riskinin ana nedenidir. İleride tarayıcı eklentisi olarak iş akışına gömülebilir.'],
  ['Hukuki', 'Yeni bir veri işleme veya aktarım yaratmaz; veriyi yalnızca kullanıcının bilgisayarında işler. "Anonimleştirme" iddia etmediği için yanlış bir uyum beyanına yol açmaz.'],
  ['Sürdürülebilirlik', 'Ad sözlüğü ve hassas kelime listesi ayrı dosyalardadır; kod değiştirmeden güncellenebilir. Mevzuat değişirse aracın kendisi değil, hangi yöntemin ne zaman kullanılacağını belirleyen politika güncellenir.'],
], [2, 10]));

// ------------------------------------------------------------------ 8
add(h1('8. UYGULAMA VE SENARYO ANALİZİ'));
add(h2('8.1. Senaryo'));
add(P(`Bir e-ticaret şirketinin müşteri hizmetleri çalışanı, bir iade talebine yanıt yazmak için müşteri kaydını ÜYZ aracına yapıştırmak istiyor. Kayıtta ad soyad, doğum tarihi, T.C. kimlik no, iki farklı yazımla aynı telefon, e-posta, IBAN, kart numarası ve müşterinin "diyabet hastası" ve "sendika üyesi" olduğu bilgisi var. Ayrıca kişisel veri olmayan bir sipariş numarası ve fatura tarihi de bulunuyor. Tüm bilgiler sentetiktir.`));
add(h2('8.2. Sonuçlar'));
add(P(`Araç metinde 8 kişisel veri buldu ve 3 hassas bilgi uyarısı verdi. Tablo 8 sonuçları, Şekil 3 ve Şekil 4 ise uygulamanın ekran görüntülerini göstermektedir.`));
add(TAB('Senaryo metninde yöntemlerin çıktıları', ['Veri', 'Orijinal', 'Maskeleme', 'Takma ad'], [
  ['Ad soyad', 'Fatma Yılmaz', 'F*** Y***', 'Person_1'],
  ['Doğum tarihi', '28.06.2005', '**.**.2005', 'Date_1'],
  ['T.C. kimlik no', '53321819608', '533******08', 'TCKN_1'],
  ['Telefon (2 yazım)', '0500 133 89 08 / +90 500 133 89 08', '500***8908 (ikisi de)', 'Phone_1 (ikisi de)'],
  ['E-posta', 'fatma.yilmaz@example.com', 'f***@example.com', 'Email_1'],
  ['IBAN', 'TR53 0011 1086 3794 0265 4235 11', 'TR53 **** **** **** **** **35 11', 'IBAN_1'],
  ['Kart', '4615 5940 7816 1842', '**** **** **** 1842', 'Card_1'],
  ['Hassas bilgi', '"diyabet hastası", "sendika üyesi"', '<b>Değişmez</b> (uyarı verilir)', '<b>Değişmez</b> (uyarı verilir)'],
  ['Sipariş no', '12345678951 (geçersiz kimlik no)', 'Değişmez (doğru)', 'Değişmez (doğru)'],
], [2.2, 3.6, 3.2, 2.2], 'Kaldırma yönteminde bulunan 8 verinin tamamı [REMOVED] olarak değiştirilmiştir.'));
add(FIG('docs/screenshots/text-masking.png', 1826, 627, 'Bulunan verilerin renkle gösterilmesi ve maskeleme', 'Kaynak: Uygulamanın ekran görüntüsü (sentetik veri).', 500));
add(FIG('docs/screenshots/risk-report.png', 1800, 742, 'Risk raporu ve hassas bilgi uyarıları', 'Kaynak: Uygulamanın ekran görüntüsü (sentetik veri).', 500));
add(P(`Aynı işlem 11 satırlık sentetik bir Excel tablosunda da denenmiştir: 77 kişisel veri bulunmuş ve her müşteri tüm sütunlarda aynı takma adı almıştır. Bu çıktı, gerçek veri yerine test ortamında kullanılabilir.`));
add(h2('8.3. Hukuki Değerlendirme'));
add(P(`Senaryo üç şeyi göstermektedir. <b>Birincisi</b>, kontrol hanesi doğrulaması sayesinde sipariş numarası yanlışlıkla gizlenmemiş, metnin işe yarar kısmı korunmuştur. <b>İkincisi</b>, aynı telefonun iki farklı yazımı aynı takma adı almıştır; ÜYZ'den gelen yanıt kurum içinde kod tablosuyla doğru kişiye geri eşlenebilir. <b>Üçüncüsü ve en önemlisi</b>, gizlenmiş metinde "Person_1 ... diyabet hastası ... sendika üyesi" bilgisi kalmaktadır. Bu, takma adlı bir kişiye ait hassas veridir ve KVKK m.6 kapsamındadır. Araç bu bilgiyi otomatik silmez, çünkü aynı kelimeler başka bir bağlamda kişisel veri olmayabilir; karar uyarıyı gören kişiye bırakılır.`));

// ------------------------------------------------------------------ 9
add(h1('9. BULGULAR, KARŞILAŞTIRMALI ANALİZ VE DEĞERLENDİRME'));
add(h2('9.1. Tespit Doğruluğu'));
add(P(`Aracın başarısı, cevabı önceden bilinen 200 sentetik belgede ölçülmüştür. Her belgede 7 türden birer kişisel veri ve kişisel veriye benzeyen 6 tuzak (kontrol hanesi bozuk numaralar, fatura tarihi, içinde ad geçen kurum adı gibi) vardır. İki ölçüt kullanılmıştır: <b>Kesinlik</b>, aracın "kişisel veri" dediklerinin ne kadarının gerçekten kişisel veri olduğunu; <b>duyarlılık</b> ise metindeki gerçek kişisel verilerin ne kadarının bulunduğunu gösterir.`));
add(TAB('Veri türlerine göre tespit doğruluğu (200 sentetik belge)', ['Veri türü', 'Metinde', 'Bulunan', 'Kaçırılan', 'Yanlış alarm', 'Kesinlik', 'Duyarlılık'], [
  ['Ad soyad', '200', '200', '0', '76', '%72,5', '%100'],
  ['T.C. kimlik no, telefon, e-posta, IBAN, kart, doğum tarihi (her biri)', '200', '200', '0', '0', '%100', '%100'],
  ['<b>Toplam</b>', '<b>1400</b>', '<b>1400</b>', '<b>0</b>', '<b>76</b>', '<b>%94,9</b>', '<b>%100</b>'],
], [4.2, 1.2, 1.2, 1.3, 1.4, 1.3, 1.4], 'Kaynak: scripts/evaluate.py çıktısı. Koruma sonrasında 1400 verinin hiçbiri tam hâliyle metinde kalmamıştır.'));
add(P(`Yanlış alarmların hepsi, içinde Türkçe bir ad geçen iki ifadeden gelmiştir: "Deniz Kuvvetleri" ve "Gül Sokak". Kontrol hanesi bozuk numaraların hiçbiri kişisel veri sayılmamıştır.`));
add(P(`Bu sonuçlar dikkatli yorumlanmalıdır. Test metinlerindeki 16 adın hepsi aracın sözlüğünde vardır; yani %100 duyarlılık yalnızca sözlükteki adlar için geçerlidir. Zor durumlar ayrıca 50'şer örnekle ölçülmüştür (Tablo 10):`));
add(TAB('Zor durumlarda tespit oranı', ['Durum', 'Örnek', 'Bulunan', 'Oran'], [
  ['Büyük harfle yazılmış ad (AHMET YILMAZ)', '50', '0', '<b>%0</b>'],
  ['Sözlükte olmayan ad, ipucu kelime yok', '50', '0', '<b>%0</b>'],
  ['Parantezli telefon ((0532) 123 45 67)', '50', '50', '%100'],
], [6, 1.3, 1.5, 1.3]));
add(P(`Resmî yazışmalarda adlar sık sık büyük harfle yazıldığı için bu, aracın <b>en önemli sınırlılığıdır</b> ve R7 riskinin somut kanıtıdır.`));
add(h2('9.2. Önlem Öncesi ve Sonrası Risk'));
add(P(`Şekil 5, Tablo 5'teki risklerin önlemlerden önceki ve sonraki yerini göstermektedir. Çok yüksek düzeydeki iki risk (R1, R2) orta düzeye inmiş, test ortamı (R4) ve model çıktısı (R5) riskleri düşük düzeye gerilemiştir. Yeni çıkan iki risk de dahil toplam risk skoru 88'den 55'e düşmüştür. Ancak hassas veri riski (R3) yüksek kalmış, dolaylı bilgi riski (R6) değişmemiştir.`));
add(FIG('docs/report/figures/sekil3_risk_matrisi.png', 2200, 982, 'Önlemlerden önce (a) ve sonra (b) risk matrisi', 'Kaynak: Yazar tarafından Tablo 5\'teki puanlarla hazırlanmıştır.', 560));
add(h2('9.3. Değerlendirme'));
add(P(`Araç, Türkiye'ye özgü doğrudan kimlik bilgilerini bulmada sentetik veride başarılıdır. Ancak hukuken en ağır sonucu doğuran iki alanda, yani hassas veriler ve dolaylı bilgilerde, sınırlı kalmaktadır. Bu durum literatürle uyumludur: Doğrudan kimlik bilgilerini silmek gereklidir ama yeterli değildir (Sweeney, 2002; Ohm, 2010).`));

// ------------------------------------------------------------------ 10
add(h1('10. SONUÇ VE ÖNERİLER'));
add(h2('10.1. Sonuç'));
add(P(`Bu proje, ÜYZ araçlarının iş yerinde kontrolsüz kullanımını verinin izlediği somut bir yol olarak incelemiştir. Hukuki açıdan, maskeleme ve takma adlandırmanın KVKK'daki anonimleştirme tanımını karşılamadığı ve KVKK'da takma adlandırma konusunda bir boşluk olduğu gösterilmiştir. Teknik açıdan, Türkiye'ye özgü verileri doğrulayan, internetsiz çalışan, test edilmiş ve başarısı ölçülmüş açık kaynaklı bir araç geliştirilmiştir. Temel sonuç şudur: Araç riskleri belirgin biçimde azaltır, ancak tek başına KVKK uyumu sağlamaz; şirket politikası ve insan kontrolüyle birlikte kullanılmalıdır.`));
add(h2('10.2. Sınırlılıklar'));
add(BULLET(`Büyük harfle yazılmış ve sözlükte olmayan adlar bulunamamaktadır.`));
add(BULLET(`Adres, plaka, sabit telefon ve dolaylı bilgiler (yaş, meslek, şehir) tespit edilmemektedir.`));
add(BULLET(`Hassas bilgiler yalnızca anahtar kelimeyle, anlamı anlaşılmadan işaretlenmektedir.`));
add(BULLET(`Ölçüm sentetik verilerle yapılmıştır; gerçek belgelerde başarı daha düşük olabilir. Risk puanları da yazarın değerlendirmesidir.`));
add(h2('10.3. Öneriler'));
add(BULLET(`<b>Şirketlere:</b> ÜYZ kullanım politikası hazırlanmalı, kurumsal hesaplar kullanılmalı ve bu tür bir ara adım zorunlu hâle getirilmelidir.`));
add(BULLET(`<b>KVK Kurumu'na:</b> Takma adlandırmayı tanımlayan ve takma adlı verinin karşı taraf açısından durumunu açıklayan bir rehber yayımlanması hukuki belirsizliği azaltacaktır.`));
add(BULLET(`<b>Geliştirme için:</b> Büyük harf desteği, Türkçe ad tanıma modeli, dolaylı bilgiler için risk göstergesi ve tarayıcı eklentisi eklenebilir; araç gerçek ve uygun biçimde anonimleştirilmiş Türkçe belgelerle test edilmelidir.`));

// ------------------------------------------------------------------ 11
add(h1('11. YAPAY ZEKÂ ARAÇLARININ KULLANIMI BEYANI'));
add(P(`Bu projede Claude (Anthropic) üretken yapay zekâ aracı; yazılım geliştirmede kod önerisi ve hata ayıklama, kaynak araştırmasının planlanması, rapor taslağının ve şekillerin hazırlanması aşamalarında yardımcı olarak kullanılmıştır. Rapordaki kanun maddeleri, Resmî Gazete bilgileri, ceza tutarları, KVK Kurumu alıntıları, AB düzenlemeleri, mahkeme kararı ve akademik kaynaklar öğrenci tarafından Mevzuat Bilgi Sistemi, Resmî Gazete, KVK Kurumu, EUR-Lex ve yayıncı sayfalarından tek tek doğrulanmıştır. Ölçüm sonuçları proje deposundaki betik çalıştırılarak elde edilmiştir. Yapay zekâ aracına gerçek kişisel veri girilmemiştir. Rapordaki hukuki değerlendirmeler kesin hukuki görüş niteliğinde değildir.`));
};
