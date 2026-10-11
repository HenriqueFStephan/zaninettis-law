from app.core.locale import localize_item, normalize_lang


def test_normalize_lang_defaults_to_pt():
    assert normalize_lang(None) == "pt-BR"
    assert normalize_lang("") == "pt-BR"
    assert normalize_lang("pt") == "pt-BR"
    assert normalize_lang("pt-BR") == "pt-BR"


def test_normalize_lang_maps_english():
    assert normalize_lang("en") == "en"
    assert normalize_lang("en-US") == "en"
    assert normalize_lang("EN") == "en"


def test_localize_item_applies_english_overlay():
    item = {
        "id": "tributario",
        "title": "Tributário",
        "description": "Consultoria",
        "i18n": {"en": {"title": "Tax", "description": "Tax advisory"}},
    }
    out = localize_item(item, "en")
    assert out["title"] == "Tax"
    assert out["description"] == "Tax advisory"
    assert "i18n" not in out


def test_localize_item_keeps_portuguese_without_overlay():
    item = {"id": "x", "title": "Tributário", "i18n": {"en": {"title": "Tax"}}}
    out = localize_item(item, "pt-BR")
    assert out["title"] == "Tributário"
