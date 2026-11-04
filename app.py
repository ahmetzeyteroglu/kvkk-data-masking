import streamlit as st

from kvkk.detection import find_all
from kvkk.protection import PseudonymTable, protect_text

# Arayüzde görünen yöntem adı -> protect_text'in beklediği method değeri
METHODS = {
    "Masking (532***4567)": "mask",
    "Pseudonymization (Phone_1)": "pseudonym",
    "Removal ([REMOVED])": "remove",
}

st.set_page_config(page_title="KVKK Data Masking", layout="wide")
st.title("KVKK Personal Data Masking Tool")
st.caption("Detects and protects personal data in text. Do not enter real personal data.")

text = st.text_area("Paste your text here", height=200)
method_label = st.radio("Protection method", list(METHODS), horizontal=True)

if st.button("Protect"):
    if not text.strip():
        st.warning("Please enter some text first.")
    else:
        findings = find_all(text)
        # Streamlit her tıklamada betiği baştan çalıştırır; tablo da her seferinde sıfırdan kurulur.
        table = PseudonymTable()
        protected = protect_text(text, findings, METHODS[method_label], table)

        left, right = st.columns(2)
        with left:
            st.subheader("Original")
            st.text(text)
        with right:
            st.subheader("Protected")
            st.text(protected)

        st.info(f"{len(findings)} personal data item(s) found.")

        if METHODS[method_label] == "pseudonym" and table.mapping():
            with st.expander("Pseudonym mapping table (keep separate from protected data!)"):
                st.table([{"Code": code, "Original": value} for code, value in table.mapping()])
