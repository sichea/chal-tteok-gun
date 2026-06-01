import os
import json

with open('scratch/roles_list.json', 'r', encoding='utf-8') as f:
    roles = json.load(f)

missing = []
for role in roles:
    char_name = role['character']
    path = os.path.join('public/assets/characters', f"{char_name}.png")
    if not os.path.exists(path):
        missing.append(char_name)

if not missing:
    print("All 128 role character images exist in the folder!")
else:
    print(f"Missing {len(missing)} character images: {missing}")
