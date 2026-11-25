import re
from dataclasses import dataclass
from pathlib import Path

from kvkk.validation import is_valid_date, is_valid_iban, is_valid_luhn, is_valid_tckn


@dataclass
class Finding:
    # Metinde bulunan tek bir kişisel veriyi temsil eder.
    kind: str     # Veri türü: "EMAIL", "PHONE", ...
    value: str    # Metinde geçtiği haliyle değer
    start: int    # Metindeki başlangıç indeksi
    end: int      # Metindeki bitiş indeksi (dahil değil, Python dilimleme mantığı)


# E-posta: kullanıcı adı @ alan adı . uzantı
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

# Türkiye cep telefonu: isteğe bağlı +90 / 0090 / 0 öneki, ardından 5XX XXX XX XX.
# Gruplar arasında boşluk veya tire olabilir. (?<![\d+]) ve (?!\d) sayesinde
# daha uzun bir sayının (örneğin 11 haneli TC) ortasından parça yakalanmaz.
# Baştaki isteğe bağlı "(" sayesinde "(0532) 123 45 67" parantezi dahil bütün olarak bulunur.
PHONE_PATTERN = re.compile(
    r"(?<![\d+])\(?"
    r"(?:(?:\+90|0090|0)[\s-]?)?"
    r"\(?5\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}"
    r"(?!\d)"
)

# TC kimlik: 0 ile başlamayan, tam olarak 11 haneli sayı.
TCKN_PATTERN = re.compile(r"(?<!\d)[1-9]\d{10}(?!\d)")

# TR IBAN: TR + 24 rakam; 4'erli gruplar arasında isteğe bağlı boşluk olabilir.
# Örnek: TR40 0006 1000 0000 0123 4567 89  veya  TR400006100000000123456789
IBAN_PATTERN = re.compile(r"\bTR\d{2}(?: ?\d{4}){5} ?\d{2}(?!\d)", re.IGNORECASE)

# Kart: 13-19 rakam, rakamlar arasında isteğe bağlı boşluk veya tire.
CARD_PATTERN = re.compile(r"(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)")

# Tarih: gg.aa.yyyy, gg/aa/yyyy veya gg-aa-yyyy
DATE_PATTERN = re.compile(r"(?<!\d)\d{2}[./-]\d{2}[./-]\d{4}(?!\d)")

# Bir tarihin "doğum tarihi" sayılması için yakınında geçmesi gereken ifadeler.
BIRTH_DATE_KEYWORDS = ["doğum", "dogum", "d.t", "d. tarihi", "birth"]
BIRTH_DATE_WINDOW = 20  # Tarihin önünde ve arkasında bakılacak karakter sayısı

# Cümle sonu: ardından boşluk/metin sonu gelen . ! ? ya da satır sonu.
# (?<!\b\w): tek harften sonraki nokta kısaltmadır ("D. Tarihi", "T.C."), cümle sonu sayılmaz.
# Tarihin içindeki noktalar ("30.04.1965") ardından boşluk gelmediği için sayılmaz.
SENTENCE_END = re.compile(r"(?<!\b\w)[.!?](?=\s|$)|\n")

# Çakışmada hangi türün kazanacağı: sayı küçük olan daha önceliklidir.
PRIORITY = {
    "IBAN": 1,
    "CREDIT_CARD": 2,
    "TCKN": 3,
    "PHONE": 4,
    "BIRTH_DATE": 5,
    "EMAIL": 6,
    "FULL_NAME": 7,
}

NAMES_PATH = Path(__file__).parent / "dictionaries" / "names.txt"


def load_first_names(path=NAMES_PATH):
    # Ad sözlüğünü okur; boş satırları ve # ile başlayan açıklama satırlarını atlar.
    names = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            names.append(line)
    return names


FIRST_NAMES = load_first_names()

# Büyük harfle başlayıp küçük harflerle devam eden Türkçe kelime: Yılmaz, Özdemir, İsmail
CAPITALIZED_WORD = r"[A-ZÇĞİÖŞÜ][a-zçğıöşü]+"

# Sözlükteki bir ad + aynı satırda boşlukla ayrılmış 1-2 büyük harfli kelime.
# Uzun adlar önce denensin diye sıralanır (yoksa "Oğuzhan" yerine "Oğuz" eşleşirdi).
NAME_PATTERN = re.compile(
    r"(?<!\w)(?:" + "|".join(sorted(FIRST_NAMES, key=len, reverse=True)) + r")"
    r"(?: " + CAPITALIZED_WORD + r"){1,2}(?!\w)"
)

# Adı sözlükte olmasa bile kişi adının geleceğini gösteren ipuçları; ad 1. gruptadır.
NAME_HINT_PATTERN = re.compile(
    r"(?:Sayın|Ad Soyad:|Adı Soyadı:|Hasta:) ?"
    r"(" + CAPITALIZED_WORD + r"(?: " + CAPITALIZED_WORD + r"){1,2})(?!\w)"
)


def _find_with_pattern(text, pattern, kind, validator=None):
    # Verilen regex desenine uyan parçaları Finding listesi olarak döndürür.
    # validator verilmişse, sadece doğrulamadan geçen adaylar listeye eklenir.
    findings = []
    for match in pattern.finditer(text):
        if validator is None or validator(match.group()):
            findings.append(Finding(kind, match.group(), match.start(), match.end()))
    return findings


