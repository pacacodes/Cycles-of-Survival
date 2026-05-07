#!/usr/bin/env python3
"""
Add water requirement values (-5 to 5) to all organism cards.

Water requirement scale:
  -5 to -1: Organisms that PROVIDE/PRODUCE water to systems
  0: Neutral water relationship
  1 to 5: Organisms that REQUIRE water (higher = more dependent on water)
"""

import json
import os
from pathlib import Path

def get_water_requirement(organism):
    """
    Determine water requirement based on organism characteristics.
    Returns a value from -5 to 5.
    """
    common_name = organism.get('common_name', '').lower()
    scientific_name = organism.get('scientific_name', '').lower()
    organism_type = organism.get('organism_type', '').lower()
    kingdom = organism.get('kingdom', '').lower()
    biomes = [b.lower() for b in organism.get('biomes', [])]
    roles = [r.lower() for r in organism.get('role', [])]
    categories = [c.lower() for c in organism.get('categories', [])]
    trophic = organism.get('trophic_level', '').lower()

    # WATER PROVIDERS (negative values)
    # Trees and forest plants that pump water and release as transpiration
    if any(term in common_name for term in ['tree', 'oak', 'maple', 'beech', 'spruce', 'pine', 'fir', 'cedar', 'birch', 'willow', 'aspen']):
        if 'wetland' in biomes or 'wetlands' in biomes:
            return -4  # Water-loving tree
        elif 'forest' in biomes or 'taiga' in biomes:
            return -3  # Forest tree
    
    # Wetland plants - active water providers
    if 'wetland' in common_name or 'wetland' in ' '.join(biomes):
        if any(term in common_name for term in ['reed', 'sedge', 'cattail', 'rush', 'sphagnum', 'moss']):
            return -4
    
    # Mycorrhizal fungi - help plants access water
    if any(term in common_name for term in ['mycorrhiza', 'fungus', 'fungi']) and 'root' in roles:
        return -3
    
    # Aquatic plants and algae - provide oxygen and cycle water
    if any(term in common_name for term in ['kelp', 'seaweed', 'phytoplankton', 'algae', 'diatom', 'eelgrass', 'waterweed']):
        return -3
    
    # Riparian and riverside plants
    if any(term in common_name for term in ['willow', 'alder', 'cottonwood']):
        return -3
    
    # Moss and lichen - slow water release
    if any(term in common_name for term in ['moss', 'lichen', 'bryophyte']):
        return -2
    
    # Legumes with nitrogen fixation in moist areas
    if 'nitrogen_fixer' in roles and 'forest' in biomes:
        return -2

    # WATER NEUTRAL (0)
    if any(term in organism_type for term in ['microbe', 'bacteria', 'archaeon']):
        return 0  # Most microbes moderate
    
    if any(term in biomes for term in ['tundra']):
        return 0  # Cold/permafrost areas have frozen water

    # WATER CONSUMERS (positive values)
    
    # Highly aquatic organisms - need water (5)
    if any(term in organism_type for term in ['fish', 'aquatic', 'amphibian']):
        if 'freshwater' in biomes or 'marine' in biomes or 'river' in biomes:
            return 5
        return 4  # Some aquatic tolerance
    
    # Ocean/marine fish - need saltwater (4-5)
    if any(term in organism_type for term in ['fish']) and any(term in biomes for term in ['ocean', 'sea', 'marine', 'coral']):
        return 5
    
    # Freshwater/shallow water organisms (4-5)
    if any(term in common_name for term in ['frog', 'tadpole', 'salamander', 'newt', 'crayfish', 'mussel', 'clam', 'oyster', 'snail']):
        return 4
    
    # Amphibians in general
    if 'amphibian' in organism_type.lower():
        return 4
    
    # Water-dependent animals
    if any(term in common_name for term in ['hippopotamus', 'hippo', 'otter', 'beaver', 'platypus', 'manatee', 'dolphin', 'whale', 'seal', 'sea lion']):
        return 5
    
    # Moisture-dependent mammals
    if any(term in common_name for term in ['elephant', 'rhino', 'antelope', 'deer', 'moose', 'elk']):
        if 'water-dependent' in common_name or 'savanna' in biomes:
            return 4
        return 3
    
    # Large herbivores (moderate water need)
    if any(term in common_name for term in ['bison', 'buffalo', 'wildebeest', 'zebra', 'horse']):
        return 3
    
    # Birds and reptiles with water needs
    if any(term in common_name for term in ['duck', 'goose', 'heron', 'crane', 'wading', 'ibis', 'kingfisher', 'cormorant']):
        return 4
    
    if any(term in common_name for term in ['crocodile', 'alligator', 'turtle', 'tortoise', 'gecko', 'lizard', 'snake']):
        if 'aquatic' in roles or 'water' in common_name:
            return 4
        return 2
    
    # Insects with aquatic life stages
    if any(term in common_name for term in ['dragonfly', 'mayfly', 'mosquito', 'damselfly', 'aquatic insect']):
        return 4
    
    # Desert-adapted organisms (low water need = high positive value)
    if any(term in biomes for term in ['desert', 'xeric', 'arid']):
        if any(term in common_name for term in ['cactus', 'succulent', 'yucca', 'agave']):
            return 1
        if any(term in common_name for term in ['scorpion', 'snake', 'lizard', 'rat', 'mouse']):
            return 2
        if any(term in common_name for term in ['camel', 'oryx', 'gazelle']):
            return 2
        return 2
    
    # Tropical rainforest plants (high moisture requirement)
    if 'tropical' in biomes or 'rainforest' in biomes or 'tropical forest' in biomes:
        if 'plant' in organism_type.lower():
            return -3
        if any(term in organism_type for term in ['amphibian', 'insect', 'bird']):
            return 3
        return 2
    
    # Grassland organisms
    if 'grassland' in biomes or 'savanna' in biomes or 'prairie' in biomes:
        if 'plant' in organism_type.lower():
            if any(term in common_name for term in ['grass', 'sedge']):
                return 2
            return 1
        return 2
    
    # General herbivores
    if 'herbivore' in trophic or 'herbivore' in roles:
        return 2
    
    # Carnivores - moderate water need
    if 'carnivore' in trophic or 'predator' in roles:
        if any(term in common_name for term in ['dolphin', 'whale', 'seal', 'otter', 'shark']):
            return 5
        if any(term in common_name for term in ['wolf', 'dog', 'fox', 'cat', 'lion', 'tiger', 'leopard']):
            return 2
        if any(term in common_name for term in ['eagle', 'hawk', 'falcon', 'owl']):
            return 1
        return 2
    
    # General producers
    if 'producer' in roles:
        if 'water' in common_name or 'aquatic' in organism_type:
            return 4
        return 1
    
    # Default based on biome
    if 'wetland' in biomes or 'river' in biomes or 'lake' in biomes:
        return 3
    if 'marine' in biomes or 'ocean' in biomes or 'coral reef' in biomes:
        return 4
    if 'desert' in biomes:
        return 2
    if 'forest' in biomes:
        return 1
    
    # Default neutral
    return 0


def process_organism_file(filepath):
    """Process a single organism JSON file and add water requirements."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    if 'organisms' in data:
        for organism in data['organisms']:
            if 'waterRequirement' not in organism:
                organism['waterRequirement'] = get_water_requirement(organism)
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    
    return len(data.get('organisms', []))


def main():
    config_dir = Path('/workspaces/Cycles-of-Survival/game/config')
    organism_files = list(config_dir.glob('organisms*.json'))
    
    total_organisms = 0
    for filepath in sorted(organism_files):
        count = process_organism_file(filepath)
        total_organisms += count
        print(f"✓ {filepath.name}: {count} organisms processed")
    
    print(f"\n✓ Total organisms processed: {total_organisms}")
    print("✓ Water requirements added to all organism cards")


if __name__ == '__main__':
    main()
