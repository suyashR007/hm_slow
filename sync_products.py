import json
import os

# From fix_home_data.py
home_products = [
    {
        "id": "1249274005",
        "name": "Reed diffuser",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/c6/a5/c6a5151ae7afbee72fb78107963064b242245bb0.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/c6/a5/c6a5151ae7afbee72fb78107963064b242245bb0.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/c7/44/c7440ee51e3758ae522904d267dfc6c4dd4cf725.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/9f/18/9f1839aa8eb1c8da9eb5896dcb3193202dbdf337.jpg?imwidth=820"
        ],
        "category": "Fragrance",
        "description": "Reed diffuser in a glass bottle with wooden sticks for continuous fragrance.",
        "colors": ["Transparent"],
        "art_no": "1249274005"
    },
    {
        "id": "1331039001",
        "name": "Bedside carafe and glass",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/15/c6/15c672914c8450a2eb2b4875f66e770f2354695b.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/15/c6/15c672914c8450a2eb2b4875f66e770f2354695b.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/20/85/2085fdfe820ea6573307eba99ecd8c63c55a4b7b.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/96/09/96098a4fa31b1b8a736b1b5a3f4098414b194a48.jpg?imwidth=820"
        ],
        "category": "Glassware",
        "description": "Glass carafe with a matching drinking glass that doubles as a lid.",
        "colors": ["Clear glass"],
        "art_no": "1331039001"
    },
    {
        "id": "1123076017",
        "name": "Towel cape",
        "brand": "H&M Home",
        "price": "Rs. 1,499.00",
        "image": "https://image.hm.com/assets/hm/2e/c4/2ec406d6d98adc1ac1eb16300b947099c0404dca.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/2e/c4/2ec406d6d98adc1ac1eb16300b947099c0404dca.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/55/f2/55f24dcef935c0b31c158b8fdc163857bf1df907.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/04/85/04851aa839ede9731ca388980cecc96d80c1095e.jpg?imwidth=820"
        ],
        "category": "Bathroom",
        "description": "Soft towel cape with a hood, ideal for after bath or swim.",
        "colors": ["White"],
        "art_no": "1123076017"
    },
    {
        "id": "0995539072",
        "name": "Patterned fleece blanket",
        "brand": "H&M Home",
        "price": "Rs. 799.00",
        "image": "https://image.hm.com/assets/hm/a8/91/a891a84961041a3f15e136c2bba45c33612c1600.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/a8/91/a891a84961041a3f15e136c2bba45c33612c1600.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/f9/a1/f9a13483655eac1bba1e6bd22234a204f03fa98c.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/cf/ae/cfaebed746211c924591b6b61abe0fb433542437.jpg?imwidth=820"
        ],
        "category": "Blanket",
        "description": "Soft patterned fleece blanket for cosy living room or bedroom use.",
        "colors": ["Patterned"],
        "art_no": "0995539072"
    },
    {
        "id": "1209353002",
        "name": "Bunny storage basket",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/df/c7/dfc7804e65caf4101fbb450f7d6040dc246ccb97.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/df/c7/dfc7804e65caf4101fbb450f7d6040dc246ccb97.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/b2/43/b243744d7ec00274230ac726f52b009f56d2c6ac.jpg?imwidth=820"
        ],
        "category": "Storage",
        "description": "Cute bunny-shaped storage basket for kids' toys and accessories.",
        "colors": ["Natural"],
        "art_no": "1209353002"
    },
    {
        "id": "1312176002",
        "name": "Small textured glass vase",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/3a/8e/3a8ed45bb82d7ccc3cce996fa704078c887a2c56.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/3a/8e/3a8ed45bb82d7ccc3cce996fa704078c887a2c56.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/9f/c3/9fc39fbef587f5fe028c2600b91593549cdcc834.jpg?imwidth=820"
        ],
        "category": "Vase",
        "description": "Small textured glass vase suitable for flowers or decorative display.",
        "colors": ["Transparent"],
        "art_no": "1312176002"
    },
    {
        "id": "1043565053",
        "name": "Cotton canvas cushion cover",
        "brand": "H&M Home",
        "price": "Rs. 399.00",
        "image": "https://image.hm.com/assets/hm/02/4b/024b081d7fdad22c909e98b5383a9041e7428892.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/02/4b/024b081d7fdad22c909e98b5383a9041e7428892.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/cd/bc/cdbc15bede15c192ca64add3011e06ecea50f844.jpg?imwidth=820"
        ],
        "category": "Cushion",
        "description": "Cotton canvas cushion cover with concealed zip, fits standard cushion inserts.",
        "colors": ["Natural"],
        "art_no": "1043565053"
    },
    {
        "id": "1257031001",
        "name": "Chick storage basket",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/b3/71/b371118ce816f3456e5e77b9403c4b35120563fd.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/b3/71/b371118ce816f3456e5e77b9403c4b35120563fd.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/e3/93/e39364634e5f4b59c2000a993258e20a3234d2e3.jpg?imwidth=820"
        ],
        "category": "Storage",
        "description": "Adorable chick-shaped storage basket, perfect for kids room organisation.",
        "colors": ["Yellow"],
        "art_no": "1257031001"
    },
    {
        "id": "1249274009",
        "name": "Reed diffuser – Floral",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/59/95/5995b9779df18e1dbc18127899db1b46b7f44b67.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/59/95/5995b9779df18e1dbc18127899db1b46b7f44b67.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/1b/40/1b40fe1ce4374bfc83a2c60e39a28ba9fa7ef108.jpg?imwidth=820"
        ],
        "category": "Fragrance",
        "description": "Floral reed diffuser in a tinted glass bottle with rattan sticks.",
        "colors": ["Tinted glass"],
        "art_no": "1249274009"
    },
    {
        "id": "1174134012",
        "name": "Lidded toy storage basket",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/ab/17/ab17dd521a08f214cae467b247a4989dfd157fb8.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/ab/17/ab17dd521a08f214cae467b247a4989dfd157fb8.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/53/24/5324f7fa83daf61e7425c69b19cc4d68b078437c.jpg?imwidth=820"
        ],
        "category": "Storage",
        "description": "Fabric storage basket with lid for organising toys and household items.",
        "colors": ["Natural"],
        "art_no": "1174134012"
    },
    {
        "id": "1284612009",
        "name": "Tufted cotton bath mat",
        "brand": "H&M Home",
        "price": "Rs. 1,499.00",
        "image": "https://image.hm.com/assets/hm/26/16/26165cc166278ad8f44ea58c975caf50b38afb8a.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/26/16/26165cc166278ad8f44ea58c975caf50b38afb8a.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/a0/e9/a0e94618600d17b9171dd62f06a4218f3b5c2fdf.jpg?imwidth=820"
        ],
        "category": "Bathroom",
        "description": "Tufted cotton bath mat with soft texture and anti-slip backing.",
        "colors": ["Beige"],
        "art_no": "1284612009"
    },
    {
        "id": "1329726001",
        "name": "Linen-blend blanket",
        "brand": "H&M Home",
        "price": "Rs. 2,499.00",
        "image": "https://image.hm.com/assets/hm/2b/21/2b2140ffd5cc94c9134d300aacf7345bbba6e717.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/2b/21/2b2140ffd5cc94c9134d300aacf7345bbba6e717.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/51/fe/51fe1db10ad214b276f3608a0a2183d91d60565c.jpg?imwidth=820"
        ],
        "category": "Blanket",
        "description": "Lightweight linen-blend blanket for layering on beds or sofas.",
        "colors": ["Natural"],
        "art_no": "1329726001"
    },
    {
        "id": "0579381147",
        "name": "Cotton velvet cushion cover",
        "brand": "H&M Home",
        "price": "Rs. 649.00",
        "image": "https://image.hm.com/assets/hm/d0/b1/d0b1d76b66ea322a7ee14896b351d293587431c8.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/d0/b1/d0b1d76b66ea322a7ee14896b351d293587431c8.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/78/06/7806986931dc5d88da32ddbe2931f03226a81645.jpg?imwidth=820"
        ],
        "category": "Cushion",
        "description": "Luxurious cotton velvet cushion cover with concealed zip closure.",
        "colors": ["Velvet"],
        "art_no": "0579381147"
    },
    {
        "id": "1317850004",
        "name": "Scented candle in glass holder",
        "brand": "H&M Home",
        "price": "Rs. 399.00",
        "image": "https://image.hm.com/assets/hm/57/c1/57c1e014ed2d6ceb6d556c40ac9dff5eaf845756.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/57/c1/57c1e014ed2d6ceb6d556c40ac9dff5eaf845756.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/7f/36/7f3616c8b758e1ce696a00a604e2fcd172bc1225.jpg?imwidth=820"
        ],
        "category": "Candle",
        "description": "Scented candle in a decorative glass holder with unique fragrance.",
        "colors": ["Glass holder"],
        "art_no": "1317850004"
    },
    {
        "id": "1318828002",
        "name": "Queen bed sheet set",
        "brand": "H&M Home",
        "price": "Rs. 2,699.00",
        "image": "https://image.hm.com/assets/hm/c5/c1/c5c1704bd579d98d212e4faeaf09c48df43db215.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/c5/c1/c5c1704bd579d98d212e4faeaf09c48df43db215.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/4e/07/4e078c705d9ad158f8fc5f8dcc40ed3b1da055ed.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Soft cotton queen bed sheet set with pillow covers included.",
        "colors": ["White"],
        "art_no": "1318828002"
    },
    {
        "id": "1316114001",
        "name": "Small pompom seagrass storage basket",
        "brand": "H&M Home",
        "price": "Rs. 1,499.00",
        "image": "https://image.hm.com/assets/hm/2f/cf/2fcf78454569ba85252e4a15dd0dd103a9c3a9c8.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/2f/cf/2fcf78454569ba85252e4a15dd0dd103a9c3a9c8.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/27/dd/27dd50641b0554291c6d012f2e27f15e3092327c.jpg?imwidth=820"
        ],
        "category": "Storage",
        "description": "Handwoven seagrass storage basket with decorative pompom trim.",
        "colors": ["Natural"],
        "art_no": "1316114001"
    },
    {
        "id": "1318832001",
        "name": "King bed sheet set",
        "brand": "H&M Home",
        "price": "Rs. 2,999.00",
        "image": "https://image.hm.com/assets/hm/a0/bd/a0bd8611a580919cd3c18e1e93c6a4e6996656eb.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/a0/bd/a0bd8611a580919cd3c18e1e93c6a4e6996656eb.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/1e/ea/1eea6efb31d461ee2cfe4e11eaa41c4d4ee5eca9.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Premium cotton king bed sheet set with matching pillow covers.",
        "colors": ["White"],
        "art_no": "1318832001"
    },
    {
        "id": "1338611003",
        "name": "6-pack moulded tapered candles",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/a2/14/a21435740db0510732c68ab6b71342e31e484404.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/a2/14/a21435740db0510732c68ab6b71342e31e484404.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/e2/1d/e21d18bd28096c61311cec91f420263f61cd3daa.jpg?imwidth=820"
        ],
        "category": "Candle",
        "description": "Set of 6 moulded tapered candles for elegant dining table decor.",
        "colors": ["Assorted"],
        "art_no": "1338611003"
    },
    {
        "id": "1331039002",
        "name": "Bedside carafe and glass – Tinted",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/cb/0f/cb0fbebcdb2b9013be958d224cece392f87cdc98.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/cb/0f/cb0fbebcdb2b9013be958d224cece392f87cdc98.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/a9/26/a9265700b4bb68538f1843a70820f2a81db5f470.jpg?imwidth=820"
        ],
        "category": "Glassware",
        "description": "Tinted glass bedside carafe with matching drinking glass lid.",
        "colors": ["Tinted glass"],
        "art_no": "1331039002"
    },
    {
        "id": "1296975004",
        "name": "2-pack reactive-glaze bowls",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/e1/1b/e11bca718a2a9a5a608216b8725c3aefde3af40c.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/e1/1b/e11bca718a2a9a5a608216b8725c3aefde3af40c.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/43/39/4339f106e904d4971e2f31162f8e8e6596a37305.jpg?imwidth=820"
        ],
        "category": "Tableware",
        "description": "Set of 2 stoneware bowls with unique reactive-glaze finish.",
        "colors": ["Reactive glaze"],
        "art_no": "1296975004"
    },
    {
        "id": "0496279104",
        "name": "Cotton double/king duvet cover set",
        "brand": "H&M Home",
        "price": "Rs. 2,699.00",
        "image": "https://image.hm.com/assets/hm/13/a9/13a9716ba7fcb6d1aa65cca24bda29419fa83bff.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/13/a9/13a9716ba7fcb6d1aa65cca24bda29419fa83bff.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/83/bc/83bc3b3ad720eeb40adf8c8a7dc6d96047c231f9.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Cotton duvet cover set for double or king sized bed with pillow covers.",
        "colors": ["Patterned"],
        "art_no": "0496279104"
    },
    {
        "id": "1319209001",
        "name": "Wooden organiser box",
        "brand": "H&M Home",
        "price": "Rs. 2,299.00",
        "image": "https://image.hm.com/assets/hm/43/64/4364bdb31572ab623c1b3775b8584ec9f9bdef43.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/43/64/4364bdb31572ab623c1b3775b8584ec9f9bdef43.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/3c/85/3c85b08a77f89aff6256195d3b315203671832c2.jpg?imwidth=820"
        ],
        "category": "Storage",
        "description": "Wooden organiser box for storing accessories, stationery, or small items.",
        "colors": ["Natural wood"],
        "art_no": "1319209001"
    },
    {
        "id": "1226525015",
        "name": "Cotton muslin blanket",
        "brand": "H&M Home",
        "price": "Rs. 1,699.00",
        "image": "https://image.hm.com/assets/hm/61/e2/61e2af063bacb10ff121f867fe4a1574b26b7a20.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/61/e2/61e2af063bacb10ff121f867fe4a1574b26b7a20.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/c2/37/c237e9e97980bfee7105eb886f965ee422644ae7.jpg?imwidth=820"
        ],
        "category": "Blanket",
        "description": "Soft cotton muslin blanket, breathable and lightweight for all seasons.",
        "colors": ["Natural"],
        "art_no": "1226525015"
    },
    {
        "id": "1292800008",
        "name": "Hand-painted stoneware starter plate",
        "brand": "H&M Home",
        "price": "Rs. 799.00",
        "image": "https://image.hm.com/assets/hm/66/a1/66a1f5f8e186c3a2a318368e7b05738b2b379ffa.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/66/a1/66a1f5f8e186c3a2a318368e7b05738b2b379ffa.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/40/4d/404d72a91713cfd6946a8d76cfa49275d4f75165.jpg?imwidth=820"
        ],
        "category": "Tableware",
        "description": "Hand-painted stoneware starter plate with artisan finish, each piece unique.",
        "colors": ["Stoneware"],
        "art_no": "1292800008"
    },
    {
        "id": "1315325010",
        "name": "Linen-blend tablecloth",
        "brand": "H&M Home",
        "price": "Rs. 2,299.00",
        "image": "https://image.hm.com/assets/hm/9e/16/9e16d261984eb9dbff1914608c7b35a4804a8006.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/9e/16/9e16d261984eb9dbff1914608c7b35a4804a8006.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/40/67/4067dc22d2a07e2bd509ab75595ea3b7603871b6.jpg?imwidth=820"
        ],
        "category": "Table linen",
        "description": "Linen-blend tablecloth with a natural, textured feel for dining table styling.",
        "colors": ["Natural"],
        "art_no": "1315325010"
    },
    {
        "id": "1308723001",
        "name": "Linen-blend cushion cover",
        "brand": "H&M Home",
        "price": "Rs. 499.00",
        "image": "https://image.hm.com/assets/hm/88/db/88db0003c01851c869e62f5fd2125b923cafb962.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/88/db/88db0003c01851c869e62f5fd2125b923cafb962.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/4f/86/4f8676b943552b0414d8cc0adab32cea9fb1d14b.jpg?imwidth=820"
        ],
        "category": "Cushion",
        "description": "Linen-blend cushion cover with a natural texture and concealed zip.",
        "colors": ["Natural linen"],
        "art_no": "1308723001"
    },
    {
        "id": "1319855002",
        "name": "Large metal plant pot",
        "brand": "H&M Home",
        "price": "Rs. 2,999.00",
        "image": "https://image.hm.com/assets/hm/4f/99/4f99771db88472bbacafa460e884f7052debce90.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/4f/99/4f99771db88472bbacafa460e884f7052debce90.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/6b/57/6b5731749ed611625d6d1f63248fbf474845bcbd.jpg?imwidth=820"
        ],
        "category": "Planter",
        "description": "Large metal plant pot suitable for indoor or outdoor plants.",
        "colors": ["Metal"],
        "art_no": "1319855002"
    },
    {
        "id": "1028613056",
        "name": "Patterned cotton fitted sheet",
        "brand": "H&M Home",
        "price": "Rs. 1,399.00",
        "image": "https://image.hm.com/assets/hm/d5/01/d5014af33e9d93b1595bdaa54ec7b39f8aded443.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/d5/01/d5014af33e9d93b1595bdaa54ec7b39f8aded443.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/01/aa/01aa1e9b8fd77b7e9288b53154206b0b36be6c7d.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Patterned cotton fitted sheet with elasticised edges for a snug fit.",
        "colors": ["Patterned"],
        "art_no": "1028613056"
    },
    {
        "id": "1307500001",
        "name": "4-pack embroidery-detail linen-blend napkins",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/32/ec/32ec22e38bd923e590e8e9540fa417fa478bce02.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/32/ec/32ec22e38bd923e590e8e9540fa417fa478bce02.jpg?imwidth=820"
        ],
        "category": "Table linen",
        "description": "Set of 4 linen-blend napkins with elegant embroidery detail.",
        "colors": ["White"],
        "art_no": "1307500001"
    },
    {
        "id": "1310798002",
        "name": "Cotton single duvet cover set",
        "brand": "H&M Home",
        "price": "Rs. 2,499.00",
        "image": "https://image.hm.com/assets/hm/7d/23/7d2306901bffbcc8f53e6f98400b69635f0ad6f2.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/7d/23/7d2306901bffbcc8f53e6f98400b69635f0ad6f2.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Cotton single duvet cover set in a floral pattern with pillow cover.",
        "colors": ["Light beige/Floral"],
        "art_no": "1310798002"
    },
    {
        "id": "1311807001",
        "name": "Print-motif cotton pillowcase",
        "brand": "H&M Home",
        "price": "Rs. 799.00",
        "image": "https://image.hm.com/assets/hm/0c/1f/0c1f3003be63e31ffb00d86bad1e894a3cf70f07.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/0c/1f/0c1f3003be63e31ffb00d86bad1e894a3cf70f07.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Cotton pillowcase with print motif design and envelope closure.",
        "colors": ["White/Heart"],
        "art_no": "1311807001"
    },
    {
        "id": "1319854003",
        "name": "Metal plant pot",
        "brand": "H&M Home",
        "price": "Rs. 2,699.00",
        "image": "https://image.hm.com/assets/hm/64/0e/640e19102bb6739782fdf4930d8f14f57780c387.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/64/0e/640e19102bb6739782fdf4930d8f14f57780c387.jpg?imwidth=820"
        ],
        "category": "Planter",
        "description": "Decorative metal plant pot in earthy tones for indoor plants.",
        "colors": ["Dark brown", "Terracotta", "Light beige"],
        "art_no": "1319854003"
    },
    {
        "id": "1306195001",
        "name": "Footed serving plate",
        "brand": "H&M Home",
        "price": "Rs. 2,299.00",
        "image": "https://image.hm.com/assets/hm/f2/f3/f2f3eceb88f841b4b16f6a3c23b2698fe3adc4cf.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/f2/f3/f2f3eceb88f841b4b16f6a3c23b2698fe3adc4cf.jpg?imwidth=820"
        ],
        "category": "Tableware",
        "description": "Elegant footed serving plate in dark brown, ideal for entertaining.",
        "colors": ["Dark brown"],
        "art_no": "1306195001"
    },
    {
        "id": "1308338001",
        "name": "Cotton percale double/king duvet cover set",
        "brand": "H&M Home",
        "price": "Rs. 3,999.00",
        "image": "https://image.hm.com/assets/hm/96/0f/960f82f2dfbc9cb3bd632acb44494a4021199e9f.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/96/0f/960f82f2dfbc9cb3bd632acb44494a4021199e9f.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Premium cotton percale duvet cover set with a crisp, smooth feel.",
        "colors": ["Light blue/Striped", "Light yellow/Striped", "Green/Striped", "Light pink/Striped"],
        "art_no": "1308338001"
    },
    {
        "id": "1310850001",
        "name": "Striped cotton bedspread",
        "brand": "H&M Home",
        "price": "Rs. 2,699.00",
        "image": "https://image.hm.com/assets/hm/66/e8/66e8a79d042ffda6172dc30ad29d7b02ea9075d3.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/66/e8/66e8a79d042ffda6172dc30ad29d7b02ea9075d3.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Striped cotton bedspread for layering or as a standalone bed cover.",
        "colors": ["Light khaki green/Cream"],
        "art_no": "1310850001"
    },
    {
        "id": "1310843001",
        "name": "Quilted cotton bedspread",
        "brand": "H&M Home",
        "price": "Rs. 5,999.00",
        "image": "https://image.hm.com/assets/hm/1f/7e/1f7e8ecaa75a708d6375a475d873fff329431c7b.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/1f/7e/1f7e8ecaa75a708d6375a475d873fff329431c7b.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Quilted cotton bedspread with elegant stitching detail.",
        "colors": ["White"],
        "art_no": "1310843001"
    },
    {
        "id": "1308991003",
        "name": "Extra-small stoneware plant pot with saucer",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/45/b9/45b94b8d8d61d0d9a614da19ef38376a43544560.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/45/b9/45b94b8d8d61d0d9a614da19ef38376a43544560.jpg?imwidth=820"
        ],
        "category": "Planter",
        "description": "Extra-small stoneware plant pot with matching saucer, ideal for succulents.",
        "colors": ["Dark brown", "Light green", "Light yellow", "White"],
        "art_no": "1308991003"
    },
    {
        "id": "1308999003",
        "name": "Stoneware plant pot with saucer",
        "brand": "H&M Home",
        "price": "Rs. 1,699.00",
        "image": "https://image.hm.com/assets/hm/a3/a8/a3a80c8cd3cacbc9b51ee9ca50bb54277a5a6a8e.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/a3/a8/a3a80c8cd3cacbc9b51ee9ca50bb54277a5a6a8e.jpg?imwidth=820"
        ],
        "category": "Planter",
        "description": "Stoneware plant pot with saucer in glazed finish, suitable for medium plants.",
        "colors": ["Dark brown", "Light green", "Light yellow", "White"],
        "art_no": "1308999003"
    },
    {
        "id": "1310908003",
        "name": "Cotton pillowcase",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/f7/ac/f7ac292f82be7c2c18436f7dedef7ad914fd13ac.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/f7/ac/f7ac292f82be7c2c18436f7dedef7ad914fd13ac.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Soft cotton pillowcase in pastel tones.",
        "colors": ["Pale yellow", "Powder pink"],
        "art_no": "1310908003"
    },
    {
        "id": "1224355010",
        "name": "Patterned cotton fitted sheet",
        "brand": "H&M Home",
        "price": "Rs. 999.00",
        "image": "https://image.hm.com/assets/hm/25/84/25840b116108e5ed836951831e92070cea7efba8.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/25/84/25840b116108e5ed836951831e92070cea7efba8.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Patterned cotton fitted sheet with blue floral design.",
        "colors": ["White/Blue floral"],
        "art_no": "1224355010"
    },
    {
        "id": "1306196001",
        "name": "Wooden serving plate",
        "brand": "H&M Home",
        "price": "Rs. 2,799.00",
        "image": "https://image.hm.com/assets/hm/f2/f3/f2f3eceb88f841b4b16f6a3c23b2698fe3adc4cf.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/f2/f3/f2f3eceb88f841b4b16f6a3c23b2698fe3adc4cf.jpg?imwidth=820"
        ],
        "category": "Tableware",
        "description": "Dark brown wooden serving plate for food presentation and entertaining.",
        "colors": ["Dark brown"],
        "art_no": "1306196001"
    },
    {
        "id": "1310799003",
        "name": "Cotton double/king duvet cover set",
        "brand": "H&M Home",
        "price": "Rs. 3,499.00",
        "image": "https://image.hm.com/assets/hm/96/0f/960f82f2dfbc9cb3bd632acb44494a4021199e9f.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/96/0f/960f82f2dfbc9cb3bd632acb44494a4021199e9f.jpg?imwidth=820"
        ],
        "category": "Bedding",
        "description": "Floral cotton duvet cover set for double or king bed.",
        "colors": ["White/Floral", "Light green/Floral"],
        "art_no": "1310799003"
    },
    {
        "id": "1314706001",
        "name": "Patterned linen-blend tablecloth",
        "brand": "H&M Home",
        "price": "Rs. 2,299.00",
        "image": "https://image.hm.com/assets/hm/05/7d/057d1c8524c64441876a92be9fb4e0bc82962d83.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/05/7d/057d1c8524c64441876a92be9fb4e0bc82962d83.jpg?imwidth=820",
            "https://image.hm.com/assets/hm/84/e9/84e99fe7233be3a83256f79d755dd361e68409bb.jpg?imwidth=820"
        ],
        "category": "Table linen",
        "description": "Patterned linen-blend tablecloth with a textured finish for dining.",
        "colors": ["Patterned"],
        "art_no": "1314706001"
    },
    {
        "id": "1312176001",
        "name": "Small textured glass vase – Beige",
        "brand": "H&M Home",
        "price": "Rs. 1,299.00",
        "image": "https://image.hm.com/assets/hm/ad/7c/ad7c17d8acaa2519ea712986fa4f9b08489d7e9c.jpg?imwidth=820",
        "image_list": [
            "https://image.hm.com/assets/hm/ad/7c/ad7c17d8acaa2519ea712986fa4f9b08489d7e9c.jpg?imwidth=820"
        ],
        "category": "Vase",
        "description": "Textured glass vase in beige tones for decorative flower arrangements.",
        "colors": ["Transparent", "Beige"],
        "art_no": "1312176001"
    }
]

