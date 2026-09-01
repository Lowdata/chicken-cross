#!/usr/bin/env python3
"""
NFT Image Generator – Bunny Cross Collection
=============================================
Generates 100 unique layered NFT images from /pong asset folders
and writes an OpenSea-compatible metadata CSV.

RULES
-----
1.  Body group (mutually exclusive, strict round-robin cycle):
        Ears  ->  Breed  ->  Fur  ->  Skin  ->  Ears  -> ...
    Token #2 starts at Ears, token #3 at Breed, etc.
    ONLY ONE from this group is ever used per image.

2.  Origin Region CANNOT be combined with Background
    (Origin Region already contains bg).  Use one or the other.

3.  Eyes CANNOT appear with Eyewear UNLESS the eyewear is one of
    the eye-compatible "simple frame" types:
        Classic Rectangle, Full-Face Cracked Porcelain Mask,
        Heart-Shape Frame, Monocle, Round Wire Frames,
        Star-Shape Frame, Thick Wayfarer.

4.  Token #1  ->  Hatchling from "1-1 Special" (standalone, no layers).
    Tokens #2-100 are fully generated; "1-1 Special" folder is EXCLUDED.

LAYER ORDER (bottom -> top)
--------------------------
 1. Background  OR  Origin Region  (never both)
 2. Aura / Power Effect             (optional)
 3. Body: exactly ONE of Skin | Breed | Ears | Fur  (round-robin)
 4. Eyes                            (optional)
 5. Mouths                          (optional)
 6. Footwear                        (optional)
 7. Bottoms                         (optional)
 8. Specialty                       (optional)
 9. Clothing                        (optional)
10. Body Accessories                (optional)
11. Facial Hair                     (optional)
12. Face Accessories                (optional)
13. Headwear                        (optional)
14. Eyewear                         (optional, restricted by Eyes rule)
15. Held Items                      (optional)
16. Companion / Pet                 (optional)
"""

import csv
import json
import random
import sys
from collections import Counter
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required.  Run:  pip install Pillow")
    sys.exit(1)

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
SCRIPT_DIR  = Path(__file__).parent
PONG_DIR    = SCRIPT_DIR / "pong"
OUTPUT_DIR  = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

TOTAL_SUPPLY  = 100
CANVAS_SIZE   = (1000, 1000)
SEED          = 42

COLLECTION_NAME        = "Bunny Cross Collection"
COLLECTION_DESCRIPTION = (
    "A collection of 100 uniquely generated bunny NFTs, each with rare traits "
    "across backgrounds, body types, accessories, and special companions."
)

# ---------------------------------------------------------------------------
# EYEWEAR COMPATIBLE WITH EYES
# (these are the only eyewear pieces allowed when Eyes trait is present)
# ---------------------------------------------------------------------------
EYES_COMPATIBLE_EYEWEAR = {
    "Classic Rectangle.png",
    "Full-Face Cracked Porcelain Mask.png",
    "Heart-Shape Frame.png",
    "Monocle.png",
    "Round Wire Frames.png",
    "Star-Shape Frame.png",
    "Thick Wayfarer.png",
}

# ---------------------------------------------------------------------------
# FOLDER MAP
# ---------------------------------------------------------------------------
FOLDERS = {
    "Background"       : PONG_DIR / "Backgrounds",
    "Aura"             : PONG_DIR / "Aura - Power Effect ",
    "Skin"             : PONG_DIR / "Skin - Material ",
    "Breed"            : PONG_DIR / "Breed - Kind",
    "Ears"             : PONG_DIR / "Ears",
    "Fur"              : PONG_DIR / "Fur - Body",
    "OriginRegion"     : PONG_DIR / "Origin Region",
    "Eyes"             : PONG_DIR / "Eyes",
    "Mouths"           : PONG_DIR / "Mouths",
    "Footwear"         : PONG_DIR / "Footwear",
    "Bottoms"          : PONG_DIR / "Bottoms",
    "Specialty"        : PONG_DIR / "Specialty",
    "Clothing"         : PONG_DIR / "Clothing",
    "BodyAccessories"  : PONG_DIR / "Body Accessories",
    "FacialHair"       : PONG_DIR / "Facial Hair",
    "FaceAccessories"  : PONG_DIR / "Face Accessories",
    "Headwear"         : PONG_DIR / "Headwears",
    "Eyewear"          : PONG_DIR / "Eyewear ",
    "HeldItems"        : PONG_DIR / "Held Items",
    "Companion"        : PONG_DIR / "Companion - Pet ",
    # 1-1 Special folder is completely excluded from generation
}

