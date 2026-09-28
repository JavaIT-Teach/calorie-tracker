// ── FOOD DATABASE ──────────────────────────────────────────────────────────────
// All values per listed portion size: cal, protein(g), carbs(g), fiber(g), sugar(g), fat(g)
const FOOD_DB = [
  { id: "boiled_egg",        name: "Egg (whole, large)",          portion: "1 pc",          cal: 78,    p: 6.3,  c: 0.6,  f: 0,    s: 0.6,  fat: 5.3  },
  { id: "banana",            name: "Banana (medium, ~118 g)",      portion: "1 pc",          cal: 105,   p: 1.3,  c: 27,   f: 3.1,  s: 14,   fat: 0.4  },
  { id: "greek_yogurt",      name: "Greek Yogurt",                portion: "100 g",         cal: 90,    p: 8,    c: 11,   f: 0,    s: 3.5,  fat: 2.5  },
  { id: "greek_yogurt_0",    name: "Greek Yogurt 0%",             portion: "175 g",         cal: 100,   p: 19,   c: 7,    f: 0,    s: 5.5,  fat: 0    },
  { id: "whey_protein",      name: "Whey Protein",                portion: "1 scoop",       cal: 140,   p: 23,   c: 6,    f: 0,    s: 2,    fat: 3    },
  { id: "gainer",            name: "Gainer",                      portion: "1 scoop",       cal: 250,   p: 16,   c: 43,   f: 1.5,  s: 4.5,  fat: 2    },
  { id: "cream_cheese",      name: "Cream Cheese",                portion: "2 tbsp",        cal: 60,    p: 3,    c: 2,    f: 0,    s: 1,    fat: 4.5  },
  { id: "havarti",           name: "Havarti",                     portion: "1 slice",       cal: 120,   p: 6,    c: 1,    f: 0,    s: 0,    fat: 10   },
  { id: "provolone",         name: "Provolone Cheese",            portion: "1 slice",       cal: 70,    p: 5,    c: 1,    f: 0,    s: 0,    fat: 5    },
  { id: "potatoes",          name: "Potato (raw)",                portion: "100 g",         cal: 77,    p: 2,    c: 17,   f: 2.2,  s: 0.8,  fat: 0.1  },
  { id: "rudolphs_bread",    name: "Rudolph's Bread",             portion: "2 slices",      cal: 330,   p: 14,   c: 63,   f: 4,    s: 2,    fat: 3.5  },
  { id: "pasta",             name: "Pasta (raw, dry)",            portion: "100 g",         cal: 371,   p: 13,   c: 75,   f: 3.2,  s: 2.7,  fat: 1.5  },
  { id: "tortilla",          name: "Tortilla",                    portion: "1 pc",          cal: 180,   p: 5,    c: 30,   f: 1.2,  s: 1.2,  fat: 4.5  },
  { id: "protein_tortilla",  name: "Protein Tortilla",            portion: "1 pc",          cal: 150,   p: 13,   c: 19,   f: 4,    s: 2,    fat: 3.5  },
  { id: "rice",              name: "Rice (raw, white)",           portion: "100 g",         cal: 365,   p: 7.1,  c: 80,   f: 1.3,  s: 0.1,  fat: 0.7  },
  { id: "chicken_breast",    name: "Chicken Breast (raw, b/s)",   portion: "100 g",         cal: 165,   p: 31,   c: 0,    f: 0,    s: 0,    fat: 3.6  },
  { id: "diced_tomatoes",    name: "Diced Tomatoes",              portion: "1 cup",         cal: 54,    p: 4,    c: 10,   f: 2.2,  s: 1.7,  fat: 0    },
  { id: "kirkland_ham",      name: "Kirkland Master Carve Ham",   portion: "100 g",         cal: 150,   p: 3.5,  c: 15,   f: 0,    s: 4,    fat: 7    },
  { id: "avocado",           name: "Avocado",                     portion: "1 pc",          cal: 320,   p: 4,    c: 17,   f: 11,   s: 1,    fat: 30   },
  { id: "egg_white",         name: "Egg White",                   portion: "100 g",         cal: 45,    p: 10,   c: 1,    f: 0,    s: 0.7,  fat: 0    },
  { id: "eggs",              name: "Eggs",                        portion: "1 pc",          cal: 65,    p: 5.5,  c: 1,    f: 0,    s: 0.5,  fat: 4.5  },
  { id: "olive_oil",         name: "Gallo Olive Oil",             portion: "10 ml",         cal: 80,    p: 0,    c: 0,    f: 0,    s: 0,    fat: 9    },
  { id: "flour",             name: "Robin Hood Flour",            portion: "30 g",          cal: 110,   p: 4,    c: 21,   f: 1,    s: 0,    fat: 0.5  },
  { id: "kefir",             name: "Kefir",                       portion: "1 cup",         cal: 85,    p: 10.5, c: 11,   f: 0,    s: 11,   fat: 0    },
  { id: "bell_peppers",      name: "Bell Pepper (raw)",           portion: "100 g",         cal: 31,    p: 1,    c: 6,    f: 2.1,  s: 4.2,  fat: 0.3  },
  { id: "kalamata_olives",   name: "Kalamata Olives",             portion: "30 g",          cal: 45,    p: 0,    c: 2,    f: 0,    s: 1,    fat: 4    },
  { id: "feta",              name: "Feta",                        portion: "40 g",          cal: 120,   p: 7,    c: 1.4,  f: 0,    s: 0,    fat: 9.3  },
  { id: "red_onions",        name: "Red Onions",                  portion: "20 g",          cal: 8,     p: 0,    c: 2,    f: 1,    s: 0,    fat: 0    },
  { id: "cucumbers",         name: "Cucumber (raw)",              portion: "100 g",         cal: 15,    p: 0.7,  c: 3.6,  f: 0.5,  s: 1.7,  fat: 0.1  },
  { id: "mozzarella",        name: "Mozzarella Cheese",           portion: "64 g",          cal: 171,   p: 17.1, c: 2.1,  f: 0,    s: 0,    fat: 12.8 },
  { id: "marinara",          name: "Marinara Sauce",              portion: "120 ml",        cal: 58,    p: 1.9,  c: 11.5, f: 0,    s: 0,    fat: 0.5  },
  { id: "ricotta",           name: "Ricotta",                     portion: "95 g",          cal: 104,   p: 10.4, c: 5.2,  f: 0,    s: 0,    fat: 5.2  },
  { id: "chicken_thighs",   name: "Chicken Thigh (bone-in, raw)", portion: "100 g",        cal: 150,   p: 18.7, c: 0,    f: 0,    s: 0,    fat: 7.8,
    note: "bone-in, skin removed before weighing \u2014 do not use boneless/skinless values." },
  { id: "shrimp",            name: "Shrimp (raw)",                portion: "100 g",         cal: 85,    p: 20,   c: 0.2,  f: 0,    s: 0,    fat: 0.3  },
  { id: "salmon",            name: "Fresh Salmon (raw)",          portion: "100 g",         cal: 208,   p: 20,   c: 0,    f: 0,    s: 0,    fat: 13   },
  { id: "sweet_potatoes",    name: "Sweet Potatoes (raw)",        portion: "100 g",         cal: 86,    p: 1.6,  c: 20,   f: 3,    s: 4.2,  fat: 0.1  },
  { id: "chicken_broth",     name: "Chicken Broth",               portion: "240 ml",        cal: 15,    p: 1,    c: 1,    f: 0,    s: 1,    fat: 0.5  },
  { id: "soy_sauce",         name: "Soy Sauce",                   portion: "1 tbsp",        cal: 8,     p: 1.3,  c: 1,    f: 0,    s: 0.1,  fat: 0    },
  { id: "honey",             name: "Honey",                       portion: "1 tbsp",        cal: 64,    p: 0.1,  c: 17,   f: 0,    s: 17,   fat: 0    },
  { id: "garlic",            name: "Garlic",                      portion: "1 clove",       cal: 4,     p: 0.2,  c: 1,    f: 0.1,  s: 0,    fat: 0    },
  { id: "butter",            name: "Butter",                      portion: "1 tbsp",        cal: 100,   p: 0.1,  c: 0,    f: 0,    s: 0,    fat: 11   },
  { id: "spinach",          name: "Spinach (fresh)",             portion: "100 g",         cal: 23,    p: 2.9,  c: 3.6,  f: 2.2,  s: 0.4,  fat: 0.4  },
  { id: "cherry_tomatoes",  name: "Cherry Tomatoes",             portion: "100 g",         cal: 18,    p: 0.9,  c: 3.9,  f: 1.2,  s: 2.6,  fat: 0.2  },
  { id: "lemon_juice",      name: "Lemon Juice",                 portion: "100 g",         cal: 22,    p: 0.4,  c: 6.9,  f: 0.3,  s: 2.5,  fat: 0.2  },
  { id: "sukhari",          name: "Sukhari (dried rusks)",       portion: "100 g",         cal: 287,   p: 11.5, c: 50.8, f: 2.5,  s: 0,    fat: 5.5  },
  { id: "lavash",           name: "Lavash (thin flatbread)",     portion: "100 g",         cal: 281,   p: 8.7,  c: 60.3, f: 3.1,  s: 0,    fat: 1.2  },
  { id: "sukhari_snack",    name: "Sukhari Snack (24 g)",        portion: "24 g",          cal: 68.9,  p: 2.8,  c: 12.2, f: 0.6,  s: 0,    fat: 1.3  },
  { id: "psyllium_husk",    name: "Psyllium Husk Powder",        portion: "100 g",         cal: 300,   p: 0,    c: 80,   f: 80,   s: 0,    fat: 0    },

  // ── Diet Reset / Workout 6.0 additions ─────────────────────────────────────
  // Confirmed real label — do not alter.
  { id: "greek_yogurt_dilbah", name: "Greek Yogurt, Dil-Bah (LF 4.5%)", portion: "100 g",     cal: 96,    p: 10,   c: 4.1,  f: 0,    s: 4.1,  fat: 4.5  },
  // VERIFY resolved: no reliable per-100 g data exists for Uzbek non/lepeshka.
  // Fallback = plain white tandyr-style flatbread average (closest published
  // reference: Gandoum Bakery "Uzbek Bread", 180 kcal / 48 c / 6 p / 3 fat per
  // serving, serving size unstated). Replace if a real label becomes available.
  { id: "non_lepeshka",     name: "Local Flatbread / Non (lepeshka)", portion: "100 g",     cal: 270,   p: 8.5,  c: 53,   f: 2.3,  s: 2.5,  fat: 3.2  },
  // Sugar NOT confirmed — stored as 0 with sugarTBD flag. TBD, check label.
  { id: "bran_bread",       name: "Bran Bread",                  portion: "100 g",         cal: 259,   p: 8.2,  c: 52.8, f: 1.6,  s: 0,    fat: 1.7, sugarTBD: true, note: "Sugar TBD, check label" },
  { id: "mayonnaise",       name: "Mayonnaise",                  portion: "100 g",         cal: 680,   p: 1,    c: 2,    f: 0,    s: 1,    fat: 75   },
  { id: "korean_carrot",    name: "Korean Carrot Salad",         portion: "100 g",         cal: 130,   p: 1.5,  c: 10,   f: 2.5,  s: 6,    fat: 9    },
  { id: "onion",            name: "Onion (raw)",                 portion: "100 g",         cal: 40,    p: 1.1,  c: 9.3,  f: 1.7,  s: 4.2,  fat: 0.1  },
  { id: "tomato_paste",     name: "Tomato Paste",                portion: "100 g",         cal: 82,    p: 4.3,  c: 18.9, f: 4.1,  s: 12.2, fat: 0.5  },
  // Always dosed identically, so stored per-serving rather than per-100 g.
  { id: "psyllium_serving", name: "Psyllium Husk (10 g serving)", portion: "1 serving",    cal: 35,    p: 0.1,  c: 8,    f: 7,    s: 0,    fat: 0.1  },
  { id: "creatine",         name: "Creatine (5 g serving)",      portion: "1 serving",     cal: 0,     p: 0,    c: 0,    f: 0,    s: 0,    fat: 0    },
  { id: "mushrooms",       name: "Mushrooms (raw, white button)", portion: "100 g",    cal: 22,    p: 3.1,  c: 3.3,  f: 1,    s: 2,    fat: 0.3  },
  { id: "yasno_oats_1",     name: "Yasno Solnyshko Rolled Oats (Size 1)", ru: "Ясно Солнышко, овсяные хлопья №1", portion: "100 g", cal: 370, p: 13.0, c: 60.0, f: 10.1, s: 1.0, fat: 6.5 },
  { id: "cottage_cheese",   name: "Cottage Cheese",               portion: "100 g",         cal: 84,    p: 11,   c: 4.3,  f: 0,    s: 4,    fat: 2.3  }, // provisional — update from label
  { id: "roasted_red_pepper", name: "Roasted Red Pepper",         portion: "1 pc",          cal: 10,    p: 0.3,  c: 2,    f: 0.5,  s: 1.4,  fat: 0.1  },
  { id: "smoked_paprika",   name: "Smoked Paprika",               portion: "1 tsp",         cal: 6,     p: 0.3,  c: 1.2,  f: 0.8,  s: 0.2,  fat: 0.3  },
  { id: "salt",             name: "Salt",                         portion: "1 tsp",         cal: 0,     p: 0,    c: 0,    f: 0,    s: 0,    fat: 0    },
  { id: "black_pepper",     name: "Black Pepper",                 portion: "1 tsp",         cal: 6,     p: 0.2,  c: 1.5,  f: 0.6,  s: 0,    fat: 0.1  },
  { id: "fresh_dill",       name: "Fresh Dill (chopped)",         portion: "1 tbsp",        cal: 1,     p: 0.1,  c: 0.15, f: 0.05, s: 0.05, fat: 0    },
  { id: "sunflower_oil",    name: "Sunflower Oil",                portion: "100 g",         cal: 884,   p: 0,    c: 0,    f: 0,    s: 0,    fat: 100  },
  // USDA FoodData Central, rainbow trout, raw.
  { id: "trout",            name: "Trout (rainbow, raw)",         portion: "100 g",         cal: 119,   p: 20.5, c: 0,    f: 0,    s: 0,    fat: 3.5  },
  { id: "rice_cakes",       name: "Rice Cakes",                   portion: "2 pcs (19 g)",  cal: 70,    p: 2,    c: 15,   f: 0,    s: 0,    fat: 1    },
];

