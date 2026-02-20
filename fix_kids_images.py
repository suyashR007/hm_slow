import json
import os

# Load products
with open('data/products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

kids = data['products'].get('kids', [])
dirty_ids = []

# Values to clear (new IDs added in the bad batch)
# Based on analysis, IDs starting from 1398657119 are the new ones.
start_bad_id = 1398657119

for p in kids:
    try:
        pid = int(p['id'])
        if pid >= start_bad_id:
            # This is likely a new product with a potentially wrong image
            print(f"Clearing image for new product: {p['name']} (ID: {pid})")
            p['image'] = ""
            p['image_list'] = []
            dirty_ids.append(str(pid))
    except:
        pass

# Also check for any existing products that might have been updated with men's images
# We can check if the image path points to a file that doesn't exist (if I delete them)
# or if it matches a known bad pattern.
# For now, let's just clean the new ones.

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print(f"Cleared images for {len(dirty_ids)} products.")

# Delete the actual files
img_dir = 'images/products/kids'
count_deleted = 0
for fname in os.listdir(img_dir):
    name, ext = os.path.splitext(fname)
    if name in dirty_ids:
        try:
            os.remove(os.path.join(img_dir, fname))
            count_deleted += 1
        except Exception as e:
            print(f"Error deleting {fname}: {e}")

print(f"Deleted {count_deleted} image files.")