# Body-group round-robin order
BODY_CYCLE = ["Ears", "Breed", "Fur", "Skin"]


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def list_assets(folder: Path) -> list:
    """Sorted list of PNG filenames in a folder; skips hidden / DS_Store."""
    if not folder.exists():
        print(f"  WARNING: folder not found: {folder}")
        return []
    return sorted(
        f.name
        for f in folder.iterdir()
        if f.suffix.lower() == ".png" and not f.name.startswith(".")
    )


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA").resize(CANVAS_SIZE, Image.LANCZOS)


def composite(base: Image.Image, layer_path: Path) -> Image.Image:
    if not layer_path.exists():
        print(f"  WARNING: missing asset '{layer_path.name}', skipping layer.")
        return base
    layer = load_rgba(layer_path)
    base.alpha_composite(layer)
    return base


def maybe(probability: float = 0.5) -> bool:
    return random.random() < probability


def strip_ext(filename: str) -> str:
    """Remove .png / .PNG extension for clean trait names."""
    if not filename or filename == "None":
        return "None"
    return Path(filename).stem


def rarity_pct(counter: Counter, value: str, total: int) -> str:
    if not value or value == "None":
        return ""
    pct = counter[value] / total * 100
    return f"{pct:.1f}%"


# ---------------------------------------------------------------------------
# PRE-LOAD ASSET LISTS
# ---------------------------------------------------------------------------
print("Loading asset lists ...")
assets = {k: list_assets(v) for k, v in FOLDERS.items()}

for key, lst in assets.items():
    print(f"  {key}: {len(lst)} assets")

# ---------------------------------------------------------------------------
# METADATA ACCUMULATOR
# ---------------------------------------------------------------------------
metadata_rows = []

# ---------------------------------------------------------------------------
# TOKENS #1-100  (all fully generated, no 1-1 Special)
# ---------------------------------------------------------------------------
random.seed(SEED)
used_combos = set()

