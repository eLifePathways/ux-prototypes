"""
Step 2: Build papers_fresh.json with a spread of v1 / v2 / VoR across subfields,
        plus eLife Assessment data (significance + strength terms) for each paper.

Strategy:
  - OpenAlex topics/keywords come from the indexed (VoR) version — that's fine.
  - For each paper, we fetch its full version history from the eLife API.
  - Within each subfield we rotate the target version: v1 → v2 → VoR → v1 …
  - The JSON stores the target version's number, status, and date.
  - Papers where the target version doesn't exist fall back to the earliest available.
  - Assessment data is fetched from the latest available article version.

Reads:  openalex_raw.json  (produced by discover_elife_subjects.py)
Writes: papers_fresh.json

Optional flags:
  --debug-assessment  Print the raw API response for the first paper to help
                      verify the assessment data structure.
"""

import json
import sys
import time
import requests
from collections import defaultdict, Counter

MAILTO = "c.huggins@elifesciences.org"

CHOSEN_SUBFIELDS = [
    "Molecular Biology",
    "Cognitive Neuroscience",
    "Cell Biology",
    "Genetics",
    "Cellular and Molecular Neuroscience",
    "Immunology",
    "Epidemiology",
]

MAX_PER_SUBFIELD = 10  # up to 10 per subfield → max ~70 papers total

DEBUG_ASSESSMENT = "--debug-assessment" in sys.argv

# eLife assessment terms
SIGNIFICANCE_TERMS = ["Landmark", "Fundamental", "Important", "Valuable", "Useful"]
STRENGTH_TERMS     = ["Exceptional", "Compelling", "Convincing", "Solid", "Incomplete", "Inadequate"]


# ── helpers ──────────────────────────────────────────────────────────────────

def primary_subfield(paper):
    topics = paper.get("topics", [])
    if topics:
        return topics[0].get("subfield", {}).get("display_name", "Unknown")
    return "Unknown"


def extract_article_id(doi):
    """'10.7554/eLife.112378' or '10.7554/elife.99874.4' → '112378' / '99874'"""
    if not doi:
        return None
    doi_lower = doi.lower()
    if "elife." in doi_lower:
        part = doi[doi_lower.index("elife.") + 6:]
        return part.split(".")[0]
    return None


def get_article_versions(article_id):
    """
    Returns a sorted list of dicts: [{version, status, date}, …]
    Tries /versions endpoint; falls back to /articles/{id} for single version.
    """
    url = f"https://api.elifesciences.org/articles/{article_id}/versions"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            # API may return a list or {"versions": [...]}
            items = data if isinstance(data, list) else data.get("versions", [])
            if items:
                versions = [
                    {
                        "version": v.get("version"),
                        "status":  v.get("status", ""),
                        "date":    v.get("published") or v.get("statusDate") or v.get("versionDate") or "",
                    }
                    for v in items
                    if v.get("version") is not None
                ]
                return sorted(versions, key=lambda x: x["version"])
    except Exception as e:
        print(f"    ⚠ versions API error for {article_id}: {e}")

    # Fallback: single article call
    try:
        r2 = requests.get(f"https://api.elifesciences.org/articles/{article_id}", timeout=10)
        if r2.status_code == 200:
            d = r2.json()
            return [{
                "version": d.get("version"),
                "status":  d.get("status", "vor"),
                "date":    d.get("published") or d.get("statusDate") or "",
            }]
    except Exception:
        pass

    return []


def pick_version(versions, rotation_index):
    """
    Pick a target version based on rotation_index % 3:
      0 → earliest (v1)
      1 → middle   (v2, or v1 if only one exists)
      2 → latest   (VoR / highest version)
    Falls back gracefully if the requested depth doesn't exist.
    """
    if not versions:
        return None

    cycle = rotation_index % 3
    if cycle == 0:
        return versions[0]                          # earliest
    elif cycle == 1:
        return versions[1] if len(versions) >= 2 else versions[0]   # middle
    else:
        return versions[-1]                         # latest / VoR


def version_label(version_num, status):
    if version_num is None:
        return "Unknown"
    if status and "vor" in status.lower():
        return "Version of Record"
    return f"v{version_num}"


# ── assessment helpers ────────────────────────────────────────────────────────

