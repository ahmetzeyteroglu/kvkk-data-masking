# Kaynaklar ve Mevzuat Haritası (2. adım: hukuki araştırma)

Bu dosya rapordaki "Literatür Araştırması" ve "İlgili Mevzuat" bölümlerinin hammaddesidir.
Her kaynağın varlığı ve künyesi web araması ve akademik veri tabanı (Consensus) ile kontrol edildi.

**Doğrulama durumu:**
- ✅ Künye birden fazla bağımsız kaynakla (resmî site, yayıncı, DOI) teyit edildi.
- 🟡 Varlığı teyit edildi; ama ayrıntılar ikincil kaynaklardan (hukuk bürosu, haber) geldi. Rapora yazmadan önce resmî metni **sen aç ve oku**.

> Hocanın 7. bölümdeki şartı: Mevzuat Resmî Gazete, mevzuat.gov.tr, kvkk.gov.tr ve EUR-Lex'ten doğrulanmalı.
> Aşağıda "Sen kontrol et" sütunu bu yüzden var. Her satırı açıp işaretle.

---

## 1. Türk mevzuatı

| # | Kaynak (raporda atıf biçimi) | Projede neyi destekliyor | Durum | Sen kontrol et |
|---|---|---|---|---|
| T1 | 6698 sayılı Kişisel Verilerin Korunması Kanunu, RG 07.04.2016, S. 29677 | Ana kanun | ✅ | ☑ mevzuat.gov.tr |
| T1a | KVKK m.3 (tanımlar: kişisel veri, anonim hâle getirme) | Maskeleme/takma ad ≠ anonimleştirme tartışması | ✅ | ☑ |
| T1b | KVKK m.4/2 (genel ilkeler; özellikle "amaçla bağlantılı, sınırlı ve ölçülü olma") | Veri minimizasyonu: test ortamına/YZ aracına gereğinden fazla veri gitmesi | ✅ | ☑ |
| T1c | KVKK m.5 ve m.6 (işleme şartları; özel nitelikli veri), **m.6, 7499 sayılı Kanun m.33 ile değişik** | Risk raporundaki sağlık, sendika vb. uyarıları | ✅ | ☑ |
| T1d | KVKK m.7 (silme, yok etme, anonim hâle getirme) | "Kaldırma" yöntemi ve aracın sınırı | ✅ | ☑ |
| T1e | KVKK m.9 (yurt dışına aktarım), **7499 sayılı Kanun m.34 ile değişik**, RG 12.03.2024, S. 32487; yürürlük 01.06.2024 | Yurt dışı sunuculu YZ araçlarına veri yapıştırmak = yurt dışına aktarım riski | ✅ | ☑ |
| T1f | KVKK m.12 (veri güvenliği: teknik ve idari tedbirler) | Aracın kendisi bir "teknik tedbir" önerisi | ✅ | ☑ |
| T1g | KVKK m.18 (idari para cezaları) | Risk analizindeki "etki" boyutu | ✅ | ☑ 2026 tutarları aşağıdaki tabloda |
| T2 | Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik, RG 28.10.2017, S. 30224 (yürürlük 01.01.2018; RG 28.04.2019, S. 30758 ile değişik) | Anonimleştirmenin tanımı ve yöntemleri | ✅ | ☑ |
| T3 | Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik, RG 10.07.2024, S. 32598 | m.9 senaryosunun ayrıntısı | ✅ | ☑ |
| T4 | 5237 sayılı Türk Ceza Kanunu m.135–138 (kişisel verilerin kaydedilmesi, hukuka aykırı verme/ele geçirme, verileri yok etmeme) | Çalışanın veriyi izinsiz dış araca vermesinin cezai boyutu | ✅ | ☑ |

**7499 sayılı Kanun tarihleri (raporda karıştırma):** kabul 02.03.2024 · Resmî Gazete 12.03.2024, S. 32487 · KVKK değişikliklerinin yürürlüğü **01.06.2024**. Raporda "değişik" derken RG tarihini, "yürürlük" derken 01.06.2024'ü yaz.

