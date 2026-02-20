import json

def find_dupes():
    with open('data/products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    seen = {}
    for p in data['products']['home']:
        img = p['image']
        if img in seen:
            print(f"DUPE FOUND: {img}")
            print(f"  First: {seen[img]['id']} - {seen[img]['name']}")
            print(f"  Second: {p['id']} - {p['name']}")
        else:
            seen[img] = p

if __name__ == "__main__":
    find_dupes()
