# Geological Period Accuracy Report
## Cycles of Survival Game

**Report Generated:** 2024
**Scope:** All organisms*.json configuration files in `game/config/`
**Purpose:** Identify organisms with geologically inaccurate time periods

---

## Summary

**Total Issues Found:** 30+ organisms with incorrect or incomplete geological periods

**Main Problem Categories:**
1. Modern plant species incorrectly placed in Paleogene/Neogene when they should be Quaternary
2. Organisms missing multiple periods they actually existed across
3. Ancient species with accurate periods (mostly correct)

---

## CRITICAL ISSUES - MODERN SPECIES IN WRONG PERIODS

### organisms.herbaceous.plants.json

| Card | Common Name | Scientific Name | Current Periods | CORRECT Periods | Issue |
|------|-------------|-----------------|-----------------|-----------------|-------|
| 217 | Ancient Cattail | Typha latissima | Paleogene | **Quaternary** (also Neogene) | Modern species incorrectly in Paleogene. Typha existed since Eocene but thrived in Neogene-Quaternary |
| 218 | Mangrove Fern | Acrostichum aureum | Paleogene | **Quaternary** (also Neogene) | Modern species. While ferns existed in Paleogene, *A. aureum* specifically is modern |
| 219 | Eocene Grass | Poaceae sp. | Paleogene | **Quaternary** (also Neogene) | Generic Poaceae - grasses diversified in Neogene, dominant in Quaternary. Card name suggests Eocene but species is modern |
| 220 | Floating Fern | Salvinia formosa | Paleogene | **Quaternary** (also Neogene) | Modern species. Salvinia existed by late Cretaceous but *S. formosa* is modern |

### organisms.understory.plants.json

| Card | Common Name | Scientific Name | Current Periods | CORRECT Periods | Issue |
|------|-------------|-----------------|-----------------|-----------------|-------|
| 630 | Common Greenbrier | Smilax rotundifolia | Paleogene | **Quaternary** (also Neogene) | Modern North American species should be Quaternary minimum |
| 610 | Sassafras | Sassafras hesperia | Cretaceous | **Paleogene + Neogene** | Fossil species exists in these periods, but modern *S. albidum* is Quaternary. Needs clarification |

---

## ORGANISMS MISSING MULTIPLE TIME PERIODS

These organisms existed across multiple periods but only list one period.

### organisms.lichens.moss.fungi.json

| Card | Common Name | Scientific Name | Current Period | Missing Periods | Notes |
|------|-------------|-----------------|-----------------|-----------------|-------|
| 318 | Rock Tripe | Umbilicaria mammulata | Neogene | Quaternary | Modern lichen - should include both |
| 319 | Old Man's Beard | Usnea barbata | Neogene | Quaternary | Modern lichen - should include both |
| 320 | Witch's Hair Lichen | Alectoria sarmentosa | Neogene | Quaternary | Modern lichen - should include both |
| 322 | Wolf Lichen | Letharia vulpina | Neogene | Quaternary | Modern lichen - should include both |
| 323 | Oakmoss | Evernia prunastri | Neogene | Quaternary | Modern lichen - should include both |
| 324 | Treemoss Lichen | Pseudevernia furfuracea | Neogene | Quaternary | Modern lichen - should include both |
| 327 | Hammered Shield Lichen | Parmelia sulcata | Neogene | Quaternary | Modern lichen - should include both |
| 328 | Dog Lichen | Peltigera canina | Neogene | Quaternary | Modern lichen - should include both |
| 330 | Oregon Lungwort | Lobaria oregana | Neogene | Quaternary | Modern lichen - should include both |
| 334 | Powdery Camouflage Lichen | Xanthoparmelia conspersa | Neogene | Quaternary | Modern lichen - should include both |
| 335 | Desert Crust Lichen | Aspicilia desertorum | Neogene | Quaternary | Modern lichen - should include both |
| 337 | Wall Crust Lichen | Diplotomma chlorophaeum | Neogene | Quaternary | Modern lichen - should include both |
| 341 | River Rim Lichen | Dermatocarpon miniatum | Neogene | Quaternary | Modern lichen - should include both |
| 343 | Mountain Stream Lichen | Hydrothyria venosa | Neogene | Quaternary | Modern lichen - should include both |
| 345 | Helmet Lichen | Physcia adscendens | Quaternary | Neogene | Modern lichen could have appeared in Neogene |
| 346 | Farinose Cartilage Lichen | Ramalina farinacea | Neogene | Quaternary | Modern lichen - should include both |
| 347 | Jelly Lichen | Collema crispum | Neogene | Quaternary | Modern lichen - should include both |

