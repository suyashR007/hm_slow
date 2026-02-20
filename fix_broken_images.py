import json
import os

def fix_images():
    data_path = 'data/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Replacements
    # Map Product Name Substring -> New Image URL
    replacements = {
        "Linen-blend shirt": "https://image.hm.com/assets/hm/23/fe/23fefdb3083e4dd9847a89004c3e26ac98653540.jpg?imwidth=2160", # Use Oxford shirt image
        "Sports vest": "https://image.hm.com/assets/hm/b9/ee/b9eebe4ce9c0e0df98815ffecf1c10043dec525b.jpg?imwidth=2160" # Use T-shirt image
    }

    count = 0
    for product in data['products']['men']:
        for key, new_url in replacements.items():
            if key in product['name']:
                print(f"Fixing image for {product['name']}")
                product['image'] = new_url
                product['image_list'] = [new_url]
                count += 1

    if count > 0:
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        os.system('node convert_data.js')
        print(f"Fixed {count} products.")
    else:
        print("No matching products found to fix.")

if __name__ == "__main__":
    fix_images()
