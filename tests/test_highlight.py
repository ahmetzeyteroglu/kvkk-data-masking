from kvkk.detection import Finding, find_all
from kvkk.highlight import COLORS, highlight_html


def test_finding_is_wrapped_in_mark():
    text = "Tel: 0532 123 45 67"
    result = highlight_html(text, find_all(text))
    assert "<mark" in result
    assert ">0532 123 45 67</mark>" in result
    assert 'title="PHONE"' in result
    assert COLORS["PHONE"] in result


def test_each_kind_gets_its_own_color():
    text = "Tel: 0532 123 45 67, mail: a@ornek.com"
    result = highlight_html(text, find_all(text))
    assert COLORS["PHONE"] in result
    assert COLORS["EMAIL"] in result


def test_user_html_is_escaped():
    text = "<script>alert(1)</script> 0532 123 45 67"
    result = highlight_html(text, find_all(text))
    assert "<script>" not in result
    assert "&lt;script&gt;" in result


def test_finding_value_is_escaped():
    # Bulgunun kendisi de HTML'e kaçırılmadan girmemeli.
    finding = Finding("EMAIL", "<b>x</b>", 0, 8)
    result = highlight_html("<b>x</b>", [finding])
    assert "<b>" not in result
    assert "&lt;b&gt;x&lt;/b&gt;" in result


def test_text_around_findings_is_kept():
    text = "A: 0532 123 45 67, B: a@ornek.com."
    result = highlight_html(text, find_all(text))
    assert result.startswith('<div style="white-space: pre-wrap">A: <mark')
    assert "</mark>, B: <mark" in result
    assert result.endswith("</mark>.</div>")


def test_text_without_findings_is_only_escaped():
    assert highlight_html("a < b", []) == '<div style="white-space: pre-wrap">a &lt; b</div>'