### organisms.plants.json (Roots)

| Card | Common Name | Scientific Name | Current Period | Missing Periods | Notes |
|------|-------------|-----------------|-----------------|-----------------|-------|
| 5 | Maple Tree | Acer saccharum | Neogene | Quaternary | Modern maple - should include both |
| 181 | Eucalyptus | Eucalyptus globulus | Neogene | Quaternary | Modern Australian species - should include both |
| 2 | Savanna Acacia | Acacia antiqua | Neogene | Quaternary | Modern African acacia - should include both |

---

## ORGANISMS SPANNING MULTIPLE PERIODS (CORRECTLY LISTED)

These organisms correctly list multiple periods:

| Card | Common Name | Scientific Name | Periods | Assessment |
|------|-------------|-----------------|---------|------------|
| 649 | Kudzu | Pueraria montana | Neogene, Quaternary | ✓ CORRECT - invasive modern species could appear late Neogene |

---

## SYMBIOTIC POWERHOUSES ISSUES

### organisms.symbiotic-powerhouses.json

| Card | Common Name | Scientific Name | Current Period | CORRECT Periods | Issue |
|------|-------------|-----------------|-----------------|-----------------|-------|
| 582 | Giant Sequoia | Sequoiadendron giganteum | Cretaceous | **Paleogene + Quaternary** | *Sequoiadendron* first appeared Paleogene, not Cretaceous. Modern species exists today (Quaternary) |
| 583 | Wollemi Pine | Wollemia nobilis | Jurassic | **Paleogene + Quaternary** | Wollemi fossil record goes back to Jurassic/Cretaceous but modern populations are Quaternary |

---

## ORGANISMS WITH GEOLOGICALLY APPROPRIATE PERIODS

These are correctly dated:

### Correctly Ancient (Paleozoic/Mesozoic):
- Jurassic organisms - all correctly in "Jurassic"
- Triassic organisms - correctly in "Triassic"  
- Devonian organisms - correctly in "Devonian"
- Permian organisms - correctly in "Permian"
- Paleozoic microbes - correctly dated

### Correctly Modern (Quaternary/Neogene):
- Hominids - mostly correctly distributed between Neogene and Quaternary
- Modern mammals (predators, herbivores) - correctly in Quaternary
- Modern shrubs - correctly in Quaternary
- Modern vines - correctly in Quaternary or Neogene

---

## CORRECTIONS NEEDED BY FILE

### 1. **organisms.herbaceous.plants.json**
```json
Card 217 - Ancient Cattail:
  FROM: "periods": ["Paleogene"]
  TO: "periods": ["Paleogene", "Neogene", "Quaternary"]

Card 218 - Mangrove Fern:
  FROM: "periods": ["Paleogene"]
  TO: "periods": ["Paleogene", "Neogene", "Quaternary"]

Card 219 - Eocene Grass:
  FROM: "periods": ["Paleogene"]
  TO: "periods": ["Paleogene", "Neogene", "Quaternary"]

Card 220 - Floating Fern:
  FROM: "periods": ["Paleogene"]
  TO: "periods": ["Cretaceous", "Paleogene", "Neogene", "Quaternary"]
```

