import re


def digits_only(value):
    # Bir metindeki rakam dışı tüm karakterleri (boşluk, tire, +, parantez) atar.
    # Regex'te:
    # \d → rakam demektir. Örneğin 0, 5, 9.
    # \D → rakam olmayan karakter demektir.
    return re.sub(r"\D", "", value)


def _mask_phone(value):
    # 0532 123 45 67 -> 532***4567 (ilk 3 ve son 4 hane görünür kalır).
    digits = digits_only(value)[-10:]
    return digits[:3] + "***" + digits[-4:]


def _mask_email(value):
    # ahmet@ornek.com -> a***@ornek.com (kullanıcı adının ilk harfi kalır).
    local_part, domain = value.split("@", 1)
    return local_part[0] + "***@" + domain


def _mask_digits(value, keep_first, keep_last):
    # Değerdeki rakamları yıldızlar; baştan keep_first ve sondan keep_last rakam görünür kalır.
    # Rakam olmayan karakterler (boşluk, nokta, "TR") olduğu gibi bırakılır,
    # böylece maskelenmiş değer orijinal yazım biçimini korur.
    total_digits = len(digits_only(value))
    result = ""
    digit_index = 0
    for char in value:
        if char.isdigit():
            if digit_index < keep_first or digit_index >= total_digits - keep_last:
                result += char
            else:
                result += "*"
            digit_index += 1
        else:
            result += char
    return result


def mask(finding):
    # Bulgunun türüne göre uygun maskeleme kuralını uygular.
    if finding.kind == "PHONE":
        return _mask_phone(finding.value)
    if finding.kind == "EMAIL":
        return _mask_email(finding.value)
    if finding.kind == "TCKN":
        # 12345678950 -> 123******50
        return _mask_digits(finding.value, 3, 2)
    if finding.kind == "IBAN":
        # TR40 0006 1000 ... 4567 89 -> TR40 **** **** ... **67 89 (kontrol haneleri ve son 4 hane)
        return _mask_digits(finding.value, 2, 4)
    if finding.kind == "CREDIT_CARD":
        # PCI DSS'e uygun olarak sadece son 4 hane görünür: **** **** **** 1111
        return _mask_digits(finding.value, 0, 4)
    if finding.kind == "BIRTH_DATE":
        # 15.06.1990 -> **.**.1990 (genelleştirme: sadece yıl kalır)
        return _mask_digits(finding.value, 0, 4)
    # Henüz özel kuralı olmayan türler tamamen yıldızlanır.
    return "*" * len(finding.value)


def normalize(finding):
    # Aynı verinin farklı yazımlarını tek bir biçime indirger.
    # Örnek: "0532 123 45 67" ve "+905321234567" -> "5321234567"
    # Takma ad tablosu bu değeri anahtar olarak kullanır.
    if finding.kind == "PHONE":
        return digits_only(finding.value)[-10:]
    if finding.kind in ("TCKN", "CREDIT_CARD", "BIRTH_DATE"):
        # 15.06.1990 ve 15/06/1990 aynı tarihtir; sadece rakamlara bakarız.
        return digits_only(finding.value)
    if finding.kind == "IBAN":
        return finding.value.replace(" ", "").upper()
    # E-posta ve ad-soyad gibi metinsel türlerde büyük/küçük harf farkı önemsizdir.
    return finding.value.strip().lower()


# Takma ad kodlarının önekleri: Phone_1, Person_2 ...
PSEUDONYM_PREFIX = {
    "PHONE": "Phone",
    "EMAIL": "Email",
    "TCKN": "TCKN",
    "IBAN": "IBAN",
    "CREDIT_CARD": "Card",
    "BIRTH_DATE": "Date",
    "FULL_NAME": "Person",
}


class PseudonymTable:
    # Gerçek değer -> takma ad eşlemesini tutar.
    # Aynı değer (normalize edilmiş hali) her zaman aynı kodu alır.
    # Hukuki not: Bu tablo var olduğu sürece veri hâlâ kişisel veridir;
    # tablo korunmuş veriden ayrı saklanmalıdır.

    def __init__(self):
        # Kurucu: boş bir eşleme sözlüğü ve tür başına sayaçlarla başlar.
        self.codes = {}     # (kind, normalize edilmiş değer) -> "Phone_1"
        self.counters = {}  # kind -> o türde şimdiye kadar verilen kod sayısı
        self.originals = {}  # "Phone_1" -> metinde ilk görülen orijinal yazım

    def get_code(self, finding):
        # Bulgunun takma adını döndürür; daha önce görülmediyse yeni kod üretir.
        key = (finding.kind, normalize(finding))
        prefix = PSEUDONYM_PREFIX.get(finding.kind, finding.kind)

        # Bu değer daha önce görüldüyse aynı kodu veririz.
        if key in self.codes:
            return self.codes[key]

        # İlk kez görüldü: bu türün sayacını bir artırıp yeni kod üretiriz.
        number = self.counters.get(finding.kind, 0) + 1
        self.counters[finding.kind] = number
        code = f"{prefix}_{number}"

        self.codes[key] = code
        self.originals[code] = finding.value
        return code

    def mapping(self):
        # Arayüzde gösterilecek eşleme listesini döndürür: [(kod, orijinal değer), ...]
        return list(self.originals.items())


REMOVED_TEXT = "[REMOVED]"


def protect_text(text, findings, method="mask", table=None):
    # Metindeki tüm bulguları seçilen yönteme göre değiştirir.
    # method: "mask" (maskeleme), "pseudonym" (takma ad) veya "remove" (silme).
    # table: takma ad için kullanılacak PseudonymTable. Verilmezse yenisi açılır;
    # birden çok metin/hücrede tutarlı kod için aynı tablo dışarıdan verilmelidir.
    # Değiştirmeyi sondan başa yapıyoruz: böylece öndeki bulguların
    # start/end indeksleri, arkadaki değişikliklerden etkilenmez.
    if method not in ("mask", "pseudonym", "remove"):
        raise ValueError("Unknown protection method: " + method)
    if table is None:
        table = PseudonymTable()

    # Kodlar metindeki okuma sırasına göre verilsin diye (ilk geçen kişi Person_1)
    # takma adları önce baştan sona sırayla üretiyoruz.
    if method == "pseudonym":
        for finding in sorted(findings, key=lambda f: f.start):
            table.get_code(finding)

    result = text
    for finding in sorted(findings, key=lambda f: f.start, reverse=True):
        if method == "mask":
            replacement = mask(finding)
        elif method == "pseudonym":
            replacement = table.get_code(finding)
        else:
            replacement = REMOVED_TEXT
        result = result[:finding.start] + replacement + result[finding.end:]
    return result