// Seed foods and recipes only fill in IDs that are missing from storage; a
// stored item with the same ID always wins. Editing a seed here does not
// change data a user already has — see CLAUDE.md.

// Ingredients whose sugar is added/processed rather than whole-food. Used only
// by the sugar status rule; the standard meal plan contains none of these.
const PROCESSED_SUGAR_IDS = ['honey', 'gainer', 'banana_bread'];

// ── RECIPES ────────────────────────────────────────────────────────────────────
// li(foodId, name, portion, qty) — a recipe line item. Meal totals are computed
// live from these against the ingredient database (see sumLineItems), so an
// ingredient correction propagates into every meal that uses it.
function li(foodId, foodName, foodPortion, enteredQty) {
  const base = parseFloat(String(foodPortion).match(/[\d.]+/)?.[0]) || 1;
  const unit = String(foodPortion).replace(/^[\d.]+\s*/, '').replace(/\s*\(.*\)$/, '');
  return { id: foodId + '_seed', foodId, foodName, foodPortion, enteredQty, unit, mult: enteredQty / base };
}

const RECIPES = [
  { id: "tomato_egg_dish",       name: "Tomato Egg Dish",         portion: "1 portion",  cal: 699,   p: 41.5, c: 76,   f: 6.2,  s: 5.2,  fat: 27   },
  { id: "sandwich",              name: "Sandwich",                portion: "2 pcs",      cal: 950,   p: 33,   c: 84,   f: 0,    s: 0,    fat: 58   },
  { id: "omelette",              name: "Omelette",                portion: "1 portion",  cal: 640,   p: 34,   c: 68,   f: 0,    s: 0,    fat: 27   },
  { id: "banana_bread",          name: "Banana Bread",            portion: "1 slice",    cal: 255,   p: 5,    c: 39,   f: 0,    s: 0,    fat: 9.5  },
  { id: "lasagna",               name: "Lasagna",                 portion: "1 portion",  cal: 891,   p: 65.3, c: 79.7, f: 0,    s: 0,    fat: 39.6 },
  { id: "greek_salad",           name: "Greek Salad",             portion: "1 bowl",     cal: 220,   p: 9,    c: 16.4, f: 7,    s: 4,    fat: 13.3 },
  { id: "tortilla_cheese_wrap",  name: "Tortilla Cheese Wrap",    portion: "1 wrap",     cal: 220,   p: 18,   c: 20,   f: 4,    s: 2,    fat: 8.5  },
  { id: "potato_meal",           name: "Potato Meal",             portion: "1 portion",  cal: 295,   p: 32,   c: 33,   f: 2,    s: 5.5,  fat: 4.5  },
  // ── Diet Reset / Workout 6.0 composed meals ─────────────────────────────────
  { id: "meal_breakfast", name: "Breakfast — Eggs & Greek Yogurt", portion: "1 portion",
    lineItems: [li('boiled_egg', 'Egg (whole, large)', '1 pc', 2), li('greek_yogurt_dilbah', 'Greek Yogurt, Dil-Bah (LF 4.5%)', '100 g', 200)],
    cal: 348, p: 32.6, c: 9.4, f: 0, s: 9.4, fat: 19.6 },
  { id: "meal_preworkout", name: "Pre-Workout — Banana", portion: "1 portion",
    lineItems: [li('banana', 'Banana (medium, ~118 g)', '1 pc', 1)],
    cal: 105, p: 1.3, c: 27, f: 3.1, s: 14, fat: 0.4 },
  { id: "meal_dinner_wrap", name: "Dinner Wrap", portion: "1 wrap",
    lineItems: [
      li('lavash', 'Lavash (thin flatbread)', '100 g', 150),
      li('chicken_breast', 'Chicken Breast (raw, b/s)', '100 g', 127),
      li('boiled_egg', 'Egg (whole, large)', '1 pc', 2),
      li('mayonnaise', 'Mayonnaise', '100 g', 20),
      li('korean_carrot', 'Korean Carrot Salad', '100 g', 65),
      li('bell_peppers', 'Bell Pepper (raw)', '100 g', 245),
      li('onion', 'Onion (raw)', '100 g', 105),
      li('cucumbers', 'Cucumber (raw)', '100 g', 140),
      li('tomato_paste', 'Tomato Paste', '100 g', 5),
    ],
    cal: 1150.6, p: 71, c: 129, f: 14.1, s: 23, fat: 38.8 },
  { id: "lunch_potato_week", name: "Lunch — Potato Week (thigh)", portion: "1 portion",
    lineItems: [
      li('chicken_thighs', 'Chicken Thigh (bone-in, raw)', '100 g', 370),
      li('potatoes', 'Potato (raw)', '100 g', 630),
      li('bran_bread', 'Bran Bread', '100 g', 74),
    ],
    cal: 1231.8, p: 87.8, c: 146.2, f: 15.1, s: 5.1, fat: 30.7, sugarUncertain: true },
  { id: "lunch_rice_week", name: "Lunch — Rice Week (thigh)", portion: "1 portion",
    lineItems: [
      li('chicken_thighs', 'Chicken Thigh (bone-in, raw)', '100 g', 390),
      li('rice', 'Rice (raw, white)', '100 g', 125),
      li('bran_bread', 'Bran Bread', '100 g', 74),
    ],
    cal: 1233.0, p: 87.9, c: 139.1, f: 2.8, s: 0.2, fat: 32.5, sugarUncertain: true },
  { id: "lunch_pasta_week", name: "Lunch — Pasta Week (thigh)", portion: "1 portion",
    lineItems: [
      li('chicken_thighs', 'Chicken Thigh (bone-in, raw)', '100 g', 340),
      li('pasta', 'Pasta (raw, dry)', '100 g', 150),
      li('bran_bread', 'Bran Bread', '100 g', 64),
    ],
    cal: 1232.3, p: 88.3, c: 146.3, f: 5.8, s: 4.1, fat: 29.9, sugarUncertain: true },
  // ── Trout lunch variants — alternatives to the thigh lunches, same rotation ──
  { id: "lunch_potato_week_trout", name: "Lunch — Potato Week (trout)", portion: "1 portion",
    lineItems: [
      li('trout', 'Trout (rainbow, raw)', '100 g', 370),
      li('potatoes', 'Potato (raw)', '100 g', 710),
      li('non_lepeshka', 'Local Flatbread / Non (lepeshka)', '100 g', 90),
    ],
    cal: 1230, p: 97.7, c: 168.4, f: 17.7, s: 7.9, fat: 16.5 },
  { id: "lunch_rice_week_trout", name: "Lunch — Rice Week (trout)", portion: "1 portion",
    lineItems: [
      li('trout', 'Trout (rainbow, raw)', '100 g', 370),
      li('rice', 'Rice (raw, white)', '100 g', 165),
      li('non_lepeshka', 'Local Flatbread / Non (lepeshka)', '100 g', 70),
    ],
    cal: 1231.6, p: 93.5, c: 169.1, f: 3.8, s: 1.9, fat: 16.3 },
  { id: "lunch_pasta_week_trout", name: "Lunch — Pasta Week (trout)", portion: "1 portion",
    lineItems: [
      li('trout', 'Trout (rainbow, raw)', '100 g', 320),
      li('pasta', 'Pasta (raw, dry)', '100 g', 185),
      li('non_lepeshka', 'Local Flatbread / Non (lepeshka)', '100 g', 60),
    ],
    cal: 1229.2, p: 94.8, c: 170.6, f: 7.3, s: 6.5, fat: 15.9 },
  { id: "meal_dinner_trout_salad", name: "Dinner — Trout Salad Sandwich", portion: "1 sandwich",
    note: "Trout is cooked, flaked and mixed with the mayo, yogurt, fresh dill and lemon juice into a trout salad (tuna-salad style), not eaten as a whole fillet. Bell pepper is roasted, not saut\u00e9ed. Dill, lemon juice and black pepper to taste — negligible macros, untracked.",
    lineItems: [
      li('trout', 'Trout (rainbow, raw)', '100 g', 210),
      li('lavash', 'Lavash (thin flatbread)', '100 g', 200),
      li('mayonnaise', 'Mayonnaise', '100 g', 25),
      li('greek_yogurt_dilbah', 'Greek Yogurt, Dil-Bah (LF 4.5%)', '100 g', 30),
      li('bell_peppers', 'Bell Pepper (raw)', '100 g', 180),
      li('onion', 'Onion (raw)', '100 g', 25),
      li('cucumbers', 'Cucumber (raw)', '100 g', 120),
    ],
    cal: 1094.5, p: 66.6, c: 139.8, f: 11, s: 12.1, fat: 30.5 },
  { id: "meal_dinner_mushroom_wrap", name: "Dinner — Mushroom Chicken Mozzarella Spinach Wrap", portion: "1 wrap",
    note: "Saut\u00e9 onion, mushrooms and spinach in the sunflower oil until softened, seasoning with garlic powder, hot pepper or paprika, salt and pepper to taste. Cook the chicken breast separately (grilled or pan-seared), then shred and mix into the pan with the vegetables in the last minute to warm through. Lay the lavash flat, layer the chicken-vegetable mix down the centre, top with mozzarella while still warm so it melts slightly, add basil or parsley to taste, and roll tightly.",
    lineItems: [
      li('lavash', 'Lavash (thin flatbread)', '100 g', 100),
      li('chicken_breast', 'Chicken Breast (raw, b/s)', '100 g', 180),
      li('mushrooms', 'Mushrooms (raw, white button)', '100 g', 180),
      li('mozzarella', 'Mozzarella Cheese', '64 g', 55),
      li('onion', 'Onion (raw)', '100 g', 60),
      li('sunflower_oil', 'Sunflower Oil', '100 g', 14),
      li('spinach', 'Spinach (fresh)', '100 g', 90),
    ],
    cal: 933, p: 88.1, c: 76.9, f: 7.9, s: 6.5, fat: 33.6 },
  { id: "egg_salad_sandwich", name: "Egg Salad Sandwich (daily portion)", portion: "1 sandwich",
    lineItems: [
      li('boiled_egg', 'Egg (whole, large)', '1 pc', 2.5),
      li('cottage_cheese', 'Cottage Cheese', '100 g', 100),
      li('greek_yogurt_0', 'Greek Yogurt 0%', '175 g', 30),
      li('roasted_red_pepper', 'Roasted Red Pepper', '1 pc', 0.5),
      li('lemon_juice', 'Lemon Juice', '100 g', 10),
      li('smoked_paprika', 'Smoked Paprika', '1 tsp', 1),
      li('salt', 'Salt', '1 tsp', 0.5),
      li('black_pepper', 'Black Pepper', '1 tsp', 0.5),
      li('fresh_dill', 'Fresh Dill (chopped)', '1 tbsp', 1),
      li('rudolphs_bread', "Rudolph's Bread", '2 slices', 1),
    ],
    cal: 478.3, p: 37.7, c: 42.3, f: 3.43, s: 8.6, fat: 17.72 },
  { id: "chicken_wrap", name: "Chicken Wrap", portion: "1 wrap",
    lineItems: [
      li('chicken_breast', 'Chicken Breast (raw, b/s)', '100 g', 85),
      li('lavash', 'Lavash (thin flatbread)', '100 g', 60),
      li('mozzarella', 'Mozzarella Cheese', '64 g', 28),
      li('red_onions', 'Red Onions', '20 g', 20),
      li('cream_cheese', 'Cream Cheese', '2 tbsp', 0.5),
    ],
    cal: 406.7, p: 39.8, c: 39.6, f: 2.9, s: 0.3, fat: 10.5 },
  { id: "chicken_veggie_wrap", name: "Chicken Veggie Wrap", portion: "1 wrap",
    lineItems: [
      li('chicken_breast', 'Chicken Breast (raw, b/s)', '100 g', 85),
      li('lavash', 'Lavash (thin flatbread)', '100 g', 60),
      li('bell_peppers', 'Red Peppers', '100 g', 50),
      li('bell_peppers', 'Green Peppers', '100 g', 50),
      li('red_onions', 'Red Onions', '20 g', 20),
      li('greek_yogurt_0', 'Greek Yogurt 0%', '175 g', 30),
    ],
    cal: 365, p: 35.8, c: 45.4, f: 5, s: 5.1, fat: 4.1 },
  { id: "daily_supplements", name: "Daily Supplements — Psyllium + Creatine", portion: "1 day",
    lineItems: [
      li('psyllium_serving', 'Psyllium Husk (10 g serving)', '1 serving', 1),
      li('creatine', 'Creatine (5 g serving)', '1 serving', 1),
    ],
    cal: 35, p: 0.1, c: 8, f: 7, s: 0, fat: 0.1 },
];

