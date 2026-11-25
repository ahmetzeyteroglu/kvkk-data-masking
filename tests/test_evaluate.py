import random

from kvkk.detection import find_all
from scripts.evaluate import (
    EDGE_CASES,
    KINDS,
    Document,
    build_document,
    build_edge_document,
    count_results,
    exposed_count,
    precision_recall,
)


def test_answer_key_positions_match_text():
    document = Document()
    document.add("Tel: ")
    document.add_data("PHONE", "0532 123 45 67")
    document.add(".")
    assert document.truth == {("PHONE", 5, 19)}
    assert document.text[5:19] == "0532 123 45 67"


def test_generated_document_has_one_item_of_each_kind():
    random.seed(1)
    for _ in range(20):
        document = build_document()
        assert sorted(kind for kind, _, _ in document.truth) == sorted(KINDS)
        for _, start, end in document.truth:
            # Konum kaymışsa dilim boşluk veya noktayla başlar/biter.
            value = document.text[start:end]
            assert value == value.strip(" .,")


def test_edge_documents_have_one_item():
    random.seed(1)
    for case in EDGE_CASES:
        assert len(build_edge_document(case).truth) == 1


def test_count_results_separates_tp_fp_fn():
    document = Document()
    document.add("Tel: ")
    document.add_data("PHONE", "0532 123 45 67")
    document.add(", TC: ")
    document.add_data("TCKN", "12345678951")  # Bilerek geçersiz: araç bulamaz -> FN
    document.add(", mail: a@ornek.com")        # Cevap anahtarında yok -> FP
    counts = count_results([document])
    assert counts["PHONE"] == {"TP": 1, "FP": 0, "FN": 0}
    assert counts["TCKN"] == {"TP": 0, "FP": 0, "FN": 1}
    assert counts["EMAIL"] == {"TP": 0, "FP": 1, "FN": 0}


def test_precision_recall_formulas():
    assert precision_recall(8, 2, 0) == (0.8, 1.0)
    assert precision_recall(3, 0, 1) == (1.0, 0.75)


def test_precision_recall_with_zero_denominator():
    # Araç hiçbir şey bulmadıysa kesinlik hesaplanamaz.
    assert precision_recall(0, 0, 5) == (None, 0.0)
    assert precision_recall(0, 0, 0) == (None, None)


def test_exposure_before_and_after_removal():
    document = Document()
    document.add("Tel: ")
    document.add_data("PHONE", "0532 123 45 67")
    assert exposed_count([document], None) == 1
    assert exposed_count([document], "remove") == 0


def test_found_findings_match_document_text():
    random.seed(1)
    document = build_document()
    for finding in find_all(document.text):
        assert document.text[finding.start:finding.end] == finding.value
