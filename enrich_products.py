import json
import os

def enrich():
    data_path = 'data/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Enrich Men
    new_men = [
        {
            "id": "m-new-006",
            "name": "Regular Fit Shirt",
            "brand": "H&M",
            "price": "Rs. 1,499.00",
            "image": "https://image.hm.com/assets/hm/8a/1a/8a1aeb6235815dc9f1c200cac701cab4e0f11123.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/8a/1a/8a1aeb6235815dc9f1c200cac701cab4e0f11123.jpg?imwidth=2160"],
            "category": "Shirts",
            "description": "Classic regular fit cotton shirt.",
            "colors": ["White", "Blue"]
        },
        {
            "id": "m-new-007",
            "name": "Relaxed Fit Jeans",
            "brand": "H&M",
            "price": "Rs. 2,999.00",
            "image": "https://image.hm.com/assets/hm/b1/0f/b10fcf884bcb0a1a120d186702db5bfd0cee8779.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/b1/0f/b10fcf884bcb0a1a120d186702db5bfd0cee8779.jpg?imwidth=2160"],
            "category": "Jeans",
            "description": "Comfortable relaxed fit jeans in denim.",
            "colors": ["Denim Blue"]
        },
        {
            "id": "m-new-008",
            "name": "Premium Cotton T-shirt",
            "brand": "H&M",
            "price": "Rs. 799.00",
            "image": "https://image.hm.com/assets/hm/d8/cd/d8cd233181ff9a897323084a37c66e942abafbd4.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/d8/cd/d8cd233181ff9a897323084a37c66e942abafbd4.jpg?imwidth=2160"],
            "category": "T-shirts",
            "description": "High quality cotton t-shirt with soft finish.",
            "colors": ["Black", "White", "Grey"]
        },
        {
            "id": "m-new-009",
            "name": "Canvas Trainers",
            "brand": "H&M",
            "price": "Rs. 1,999.00",
            "image": "https://image.hm.com/assets/hm/a4/a1/a4a185b4a1fe6b24d62fd0aabf8633174854481a.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/a4/a1/a4a185b4a1fe6b24d62fd0aabf8633174854481a.jpg?imwidth=2160"],
            "category": "Shoes",
            "description": "Casual canvas trainers with rubber soles.",
            "colors": ["White"]
        }
    ]
    data['products']['men'].extend(new_men)

    # 2. Enrich Kids
    new_kids = [
        {
            "id": "k-new-009",
            "name": "2-piece Cotton Set",
            "brand": "H&M",
            "price": "Rs. 1,299.00",
            "image": "https://image.hm.com/assets/hm/9a/5f/9a5fd47db1e7f98d2d86de6090af5bc8ec2411c0.jpg?imwidth=1536",
            "image_list": ["https://image.hm.com/assets/hm/9a/5f/9a5fd47db1e7f98d2d86de6090af5bc8ec2411c0.jpg?imwidth=1536"],
            "category": "Sets",
            "description": "Soft cotton set for everyday comfort.",
            "colors": ["Pastel Blue"]
        },
        {
            "id": "k-new-010",
            "name": "Printed Hoodie",
            "brand": "H&M",
            "price": "Rs. 1,499.00",
            "image": "https://image.hm.com/assets/hm/be/77/be771de62b1962732f19f14e1195904c457ecd52.jpg?imwidth=1536",
            "image_list": ["https://image.hm.com/assets/hm/be/77/be771de62b1962732f19f14e1195904c457ecd52.jpg?imwidth=1536"],
            "category": "Hoodies",
            "description": "Fun printed hoodie for active kids.",
            "colors": ["Grey Melange"]
        },
        {
            "id": "k-new-011",
            "name": "Denim Dungarees",
            "brand": "H&M",
            "price": "Rs. 1,999.00",
            "image": "https://image.hm.com/assets/hm/67/22/67221036da91a95233ba8cbb2247cea50515b2fe.jpg?imwidth=1536",
            "image_list": ["https://image.hm.com/assets/hm/67/22/67221036da91a95233ba8cbb2247cea50515b2fe.jpg?imwidth=1536"],
            "category": "Dungarees",
            "description": "Classic denim dungarees with adjustable straps.",
            "colors": ["Denim Blue"]
        }
    ]
    data['products']['kids'].extend(new_kids)

    # 3. Fix Women Placeholders (Replace picsum with H&M assets we have elsewhere or just remove them to maintain quality)
    # I will replace some with known good URLs from the start of the file or similar
    # Actually, I'll just remove the ones starting with 'w-dress-001' etc if they use picsum
    data['products']['women'] = [p for p in data['products']['women'] if 'picsum.photos' not in p.get('image', '')]

    # Save
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    # Run conversion
    os.system('node convert_data.js')
    print("Enrichment complete and js/products-data.js updated.")

if __name__ == "__main__":
    enrich()
