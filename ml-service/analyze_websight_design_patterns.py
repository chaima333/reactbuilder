from pathlib import Path
import json
import pandas as pd

DATA_PATH = Path("training_data/websight_design_patterns_sample_5000.csv")

OUT_DIR = Path("models")
OUT_DIR.mkdir(exist_ok=True)

OUT_JSON = OUT_DIR / "websight_design_profiles.json"
OUT_LABELED = Path("training_data/websight_design_patterns_labeled_5000.csv")

df = pd.read_csv(DATA_PATH)

numeric_cols = [
    "html_length",
    "button_count",
    "card_count",
    "section_count",
    "nav_count",
    "form_count",
    "image_count",
    "link_count",
    "heading_count",
    "has_hero",
    "has_pricing",
    "has_testimonials",
    "has_faq",
    "has_contact",
    "has_services",
    "has_portfolio",
    "color_count",
    "font_size_count",
    "radius_count",
    "shadow_count",
    "padding_count",
    "margin_count",
]

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

def q(col: str, value: float) -> float:
    if col not in df.columns:
        return 0
    return float(df[col].quantile(value))

thresholds = {
    "high_cards": q("card_count", 0.75),
    "high_images": q("image_count", 0.75),
    "high_sections": q("section_count", 0.75),
    "high_headings": q("heading_count", 0.75),
    "high_radius": q("radius_count", 0.60),
    "high_shadows": q("shadow_count", 0.60),
    "high_padding": q("padding_count", 0.60),
    "low_colors": q("color_count", 0.35),
}

def classify_profile(row) -> str:
    if row.get("form_count", 0) > 0 or row.get("has_contact", 0) > 0:
        return "form-focused"

    if (
        row.get("image_count", 0) >= thresholds["high_images"]
        and row.get("has_portfolio", 0) > 0
    ):
        return "image-rich-gallery"

    if (
        row.get("card_count", 0) >= thresholds["high_cards"]
        or row.get("shadow_count", 0) >= thresholds["high_shadows"]
    ):
        return "card-heavy-modern"

    if (
        row.get("section_count", 0) >= thresholds["high_sections"]
        and row.get("heading_count", 0) >= thresholds["high_headings"]
    ):
        return "section-rich-landing"

    if (
        row.get("color_count", 0) <= thresholds["low_colors"]
        and row.get("shadow_count", 0) == 0
        and row.get("card_count", 0) <= thresholds["high_cards"]
    ):
        return "minimal-clean"

    return "balanced-modern"

df["design_profile"] = df.apply(classify_profile, axis=1)

def avg(frame: pd.DataFrame, col: str) -> float:
    if col not in frame.columns or len(frame) == 0:
        return 0.0
    return round(float(frame[col].mean()), 2)

def rate(frame: pd.DataFrame, col: str) -> float:
    if col not in frame.columns or len(frame) == 0:
        return 0.0
    return round(float((frame[col] > 0).mean()), 2)

def infer_density(stats: dict) -> str:
    score = (
        stats["avgSections"]
        + stats["avgCards"]
        + stats["avgHeadings"]
    )

    if score >= 28:
        return "rich"

    if score >= 14:
        return "medium"

    return "minimal"

def infer_spacing(stats: dict) -> str:
    score = stats["avgPadding"] + stats["avgMargin"]

    if score >= 18:
        return "spacious"

    if score >= 7:
        return "balanced"

    return "compact"

def infer_animation(profile: str, density: str) -> str:
    if profile == "image-rich-gallery":
        return "staggered-gallery"

    if profile == "card-heavy-modern":
        return "card-stagger-up"

    if profile == "form-focused":
        return "soft-fade-up"

    if profile == "section-rich-landing":
        return "section-fade-up"

    if density == "rich":
        return "section-stagger"

    return "soft-fade-up"

