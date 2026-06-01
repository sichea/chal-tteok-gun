import json

with open('scratch/roles_list.json', 'r', encoding='utf-8') as f:
    roles = json.load(f)

print(f"Total roles: {len(roles)}")
unique_chars = sorted(list(set(r['character'] for r in roles)))
print(f"Unique characters ({len(unique_chars)}):")
for char in unique_chars:
    print(char)
