import re
import json
import unicodedata

def normalize(text):
    if not text: return ""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    return text.strip()

candidates = {}

try:
    with open('new_kids_dump.html', 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Strategy: Find chunk between title and img
    # Pattern: title="NAME" ... (arbitrary stuff) ... src="URL" or data-src="URL"
    # But usually img is inside article.
    
    # Let's iterate over potential product blocks using a simpler split
    # Split by <article
    chunks = content.split('<article')
    for chunk in chunks[1:]: # Skip preamble
        # Extract title
        t_match = re.search(r'title=\"([^\"]+)\"', chunk)
        if not t_match: continue
        name = normalize(t_match.group(1))
        
        # Extract image (src or data-src)
        # Prioritize data-src if present? No, usually src is placeholder, data-src is real.
        # But in the snippet, src is low-res or same.
        # Let's just grab the first jpg url we see.
        img_match = re.search(r'(?:src|data-src)=\"(https://image.hm.com/[^\"]+\.jpg)', chunk)
        if img_match:
            url = img_match.group(1)
            candidates[name] = url
            # print(f"Extracted: {name} -> {url}")

except Exception as e:
    print(f"Error: {e}")

print(f"Emergency extracted: {len(candidates)}")

with open('emergency_candidates.json', 'w') as f:
    json.dump(candidates, f, indent=4)
