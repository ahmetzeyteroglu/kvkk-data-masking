import pytest

from kvkk.detection import Finding, find_all
from kvkk.protection import PseudonymTable, mask, normalize, protect_text


def test_phone_masking():
    assert mask(Finding("PHONE", "0532 123 45 67", 0, 14)) == "532***4567"
    assert mask(Finding("PHONE", "+905321234567", 0, 13)) == "532***4567"


def test_email_masking():
    assert mask(Finding("EMAIL", "deneme@ornek.com", 0, 16)) == "d***@ornek.com"


def test_tckn_masking():
    assert mask(Finding("TCKN", "12345678950", 0, 11)) == "123******50"


def test_iban_masking_keeps_format():
    value = "TR40 0006 1000 0000 0123 4567 89"
    assert mask(Finding("IBAN", value, 0, len(value))) == "TR40 **** **** **** **** **67 89"


def test_card_masking_shows_last_four():
    value = "4111 1111 1111 1111"
    assert mask(Finding("CREDIT_CARD", value, 0, len(value))) == "**** **** **** 1111"


def test_birth_date_masking_keeps_year():
    assert mask(Finding("BIRTH_DATE", "15.06.1990", 0, 10)) == "**.**.1990"


def test_positions_do_not_shift_with_multiple_findings():
    text = "A: 0532 123 45 67, B: x@ornek.com, C: 0555 999 88 77 son."
    result = protect_text(text, find_all(text))
    assert result == "A: 532***4567, B: x***@ornek.com, C: 555***8877 son."


def test_text_without_findings_is_unchanged():
    text = "Burada kişisel veri yok."
    assert protect_text(text, find_all(text)) == text


def test_unknown_method_raises_error():
    with pytest.raises(ValueError):
        protect_text("metin", [], method="magic")


def test_phone_normalization_ignores_format():
    a = Finding("PHONE", "0532 123 45 67", 0, 14)
    b = Finding("PHONE", "+905321234567", 0, 13)
    c = Finding("PHONE", "532-123-45-67", 0, 13)
    assert normalize(a) == normalize(b) == normalize(c) == "5321234567"


def test_same_phone_in_different_formats_gets_same_pseudonym():
    text = "Ara: 0532 123 45 67, yedek: +905321234567, tekrar: 532-123-45-67."
    result = protect_text(text, find_all(text), method="pseudonym")
    assert result == "Ara: Phone_1, yedek: Phone_1, tekrar: Phone_1."


def test_different_values_get_increasing_numbers():
    text = "A: 0532 123 45 67, B: 0555 999 88 77, C: a@ornek.com"
    result = protect_text(text, find_all(text), method="pseudonym")
    assert result == "A: Phone_1, B: Phone_2, C: Email_1"


def test_counters_are_separate_per_kind():
    table = PseudonymTable()
    assert table.get_code(Finding("FULL_NAME", "Ahmet Yılmaz", 0, 12)) == "Person_1"
    assert table.get_code(Finding("FULL_NAME", "Ayşe Kaya", 0, 9)) == "Person_2"
    assert table.get_code(Finding("PHONE", "05321234567", 0, 11)) == "Phone_1"
    # Aynı kişi tekrar gelince yeni numara verilmez.
    assert table.get_code(Finding("FULL_NAME", "ahmet yılmaz", 0, 12)) == "Person_1"


def test_shared_table_keeps_codes_across_texts():
    # Dosya sekmesinde her hücre ayrı metin olacak; tablo paylaşılınca kodlar tutarlı kalır.
    table = PseudonymTable()
    first = protect_text("0532 123 45 67", find_all("0532 123 45 67"), "pseudonym", table)
    second = protect_text("+905321234567", find_all("+905321234567"), "pseudonym", table)
    assert first == second == "Phone_1"


def test_mapping_shows_original_values():
    text = "A: 0532 123 45 67, B: +905321234567"
    table = PseudonymTable()
    protect_text(text, find_all(text), "pseudonym", table)
    assert table.mapping() == [("Phone_1", "0532 123 45 67")]


def test_remove_leaves_no_original_value():
    text = "TC: 12345678950, tel: 0532 123 45 67, mail: a@ornek.com"
    findings = find_all(text)
    result = protect_text(text, findings, method="remove")
    assert result == "TC: [REMOVED], tel: [REMOVED], mail: [REMOVED]"
    for finding in findings:
        assert finding.value not in result
