import random

from kvkk.detection import (
    Finding,
    find_all,
    find_birth_dates,
    find_cards,
    find_emails,
    find_ibans,
    find_phones,
    find_tckns,
    resolve_overlaps,
)
from scripts.generate_fake_data import build_sample_text, fake_person

# İçindeki "20 0011 1017 3008 6914" parçası Luhn'dan geçen gerçek bir çakışma örneği
# (sahte veri üreticisiyle bulundu).
IBAN_WITH_HIDDEN_CARD = "TR20 0011 1017 3008 6914 1314 56"


# ---------- E-posta ----------

def test_email_is_found():
    findings = find_emails("İletişim: deneme.kisi@ornek.com adresine yazın.")
    assert len(findings) == 1
    assert findings[0].value == "deneme.kisi@ornek.com"


def test_text_without_email():
    assert find_emails("Bu metinde @ işareti var ama adres yok.") == []


# ---------- Telefon ----------

def test_phone_format_variations():
    samples = [
        "0532 123 45 67",
        "05321234567",
        "+90 532 123 45 67",
        "+905321234567",
        "0090 532 123 45 67",
        "532-123-45-67",
    ]
    for sample in samples:
        findings = find_phones("Tel: " + sample + " arayın")
        assert len(findings) == 1, sample
        assert findings[0].value == sample


def test_non_phone_numbers_are_ignored():
    # 5 ile başlamayan 10 hane ve 11 haneli bir sayının içi telefon sayılmamalı
    assert find_phones("Sipariş no: 1234567890") == []
    assert find_phones("Numara: 53212345678") == []


# ---------- Birlikte ----------

def test_find_all_returns_sorted():
    text = "Tel 0532 123 45 67, posta a@ornek.com"
    findings = find_all(text)
    assert [f.kind for f in findings] == ["PHONE", "EMAIL"]
    # Konumlar metindeki gerçek değeri göstermeli
    for f in findings:
        assert text[f.start:f.end] == f.value


# ---------- TC Kimlik ----------

def test_valid_tckn_is_found():
    findings = find_tckns("TC: 12345678950 olarak kayıtlı.")
    assert [f.value for f in findings] == ["12345678950"]


def test_invalid_tckn_is_ignored():
    # Kontrol hanesi yanlış: sipariş numarası gibi sıradan bir sayı
    assert find_tckns("Sipariş no: 12345678951") == []
    # 12 haneli sayının içinden 11 hane alınmamalı
    assert find_tckns("Ref: 123456789501") == []


# ---------- IBAN ----------

def test_iban_spaced_and_compact():
    assert len(find_ibans("Hesap: TR40 0006 1000 0000 0123 4567 89.")) == 1
    assert len(find_ibans("Hesap: TR400006100000000123456789.")) == 1


def test_invalid_iban_is_ignored():
    assert find_ibans("Hesap: TR41 0006 1000 0000 0123 4567 89") == []


# ---------- Kart ----------

def test_valid_card_is_found():
    findings = find_cards("Kart: 4111 1111 1111 1111, son kullanma 12/30")
    assert [f.value for f in findings] == ["4111 1111 1111 1111"]


def test_invalid_card_is_ignored():
    assert find_cards("Kart: 4111 1111 1111 1112") == []


# ---------- Doğum tarihi ----------

def test_birth_date_with_context():
    assert len(find_birth_dates("Doğum tarihi: 15.06.1990")) == 1
    assert len(find_birth_dates("15/06/1990 doğumlu")) == 1


def test_date_without_context_is_ignored():
    assert find_birth_dates("Fatura tarihi: 15.03.2024") == []


def test_impossible_date_is_ignored():
    assert find_birth_dates("Doğum tarihi: 31.02.1990") == []


# ---------- Çakışma çözümü ----------

def test_resolve_overlaps_keeps_higher_priority():
    iban = Finding("IBAN", "x" * 32, 0, 32)
    card = Finding("CREDIT_CARD", "x" * 21, 2, 23)
    assert resolve_overlaps([card, iban]) == [iban]


def test_resolve_overlaps_keeps_separate_findings():
    tckn = Finding("TCKN", "x" * 11, 0, 11)
    phone = Finding("PHONE", "x" * 14, 20, 34)
    result = resolve_overlaps([tckn, phone])
    assert len(result) == 2


def test_resolve_overlaps_touching_findings_are_not_overlap():
    # Biri 11'de bitiyor, öteki 11'de başlıyor: ortak karakter yok
    first = Finding("TCKN", "x" * 11, 0, 11)
    second = Finding("PHONE", "x" * 10, 11, 21)
    assert len(resolve_overlaps([first, second])) == 2


def test_card_hidden_in_iban_is_not_reported():
    # Kart deseni tek başına IBAN'ın içinden bir kart bulur...
    assert len(find_cards(IBAN_WITH_HIDDEN_CARD)) == 1
    # ...ama find_all çakışmayı çözüp sadece IBAN'ı raporlamalı
    findings = find_all("Hesap: " + IBAN_WITH_HIDDEN_CARD)
    assert [f.kind for f in findings] == ["IBAN"]


# ---------- Uçtan uca: örnek metin ----------

def test_sample_text_finds_every_kind_once_or_twice():
    random.seed(42)
    text = build_sample_text(fake_person())
    kinds = [f.kind for f in find_all(text)]
    # Telefon metinde iki farklı biçimde geçiyor
    assert sorted(kinds) == sorted(
        ["FULL_NAME", "BIRTH_DATE", "TCKN", "PHONE", "EMAIL", "IBAN", "CREDIT_CARD", "PHONE"]
    )
    # Tuzaklar: geçersiz TC ve geçersiz tarih yakalanmamalı
    values = [f.value for f in find_all(text)]
    assert "12345678951" not in values
    assert "31.02.2024" not in values


# ---------- Ölçüm betiğinin bulduğu sorunlar ----------

def test_phone_with_parentheses_includes_opening_bracket():
    findings = find_phones("Tel: (0552) 257 25 74.")
    assert [f.value for f in findings] == ["(0552) 257 25 74"]
    assert [f.value for f in find_phones("Tel: (532) 123 45 67")] == ["(532) 123 45 67"]


def test_birth_keyword_in_next_sentence_does_not_count():
    text = "Fatura tarihi: 24.08.2024. 30.04.1965 doğumlu."
    assert [f.value for f in find_birth_dates(text)] == ["30.04.1965"]


def test_birth_keyword_in_previous_sentence_does_not_count():
    text = "Doğum günü kutlandı. Fatura tarihi: 24.08.2024."
    assert find_birth_dates(text) == []


def test_abbreviation_is_not_a_sentence_end():
    assert [f.value for f in find_birth_dates("D. Tarihi: 01.02.1990")] == ["01.02.1990"]
    assert [f.value for f in find_birth_dates("D.T. 01.02.1990")] == ["01.02.1990"]
