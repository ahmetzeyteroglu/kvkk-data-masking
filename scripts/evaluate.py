"""Aracın doğruluğunu, cevabı bilinen sentetik metinler üzerinde ölçer.

Çalıştırma (proje kök klasöründen):
    python -m scripts.evaluate

Sonuçlar ekrana yazılır ve docs/evaluation_results.md dosyasına kaydedilir.
Sabit tohum (seed) sayesinde her çalıştırmada aynı metinler ve aynı sonuçlar çıkar.
"""

import random
import sys
from pathlib import Path

from kvkk.detection import find_all
from kvkk.protection import protect_text
from scripts.generate_fake_data import (
    FIRST_NAMES,
    LAST_NAMES,
    fake_birth_date,
    fake_card,
    fake_email,
    fake_iban,
    fake_phone_digits,
    fake_tckn,
    format_phone,
)

SEED = 2026
DOCUMENT_COUNT = 200
EDGE_CASE_COUNT = 50
RESULTS_PATH = Path(__file__).resolve().parent.parent / "docs" / "evaluation_results.md"

KINDS = ["FULL_NAME", "TCKN", "PHONE", "EMAIL", "IBAN", "CREDIT_CARD", "BIRTH_DATE"]
PHONE_STYLES = ["spaced", "international", "dashed", "plain"]
METHODS = ["mask", "pseudonym", "remove"]

# Kişisel veri olmayan ama içinde ad geçtiği için aracı yanıltabilecek kurum ve yer adları.
ORGANIZATION_NAMES = [
    "Ankara Üniversitesi",
    "İstanbul Büyükşehir Belediyesi",
    "Deniz Kuvvetleri Komutanlığı",
    "Merkez Bankası",
    "Gül Sokak",
    "Sağlık Bakanlığı",
]

# Ad sözlüğünde olmayan adlar (bilinen sınırlılık ölçümü için).
UNLISTED_FIRST_NAMES = ["Kıvanç", "Tunç", "Doruk", "Ilgaz", "Çağan", "Alp"]

# Zor durumlar: ana ölçüme karışmasın diye ayrı ölçülür.
EDGE_CASES = {
    "ALL_CAPS_NAME": "Full name written in capitals (AHMET YILMAZ)",
    "UNLISTED_NAME": "First name not in the dictionary, no hint word",
    "PHONE_IN_PARENTHESES": "Phone with area code in parentheses ((0532) 123 45 67)",
}


class Document:
    # Parça parça kurulan bir metin; içindeki kişisel verilerin konumlarını (cevap anahtarı) da tutar.

    def __init__(self):
        # Boş metin ve boş cevap anahtarıyla başlar.
        self.text = ""
        self.truth = set()  # {(tür, başlangıç, bitiş), ...}

    def add(self, plain):
        # Kişisel veri olmayan metin ekler.
        self.text += plain

    def add_data(self, kind, value):
        # Kişisel veri ekler ve konumunu cevap anahtarına yazar.
        start = len(self.text)
        self.text += value
        self.truth.add((kind, start, len(self.text)))


def _change_last_digit(number):
    # Son haneyi bir artırır; kontrol hanesi bozulan numara artık doğrulamadan geçmez.
    return number[:-1] + str((int(number[-1]) + 1) % 10)


def personal_sentences():
    # Her türden bir kişisel veri içeren cümleler üretir: [(önceki metin, tür, değer, sonraki metin), ...]
    # Yazım biçimleri (boşluklu IBAN, +90'lı telefon, "doğumlu" ifadesi ...) rastgele seçilir.
    first_name, last_name = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    name_before, name_after = random.choice(
        [("Sayın ", ","), ("Ad Soyad: ", "."), ("", " başvuru yaptı."), ("", " bilgilendirildi.")]
    )
    birth_before, birth_after = random.choice(
        [("Doğum tarihi: ", "."), ("", " doğumlu."), ("D.T: ", ".")]
    )
    return [
        (name_before, "FULL_NAME", first_name + " " + last_name, name_after),
        (birth_before, "BIRTH_DATE", fake_birth_date(), birth_after),
        (random.choice(["TC kimlik no: ", "T.C. No: "]), "TCKN", fake_tckn(), "."),
        (random.choice(["Tel: ", "İletişim: ", "Cep: "]), "PHONE",
         format_phone(fake_phone_digits(), random.choice(PHONE_STYLES)), "."),
        ("E-posta: ", "EMAIL", fake_email(first_name, last_name), "."),
        ("IBAN: ", "IBAN", fake_iban(spaced=random.random() < 0.5), "."),
        ("Kart no: ", "CREDIT_CARD", fake_card(spaced=random.random() < 0.5), "."),
    ]


