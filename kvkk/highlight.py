import html

# Her veri türünün vurgu rengi (açık tonlar; yazı rengi siyah sabitlenir, koyu temada da okunur)
COLORS = {
    "TCKN": "#ffb3b3",
    "PHONE": "#b3d9ff",
    "EMAIL": "#c2f0c2",
    "IBAN": "#ffe0a3",
    "CREDIT_CARD": "#e0c2ff",
    "BIRTH_DATE": "#ffd1e8",
    "FULL_NAME": "#fff3a3",
}
DEFAULT_COLOR = "#dddddd"


def highlight_html(text, findings):
    # Metni, bulgular renkli <mark> etiketleri içinde olacak şekilde HTML'e çevirir.
    # Güvenlik: kullanıcı metni HTML'e girmeden önce html.escape ile kaçırılır;
    # böylece metne yazılmış "<script>" gibi bir ifade kod olarak çalışmaz.
    parts = []
    position = 0  # Metnin şimdiye kadar işlenmiş kısmının bittiği yer
    for finding in sorted(findings, key=lambda f: f.start):
        color = COLORS.get(finding.kind, DEFAULT_COLOR)
        # Bulgudan önceki sıradan metin
        parts.append(html.escape(text[position:finding.start]))
        # Bulgunun kendisi: türünün rengiyle boyanır, üzerine gelince türü görünür.
        value = html.escape(finding.value)
        parts.append(f'<mark style="background:{color}; color:#000" title="{finding.kind}">{value}</mark>')
        position = finding.end
    # Son bulgudan sonra kalan metin
    parts.append(html.escape(text[position:]))
    # pre-wrap: satır sonları ve boşluklar metindeki gibi korunur.
    return '<div style="white-space: pre-wrap">' + "".join(parts) + "</div>"