def backend_preset(profile: str, spacing: str, has_shadow: bool) -> dict:
    section_padding = {
        "spacious": "96px 40px",
        "balanced": "80px 40px",
        "compact": "64px 28px",
    }[spacing]

    if profile == "minimal-clean":
        return {
            "sectionPadding": section_padding,
            "cardRadius": "14px",
            "cardShadow": "none",
            "gridGap": "22px",
            "buttonRadius": "12px",
            "imageRadius": "18px",
        }

    if profile == "image-rich-gallery":
        return {
            "sectionPadding": section_padding,
            "cardRadius": "22px",
            "cardShadow": "0 18px 45px rgba(15, 23, 42, 0.10)",
            "gridGap": "28px",
            "buttonRadius": "14px",
            "imageRadius": "24px",
        }

    if profile == "card-heavy-modern":
        return {
            "sectionPadding": section_padding,
            "cardRadius": "20px",
            "cardShadow": "0 20px 50px rgba(15, 23, 42, 0.12)",
            "gridGap": "30px",
            "buttonRadius": "14px",
            "imageRadius": "20px",
        }

    if profile == "form-focused":
        return {
            "sectionPadding": section_padding,
            "cardRadius": "20px",
            "cardShadow": "0 18px 45px rgba(15, 23, 42, 0.10)",
            "gridGap": "28px",
            "buttonRadius": "14px",
            "imageRadius": "18px",
        }

    return {
        "sectionPadding": section_padding,
        "cardRadius": "18px",
        "cardShadow": (
            "0 14px 36px rgba(15, 23, 42, 0.10)"
            if has_shadow
            else "0 8px 24px rgba(15, 23, 42, 0.08)"
        ),
        "gridGap": "26px",
        "buttonRadius": "14px",
        "imageRadius": "18px",
    }

profiles = {}

for profile_name, group in df.groupby("design_profile"):
    stats = {
        "rows": int(len(group)),
        "avgButtons": avg(group, "button_count"),
        "avgCards": avg(group, "card_count"),
        "avgSections": avg(group, "section_count"),
        "avgForms": avg(group, "form_count"),
        "avgImages": avg(group, "image_count"),
        "avgLinks": avg(group, "link_count"),
        "avgHeadings": avg(group, "heading_count"),
        "avgColors": avg(group, "color_count"),
        "avgFontSizes": avg(group, "font_size_count"),
        "avgRadius": avg(group, "radius_count"),
        "avgShadows": avg(group, "shadow_count"),
        "avgPadding": avg(group, "padding_count"),
        "avgMargin": avg(group, "margin_count"),
        "heroRate": rate(group, "has_hero"),
        "pricingRate": rate(group, "has_pricing"),
        "testimonialRate": rate(group, "has_testimonials"),
        "faqRate": rate(group, "has_faq"),
        "contactRate": rate(group, "has_contact"),
        "servicesRate": rate(group, "has_services"),
        "portfolioRate": rate(group, "has_portfolio"),
    }

    density = infer_density(stats)
    spacing = infer_spacing(stats)
    animation = infer_animation(profile_name, density)

    profiles[profile_name] = {
        "stats": stats,
        "profile": {
            "layoutDensity": density,
            "spacingStyle": spacing,
            "visualStyle": profile_name,
            "heroStyle": (
                "hero-first"
                if stats["heroRate"] >= 0.4
                else "simple-top-section"
            ),
            "cardStyle": (
                "soft-rounded-shadow"
                if stats["avgShadows"] > 0
                else "clean-flat"
            ),
            "buttonStyle": (
                "rounded-primary"
                if stats["avgButtons"] > 0
                else "simple-link"
            ),
            "animationPreset": animation,
        },
        "backendDesignPreset": backend_preset(
            profile_name,
            spacing,
            stats["avgShadows"] > 0,
        ),
    }

result = {
    "source": "WebSight 5000 HTML sample",
    "rows": int(len(df)),
    "profileCounts": df["design_profile"].value_counts().to_dict(),
    "profiles": profiles,
    "recommendedUsage": {
    "Medical": "form-focused",
    "Healthcare": "form-focused",
    "Restaurant": "image-rich-gallery",
    "FoodHospitality": "image-rich-gallery",
    "RealEstate": "image-rich-gallery",
    "Portfolio": "image-rich-gallery",
    "Agency": "card-heavy-modern",
    "Technology": "card-heavy-modern",
    "Corporate": "card-heavy-modern",
    "Business": "card-heavy-modern",
    "Finance": "card-heavy-modern",
    "Default": "card-heavy-modern",
},
  
}

df.to_csv(OUT_LABELED, index=False, encoding="utf-8")

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("=" * 80)
print("Rows:", len(df))
print("\nProfile counts:")
print(df["design_profile"].value_counts())
print("\nSaved labeled CSV:", OUT_LABELED.resolve())
print("Saved design profiles:", OUT_JSON.resolve())
print("\nPreview JSON:")
print(json.dumps(result["recommendedUsage"], indent=2))