def extract_text_from_content(content):
    """Recursively extract plain text from eLife JSON content blocks."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join(extract_text_from_content(c) for c in content).strip()
    if isinstance(content, dict):
        text = content.get("text")
        if text is not None:
            return text
        children = content.get("content", [])
        return extract_text_from_content(children)
    return ""


def extract_html_from_content(content):
    """
    Recursively extract HTML from eLife ProseMirror JSON content blocks,
    preserving bold marks as <b> tags.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            chunk = extract_html_from_content(item)
            if chunk:
                parts.append(chunk)
        return " ".join(parts).strip()
    if isinstance(content, dict):
        node_type = content.get("type", "")
        # Text leaf node
        text = content.get("text")
        if text is not None:
            marks = content.get("marks", [])
            is_bold = any(
                m.get("type") in ("bold", "strong") for m in marks
            )
            import html as _html
            escaped = _html.escape(text)
            return f"<b>{escaped}</b>" if is_bold else escaped
        # Block nodes — recurse into children
        children = content.get("content", [])
        inner = extract_html_from_content(children)
        # Separate paragraphs with a space rather than nothing
        if node_type == "paragraph":
            return inner
        return inner
    return ""


def find_bold_terms(content, target_terms):
    """
    Walk content blocks recursively and return any target_terms that carry a
    bold or strong mark.  eLife content uses ProseMirror-style JSON:
      { "type": "text", "text": "Important", "marks": [{"type": "bold"}] }
    """
    found = []
    if isinstance(content, list):
        for block in content:
            found.extend(find_bold_terms(block, target_terms))
    elif isinstance(content, dict):
        marks = content.get("marks", [])
        is_bold = any(
            m.get("type") in ("bold", "strong") or m.get("type", "").startswith("bold")
            for m in marks
        )
        text = content.get("text", "").strip().rstrip(".")
        if is_bold and text in target_terms:
            found.append(text)
        # Recurse into children
        found.extend(find_bold_terms(content.get("content", []), target_terms))
    return found


def scan_text_for_terms(text, terms):
    """
    Fallback: plain-text scan for terms when structured bold parsing finds nothing.
    Returns the first matching term found near the start of the text.
    """
    for term in terms:
        if term.lower() in text.lower():
            return term
    return None


_debug_printed = False  # print debug output only for first paper


def get_elife_assessment(article_id):
    """
    Fetch eLife assessment data for an article.
    Tries /articles/{id} and looks in several possible locations for
    assessment / evaluation-summary content.

    Returns:
        {
          "significance":  str | None,   # e.g. "Important"
          "strength":      str | None,   # e.g. "Convincing"
          "summaryText":   str | None,   # full HTML text of evaluation summary (may contain <b> tags)
        }
    """
    global _debug_printed
    result = {"significance": None, "strength": None, "summaryText": None, "seniorEditor": None, "seniorEditorInstitution": None, "reviewingEditor": None, "reviewingEditorInstitution": None}

    try:
        r = requests.get(
            f"https://api.elifesciences.org/articles/{article_id}",
            timeout=10,
        )
        if r.status_code != 200:
            print(f"    ⚠ assessment: HTTP {r.status_code} for {article_id}")
            return result

        data = r.json()

        # ── DEBUG: dump the top-level keys (and assessment block if present) ──
        if DEBUG_ASSESSMENT and not _debug_printed:
            _debug_printed = True
            print(f"\n{'─'*60}")
            print(f"DEBUG — raw API response keys for article {article_id}:")
            print(json.dumps(list(data.keys()), indent=2))
            for key in ("elifeAssessment", "assessment", "peerReview", "peerReviewProcess"):
                if key in data:
                    print(f"\n  → '{key}' found. Keys inside:")
                    inner = data[key]
                    if isinstance(inner, dict):
                        print(json.dumps(list(inner.keys()), indent=2))
                        print(f"\n  → '{key}' raw (first 2000 chars):")
                        print(json.dumps(inner, indent=2)[:2000])
                    else:
                        print(json.dumps(inner, indent=2)[:2000])
            # Also print raw reviewer data
            print(f"\n--- reviewers ---")
            print(json.dumps(data.get("reviewers", []), indent=2)[:1000])
            print(f"{'─'*60}\n")

        # ── Extract editors (field is "reviewers", role in "role" key) ─────────
        for ed in data.get("reviewers", []):
            name = ed.get("name", {}).get("preferred", "")
            if not name:
                continue
            role = ed.get("role", "")
            # Extract institution: "Name of Institution, Country"
            affiliations = ed.get("affiliations", [])
            institution = None
            if affiliations:
                aff = affiliations[0]
                aff_name = aff.get("name", [])
                org = aff_name[0] if isinstance(aff_name, list) and aff_name else (aff_name if isinstance(aff_name, str) else None)
                country = aff.get("address", {}).get("components", {}).get("country", "")
                if org and country:
                    institution = f"{org}, {country}"
                elif org:
                    institution = org
            if role == "Senior Editor" and not result["seniorEditor"]:
                result["seniorEditor"] = name
                result["seniorEditorInstitution"] = institution
            elif role == "Reviewing Editor" and not result["reviewingEditor"]:
                result["reviewingEditor"] = name
                result["reviewingEditorInstitution"] = institution

        # ── Path 1: "elifeAssessment" block (current schema) ────────────────
        assessment = data.get("elifeAssessment")
        if assessment:
            sig_list  = assessment.get("significance", [])
            stre_list = assessment.get("strength", [])
            content   = assessment.get("content", [])
            full_text = extract_html_from_content(content)

            result["significance"] = sig_list[0].capitalize()  if sig_list  else None
            result["strength"]     = stre_list[0].capitalize() if stre_list else None
            result["summaryText"]  = full_text if full_text else None

            # ── Path 2: try reviewed-preprints endpoint for longer text ──────
            # The /articles/{id} endpoint sometimes returns truncated assessment
            # content. The reviewed-preprints endpoint may have the full text.
            try:
                rp = requests.get(
                    f"https://api.elifesciences.org/reviewed-preprints/{article_id}",
                    timeout=10,
                )
                if rp.status_code == 200:
                    rp_data = rp.json()
                    rp_assessment = rp_data.get("elifeAssessment") or rp_data.get("assessment")
                    if rp_assessment:
                        rp_content = rp_assessment.get("content", [])
                        rp_text = extract_html_from_content(rp_content)
                        # Use whichever is longer
                        if rp_text and len(rp_text) > len(full_text or ""):
                            result["summaryText"] = rp_text
                        # Also try to get terms from here if missing
                        if not result["significance"]:
                            rp_sig = rp_assessment.get("significance", [])
                            result["significance"] = rp_sig[0].capitalize() if rp_sig else None
                        if not result["strength"]:
                            rp_stre = rp_assessment.get("strength", [])
                            result["strength"] = rp_stre[0].capitalize() if rp_stre else None
            except Exception:
                pass  # silently fall back to article-endpoint text

            return result

    except Exception as e:
        print(f"    ⚠ assessment error for {article_id}: {e}")

    return result


