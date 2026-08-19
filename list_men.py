import json
import os
import hashlib

def list_and_verify_men():
    json_path = 'data/products.json'
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    products = data.get('products', {}).get('men', [])
    total = len(products)
    print(f"\n==========================================================================================")
    print(f"                                MEN'S PRODUCT CATALOG ({total} PRODUCTS)")
    print(f"==========================================================================================")
    print(f"{'#':<3} | {'ID':<11} | {'Product Name':<38} | {'Category':<12} | {'Price':<13} | {'Image File':<16} | {'Size'}")
    print(f"{'-'*3}-+-{'-'*11}-+-{'-'*38}-+-{'-'*12}-+-{'-'*13}-+-{'-'*16}-+-{'-'*8}")

    ids = []
    names = []
    img_paths = []
    file_hashes = {}
    missing_files = []

    for i, p in enumerate(products, 1):
        pid = str(p.get('id', ''))
        name = p.get('name', '')
        cat = p.get('category', '')
        price = p.get('price', '')
        img = p.get('image', '')

        ids.append(pid)
        names.append(name.lower().strip())
        img_paths.append(img)

        # Check local file
        fname = os.path.basename(img)
        fpath = os.path.join('images/products/men', fname)
        size_str = "MISSING"

        if os.path.exists(fpath):
            size_kb = os.path.getsize(fpath) / 1024
            size_str = f"{size_kb:.1f} KB"
            with open(fpath, 'rb') as fp:
                h = hashlib.md5(fp.read()).hexdigest()
            file_hashes.setdefault(h, []).append((pid, name, fname))
        else:
            missing_files.append((pid, name, fpath))

        print(f"{i:<3} | {pid:<11} | {name[:38]:<38} | {cat[:12]:<12} | {price[:13]:<13} | {fname[:16]:<16} | {size_str}")

    print(f"==========================================================================================")
    print("                                   INTEGRITY CHECKS")
    print(f"==========================================================================================")

    # 1. Duplicate IDs
    duplicate_ids = [item for item in set(ids) if ids.count(item) > 1]
    id_status = f"PASS (0 duplicates)" if not duplicate_ids else f"FAIL ({len(duplicate_ids)} duplicates: {duplicate_ids})"
    print(f"[1] Unique Product IDs:           {id_status}")

    # 2. Duplicate Names
    duplicate_names = [item for item in set(names) if names.count(item) > 1]
    name_status = f"PASS (0 duplicates)" if not duplicate_names else f"FAIL ({len(duplicate_names)} duplicates: {duplicate_names})"
    print(f"[2] Unique Product Names:         {name_status}")

    # 3. Unique Image Paths
    duplicate_paths = [item for item in set(img_paths) if img_paths.count(item) > 1]
    path_status = f"PASS (0 duplicates)" if not duplicate_paths else f"FAIL ({len(duplicate_paths)} duplicates: {duplicate_paths})"
    print(f"[3] Unique Image Paths:           {path_status}")

    # 4. Duplicate Image Hashes on Disk
    hash_collisions = {h: prods for h, prods in file_hashes.items() if len(prods) > 1}
    hash_status = f"PASS (0 identical image files across products)" if not hash_collisions else f"FAIL ({len(hash_collisions)} collisions)"
    print(f"[4] Unique Image Content (Hash):  {hash_status}")
    if hash_collisions:
        for h, prods in hash_collisions.items():
            print(f"    Collision: {[p[1] + ' (' + p[2] + ')' for p in prods]}")

    # 5. Missing Files
    missing_status = f"PASS (0 missing files)" if not missing_files else f"FAIL ({len(missing_files)} missing)"
    print(f"[5] Local Files Exist & Valid:    {missing_status}")
    if missing_files:
        for m in missing_files:
            print(f"    Missing: {m[1]} ({m[2]})")

    print(f"==========================================================================================")
    all_passed = (not duplicate_ids and not duplicate_names and not duplicate_paths and not hash_collisions and not missing_files)
    if all_passed:
        print(">> ALL CATALOG & IMAGE INTEGRITY CHECKS PASSED SUCCESSFULLY! <<")
    else:
        print(">> INTEGRITY CHECKS DETECTED ISSUES! <<")
    print(f"==========================================================================================\n")

if __name__ == '__main__':
    list_and_verify_men()
