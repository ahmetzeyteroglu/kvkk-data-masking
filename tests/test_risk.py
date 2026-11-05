from kvkk.detection import Finding, find_all
from kvkk.risk import count_by_kind, find_special_categories, load_special_keywords, tr_lower


def test_tr_lower_handles_turkish_i():
    assert tr_lower("DİYABET") == "diyabet"
    assert tr_lower("KIRK") == "kırk"


def test_count_by_kind_counts_each_type():
    findings = [
        Finding("PHONE", "05321234567", 0, 11),
        Finding("PHONE", "05559998877", 12, 23),
        Finding("EMAIL", "a@ornek.com", 24, 35),
    ]
    assert count_by_kind(findings) == {"PHONE": 2, "EMAIL": 1}


def test_count_by_kind_with_no_findings_is_empty():
    assert count_by_kind([]) == {}


def test_count_by_kind_with_detected_text():
    text = "Tel: 0532 123 45 67, yedek: 0555 999 88 77, TC: 12345678950"
    assert count_by_kind(find_all(text)) == {"PHONE": 2, "TCKN": 1}


def test_keyword_is_found_in_all_cases():
    for text in ["Diyabet tanısı", "DİYABET tanısı", "diyabet tanısı"]:
        assert find_special_categories(text) == [("Health", "diyabet")]


def test_suffixed_word_is_found():
    assert ("Health", "hastalığı") in find_special_categories("Kalp hastalığı var.")
    assert ("Membership", "sendikaya") in find_special_categories("Sendikaya üye oldu.")


def test_keyword_inside_another_word_is_not_found():
    # "kırk" içinde "ırk" geçiyor ama kelimenin başında değil.
    assert find_special_categories("Kırk yıl önce") == []


def test_same_word_is_reported_once():
    assert find_special_categories("sendika, sendika") == [("Membership", "sendika")]


def test_text_without_keywords_has_no_hits():
    assert find_special_categories("Toplantı yarın saat onda.") == []


def test_dictionary_is_loaded():
    assert ("Health", "diyabet") in load_special_keywords()
