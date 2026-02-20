import re
import os

filepath = r'js/products-data.js'
if not os.path.exists(filepath):
    print(f"File {filepath} not found")
else:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find categories
    categories = re.findall(r'\"(\w+)\":\s*\[', content)
    for cat in categories:
        if cat in ['products', 'image_list', 'badges', 'sizes', 'colors', 'composition', 'material_explanations', 'functions', 'nice_to_know']: continue
        # Find the start of the array
        start_idx = content.find(f'"{cat}":')
        array_start = content.find('[', start_idx)
        # Find balancing bracket (simplified for JSON-like structure)
        balance = 1
        i = array_start + 1
        while balance > 0 and i < len(content):
            if content[i] == '[': balance += 1
            elif content[i] == ']': balance -= 1
            i += 1
        cat_content = content[array_start:i]
        images = re.findall(r'\"image\":\s*\"(.*?)\"', cat_content)
        unique_imgs = set(images)
        print(f"Category {cat}: {len(images)} items, {len(unique_imgs)} unique.")
        if len(images) != len(unique_imgs):
            print(f"  DUPLICATES FOUND in {cat}!")
            # Find which ones
            seen = set()
            for img in images:
                if img in seen:
                    print(f"    Duplicate image: {img}")
                seen.add(img)