for token_idx in range(1, TOTAL_SUPPLY + 1):
    max_attempts = 500
    traits = {}

    for attempt in range(max_attempts):
        traits = {}

        # 1. Background OR Origin Region (never both)
        use_origin = maybe(0.15) and bool(assets.get("OriginRegion"))
        if use_origin:
            traits["OriginRegion"] = random.choice(assets["OriginRegion"])
            traits["Background"]   = "None"
        else:
            traits["Background"]   = (
                random.choice(assets["Background"]) if assets.get("Background") else "None"
            )
            traits["OriginRegion"] = "None"

        # 2. Aura / Power Effect (optional ~40%)
        traits["Aura"] = (
            random.choice(assets["Aura"]) if (maybe(0.40) and assets.get("Aura")) else "None"
        )

        # 3. Body - strict round-robin, EXACTLY ONE group
        # token #2 -> index 0 (Ears), token #3 -> index 1 (Breed), etc.
        body_group = BODY_CYCLE[(token_idx - 1) % len(BODY_CYCLE)]
        traits["BodyGroup"] = body_group
        traits["BodyAsset"] = (
            random.choice(assets[body_group]) if assets.get(body_group) else "None"
        )

        # 4. Eyes (optional ~75%)
        traits["Eyes"] = (
            random.choice(assets["Eyes"]) if (maybe(0.75) and assets.get("Eyes")) else "None"
        )

        # 5. Mouths (optional ~80%)
        traits["Mouths"] = (
            random.choice(assets["Mouths"]) if (maybe(0.80) and assets.get("Mouths")) else "None"
        )

        # 6. Footwear (optional ~60%)
        traits["Footwear"] = (
            random.choice(assets["Footwear"]) if (maybe(0.60) and assets.get("Footwear")) else "None"
        )

        # 7. Bottoms (optional ~60%)
        traits["Bottoms"] = (
            random.choice(assets["Bottoms"]) if (maybe(0.60) and assets.get("Bottoms")) else "None"
        )

        # 8. Specialty (optional ~30%)
        traits["Specialty"] = (
            random.choice(assets["Specialty"]) if (maybe(0.30) and assets.get("Specialty")) else "None"
        )

        # 9. Clothing (optional ~70%)
        traits["Clothing"] = (
            random.choice(assets["Clothing"]) if (maybe(0.70) and assets.get("Clothing")) else "None"
        )

        # 10. Body Accessories (optional ~45%)
        traits["BodyAccessories"] = (
            random.choice(assets["BodyAccessories"])
            if (maybe(0.45) and assets.get("BodyAccessories"))
            else "None"
        )

        # 11. Facial Hair (optional ~25%)
        traits["FacialHair"] = (
            random.choice(assets["FacialHair"]) if (maybe(0.25) and assets.get("FacialHair")) else "None"
        )

        # 12. Face Accessories (optional ~35%)
        traits["FaceAccessories"] = (
            random.choice(assets["FaceAccessories"])
            if (maybe(0.35) and assets.get("FaceAccessories"))
            else "None"
        )

        # 13. Headwear (optional ~55%)
        traits["Headwear"] = (
            random.choice(assets["Headwear"]) if (maybe(0.55) and assets.get("Headwear")) else "None"
        )

        # 14. Eyewear (optional ~45%, restricted by Eyes rule)
        if maybe(0.45) and assets.get("Eyewear"):
            if traits["Eyes"] != "None":
                # Eyes present -> only allow compatible simple frames
                pool = [ew for ew in assets["Eyewear"] if ew in EYES_COMPATIBLE_EYEWEAR]
            else:
                pool = assets["Eyewear"]
            traits["Eyewear"] = random.choice(pool) if pool else "None"
        else:
            traits["Eyewear"] = "None"

        # 15. Held Items (optional ~40%)
        traits["HeldItems"] = (
            random.choice(assets["HeldItems"]) if (maybe(0.40) and assets.get("HeldItems")) else "None"
        )

        # 16. Companion / Pet (optional ~30%)
        traits["Companion"] = (
            random.choice(assets["Companion"]) if (maybe(0.30) and assets.get("Companion")) else "None"
        )

        # Uniqueness guard
        combo_key = json.dumps(traits, sort_keys=True)
        if combo_key not in used_combos:
            used_combos.add(combo_key)
            break
    else:
        print(
            f"  WARNING: could not find unique combo for #{token_idx} "
            f"after {max_attempts} attempts - using last generated."
        )

    # Compose image
    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))

    # Layer 1: Background OR Origin Region
    if traits.get("Background", "None") != "None":
        canvas = composite(canvas, FOLDERS["Background"] / traits["Background"])
    elif traits.get("OriginRegion", "None") != "None":
        canvas = composite(canvas, FOLDERS["OriginRegion"] / traits["OriginRegion"])

    # Layer 2: Aura
    if traits.get("Aura", "None") != "None":
        canvas = composite(canvas, FOLDERS["Aura"] / traits["Aura"])

    # Layer 3: Body (exactly one of Ears / Breed / Fur / Skin)
    if traits.get("BodyAsset", "None") != "None":
        canvas = composite(canvas, FOLDERS[traits["BodyGroup"]] / traits["BodyAsset"])

    # Layer 4: Eyes
    if traits.get("Eyes", "None") != "None":
        canvas = composite(canvas, FOLDERS["Eyes"] / traits["Eyes"])

    # Layer 5: Mouths
    if traits.get("Mouths", "None") != "None":
        canvas = composite(canvas, FOLDERS["Mouths"] / traits["Mouths"])

    # Layer 6: Footwear
    if traits.get("Footwear", "None") != "None":
        canvas = composite(canvas, FOLDERS["Footwear"] / traits["Footwear"])

    # Layer 7: Bottoms
    if traits.get("Bottoms", "None") != "None":
        canvas = composite(canvas, FOLDERS["Bottoms"] / traits["Bottoms"])

    # Layer 8: Specialty
    if traits.get("Specialty", "None") != "None":
        canvas = composite(canvas, FOLDERS["Specialty"] / traits["Specialty"])

    # Layer 9: Clothing
    if traits.get("Clothing", "None") != "None":
        canvas = composite(canvas, FOLDERS["Clothing"] / traits["Clothing"])

    # Layer 10: Body Accessories
    if traits.get("BodyAccessories", "None") != "None":
        canvas = composite(canvas, FOLDERS["BodyAccessories"] / traits["BodyAccessories"])

    # Layer 11: Facial Hair
    if traits.get("FacialHair", "None") != "None":
        canvas = composite(canvas, FOLDERS["FacialHair"] / traits["FacialHair"])

    # Layer 12: Face Accessories
    if traits.get("FaceAccessories", "None") != "None":
        canvas = composite(canvas, FOLDERS["FaceAccessories"] / traits["FaceAccessories"])

    # Layer 13: Headwear
    if traits.get("Headwear", "None") != "None":
        canvas = composite(canvas, FOLDERS["Headwear"] / traits["Headwear"])

    # Layer 14: Eyewear
    if traits.get("Eyewear", "None") != "None":
        canvas = composite(canvas, FOLDERS["Eyewear"] / traits["Eyewear"])

    # Layer 15: Held Items
    if traits.get("HeldItems", "None") != "None":
        canvas = composite(canvas, FOLDERS["HeldItems"] / traits["HeldItems"])

    # Layer 16: Companion / Pet
    if traits.get("Companion", "None") != "None":
        canvas = composite(canvas, FOLDERS["Companion"] / traits["Companion"])

    # Save image
    out_name = f"{token_idx:04d}.png"
    canvas.convert("RGB").save(OUTPUT_DIR / out_name)

    body_info = f"{traits['BodyGroup']}={strip_ext(traits.get('BodyAsset', 'None'))}"
    print(
        f"[{token_idx}/{TOTAL_SUPPLY}] {out_name} "
        f"| {body_info} "
        f"| Eyes={strip_ext(traits.get('Eyes', 'None'))} "
        f"| Eyewear={strip_ext(traits.get('Eyewear', 'None'))}"
    )

    # Build metadata row
    bg_val = (
        strip_ext(traits["OriginRegion"])
        if traits.get("OriginRegion", "None") != "None"
        else strip_ext(traits.get("Background", "None"))
    )

    skin_val = strip_ext(traits["BodyAsset"]) if traits["BodyGroup"] == "Skin"  else "None"
    body_val = strip_ext(traits["BodyAsset"]) if traits["BodyGroup"] != "Skin"  else "None"

    metadata_rows.append({
        "tokenID"                    : token_idx,
        "name"                       : f"{COLLECTION_NAME} #{token_idx}",
        "description"                : COLLECTION_DESCRIPTION,
        "file_name"                  : out_name,
        "attributes[Background]"     : bg_val,
        "attributes[SKIN]"           : skin_val,
        "attributes[Outfits]"        : strip_ext(traits.get("Clothing",         "None")),
        "attributes[Mouth]"          : strip_ext(traits.get("Mouths",           "None")),
        "attributes[Eyes]"           : strip_ext(traits.get("Eyes",             "None")),
        "trait_Eyes_rarity"          : "",
        "trait_Sunglasses"           : strip_ext(traits.get("Eyewear",          "None")),
        "trait_Sunglasses_rarity"    : "",
        "trait_Cap"                  : strip_ext(traits.get("Headwear",         "None")),
        "trait_Cap_rarity"           : "",
        "attributes[Body]"           : body_val,
        "attributes[BodyGroup]"      : traits["BodyGroup"],
        "attributes[Aura]"           : strip_ext(traits.get("Aura",             "None")),
        "attributes[Footwear]"       : strip_ext(traits.get("Footwear",         "None")),
        "attributes[Bottoms]"        : strip_ext(traits.get("Bottoms",          "None")),
        "attributes[Specialty]"      : strip_ext(traits.get("Specialty",        "None")),
        "attributes[Clothing]"       : strip_ext(traits.get("Clothing",         "None")),
        "attributes[BodyAccessories]": strip_ext(traits.get("BodyAccessories",  "None")),
        "attributes[FacialHair]"     : strip_ext(traits.get("FacialHair",       "None")),
        "attributes[FaceAccessories]": strip_ext(traits.get("FaceAccessories",  "None")),
        "attributes[Headwear]"       : strip_ext(traits.get("Headwear",         "None")),
        "attributes[HeldItems]"      : strip_ext(traits.get("HeldItems",        "None")),
        "attributes[Companion]"      : strip_ext(traits.get("Companion",        "None")),
        "attributes[OriginRegion]"   : strip_ext(traits.get("OriginRegion",     "None")),
    })

