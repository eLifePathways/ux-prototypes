"""
Step 1: Discover how 200 recent eLife papers break down by subject area.
Run this first, pick your 5-6 subfields, then run the fetch script.

Usage: python discover_elife_subjects.py
Output: prints a breakdown table + saves openalex_raw.json for reuse
"""

import requests
import json
from collections import Counter

MAILTO   = "c.huggins@elifesciences.org"
ELIFE_ISSN = "2050-084X"
N_PAPERS = 200


def fetch_papers():
    url = "https://api.openalex.org/works"
    params = {
        "filter":   f"primary_location.source.issn:{ELIFE_ISSN},type:article",
        "sort":     "publication_date:desc",
        "per_page": N_PAPERS,
        "select":   "id,doi,publication_date,topics,concepts,authorships,title",
        "mailto":   MAILTO,
    }
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()["results"]


def show_breakdown(papers):
    subfield_counts = Counter()
    field_counts    = Counter()

    for p in papers:
        topics = p.get("topics", [])
        if topics:
            t = topics[0]
            subfield_counts[ t.get("subfield", {}).get("display_name", "Unknown") ] += 1
            field_counts[    t.get("field",    {}).get("display_name", "Unknown") ] += 1

    print(f"\n── BY SUBFIELD (primary topic of each paper) {'─'*20}")
    print(f"  {'Subfield':<52} Count")
    print(f"  {'─'*52} ─────")
    for name, n in subfield_counts.most_common():
        bar = "█" * n
        print(f"  {name:<52} {n:>4}  {bar}")

    print(f"\n── BY FIELD (rolled up) {'─'*35}")
    print(f"  {'Field':<52} Count")
    print(f"  {'─'*52} ─────")
    for name, n in field_counts.most_common():
        print(f"  {name:<52} {n:>4}")


if __name__ == "__main__":
    print(f"Fetching {N_PAPERS} recent eLife papers from OpenAlex …")
    papers = fetch_papers()
    print(f"Retrieved {len(papers)} papers.\n")

    with open("openalex_raw.json", "w") as f:
        json.dump(papers, f)
    print("Raw data saved → openalex_raw.json  (reused in the fetch script)")

    show_breakdown(papers)

    print(f"\nTotal papers: {len(papers)}")
    print("\nNext step: pick 5-6 subfields from the list above,")
    print("then run fetch_elife_papers.py with those subfields configured.")