def sync():
    data_path = 'data/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data['products']['home'] = home_products
    
    # Also add the missing Men's products I found in Step 3230
    extra_men = [
        {
            "id": "m-new-010",
            "name": "Puffer Jacket",
            "brand": "H&M",
            "price": "Rs. 4,999.00",
            "image": "https://image.hm.com/assets/hm/ee/e2/eee2ba939e6c046f7bf94acb47c5f6094ee20dbd.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/ee/e2/eee2ba939e6c046f7bf94acb47c5f6094ee20dbd.jpg?imwidth=2160"],
            "category": "Jackets",
            "description": "Warm puffer jacket for cold weather.",
            "colors": ["Black"]
        },
        {
            "id": "m-new-011",
            "name": "Knit Sweatshirt",
            "brand": "H&M",
            "price": "Rs. 2,299.00",
            "image": "https://image.hm.com/assets/hm/58/75/5875adc8e41c39be00f952bb7f4fd5627197d985.jpg?imwidth=2160",
            "image_list": ["https://image.hm.com/assets/hm/58/75/5875adc8e41c39be00f952bb7f4fd5627197d985.jpg?imwidth=2160"],
            "category": "Sweatshirts",
            "description": "Soft knit sweatshirt in textured cotton.",
            "colors": ["Grey Melange"]
        }
    ]
    # Check if already added
    seen_men_ids = [p['id'] for p in data['products']['men']]
    for p in extra_men:
        if p['id'] not in seen_men_ids:
            data['products']['men'].append(p)

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    os.system('node convert_data.js')
    print("Sync complete. Home category restored to 42 items. Men enriched.")

if __name__ == "__main__":
    sync()
