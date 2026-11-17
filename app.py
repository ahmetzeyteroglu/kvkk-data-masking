import streamlit as st

from kvkk.detection import find_all
from kvkk.file_io import (
    EXCEL_MIME,
    all_cell_text,
    find_in_table,
    protect_table,
    read_table,
    to_csv_bytes,
    to_excel_bytes,
)
from kvkk.highlight import highlight_html
from kvkk.protection import PseudonymTable, protect_text
from kvkk.risk import count_by_kind, find_special_categories

# Arayüzde görünen yöntem adı -> protect_text'in beklediği method değeri
METHODS = {
    "Masking (532***4567)": "mask",
    "Pseudonymization (Phone_1)": "pseudonym",
    "Removal ([REMOVED])": "remove",
}


def show_risk_report(findings, text):
    # Tür bazında sayım tablosunu ve özel nitelikli veri uyarılarını gösterir.
    st.subheader("Risk report")
    st.info(f"{len(findings)} personal data item(s) found.")
    counts = count_by_kind(findings)
    if counts:
        st.table([{"Data type": kind, "Count": count} for kind, count in counts.items()])
    # Özel nitelikli veriler otomatik silinmez; bağlamı değerlendirme kararı insana bırakılır.
    for category, word in find_special_categories(text):
        st.warning(f"Possible special category data ({category}): '{word}' - KVKK Art. 6")


def show_mapping(method, table):
    # Takma ad seçiliyse eşleme tablosunu korunmuş veriden ayrı bir bölümde gösterir.
    if method == "pseudonym" and table.mapping():
        with st.expander("Pseudonym mapping table (keep separate from protected data!)"):
            st.table([{"Code": code, "Original": value} for code, value in table.mapping()])


st.set_page_config(page_title="KVKK Data Masking", layout="wide")
st.title("KVKK Personal Data Masking Tool")
st.caption("Detects and protects personal data in text or files. Do not enter real personal data.")

method = METHODS[st.radio("Protection method", list(METHODS), horizontal=True)]
text_tab, file_tab = st.tabs(["Text", "File"])

with text_tab:
    text = st.text_area("Paste your text here", height=200)

    if st.button("Protect"):
        if not text.strip():
            st.warning("Please enter some text first.")
        else:
            findings = find_all(text)
            # Streamlit her tıklamada betiği baştan çalıştırır; tablo da her seferinde sıfırdan kurulur.
            table = PseudonymTable()
            protected = protect_text(text, findings, method, table)

            left, right = st.columns(2)
            with left:
                st.subheader("Original")
                # st.html, metni Markdown olarak yorumlamaz; metindeki * veya # işaretleri biçim değiştirmez.
                st.html(highlight_html(text, findings))
            with right:
                st.subheader("Protected")
                st.text(protected)

            show_risk_report(findings, text)
            show_mapping(method, table)

with file_tab:
    uploaded = st.file_uploader(
        "Upload a CSV or Excel file",
        type=["csv", "xlsx"],
        help="For Excel files only the first sheet is processed.",
    )

    if uploaded is not None:
        try:
            df = read_table(uploaded, uploaded.name)
        except Exception as error:
            # Bozuk, boş veya okunamayan dosyada uygulama çökmesin; anlaşılır bir mesaj gösterilsin.
            # Teknik ayrıntı, sorunu bulmaya yardım etsin diye altta küçük yazıyla verilir.
            st.error("Could not read the file. Please upload a valid, non-empty CSV or Excel (.xlsx) file.")
            st.caption(f"Details: {type(error).__name__}: {error}")
        else:
            if df.empty:
                st.warning("The file has no data rows.")
            table = PseudonymTable()
            protected_df = protect_table(df, method, table)

            left, right = st.columns(2)
            with left:
                st.subheader("Original")
                st.dataframe(df.head(20), hide_index=True)
            with right:
                st.subheader("Protected")
                st.dataframe(protected_df.head(20), hide_index=True)
            st.caption(f"Showing the first {min(len(df), 20)} of {len(df)} row(s).")

            # İndirilen dosya, yüklenen dosyayla aynı biçimde olur.
            if uploaded.name.lower().endswith(".csv"):
                data, mime = to_csv_bytes(protected_df), "text/csv"
            else:
                data, mime = to_excel_bytes(protected_df), EXCEL_MIME
            st.download_button("Download protected file", data, "protected_" + uploaded.name, mime)

            show_risk_report(find_in_table(df), all_cell_text(df))
            show_mapping(method, table)