# ── paper formatter ───────────────────────────────────────────────────────────

def format_paper(openalex_paper, chosen_version, all_versions, assessment):
    doi = openalex_paper.get("doi", "").replace("https://doi.org/", "")
    article_id = extract_article_id(doi)
    topics  = openalex_paper.get("topics", [])
    primary = topics[0] if topics else {}

    v_num    = chosen_version["version"] if chosen_version else None
    v_status = chosen_version["status"]  if chosen_version else "vor"
    v_date   = chosen_version["date"]    if chosen_version else openalex_paper.get("publication_date", "")

    return {
        "id":    article_id,
        "doi":   doi,
        "url":   f"https://doi.org/{doi}",
        "date":  v_date or openalex_paper.get("publication_date", ""),

        "domain":       primary.get("domain",    {}).get("display_name", ""),
        "field":        primary.get("field",     {}).get("display_name", ""),
        "subfield":     primary.get("subfield",  {}).get("display_name", ""),
        "primaryTopic": primary.get("display_name", ""),

        "topics": [
            {
                "name":     t.get("display_name", ""),
                "subfield": t.get("subfield", {}).get("display_name", ""),
                "score":    round(t.get("score", 0)),
            }
            for t in topics[:3]
        ],
        "keywords": [
            {
                "name":  c.get("display_name", ""),
                "score": round(c.get("score", 0) * 100),
            }
            for c in sorted(
                [c for c in openalex_paper.get("concepts", []) if c.get("level", 0) >= 2],
                key=lambda c: c.get("score", 0),
                reverse=True
            )[:10]
        ],
        "authors": ", ".join(
            a.get("author", {}).get("display_name", "")
            for a in openalex_paper.get("authorships", [])
            if a.get("author", {}).get("display_name")
        ),
        "title":        openalex_paper.get("title", ""),

        # Version fields
        "version":       version_label(v_num, v_status),
        "versionNumber": v_num,
        "elifeStatus":   v_status,
        "totalVersions": len(all_versions),

        # Assessment fields (None if not available for this article)
        "assessmentSignificance": assessment.get("significance"),
        "assessmentStrength":     assessment.get("strength"),
        "assessmentSummary":      assessment.get("summaryText"),

        # Editor fields
        "seniorEditor":              assessment.get("seniorEditor"),
        "seniorEditorInstitution":   assessment.get("seniorEditorInstitution"),
        "reviewingEditor":           assessment.get("reviewingEditor"),
        "reviewingEditorInstitution": assessment.get("reviewingEditorInstitution"),
    }


