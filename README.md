# KVKK Personal Data Masking Tool

A Python + Streamlit tool that detects personal data in free text or CSV/Excel files and protects it
(masking, pseudonymization or removal) before the data is sent to a test environment or an AI tool.
Built as a course project for an IT Law class, focusing on the Turkish Personal Data Protection Law (KVKK, Law No. 6698).

> All sample data in this repository is synthetic. Numbers are generated to pass validation algorithms
> but are not linked to any real person.

## Status

Work in progress.

- [x] Email and phone detection, masking
- [x] TCKN, IBAN (mod-97), credit card (Luhn) and date validation
- [x] Fake data generator (`python -m scripts.generate_fake_data`)
- [x] TCKN / IBAN / card / birth date detection with overlap resolution
- [x] Pseudonymization and removal
- [ ] Highlighting and risk report (incl. special category data warnings)
- [ ] CSV / Excel support
- [ ] Name detection

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## Usage

```bash
streamlit run app.py
```

## Tests

```bash
pytest -v
```
