from pathlib import Path

from kvkk.detection import FIRST_NAMES, find_all, find_names
from kvkk.file_io import protect_table, read_table
from kvkk.protection import mask, protect_text

SAMPLE_DIR = Path(__file__).parent.parent / "sample_data"


def names_in(text):
    return [f.value for f in find_all(text) if f.kind == "FULL_NAME"]


def test_name_from_dictionary_is_found():
    assert names_in("Ahmet Yılmaz geldi.") == ["Ahmet Yılmaz"]


def test_middle_name_is_included():
    assert names_in("Ayşe Nur Kaya aradı.") == ["Ayşe Nur Kaya"]


def test_third_word_that_is_not_a_name_is_left_out():
    assert names_in("Ahmet Yılmaz Bey aradı.") == ["Ahmet Yılmaz"]


def test_suffix_after_apostrophe_is_not_part_of_name():
    assert names_in("Ahmet Yılmaz'ın dosyası") == ["Ahmet Yılmaz"]


def test_name_starting_with_dotted_capital_i():
    assert names_in("İsmail Koç geldi.") == ["İsmail Koç"]


def test_longer_name_wins_over_its_prefix():
    # "Oğuz" da listede; "Oğuzhan" yarım kalmamalı.
    assert names_in("Oğuzhan Kurt geldi.") == ["Oğuzhan Kurt"]


def test_place_name_is_not_found():
    assert names_in("Ankara Üniversitesi açıklama yaptı.") == []


def test_ordinary_capital_word_at_sentence_start_is_not_found():
    assert names_in("Bugün Toplantı yapıldı. Yarın Ankara'ya gidilecek.") == []


def test_first_name_alone_is_not_found():
    assert names_in("Ahmet geldi.") == []


def test_hint_finds_name_not_in_dictionary():
    assert names_in("Sayın Kıvanç Erdem, başvurunuz alındı.") == ["Kıvanç Erdem"]
    assert names_in("Ad Soyad: Tunç Ertürk") == ["Tunç Ertürk"]


def test_hint_and_dictionary_do_not_double_count():
    assert names_in("Sayın Fatma Yılmaz,") == ["Fatma Yılmaz"]


def test_name_does_not_cross_line_break():
    assert names_in("Selin Aydın\nDoğum günü") == ["Selin Aydın"]


def test_generator_names_are_in_dictionary():
    from scripts.generate_fake_data import FIRST_NAMES as GENERATOR_NAMES
    for name in GENERATOR_NAMES:
        assert name in FIRST_NAMES


def test_find_names_positions_match_text():
    text = "Kayıt: Merve Çetin, 2024"
    for finding in find_names(text):
        assert text[finding.start:finding.end] == finding.value


def test_name_masking_keeps_initials():
    finding = find_all("Ahmet Yılmaz")[0]
    assert mask(finding) == "A*** Y***"


def test_name_pseudonym_in_text():
    text = "Selin Aydın aradı. Daha sonra Selin Aydın tekrar aradı, Can Aslan da geldi."
    result = protect_text(text, find_all(text), "pseudonym")
    assert result == "Person_1 aradı. Daha sonra Person_1 tekrar aradı, Person_2 da geldi."


def test_full_name_column_is_protected_in_file():
    df = read_table(SAMPLE_DIR / "sample_people.csv", "sample_people.csv")
    protected = protect_table(df, "remove")
    assert set(protected["full_name"]) == {"[REMOVED]"}