// ── DIET PLANS ─────────────────────────────────────────────────────────────────
const DIET_PLANS = [
  {
    id: "plan_a", name: "Plan A — High Chicken",
    meals: [
      { time: "8:00",  items: [{ name: "Boiled Egg",              qty: "2 pcs",   cal: 156,  p: 12.6, c: 1.2,  f: 0,   s: 0,    fat: 10.6 },
                                { name: "Banana",                 qty: "1 pc",    cal: 105,  p: 1.3,  c: 27,   f: 0,   s: 0,    fat: 0.5  }] },
      { time: "10:00", items: [{ name: "Greek Yogurt",            qty: "200 g",   cal: 140,  p: 16,   c: 16,   f: 0,   s: 0,    fat: 0    }] },
      { time: "13:00", items: [{ name: "Chicken Breast (raw)",    qty: "200 g",   cal: 227,  p: 49.7, c: 0,    f: 0,   s: 0,    fat: 5.2  },
                                { name: "Rudolph's Bread",        qty: "1 slice", cal: 165,  p: 7,    c: 31.5, f: 0,   s: 0,    fat: 1.75 },
                                { name: "Olive Oil",              qty: "10 ml",   cal: 80,   p: 0,    c: 0,    f: 0,   s: 0,    fat: 9    },
                                { name: "Potatoes (raw)",         qty: "380 g",   cal: 293,  p: 7.6,  c: 64.7, f: 0,   s: 0,    fat: 0.9  }] },
      { time: "15:00", items: [{ name: "Banana",                  qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "17:00", items: [{ name: "Gainer",                  qty: "1 scoop", cal: 250,  p: 16,   c: 43,   f: 0,   s: 0,    fat: 2    }] },
      { time: "19:00", items: [{ name: "Whey Protein",            qty: "1 scoop", cal: 140,  p: 23,   c: 6,    f: 0,   s: 0,    fat: 3    },
                                { name: "Banana Bread",           qty: "1 slice", cal: 255,  p: 5,    c: 39,   f: 0,   s: 0,    fat: 9.5  },
                                { name: "Banana",                 qty: "1 pc",    cal: 105,  p: 1.3,  c: 27,   f: 0,   s: 0,    fat: 0.5  }] },
      { time: "21:00", items: [{ name: "Tomato Egg Dish",         qty: "1 portion", cal: 984, p: 53.5, c: 109.5, f: 0, s: 0,   fat: 38.75}] },
    ]
  },
  {
    id: "plan_b", name: "Plan B — Beef & Wraps",
    meals: [
      { time: "8:00",  items: [{ name: "Boiled Egg",              qty: "1 pc",    cal: 78,   p: 6.3,  c: 0.6,  f: 0,   s: 0.6,  fat: 5.3  },
                                { name: "Banana",                 qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "10:00", items: [{ name: "Greek Yogurt",            qty: "200 g",   cal: 180,  p: 16,   c: 22,   f: 0,   s: 7,    fat: 5    }] },
      { time: "13:00", items: [{ name: "Ground Beef (raw)",       qty: "150 g",   cal: 323,  p: 31.5, c: 0,    f: 0,   s: 0,    fat: 24   },
                                { name: "Mashed Potatoes",        qty: "475 g",   cal: 348,  p: 9.5,  c: 79.2, f: 6.3, s: 2.5,  fat: 0    },
                                { name: "Greek Yogurt 0%",        qty: "60 g",    cal: 34,   p: 6.5,  c: 2.4,  f: 0,   s: 1.9,  fat: 0    }] },
      { time: "15:00", items: [{ name: "Banana",                  qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "17:00", items: [{ name: "Gainer",                  qty: "1 scoop", cal: 250,  p: 16,   c: 43,   f: 1,   s: 3,    fat: 2    },
                                { name: "Whey Protein",           qty: "1 scoop", cal: 140,  p: 23,   c: 6,    f: 0,   s: 2,    fat: 3    }] },
      { time: "19:00", items: [{ name: "Tortilla Cheese Wrap",    qty: "1 wrap",  cal: 280,  p: 19,   c: 20,   f: 4,   s: 2,    fat: 13.5 },
                                { name: "Tortilla Cheese Wrap",   qty: "1 wrap",  cal: 280,  p: 19,   c: 20,   f: 4,   s: 2,    fat: 13.5 }] },
      { time: "21:00", items: [{ name: "Tomato Egg Dish",         qty: "1 portion", cal: 699, p: 41.5, c: 76,  f: 6.2, s: 5.2,  fat: 27   },
                                { name: "Banana",                 qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
    ]
  },
  {
    id: "plan_c", name: "Plan C — Hasip Day",
    meals: [
      { time: "8:00",  items: [{ name: "Boiled Egg",              qty: "2 pcs",   cal: 156,  p: 12.6, c: 1.2,  f: 0,   s: 1.2,  fat: 10.6 },
                                { name: "Banana",                 qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "10:00", items: [{ name: "Greek Yogurt",            qty: "200 g",   cal: 180,  p: 16,   c: 22,   f: 0,   s: 7,    fat: 5    }] },
      { time: "13:00", items: [{ name: "Hasip",                   qty: "1 portion", cal: 838, p: 37.9, c: 132.2, f: 0.1, s: 4, fat: 15.7 }] },
      { time: "15:00", items: [{ name: "Banana",                  qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "17:00", items: [{ name: "Gainer",                  qty: "1 scoop", cal: 250,  p: 16,   c: 43,   f: 1,   s: 3,    fat: 2    },
                                { name: "Whey Protein",           qty: "1 scoop", cal: 140,  p: 23,   c: 6,    f: 0,   s: 2,    fat: 3    }] },
      { time: "19:00", items: [{ name: "Tortilla Cheese Wrap",    qty: "1 wrap",  cal: 280,  p: 19,   c: 20,   f: 4,   s: 2,    fat: 13.5 },
                                { name: "Tortilla Cheese Wrap",   qty: "1 wrap",  cal: 280,  p: 19,   c: 20,   f: 4,   s: 2,    fat: 13.5 }] },
      { time: "21:00", items: [{ name: "Tomato Egg Dish",         qty: "1 portion", cal: 699, p: 41.5, c: 76,  f: 6.2, s: 5.2,  fat: 27   }] },
    ]
  },
  {
    id: "plan_d", name: "Plan D — Salad & Beef",
    meals: [
      { time: "8:00",  items: [{ name: "Banana",                  qty: "3 pcs",   cal: 315,  p: 3,    c: 81,   f: 9.3, s: 43.2, fat: 0    }] },
      { time: "10:00", items: [{ name: "Greek Yogurt",            qty: "200 g",   cal: 180,  p: 16,   c: 22,   f: 0,   s: 7,    fat: 5    }] },
      { time: "13:00", items: [{ name: "Kefir",                   qty: "80 ml",   cal: 27,   p: 3.4,  c: 3.5,  f: 0,   s: 3.5,  fat: 0    },
                                { name: "Flour",                  qty: "60 g",    cal: 220,  p: 8,    c: 42,   f: 2,   s: 0,    fat: 1    },
                                { name: "Mozzarella Cheese",      qty: "64 g",    cal: 171,  p: 17.1, c: 2.1,  f: 0,   s: 0,    fat: 12.8 },
                                { name: "Greek Salad",            qty: "1 bowl",  cal: 220,  p: 9,    c: 16.4, f: 7,   s: 4,    fat: 13.3 },
                                { name: "Potato Meal",            qty: "1 portion", cal: 295, p: 32,  c: 33,   f: 2,   s: 5.5,  fat: 4.5  }] },
      { time: "15:00", items: [{ name: "Banana",                  qty: "1 pc",    cal: 105,  p: 1,    c: 27,   f: 3.1, s: 14.4, fat: 0    }] },
      { time: "17:00", items: [{ name: "Gainer",                  qty: "1 scoop", cal: 250,  p: 16,   c: 43,   f: 1,   s: 3,    fat: 2    },
                                { name: "Whey Protein",           qty: "1 scoop", cal: 140,  p: 23,   c: 6,    f: 0,   s: 2,    fat: 3    }] },
      { time: "19:00", items: [{ name: "Tortilla Cheese Wrap",    qty: "1 wrap",  cal: 220,  p: 18,   c: 20,   f: 4,   s: 2,    fat: 8.5  },
                                { name: "Tortilla Cheese Wrap",   qty: "1 wrap",  cal: 220,  p: 18,   c: 20,   f: 4,   s: 2,    fat: 8.5  }] },
      { time: "21:00", items: [{ name: "Banana Bread",            qty: "1 slice", cal: 266,  p: 5.6,  c: 40.4, f: 3.4, s: 21.1, fat: 9.3  },
                                { name: "Ground Beef (raw)",      qty: "150 g",   cal: 323,  p: 31.5, c: 0,    f: 0,   s: 0,    fat: 24   }] },
    ]
  },
];

// ── DEFAULT GOALS ──────────────────────────────────────────────────────────────
const DEFAULT_GOALS = { cal: 2700, p: 180, c: 326, f: 30, s: 50, fat: 75 };

// ── RANGE-BASED MACRO STATUS ───────────────────────────────────────────────────
// Three tiers per macro, per day: green / yellow / red. Replaces the old
// "hit target / missed target" binary.
function macroStatus(key, value, opts) {
  const v = value || 0;
  const o = opts || {};
  switch (key) {
    case 'cal':
      if (v >= 2600 && v <= 2800) return 'green';
      if ((v >= 2450 && v < 2600) || (v > 2800 && v <= 2950)) return 'yellow';
      return 'red';
    case 'p':
      if (v >= 170) return 'green';           // no upper ceiling
      if (v >= 155) return 'yellow';
      return 'red';
    case 'c':
      if (v >= 301 && v <= 351) return 'green';
      if ((v >= 266 && v < 301) || (v > 351 && v <= 386)) return 'yellow';
      return 'red';
    case 'fat':
      if (v > 105 || v < 40) return 'red';
      if (v > 90 || v < 50) return 'yellow';
      return 'green';                          // up to 90 g, floor 50 g
    case 'f':
      if (v >= 20 && v <= 45) return 'green';
      if ((v >= 15 && v < 20) || (v > 45 && v <= 55)) return 'yellow';
      return 'red';
    case 's': {
      // Sugar sourcing isn't a single number. Default: treat everything as
      // whole-food (the fixed plan is entirely whole-food). The stricter rule
      // only kicks in when processed sugar is actually logged.
      const processed = o.processedSugar || 0;
      const share = v > 0 ? processed / v : 0;
      if (v > 80 || share > 0.5) return 'red';
      if (v > 60 || (processed > 0 && v > 50)) return 'yellow';
      return 'green';
    }
    default:
      return 'green';
  }
}

const STATUS_COLOR = { green: 'var(--accent)', yellow: 'var(--amber)', red: 'var(--red)' };

// Sum of sugar coming from ingredients flagged as processed/added-sugar sources.
function processedSugarTotal(meals, foodDB) {
  const ids = new Set(typeof PROCESSED_SUGAR_IDS !== 'undefined' ? PROCESSED_SUGAR_IDS : []);
  let total = 0;
  (meals || []).forEach(meal => (meal.items || []).forEach(item => {
    const mult = item.qty_mult !== undefined ? item.qty_mult : 1;
    if (Array.isArray(item.lineItems) && item.lineItems.length) {
      item.lineItems.forEach(l => {
        if (!ids.has(l.foodId)) return;
        const food = (foodDB || []).find(f => f.id === l.foodId);
        if (food) total += (food.s || 0) * (l.mult || 1) * mult;
      });
    } else if (ids.has(item.id)) {
      total += (item.s || 0) * mult;
    }
  }));
  return total;
}

// Live meal totals from an ingredient list.
function sumLineItems(lineItems, foodDB) {
  const z = { cal: 0, p: 0, c: 0, f: 0, s: 0, fat: 0 };
  (lineItems || []).forEach(l => {
    const food = (foodDB || []).find(f => f.id === l.foodId);
    if (!food) return;
    const base = parseFloat(String(l.foodPortion || food.portion || '1').match(/[\d.]+/)?.[0]) || 1;
    const m = l.enteredQty !== undefined && l.enteredQty !== null ? l.enteredQty / base : (l.mult || 1);
    z.cal += (food.cal || 0) * m; z.p += (food.p || 0) * m; z.c += (food.c || 0) * m;
    z.f += (food.f || 0) * m;     z.s += (food.s || 0) * m; z.fat += (food.fat || 0) * m;
  });
  return z;
}

// ── HELPERS ────────────────────────────────────────────────────────────────────
// YYYY-MM-DD from the device's local calendar date (toISOString would use UTC
// and shift the day for non-UTC time zones).
function localDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayKey() {
  return localDateKey(new Date());
}

function sumMeals(meals) {
  const z = { cal: 0, p: 0, c: 0, f: 0, s: 0, fat: 0 };
  meals.forEach(meal =>
    meal.items.forEach(item => {
      const mult = item.qty_mult !== undefined ? item.qty_mult : 1;
      z.cal += (item.cal  || 0) * mult;
      z.p   += (item.p    || 0) * mult;
      z.c   += (item.c    || 0) * mult;
      z.f   += (item.f    || 0) * mult;
      z.s   += (item.s    || 0) * mult;
      z.fat += (item.fat  || 0) * mult;
    })
  );
  return z;
}

function r1(n) { return Math.round(n * 10) / 10; }
