import io
from pathlib import Path

import pandas as pd
import pytest

from kvkk.file_io import (
    all_cell_text,
    find_in_cell,
    find_in_table,
    protect_table,
    read_table,
    to_csv_bytes,
    to_excel_bytes,
)
from kvkk.protection import PseudonymTable

SAMPLE_DIR = Path(__file__).parent.parent / "sample_data"


def small_table():
    return pd.DataFrame({
        "tckn": ["12345678950", "10000000146", "12345678950"],
        "phone": ["0532 123 45 67", "0555 999 88 77", "+905321234567"],
        "note": ["", "teşekkürler", "tekrar"],
    })


def test_csv_cells_stay_as_text():
    data = io.BytesIO("tckn,phone,note\n12345678950,05321234567,\n".encode("utf-8"))
    df = read_table(data, "people.csv")
    assert df.at[0, "tckn"] == "12345678950"
    assert df.at[0, "phone"] == "05321234567"  # Baştaki 0 kaybolmamalı
    assert df.at[0, "note"] == ""  # Boş hücre NaN değil, boş metin


def test_csv_saved_by_turkish_excel_is_read():
    # Türkçe Windows'ta Excel, CSV'yi cp1254 kodlamasıyla kaydeder.
    data = io.BytesIO("full_name,phone\nGülşen Çetin,0532 123 45 67\n".encode("cp1254"))
    df = read_table(data, "people.csv")
    assert df.at[0, "full_name"] == "Gülşen Çetin"


def test_unsupported_extension_raises_error():
    with pytest.raises(ValueError):
        read_table(io.BytesIO(b"x"), "people.pdf")


def test_sample_csv_and_excel_are_read():
    csv_df = read_table(SAMPLE_DIR / "sample_people.csv", "sample_people.csv")
    excel_df = read_table(SAMPLE_DIR / "sample_people.xlsx", "sample_people.xlsx")
    assert len(csv_df) == len(excel_df) == 11
    assert list(csv_df.columns) == list(excel_df.columns)
    assert csv_df.at[0, "tckn"] == excel_df.at[0, "tckn"]


def test_column_name_gives_birth_date_context():
    findings = find_in_cell("birth_date", "12.06.2002")
    assert [(f.kind, f.value, f.start, f.end) for f in findings] == [("BIRTH_DATE", "12.06.2002", 0, 10)]


def test_date_in_other_column_is_not_birth_date():
    assert find_in_cell("invoice_date", "12.06.2002") == []


def test_finding_inside_column_name_is_ignored():
    assert find_in_cell("a@ornek.com", "merhaba") == []


def test_protected_table_has_no_original_values():
    df = small_table()
    protected = protect_table(df, "mask")
    text = all_cell_text(protected)
    for finding in find_in_table(df):
        assert finding.value not in text


def test_original_table_is_not_changed():
    df = small_table()
    protect_table(df, "remove")
    assert df.at[0, "tckn"] == "12345678950"


def test_same_person_gets_same_code_in_different_rows():
    protected = protect_table(small_table(), "pseudonym")
    assert list(protected["tckn"]) == ["TCKN_1", "TCKN_2", "TCKN_1"]
    assert list(protected["phone"]) == ["Phone_1", "Phone_2", "Phone_1"]
    assert list(protected["note"]) == ["", "teşekkürler", "tekrar"]


def test_shared_table_collects_mapping():
    table = PseudonymTable()
    protect_table(small_table(), "pseudonym", table)
    assert ("TCKN_1", "12345678950") in table.mapping()


def test_sample_duplicate_row_gets_same_codes():
    # Örnek dosyanın ilk ve son satırı aynı kişi.
    df = read_table(SAMPLE_DIR / "sample_people.csv", "sample_people.csv")
    protected = protect_table(df, "pseudonym")
    first, last = protected.iloc[0], protected.iloc[-1]
    for column in ["tckn", "phone", "email", "iban", "credit_card", "birth_date"]:
        assert first[column] == last[column]
        assert first[column] != df.iloc[0][column]


def test_csv_bytes_round_trip():
    df = small_table()
    data = to_csv_bytes(df)
    assert data.startswith(b"\xef\xbb\xbf")  # Excel için BOM
    again = read_table(io.BytesIO(data), "out.csv")
    assert again.equals(df)


def test_excel_bytes_round_trip():
    df = small_table()
    again = read_table(io.BytesIO(to_excel_bytes(df)), "out.xlsx")
    assert again.equals(df)


def test_find_in_table_counts_all_cells():
    kinds = [f.kind for f in find_in_table(small_table())]
    assert kinds.count("TCKN") == 3
    assert kinds.count("PHONE") == 3