# ── main ─────────────────────────────────────────────────────────────────────

def select_papers(raw):
    buckets = defaultdict(list)
    for p in raw:
        sf = primary_subfield(p)
        if sf in CHOSEN_SUBFIELDS:
            buckets[sf].append(p)

    selected_by_subfield = {}
    print("Papers selected per subfield:")
    for sf in CHOSEN_SUBFIELDS:
        batch = buckets[sf][:MAX_PER_SUBFIELD]
        selected_by_subfield[sf] = batch
        print(f"  {sf:<55} {len(batch)}")
    return selected_by_subfield


if __name__ == "__main__":
    with open("openalex_raw.json") as f:
        raw = json.load(f)
    print(f"Loaded {len(raw)} papers from openalex_raw.json\n")

    selected_by_subfield = select_papers(raw)
    total = sum(len(v) for v in selected_by_subfield.values())
    print(f"\nTotal selected: {total}\n")

    if DEBUG_ASSESSMENT:
        print("─── DEBUG MODE: will print raw API response for first paper ───\n")

    print("Fetching version histories + assessments from eLife API …")
    results = []
    overall_index = 0

    for sf in CHOSEN_SUBFIELDS:
        papers = selected_by_subfield[sf]
        print(f"\n  ── {sf} ──")

        for rotation_i, paper in enumerate(papers):
            overall_index += 1
            doi        = paper.get("doi", "").replace("https://doi.org/", "")
            article_id = extract_article_id(doi)

            if not article_id:
                print(f"  [{overall_index:02}] SKIP — no eLife ID: {doi}")
                continue

            versions   = get_article_versions(article_id)
            chosen     = pick_version(versions, rotation_i)
            assessment = get_elife_assessment(article_id)

            v_label    = version_label(
                chosen["version"] if chosen else None,
                chosen["status"]  if chosen else None,
            )
            n_versions = len(versions)
            title_short = (paper.get("title") or "")[:45]
            sig   = assessment.get("significance") or "—"
            stre  = assessment.get("strength")     or "—"
            print(f"  [{overall_index:02}] {article_id:<8}  {n_versions}v  →  {v_label:<22}  "
                  f"sig={sig:<15} str={stre:<15}  {title_short}")

            results.append(format_paper(paper, chosen, versions, assessment))
            time.sleep(0.30)  # slightly longer to be safe with two calls per paper

    # Drop papers with no assessment data
    before = len(results)
    results = [p for p in results if p.get("assessmentSignificance") and p.get("assessmentSummary")]
    dropped = before - len(results)
    if dropped:
        print(f"\n  (dropped {dropped} paper{'s' if dropped != 1 else ''} with no assessment data)")

    with open("papers_fresh.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✓ {len(results)} papers saved to papers_fresh.json")

    # ── Summary stats ──────────────────────────────────────────────────────────
    print("\nVersion breakdown:")
    for v, n in sorted(Counter(p["version"] for p in results).items(), key=lambda x: str(x[0])):
        print(f"  {v}: {n}")

    print("\nVersions-available breakdown (how many total versions each article has):")
    for v, n in sorted(Counter(p["totalVersions"] for p in results).items()):
        print(f"  {v} version(s): {n} papers")

    n_with_sig  = sum(1 for p in results if p.get("assessmentSignificance"))
    n_with_stre = sum(1 for p in results if p.get("assessmentStrength"))
    print(f"\nAssessment coverage:")
    print(f"  Papers with significance term : {n_with_sig} / {len(results)}")
    print(f"  Papers with strength term     : {n_with_stre} / {len(results)}")

    if n_with_sig:
        print("\nSignificance term breakdown:")
        for term, n in sorted(Counter(
            p["assessmentSignificance"] for p in results if p.get("assessmentSignificance")
        ).items(), key=lambda x: SIGNIFICANCE_TERMS.index(x[0]) if x[0] in SIGNIFICANCE_TERMS else 99):
            print(f"  {term}: {n}")

    if n_with_stre:
        print("\nStrength term breakdown:")
        for term, n in sorted(Counter(
            p["assessmentStrength"] for p in results if p.get("assessmentStrength")
        ).items(), key=lambda x: STRENGTH_TERMS.index(x[0]) if x[0] in STRENGTH_TERMS else 99):
            print(f"  {term}: {n}")
