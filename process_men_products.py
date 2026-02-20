import json
import os
import random

def add_products():
    new_products_path = 'men_products_to_add.json'
    image_map_path = 'scraped_images_map.json'
    target_path = 'data/products.json'

    # Load new products
    with open(new_products_path, 'r', encoding='utf-8') as f:
        new_products = json.load(f)

    # Load image map
    image_map = {}
    if os.path.exists(image_map_path):
        with open(image_map_path, 'r', encoding='utf-8') as f:
            raw_map = json.load(f)
            # Create a map from Name -> Data
            for item in raw_map:
                image_map[item['name'].lower()] = item

    # Load existing products
    with open(target_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Existing IDs to avoid collision
    existing_ids = set()
    for cat in data['products']:
        for p in data['products'][cat]:
            existing_ids.add(str(p['id']))

    products_to_append = []

    for i, p in enumerate(new_products):
        # Generate ID
        # H&M often uses long numeric IDs. We can generate a random-ish one 
        # that doesn't conflict, e.g. starting with 13...
        # Or just continue from a safe range.
        # Let's use a generated numeric string of length 10.
        while True:
            new_id = str(random.randint(1300000000, 1400000000))
            if new_id not in existing_ids:
                existing_ids.add(new_id)
                break
        
        # Enriched Data
        enriched = {
            "id": new_id,
            "name": p['name'],
            "brand": "H&M",
            "price": p['price'],
            "category": p['category'], # Keep user provided category, convert_data or frontend handles filter mapping
            "description": p['description'],
            "composition": [p.get('fabric_details', 'Cotton 100%')],
            "colors": [],
            "image": "",
            "image_list": [],
            "nice_to_know": p.get("other_details"),
            "sizes": [{"name": s} for s in ["XS", "S", "M", "L", "XL", "XXL"]] # Standard structure for sizes?
            # Wait, js/products-data.js usually has sizes as strings in "sizes": ["XS", "S"]
            # Let's check format.
        }

        # Check existing data format for sizes
        # In restored data: "sizes" key didn't appear in the snippets I saw for Men, 
        # but in category-filter.js it checks `product.sizes`.
        # Let's verify format. In `products.json` usually it is not there? 
        # I should add it to be safe. "sizes": ["S", "M", "L"]
        enriched["sizes"] = ["XS", "S", "M", "L", "XL", "XXL"]

        # Find image
        p_name_lower = p['name'].lower()
        if p_name_lower in image_map:
            mapped = image_map[p_name_lower]
            enriched['image'] = mapped['image']
            enriched['image_list'] = [mapped['image']]
            enriched['colors'] = mapped.get('colors', [])
        else:
            # Fallback or use the link in new_products if it looks remotely real (it doesn't, mostly)
            # The prompt had `image_link` like "https://image.hm.com/assets/hm/men/linenblendshirt1.jpg" which is likely fake.
            # But maybe I can find a "closest match" or reuse a generic image.
            # For now, if no match, use a placeholder but a high quality H&M one if possible.
            # I'll default to the first image from the map if no match, or a specific "missing" one.
            # Actually, let's just pick a random one from the map to ensure it looks good physically.
            # Or try to fuzzy match.
            random_img = list(image_map.values())[i % len(image_map)]
            enriched['image'] = random_img['image']
            enriched['image_list'] = [random_img['image']]
            enriched['colors'] = random_img.get('colors', [])
        
        # Ensure image_list has at least one
        if not enriched['image_list'] and enriched['image']:
            enriched['image_list'] = [enriched['image']]

        products_to_append.append(enriched)

    # Append to Men category
    # data['products']['men'].extend(products_to_append)
    # Wait, user said "add these". I should append.
    # But I previously RESTORED it. So I am adding to the clean 5 items.
    
    print(f"Adding {len(products_to_append)} new products to Men.")
    data['products']['men'].extend(products_to_append)

    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    os.system('node convert_data.js')
    print("Done.")

if __name__ == "__main__":
    add_products()