def decoy_sentences():
    # Kişisel veri içermeyen ama içeriyormuş gibi görünen tuzak cümleler üretir.
    # Araç bunlardan birini işaretlerse yanlış alarm (FP) sayılır.
    iban = fake_iban()
    broken_iban = iban[:2] + f"{(int(iban[2:4]) + 1) % 100:02d}" + iban[4:]  # Kontrol hanesi bozuk
    invoice_date = f"{random.randint(1, 28):02d}.{random.randint(1, 12):02d}.2024"
    return [
        "Sipariş no: " + _change_last_digit(fake_tckn()) + ".",
        "Referans no: " + _change_last_digit(fake_card(spaced=False)) + ".",
        "Hatalı hesap: " + broken_iban + ".",
        "Fatura tarihi: " + invoice_date + ".",
        "Son ödeme tarihi: 31.02.2024.",
        random.choice(ORGANIZATION_NAMES) + " ile yazışma yapıldı.",
    ]


def build_document():
    # Her türden bir kişisel veri ve altı tuzak içeren, cümle sırası karışık bir metin üretir.
    sentences = personal_sentences() + decoy_sentences()
    random.shuffle(sentences)
    document = Document()
    for index, sentence in enumerate(sentences):
        if index > 0:
            document.add(" ")
        if isinstance(sentence, tuple):
            before, kind, value, after = sentence
            document.add(before)
            document.add_data(kind, value)
            document.add(after)
        else:
            document.add(sentence)
    return document


def build_edge_document(case):
    # Zor bir durumu (bilinen zayıflık veya düzeltilmiş bir hata) içeren kısa bir metin üretir.
    document = Document()
    last_name = random.choice(LAST_NAMES)
    if case == "ALL_CAPS_NAME":
        document.add_data("FULL_NAME", (random.choice(FIRST_NAMES) + " " + last_name).upper())
        document.add(" dilekçe verdi.")
    elif case == "UNLISTED_NAME":
        document.add_data("FULL_NAME", random.choice(UNLISTED_FIRST_NAMES) + " " + last_name)
        document.add(" toplantıya katıldı.")
    elif case == "PHONE_IN_PARENTHESES":
        digits = fake_phone_digits()
        document.add("Tel: ")
        document.add_data("PHONE", f"(0{digits[:3]}) {digits[3:6]} {digits[6:8]} {digits[8:]}")
        document.add(".")
    return document


def count_results(documents):
    # Her tür için doğru bulunan (TP), yanlış alarm (FP) ve kaçırılan (FN) sayısını toplar.
    # Bulgu ancak türü ve konumu cevap anahtarıyla birebir aynıysa doğru sayılır.
    counts = {kind: {"TP": 0, "FP": 0, "FN": 0} for kind in KINDS}
    for document in documents:
        found = {(f.kind, f.start, f.end) for f in find_all(document.text)}
        for kind, _, _ in found & document.truth:   # İkisinde de olan: doğru bulundu
            counts[kind]["TP"] += 1
        for kind, _, _ in found - document.truth:   # Sadece araçta olan: yanlış alarm
            counts[kind]["FP"] += 1
        for kind, _, _ in document.truth - found:   # Sadece cevapta olan: kaçırıldı
            counts[kind]["FN"] += 1
    return counts


def precision_recall(tp, fp, fn):
    # Kesinlik (precision): aracın "kişisel veri" dediklerinin ne kadarı gerçekten kişisel veri?
    # Duyarlılık (recall): metindeki gerçek kişisel verilerin ne kadarı bulundu?
    # Payda 0 ise oran hesaplanamaz; o durumda None kalır ve tabloda "-" yazılır.
    precision, recall = None, None
    if (tp + fp !=0):
        precision = tp / (tp + fp)
    if (tp + fn !=0):
        recall = tp / (tp + fn)
    return precision, recall


