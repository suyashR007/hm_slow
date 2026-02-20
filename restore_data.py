import json
import os

def restore():
    data_path = 'data/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Men: Keep only original items (numeric IDs)
    original_men = [p for p in data['products']['men'] if not p['id'].startswith('m-new-')]
    print(f"Restoring Men from {len(data['products']['men'])} to {len(original_men)} items.")
    data['products']['men'] = original_men

    # Kids: Keep only original items (numeric IDs or specific pattern avoiding k-new-)
    original_kids = [p for p in data['products']['kids'] if not p['id'].startswith('k-new-')]
    print(f"Restoring Kids from {len(data['products']['kids'])} to {len(original_kids)} items.")
    data['products']['kids'] = original_kids

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    # Run conversion
    os.system('node convert_data.js')
    print("Restoration complete.")

if __name__ == "__main__":
    restore()
