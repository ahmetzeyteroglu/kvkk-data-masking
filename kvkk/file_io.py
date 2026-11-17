import io

import pandas as pd

from kvkk.detection import Finding, find_all
from kvkk.protection import PseudonymTable, protect_text

EXCEL_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _read_csv(file):
    # CSV'yi önce UTF-8 ile okur; olmazsa Türkçe Windows'ta Excel'in kullandığı cp1254 ile dener.
    # cp1254'teki "ü", "ş" gibi harfler geçerli UTF-8 değildir, bu yüzden ilk deneme hata verir.
    try:
        return pd.read_csv(file, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    except UnicodeDecodeError:
        # Yüklenen dosya ilk denemede sonuna kadar okundu; başa sarmadan tekrar okunamaz.
        if hasattr(file, "seek"):
            file.seek(0)
        return pd.read_csv(file, dtype=str, keep_default_na=False, encoding="cp1254")


def read_table(file, name):
    # Yüklenen CSV veya Excel dosyasını, tüm hücreler metin olacak şekilde okur.
    # dtype=str: TC ve kart numaraları sayıya dönüşüp bozulmaz (ör. 1.23e+10, baştaki 0'ın kaybı).
    # keep_default_na=False: boş hücreler NaN yerine boş metin ("") olarak gelir.
    # Excel dosyalarında sadece ilk sayfa okunur.
    lower = name.lower()
    if lower.endswith(".csv"):
        return _read_csv(file)
    if lower.endswith(".xlsx"):
        return pd.read_excel(file, dtype=str, keep_default_na=False)
    raise ValueError("Unsupported file type: " + name)


def find_in_cell(column, cell):
    # Bir hücredeki bulguları arar; sütun adını bağlam olarak kullanır.
    # "birth_date" sütunundaki "12.06.2002" hücresinin yanında "doğum" kelimesi yoktur;
    # sütun adı hücrenin önüne eklenince tarih, doğum tarihi olarak tanınır.
    prefix = f"{column}: "
    findings = []
    for finding in find_all(prefix + cell):
        # Sütun adının kendi içindeki bulgular atılır, kalanların konumu hücreye göre kaydırılır.
        if finding.start >= len(prefix):
            findings.append(Finding(finding.kind, finding.value,
                                    finding.start - len(prefix), finding.end - len(prefix)))
    return findings


def find_in_table(df):
    # Tablodaki tüm hücrelerin bulgularını tek listede toplar (risk raporu için).
    findings = []
    for column in df.columns:
        for cell in df[column]:
            findings.extend(find_in_cell(column, cell))
    return findings


def protect_cell(column, cell, method, table):
    # Tek bir hücreyi seçilen yöntemle korur ve korunmuş metni döndürür.
    return protect_text(cell, find_in_cell(column, cell), method, table)


def protect_table(df, method="mask", table=None):
    # Tablonun her hücresini korur; orijinal tabloya dokunmaz, kopyasını döndürür.
    # Tüm tablo için tek takma ad tablosu kullanılır: aynı kişi her satırda aynı kodu alır.
    if table is None:
        table = PseudonymTable()
    protected = df.copy()
    # Satır satır, soldan sağa gezilir; takma ad numaraları okuma sırasına göre verilir.
    for index in df.index:
        for column in df.columns:
            protected.at[index, column] = protect_cell(column, df.at[index, column], method, table)
    return protected


def all_cell_text(df):
    # Özel nitelikli kelime taraması için tüm hücreleri tek metinde birleştirir.
    return "\n".join(" ".join(row) for row in df.values.tolist())


def to_csv_bytes(df):
    # Tabloyu indirilebilir CSV'ye çevirir.
    # utf-8-sig: Excel, dosya başındaki BOM işareti sayesinde Türkçe karakterleri doğru gösterir.
    return df.to_csv(index=False).encode("utf-8-sig")


def to_excel_bytes(df):
    # Tabloyu indirilebilir Excel dosyasına çevirir; dosya diske değil bellekte oluşur.
    buffer = io.BytesIO()
    df.to_excel(buffer, index=False)
    return buffer.getvalue()