def exposed_count(documents, method):
    # Korumadan sonra metinde aynen kalan gerçek kişisel veri sayısını döndürür.
    # method None ise metin hiç korunmamıştır (çözüm öncesi durum).
    exposed = 0
    for document in documents:
        if method is None:
            output = document.text
        else:
            output = protect_text(document.text, find_all(document.text), method)
        for _, start, end in document.truth:
            if document.text[start:end] in output:
                exposed += 1
    return exposed


def _percent(value):
    # Oranı yüzde olarak yazar; hesaplanamayan oran için "-" döner.
    return "-" if value is None else f"{value:.1%}"


def build_report(documents, edge_documents):
    # Ölçüm sonuçlarını Markdown tabloları olarak hazırlar.
    lines = [
        "# Evaluation results",
        "",
        f"Synthetic test set: {len(documents)} documents (random seed {SEED}). Each document contains",
        "one item of each of the 7 data types in a random order and a random format, plus 6 decoys",
        "that look like personal data but are not (invalid TCKN, card and IBAN check digits, an invoice",
        "date, an impossible date, an organization or street name containing a first name).",
        "A finding counts as correct only if both its type and its exact position match the answer key.",
        "",
        "Generated by `python -m scripts.evaluate`.",
        "",
        "## Detection accuracy",
        "",
        "| Data type | In text | Found (TP) | Missed (FN) | False alarms (FP) | Precision | Recall |",
        "|---|---|---|---|---|---|---|",
    ]
    counts = count_results(documents)
    total = {"TP": 0, "FP": 0, "FN": 0}
    for kind in KINDS:
        c = counts[kind]
        for key in total:
            total[key] += c[key]
        precision, recall = precision_recall(c["TP"], c["FP"], c["FN"])
        lines.append(f"| {kind} | {c['TP'] + c['FN']} | {c['TP']} | {c['FN']} | {c['FP']} "
                     f"| {_percent(precision)} | {_percent(recall)} |")
    precision, recall = precision_recall(total["TP"], total["FP"], total["FN"])
    lines.append(f"| **Total** | {total['TP'] + total['FN']} | {total['TP']} | {total['FN']} "
                 f"| {total['FP']} | {_percent(precision)} | {_percent(recall)} |")

    all_items = sum(len(d.truth) for d in documents)
    lines += [
        "",
        "## Exposure before and after protection (full values)",
        "",
        "Personal data items whose **full** original value still appears unchanged in the output text.",
        "This does not mean nothing is revealed: masking intentionally keeps parts of the value",
        "(last 4 card digits, birth year, initials, email domain), so masked data can still identify",
        "a person when combined with other information and remains personal data.",
        "",
        "| State | Full values left exposed | Share of all items |",
        "|---|---|---|",
    ]
    for label, method in [("Before protection", None), ("After masking", "mask"),
                          ("After pseudonymization", "pseudonym"), ("After removal", "remove")]:
        exposed = exposed_count(documents, method)
        lines.append(f"| {label} | {exposed} / {all_items} | {_percent(exposed / all_items)} |")

    lines += [
        "",
        "## Hard cases (measured separately)",
        "",
        "| Case | Items | Found correctly | Detection rate |",
        "|---|---|---|---|",
    ]
    for case, description in EDGE_CASES.items():
        case_counts = count_results(edge_documents[case])
        items = sum(len(d.truth) for d in edge_documents[case])
        found = sum(c["TP"] for c in case_counts.values())
        lines.append(f"| {description} | {items} | {found} | {_percent(found / items)} |")
    return "\n".join(lines) + "\n"


def main():
    # Test metinlerini üretir, ölçer, sonucu ekrana yazar ve dosyaya kaydeder.
    random.seed(SEED)
    documents = [build_document() for _ in range(DOCUMENT_COUNT)]
    edge_documents = {
        case: [build_edge_document(case) for _ in range(EDGE_CASE_COUNT)] for case in EDGE_CASES
    }
    report = build_report(documents, edge_documents)
    # Windows konsolunda Türkçe karakterler bozulmasın diye çıktı UTF-8'e çevrilir.
    sys.stdout.reconfigure(encoding="utf-8")
    print(report)
    RESULTS_PATH.parent.mkdir(exist_ok=True)
    RESULTS_PATH.write_text(report, encoding="utf-8")
    print(f"Saved to {RESULTS_PATH}")


if __name__ == "__main__":
    main()
