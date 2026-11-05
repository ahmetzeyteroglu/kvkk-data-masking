import re
from pathlib import Path

DICTIONARY_PATH = Path(__file__).parent / "dictionaries" / "special_categories.txt"


def tr_lower(text):
    # Türkçe kurallarına göre küçük harfe çevirir.
    # Python'un lower() metodu "I" harfini "i", "İ" harfini ise noktalı iki karakter yapar.
    return text.replace("I", "ı").replace("İ", "i").lower()


def load_special_keywords(path=DICTIONARY_PATH):
    # Sözlük dosyasını okur ve [(kategori, kelime kökü), ...] listesi döndürür.
    keywords = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            category, keyword = line.split(";")
            keywords.append((category, keyword))
    return keywords


def count_by_kind(findings):
    # Her veri türünden kaç bulgu olduğunu sayar. Örnek: {"PHONE": 2, "TCKN": 1}
    counts = {}
    for finding in findings:
        counts[finding.kind] = counts.get(finding.kind, 0) + 1
    return counts


def find_special_categories(text):
    # Metinde özel nitelikli veri ipucu arar: [(kategori, geçen kelime), ...]
    # Kök kelimenin başında aranır; böylece "ırk" kökü "kırk" içinde yakalanmaz.
    # Türkçede ekler sona geldiği için "hastalığı" gibi çekimli haller yine bulunur.
    lowered = tr_lower(text)
    hits = []
    for category, keyword in load_special_keywords():
        for word in re.findall(r"(?<!\w)" + re.escape(keyword) + r"\w*", lowered):
            if (category, word) not in hits:
                hits.append((category, word))
    return hits