def find_emails(text):
    # Metindeki e-posta adreslerini bulur.
    return _find_with_pattern(text, EMAIL_PATTERN, "EMAIL")


def find_phones(text):
    # Metindeki cep telefonu numaralarını bulur.
    return _find_with_pattern(text, PHONE_PATTERN, "PHONE")


def find_tckns(text):
    # Metindeki 11 haneli sayılardan TC kimlik algoritmasına uyanları bulur.
    return _find_with_pattern(text, TCKN_PATTERN, "TCKN", is_valid_tckn)


def find_ibans(text):
    # Metindeki TR IBAN'lardan mod-97 kontrolünü geçenleri bulur.
    return _find_with_pattern(text, IBAN_PATTERN, "IBAN", is_valid_iban)


def find_cards(text):
    # Metindeki rakam dizilerinden Luhn kontrolünü geçenleri kart numarası sayar.
    return _find_with_pattern(text, CARD_PATTERN, "CREDIT_CARD", is_valid_luhn)


def _has_birth_keyword_nearby(text, start, end):
    # Tarihin etrafındaki küçük bir pencerede "doğum" benzeri bir ifade var mı bakar.
    # Pencere cümle sınırında kesilir; yan cümledeki "doğumlu" kelimesi
    # ("Fatura tarihi: 24.08.2024. 30.04.1965 doğumlu.") fatura tarihini doğum tarihi yapmaz.
    before = text[max(0, start - BIRTH_DATE_WINDOW):start]
    after = text[end:end + BIRTH_DATE_WINDOW]
    # Öndeki parçada son cümle sonundan sonrası, arkadaki parçada ilk cümle sonuna kadarı kalır.
    boundaries = list(SENTENCE_END.finditer(before))
    if boundaries:
        before = before[boundaries[-1].end():]
    boundary = SENTENCE_END.search(after)
    if boundary:
        after = after[:boundary.start()]
    window = (before + after).lower()
    for keyword in BIRTH_DATE_KEYWORDS:
        if keyword in window:
            return True
    return False


def find_birth_dates(text):
    # Takvimde gerçekten var olan ve yakınında "doğum" ifadesi geçen tarihleri bulur.
    # Bağlamı olmayan tarihler (ör. fatura tarihi) kişisel veri sayılmaz.
    findings = []
    for finding in _find_with_pattern(text, DATE_PATTERN, "BIRTH_DATE", is_valid_date):
        if _has_birth_keyword_nearby(text, finding.start, finding.end):
            findings.append(finding)
    return findings


def find_names(text):
    # Ad-soyadı iki basit kuralla bulur:
    # 1) Sözlükteki bir ad + ardından büyük harfli kelime(ler): "Ahmet Yılmaz geldi"
    # 2) "Sayın", "Ad Soyad:" gibi ipuçlarından sonra gelen büyük harfli kelimeler.
    # Sınırlılık: tamamı büyük harfle yazılmış ("AHMET YILMAZ") veya tek başına geçen adlar bulunmaz.
    findings = []
    for match in NAME_PATTERN.finditer(text):
        words = match.group().split(" ")
        # Üç kelimede ortadaki kelime bir ad değilse ("Ahmet Yılmaz Bey") sadece ilk ikisi alınır.
        if len(words) == 3 and words[1] not in FIRST_NAMES:
            words = words[:2]
        value = " ".join(words)
        findings.append(Finding("FULL_NAME", value, match.start(), match.start() + len(value)))
    for match in NAME_HINT_PATTERN.finditer(text):
        findings.append(Finding("FULL_NAME", match.group(1), match.start(1), match.end(1)))
    # İki kural aynı adı bulursa çakışma çözümü tekini bırakır.
    return findings


def overlaps(first, second):
    # İki bulgunun metinde en az bir karakteri ortak mı kontrol eder.
    # Uç uca değen bulgular (biri bittiği yerde öteki başlıyorsa) çakışmış sayılmaz.
    return first.start < second.end and second.start < first.end


def resolve_overlaps(findings):
    # Çakışan bulgulardan sadece birini tutar; kazananı PRIORITY sözlüğü belirler.
    # Örnek: Boşluklu bir IBAN'ın içindeki rakamlar Luhn'dan geçip kart sanılabilir,
    # bu durumda IBAN kalmalı, kart bulgusu atılmalı.
    # 1) Önemliden önemsize sırala. Öncelik eşitse uzun olan bulgu önce gelir
    #    (eksi işareti uzunluğu büyükten küçüğe sıralatır).
    ordered = sorted(findings, key=lambda f: (PRIORITY[f.kind], -(f.end - f.start)))

    # 2) Sırayla her bulguya bak; tutulanlardan biriyle çakışıyorsa atla.
    kept = []
    for finding in ordered:
        has_conflict = False
        for kept_finding in kept:
            if overlaps(finding, kept_finding):
                has_conflict = True
                break
        if not has_conflict:
            kept.append(finding)
    return kept


def find_all(text):
    # Tüm veri türlerini arar, çakışmaları çözer ve bulguları metindeki sıraya göre döndürür.
    findings = (
        find_ibans(text)
        + find_cards(text)
        + find_tckns(text)
        + find_phones(text)
        + find_birth_dates(text)
        + find_emails(text)
        + find_names(text)
    )
    findings = resolve_overlaps(findings)
    findings.sort(key=lambda f: f.start)
    return findings