### 2. **organisms.lichens.moss.fungi.json**
**Update these to include BOTH periods:**
- Cards 318-320, 322-324, 327-328, 330, 334-335, 337, 341, 343, 346-347: Add Quaternary
  ```json
  FROM: "periods": ["Neogene"]
  TO: "periods": ["Neogene", "Quaternary"]
  ```

- Cards 319-320, 322-324, 327, 330, 334-335, 337, 341, 343, 346-347: Add Quaternary where missing

### 3. **organisms.symbiotic-powerhouses.json**
```json
Card 582 - Giant Sequoia:
  FROM: "eras": ["Mesozoic"], "periods": ["Cretaceous"]
  TO: "eras": ["Cenozoic"], "periods": ["Paleogene", "Quaternary"]

Card 583 - Wollemi Pine:
  FROM: "periods": ["Jurassic"]
  TO: "periods": ["Jurassic", "Cretaceous", "Paleogene", "Quaternary"]
```

### 4. **organisms.understory.plants.json**
```json
Card 630 - Common Greenbrier:
  FROM: "periods": ["Paleogene"]
  TO: "periods": ["Paleogene", "Neogene", "Quaternary"]

Card 610 - Sassafras:
  FROM: "periods": ["Cretaceous"]
  TO: "periods": ["Cretaceous", "Paleogene", "Neogene", "Quaternary"]
```

### 5. **organisms.plants.json (Roots)**
```json
Card 5 - Maple Tree:
  FROM: "periods": ["Neogene"]
  TO: "periods": ["Neogene", "Quaternary"]

Card 181 - Eucalyptus:
  FROM: "periods": ["Neogene"]
  TO: "periods": ["Neogene", "Quaternary"]

Card 2 - Savanna Acacia:
  FROM: "periods": ["Neogene"]
  TO: "periods": ["Neogene", "Quaternary"]
```

---

## GEOLOGICAL TIME SCALE REFERENCE

| Era | Period | Age (MYA) | Key Characteristics |
|-----|--------|-----------|-------------------|
| Cenozoic | **Quaternary** | 2.6-Present | Modern life, ice ages, humans |
| | **Neogene** | 23-2.6 | Mammals diversify, grasses spread |
| | **Paleogene** | 66-23 | Age of mammals begins, flowering plants |
| Mesozoic | **Cretaceous** | 145-66 | Dinosaurs, flowering plants emerge |
| | **Jurassic** | 201-145 | Age of dinosaurs, cycads, conifers |
| | **Triassic** | 252-201 | Dinosaurs emerge, conifers abundant |
| Paleozoic | **Permian** | 299-252 | Seed ferns, reptiles, insects |
| | **Carboniferous** | 359-299 | Coal forests, early conifers |
| | **Devonian** | 419-359 | First trees, fish diversify |
| | **Silurian** | 444-419 | Plants colonize land |
| | **Ordovician** | 485-444 | Marine life dominant |
| | **Cambrian** | 541-485 | Explosion of life forms |

---

## RECOMMENDATIONS

1. **Immediate Action:** Update all modern lichens/mosses to include both Neogene and Quaternary
2. **Review herbaceous plants:** Ancient Cattail, Mangrove Fern species need rechecking
3. **Clarify giant plant fossils:** Determine if Sequoia/Wollemi entries represent fossil species or modern representatives
4. **Add missing periods:** Many modern organisms should span Neogene into Quaternary to reflect continuous existence
5. **Scientific accuracy:** Ensure scientific names match their correct time ranges (many species names may be fossil species vs. modern)

---

## NOTES FOR GAME DESIGNERS

- Modern organisms should generally include at least **Neogene** (when they first appeared/diversified) and **Quaternary** (modern era)
- Organisms that survived multiple geological periods should list all periods they inhabited
- Consider whether you want "realistic" geological accuracy or "gamified" simplification
- Ancient fossil species should be differentiated from modern species with same genus name (different scientific names)