**KVKK m.18, 2026 idari para cezaları** (2025 tutarları × %25,49 yeniden değerleme; hesapla teyit edildi):

| Bent | Yükümlülük | Alt sınır | Üst sınır |
|---|---|---|---|
| 18/1-a | Aydınlatma (m.10) | 85.437 TL | 1.709.200 TL |
| 18/1-b | Veri güvenliği (m.12) | 256.357 TL | 17.092.242 TL |
| 18/1-c | Kurul kararlarına uymama (m.15) | 427.263 TL | 17.092.242 TL |
| 18/1-ç | VERBİS (m.16) | 341.809 TL | 17.092.242 TL |
| 18/1-d | m.9/5 **standart sözleşmeyi Kurum'a bildirmeme** | 90.308 TL | 1.806.177 TL |

> 18/1-d yalnızca bildirim yükümlülüğünün cezasıdır, hukuka aykırı yurt dışı aktarımın kendisinin cezası değildir.
> Bizim senaryoda (veri güvenliği tedbiri alınmadan veri dışarı gidiyor) ilgili bent **18/1-b**'dir.

## 2. KVK Kurumu rehberleri ve duyuruları

| # | Kaynak | Projede neyi destekliyor | Durum | Sen kontrol et |
|---|---|---|---|---|
| K1 | KVK Kurumu (2018). *Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Rehberi*. | Maskeleme, değişken çıkarma gibi tekniklerin Kurum'daki tanımı | ✅ | ☑ Maskeleme tanımı s. 13 |
| K2 | KVK Kurumu (2025, Kasım). *Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi (15 Soruda)*. kvkk.gov.tr/Icerik/8547 | Problem tanımı: üretken YZ ve kişisel veri | ✅ | ☑ |
| K3 | KVK Kurumu (2026, 5 Mart). *İş Yerlerinde Üretken Yapay Zekâ Araçlarının Kullanımı*. kvkk.gov.tr/Icerik/8674 | **En önemli kaynak.** "Gölge yapay zekâ" (Shadow AI) riski; Kurum'un kendisi anonimleştirilmiş/genelleştirilmiş veri kullanmayı öneriyor. Projenin çıkış noktası bu. | ✅ | ☑ Alıntı: "Kurumsal kontrol dışında kullanılan ÜYZ araçları ile kişisel verilerin paylaşılması, veri ihlali riskini artırabilmektedir. Bu tür kullanımlar, kişisel verilerin hukuka aykırı şekilde işlenmesi, yetkisiz kişilerce erişilebilir hâle gelmesi veya amaç dışı kullanılması gibi sonuçlara yol açabilmektedir." ☐ **Sayfa numarasını ekle** (doğrudan alıntıda APA 7 sayfa ister) |
| K4 | KVK Kurumu (2025, Nisan). *Yapay Zekâ Alanında Kişisel Verilerin Korunmasına Dair Tavsiyeler* | Privacy by Design bağlantısı | ✅ | ☑ Nisan 2025 (gün yok, atıf: KVK Kurumu, 2025) |

## 3. Avrupa Birliği