# ---------------------------------------------------------------------------
# RARITY CALCULATION  (post-loop, across all 100 tokens)
# ---------------------------------------------------------------------------
print("\nCalculating rarity ...")

eyes_counter     = Counter(r["attributes[Eyes]"]  for r in metadata_rows)
eyewear_counter  = Counter(r["trait_Sunglasses"]  for r in metadata_rows)
headwear_counter = Counter(r["trait_Cap"]         for r in metadata_rows)

for row in metadata_rows:
    row["trait_Eyes_rarity"]       = rarity_pct(eyes_counter,     row["attributes[Eyes]"],  TOTAL_SUPPLY)
    row["trait_Sunglasses_rarity"] = rarity_pct(eyewear_counter,  row["trait_Sunglasses"],  TOTAL_SUPPLY)
    row["trait_Cap_rarity"]        = rarity_pct(headwear_counter,  row["trait_Cap"],         TOTAL_SUPPLY)

# ---------------------------------------------------------------------------
# WRITE CSV  (OpenSea-compatible, reference column order)
# ---------------------------------------------------------------------------
CSV_PATH = OUTPUT_DIR / "metadata.csv"

FIELDNAMES = [
    "tokenID",
    "name",
    "description",
    "file_name",
    "attributes[Background]",
    "attributes[SKIN]",
    "attributes[Outfits]",
    "attributes[Mouth]",
    "attributes[Eyes]",
    "trait_Eyes_rarity",
    "trait_Sunglasses",
    "trait_Sunglasses_rarity",
    "trait_Cap",
    "trait_Cap_rarity",
    # Extended columns
    "attributes[Body]",
    "attributes[BodyGroup]",
    "attributes[Aura]",
    "attributes[Footwear]",
    "attributes[Bottoms]",
    "attributes[Specialty]",
    "attributes[Clothing]",
    "attributes[BodyAccessories]",
    "attributes[FacialHair]",
    "attributes[FaceAccessories]",
    "attributes[Headwear]",
    "attributes[HeldItems]",
    "attributes[Companion]",
    "attributes[OriginRegion]",
]

with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(metadata_rows)

print(f"\nDone!  {TOTAL_SUPPLY} images saved to:  {OUTPUT_DIR}/")
print(f"Metadata CSV saved to: {CSV_PATH}")
