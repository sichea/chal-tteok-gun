import os
import json
import shutil

# Paths
roles_file = 'scratch/roles_list.json'
chars_dir = 'public/assets/characters'

# Load roles
with open(roles_file, 'r', encoding='utf-8') as f:
    roles = json.load(f)

# Define mapping logic
# Available templates in chars_dir:
# - cook.png
# - cook_army.png
# - driver.png
# - driver_army.png
# - infantry.png
# - infantry_army.png
# - infantry_marine.png
# - maintenance_airforce.png
# - medic.png
# - medic_army.png
# - recon_army.png
# - recon_marine.png
# - sailor.png
# - sailor_navy.png
# - signals.png
# - signals_army.png
# - sonar_navy.png
# - weather_airforce.png

def get_template(role):
    branch = role.get('branch')
    role_id = role.get('id')
    name = role.get('name')
    
    # Common
    if branch == '공통':
        if 'cook' in role_id or '조리' in name:
            return 'cook.png'
        if 'driver' in role_id or '운전' in name:
            return 'driver.png'
        if 'medic' in role_id or '의무' in name:
            return 'medic.png'
        if 'signals' in role_id or '통신' in name:
            return 'signals.png'
            
    # Army (육군)
    if branch == '육군':
        if 'cook' in role_id or '조리' in name:
            return 'cook_army.png'
        if any(x in role_id for x in ['driver', 'tank', 'apc', 'transport', 'mechanic', 'maintenance']):
            return 'driver_army.png'
        if any(x in role_id for x in ['medic', 'lab', 'cbrn-lab']):
            return 'medic_army.png'
        if any(x in role_id for x in ['recon', 'sdt', 'jsa', 'mp', 'guard', 'sports', 'instructor']):
            return 'recon_army.png'
        if any(x in role_id for x in ['signals', 'cyber', 'sw-dev', 'info', 'intel', 'sig-int', 'admin', 'supply', 'ip', 'cost']):
            return 'signals_army.png'
        return 'infantry_army.png'
        
    # Navy (해군)
    if branch == '해군':
        if 'cook' in role_id or '조리' in name:
            return 'cook.png'
        if any(x in role_id for x in ['udt', 'ssu']):
            return 'recon_marine.png'
        if any(x in role_id for x in ['medic', 'special-medic', 'hygiene']):
            return 'medic.png'
        if any(x in role_id for x in ['sonar', 'radar', 'navigation', 'steer', 'sailor', 'ordnance', 'electric', 'engine']):
            return 'sonar_navy.png' if 'sonar' in role_id or 'radar' in role_id else 'sailor_navy.png'
        if any(x in role_id for x in ['cyber', 'ai', 'sw-dev', 'science-lab', 'bigdata', 'ip', 'cbt']):
            return 'sonar_navy.png'
        return 'sailor_navy.png'

    # Marine (해병대)
    if branch == '해병대':
        if 'recon' in role_id or '수색' in name:
            return 'recon_marine.png'
        if 'signals' in role_id or '통신' in name:
            return 'signals_army.png'
        return 'infantry_marine.png'

    # Air Force (공군)
    if branch == '공군':
        if 'weather' in role_id or '관측' in name:
            return 'weather_airforce.png'
        if any(x in role_id for x in ['maintenance', 'facility', 'avionics', 'hydraulic', 'weapons', 'ammo', 'arresting', 'ground']):
            return 'maintenance_airforce.png'
        if 'medic' in role_id or '의무' in name:
            return 'medic.png'
        if 'driver' in role_id or '운전' in name:
            return 'driver_army.png'
        if any(x in role_id for x in ['control', 'tower', 'radar', 'control-radar', 'signals', 'ops-signals', 'infra-signals', 'it']):
            return 'weather_airforce.png'
        return 'weather_airforce.png'
        
    # Default fallback
    return 'infantry.png'

copied_count = 0
for role in roles:
    char_name = role['character']
    template_file = get_template(role)
    src_path = os.path.join(chars_dir, template_file)
    dst_path = os.path.join(chars_dir, f"{char_name}.png")
    
    if os.path.exists(src_path):
        shutil.copy(src_path, dst_path)
        copied_count += 1
    else:
        print(f"Template not found: {src_path} for role {role['id']}")

print(f"Successfully copied {copied_count} files.")