| # | Kaynak | Projede neyi destekliyor | Durum | Sen kontrol et |
|---|---|---|---|---|
| A1 | Regulation (EU) 2016/679 (GDPR), OJ L 119, 4.5.2016 | Karşılaştırma tablosu | ✅ | ☑ OJ L 119/1, 4.5.2016 |
| A1a | GDPR m.4(1), m.4(5) (kişisel veri; takma adlandırma tanımı), Gerekçe (Recital) 26 | KVKK'da takma adlandırmanın tanımı **yok**, GDPR'da var: karşılaştırmanın ana farkı | ✅ | ☑ |
| A1b | GDPR m.5(1)(c) veri minimizasyonu, m.25 Privacy by Design/Default, m.32 güvenlik | Önerilen çözümün hukuki gerekçesi. m.32(1)(a) takma adlandırma ve şifrelemeyi açıkça tedbir olarak sayıyor | ✅ | ☑ |
| A2 | EDPB (2025). *Guidelines 01/2025 on Pseudonymisation* (16.01.2025'te kabul, kamuoyu görüşüne açıldı) | Takma adlandırmanın riski azaltan ama kişisel veri niteliğini kaldırmayan bir tedbir olduğu | ✅ | ☑ Nihai sürüm yok. Atıf: "Version 1.0, adopted – version for public consultation" |
| A3 | ABAD, C-413/23 P, *EDPS v SRB*, 04.09.2025, ECLI:EU:C:2025:645 | Takma adlı veri, yeniden tanımlama imkânı olmayan **alıcı** açısından kişisel veri sayılmayabilir. Bizim senaryoda takma ad tablosu şirkette kaldığı için YZ sağlayıcısının durumu tartışılabilir. Güçlü bir tartışma noktası. | ✅ | ☑ |
| A4 | Regulation (EU) 2024/1689 (AI Act), m.10 (veri ve veri yönetişimi) | Kısa not: yüksek riskli sistemlerde eğitim verisi kalitesi. (AB) 2026/1744 sayılı Tüzük (Digital Omnibus on AI, OJ L 24.07.2026) ile yüksek risk yükümlülükleri Ek-III için 02.12.2027, Ek-I için 02.08.2028'e ertelendi. | ✅ | ☑ Atıfta bendi değil "m.113, 2026/1744 sayılı Tüzük ile değişik" yaz. Bizim araç yüksek riskli YZ değil, raporda 1 paragraf. |

## 4. Akademik literatür (APA 7)

| # | Kaynak | Projede neyi destekliyor | Durum |
|---|---|---|---|
| L1 | Sweeney, L. (2002). k-anonymity: A model for protecting privacy. *International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems, 10*(5), 557–570. https://doi.org/10.1142/S0218488502001648 | Doğrudan tanımlayıcıları silmek yetmez; dolaylı tanımlayıcılar | ✅ |
| L2 | Ohm, P. (2010). Broken promises of privacy: Responding to the surprising failure of anonymization. *UCLA Law Review, 57*, 1701–1777. | Anonimleştirmenin hukuki varsayımının çöküşü | ✅ |
| L3 | Rocher, L., Hendrickx, J. M., & de Montjoye, Y.-A. (2019). Estimating the success of re-identifications in incomplete datasets using generative models. *Nature Communications, 10*, 3069. https://doi.org/10.1038/s41467-019-10933-3 | 15 demografik özellikle Amerikalıların %99,98'i yeniden tanımlanabiliyor | ✅ |
| L4 | Finck, M., & Pallas, F. (2020). They who must not be identified—distinguishing personal from non-personal data under the GDPR. *International Data Privacy Law, 10*(1), 11–36. | Anonim veride her zaman bir artık risk kalır | ✅ |
| L5 | Mourby, M., Mackey, E., Elliot, M., Gowans, H., Wallace, S. E., Bell, J., Smith, H., Aidinlis, S., & Kaye, J. (2018). Are 'pseudonymised' data always personal data? Implications of the GDPR for administrative data research in the UK. *Computer Law & Security Review, 34*(2), 222–233. | Takma adlı veri ne zaman kişisel veridir? (A3 ile birlikte) | ✅ ☑ |
| L6 | Pilán, I., Lison, P., Øvrelid, L., Papadopoulou, A., Sánchez, D., & Batet, M. (2022). The Text Anonymization Benchmark (TAB): A dedicated corpus and evaluation framework for text anonymization. *Computational Linguistics, 48*(4), 1053–1101. | Bizim ölçüm yöntemimizin (cevap anahtarı, kesinlik/duyarlılık) akademik karşılığı | ✅ ☑ |
| L7 | Stalla-Bourdillon, S. (2025). Identifiability, as a data risk: Is a uniform approach to anonymisation about to emerge in the EU? *European Journal of Risk Regulation, 16*(4), 1456–1474. https://doi.org/10.1017/err.2025.16 | EDPB 01/2025 ve güncel ABAD içtihadının değerlendirmesi | ✅ ☑ |

## 5. Örnek olay

| # | Kaynak | Kullanım | Durum |
|---|---|---|---|
| O1 | Samsung çalışanlarının 2023'te ChatGPT'ye şirket içi kaynak kodu yüklemesi ve ardından gelen yasak (Bloomberg, 02.05.2023; The Register, 02.05.2023) | "Gölge YZ" riskinin gerçek dünyadaki örneği. **Dikkat:** sızan veri kişisel veri değil, ticari sırdı. Raporda "aynı mekanizma kişisel veri için de geçerli" diye kurgula, "Samsung kişisel veri sızdırdı" deme. | ✅ |

---

## 6. Madde → Risk → Araç özelliği haritası

Bu tablo raporun 7. bölümünün (hukuki risk analizi) ve 8. bölümünün (önerilen çözüm) iskeletidir.

| Hüküm | Sistemdeki uygulama (riskli durum) | Olası ihlal | Aracın karşılığı | Kalan risk |
|---|---|---|---|---|
| KVKK m.4/2-ç, GDPR m.5(1)(c) | Çalışan müşteri kaydını olduğu gibi YZ aracına yapıştırıyor | Veri minimizasyonu | Tespit + maskeleme/kaldırma | Dolaylı tanımlayıcılar (yaş, şehir, meslek) tespit edilmiyor |
| KVKK m.5 | Test ortamında gerçek müşteri verisi kullanımı için hukuki dayanak yok | Hukuka aykırı işleme | Takma ad ile tutarlı test verisi | Takma adlı veri hâlâ kişisel veri (m.3; GDPR Recital 26) |
| KVKK m.6 | Serbest metinde sağlık/sendika bilgisi | Özel nitelikli veri ihlali | Anahtar kelime uyarısı | Otomatik silinmiyor, insan kararı gerekiyor |
| KVKK m.9 (7499 s. K. ile değişik) | Yurt dışı sunuculu YZ servisi | Hukuka aykırı yurt dışına aktarım | Veri çıkmadan önce yerelde maskeleme | Maskelenmiş veri kişisel veri olarak kalırsa aktarım şartları yine gerekli olabilir. A3 kararı burada tartışılacak. |
| KVKK m.12 | Teknik tedbir yok | Veri güvenliği yükümlülüğü | Aracın kendisi teknik tedbir | Araç tek başına uyum sağlamaz, idari tedbir (politika, eğitim) de gerekir (K3) |
| KVKK m.7, Silme Yönetmeliği | Anonimleştirme iddiası | Yanlış "anonim" beyanı | README ve raporda açıkça "anonimleştirme değil" deniyor | — |

## 7. Teslime kadar plan (teslim: 2 Aralık 2026 Çarşamba)

| Gün | İş |
|---|---|
| 25 Kas Çar | ✅ Kaynak doğrulama ve bu harita |
| 26 Kas Per | ✅ Sen: resmî kaynak kontrolleri. Ben: rapor iskeleti + görseller (veri akışı, mimari, risk matrisi, KVKK–GDPR tablosu) |
| 27 Kas Cum | Ben: rapor 1–6. bölüm taslağı. Sen: oku, düzelt |
| 28–29 Kas Hafta sonu | Ben: rapor 7–12. bölüm taslağı. Sen: oku, kendi cümlelerinle yeniden yaz (özellikle Sonuç) |
| 30 Kas Pzt | Ben: PowerPoint (12–15 slayt) |
| 1 Ara Sal | Sen: son okuma, YZ kullanım beyanı. Birlikte: dosya adları, ZIP |
| 2 Ara Çar | Yedek gün, teslim |
