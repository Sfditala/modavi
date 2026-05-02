// ============================================================
// lib/geminiAI.js
// ============================================================

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ============================================================
// دالة مساعدة داخلية
// ============================================================
async function askGroq(prompt) {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "❌ Missing API Key! Add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file.",
    );
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          // ============================================================
          // System Prompt — قواعد التنسيق الكاملة
          // ============================================================
          content: `You are an expert luxury fashion stylist AI called Modavi Atelier.
Your job is to create complete, stylish, and realistic outfit combinations.

=== CATEGORY DEFINITIONS ===
- tops:        blouses, shirts, t-shirts, crop tops, tank tops, bodysuits, corset tops
- bottoms:     trousers, pants, jeans, skirts, shorts, wide-leg pants
- dresses:     any one-piece dress, jumpsuit, or romper
- outerwear:   jackets, coats, blazers, cardigans
- shoes:       heels, sneakers, boots, loafers, sandals, flats, mules
- accessories: bags, belts, jewelry, scarves, hats, sunglasses, watches

=== COMPLETE OUTFIT FORMULA (MANDATORY) ===
A complete outfit MUST contain:
  1. CLOTHING CORE (required — pick one):
     - Option A: 1 Top + 1 Bottom
     - Option B: 1 Top + 1 Bottom + 1 Outerwear
     - Option C: 1 Dress (standalone)
     - Option D: 1 Dress + 1 Outerwear

  2. SHOES (required if available in wardrobe):
     - Always add 1 pair of shoes that matches the outfit style

  3. ACCESSORIES (optional, add if available):
     - Add 1–2 accessories that complement the look

=== RULES ===
- NEVER combine 2 tops without a bottom
- NEVER combine 2 bottoms
- NEVER skip shoes if they exist in the wardrobe
- ALWAYS ensure color harmony (e.g. navy pairs with black/white/camel, burgundy pairs with black/camel/olive)
- Each outfit must feel like a real, complete, wearable look

Always respond with valid JSON only. No explanation. No markdown. No extra text.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.65, // دقيق أكثر مع حرية إبداعية كافية
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Groq API Error ${response.status}: ${err.error?.message || "Unknown error"}`,
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq. Please try again.");

  return text;
}

// ============================================================
// دالة مساعدة: تبني ملخص الخزانة للـ prompt
// ============================================================
function buildWardrobeSummary(wardrobeItems) {
  // نصنّف الملابس حسب category
  const grouped = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
    accessories: [],
  };

  wardrobeItems.forEach((item, i) => {
    const cat = item.category?.toLowerCase() || "tops";
    if (grouped[cat]) {
      grouped[cat].push({ ...item, index: i });
    } else {
      grouped["tops"].push({ ...item, index: i }); // fallback
    }
  });

  // ملخص ما هو متاح
  const summary = Object.entries(grouped)
    .filter(([_, items]) => items.length > 0)
    .map(
      ([cat, items]) =>
        `${cat.toUpperCase()} (${items.length}): ${items.map((i) => `[${i.index}]${i.title}`).join(", ")}`,
    )
    .join("\n");

  // القائمة الكاملة المفهرسة
  const fullList = wardrobeItems
    .map(
      (item, i) =>
        `${i}. [${item.category?.toUpperCase() || "TOPS"}] "${item.title}" | Color: ${item.color || "N/A"} | ${item.description || ""}`,
    )
    .join("\n");

  return { summary, fullList, grouped };
}

// ============================================================
// دالة validation: تتحقق إن الـ outfit مكتمل ومنطقي
// ============================================================
function validateOutfit(outfit, wardrobeItems) {
  const pieces = (outfit.items || [])
    .map((i) => wardrobeItems[i])
    .filter(Boolean);

  const categories = pieces.map((p) => p.category?.toLowerCase() || "tops");

  const count = (cat) => categories.filter((c) => c === cat).length;

  const hasDress = count("dresses") >= 1;
  const hasTop = count("tops") >= 1;
  const hasBottom = count("bottoms") >= 1;
  const hasOuterwear = count("outerwear") >= 1;
  const twoTops = count("tops") >= 2;
  const twoBottoms = count("bottoms") >= 2;

  // فشل لو: توبين بدون بوتوم، أو بوتومين
  if (twoTops && !hasBottom) return false;
  if (twoBottoms) return false;

  // نجاح لو: فستان، أو توب+بوتوم
  return hasDress || (hasTop && hasBottom);
}

// ============================================================
// 1️⃣  generateOutfits — ينتج 4 تنسيقات كاملة
// ============================================================
export async function generateOutfits(wardrobeItems) {
  if (!wardrobeItems || wardrobeItems.length < 2) {
    throw new Error("Add at least 2 items to your wardrobe first.");
  }

  const { summary, fullList, grouped } = buildWardrobeSummary(wardrobeItems);

  // نخبر الـ AI بالضبط شو الـ categories الموجودة
  const hasShoes = grouped.shoes.length > 0;
  const hasAccessories = grouped.accessories.length > 0;

  const prompt = `
=== WARDROBE SUMMARY ===
${summary}

=== FULL ITEM LIST (use these exact index numbers) ===
${fullList}

=== YOUR TASK ===
Create exactly 4 COMPLETE outfit combinations.

Each outfit must follow this structure:
- REQUIRED: 1 top [tops] + 1 bottom [bottoms]  OR  1 dress [dresses]
- OPTIONAL: add 1 outerwear [outerwear] if it matches the style
- ${hasShoes ? "REQUIRED: add 1 pair of shoes [shoes] that fits the outfit's occasion" : "No shoes available — skip"}
- ${hasAccessories ? "OPTIONAL: add 1–2 accessories [accessories] that elevate the look" : "No accessories available — skip"}

Vary the occasions across all 4 outfits:
  Outfit 1: Work/Professional
  Outfit 2: Casual/Weekend  
  Outfit 3: Evening/Going Out
  Outfit 4: Smart Casual/Brunch

Return ONLY this JSON array — no markdown, no explanation:
[
  {
    "id": "outfit_1",
    "name": "Sharp Authority",
    "description": "A polished, commanding look that means business.",
    "occasion": "Work",
    "vibe": ["Professional", "Sharp"],
    "matchScore": 94,
    "items": [4, 3, 7, 12]
  },
  {
    "id": "outfit_2",
    "name": "Weekend Edit",
    "description": "Effortless weekend energy with a refined touch.",
    "occasion": "Casual",
    "vibe": ["Relaxed", "Chic"],
    "matchScore": 88,
    "items": [1, 2, 9]
  },
  {
    "id": "outfit_3",
    "name": "After Dark",
    "description": "A sleek evening look that commands attention.",
    "occasion": "Evening",
    "vibe": ["Glamorous", "Edgy"],
    "matchScore": 91,
    "items": [0, 5, 8, 11]
  },
  {
    "id": "outfit_4",
    "name": "Sunday Brunch",
    "description": "Polished yet relaxed — perfect for a refined brunch.",
    "occasion": "Weekend",
    "vibe": ["Smart Casual", "Elegant"],
    "matchScore": 86,
    "items": [6, 3, 10]
  }
]
`;

  const text = await askGroq(prompt);
  const clean = text.replace(/```json|```/gi, "").trim();

  try {
    const outfits = JSON.parse(clean);

    // Validation طبقة ثانية في الكود
    const validated = outfits.filter((outfit) => {
      const valid = validateOutfit(outfit, wardrobeItems);
      if (!valid) {
        console.warn(`⚠️ Outfit "${outfit.name}" skipped — invalid structure`);
      }
      return valid;
    });

    // لو الـ validation حذف الكل نرجع الأصلية
    return validated.length >= 2 ? validated : outfits;
  } catch (e) {
    throw new Error("Failed to parse outfits. Please try again.");
  }
}

// ============================================================
// 2️⃣  generateTodayOutfit — يختار outfit واحد لليوم
// ============================================================
export async function generateTodayOutfit(wardrobeItems) {
  if (!wardrobeItems || wardrobeItems.length < 2) {
    throw new Error("Add at least 2 items to your wardrobe first.");
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("en", { weekday: "long" });
  const fullDate = today.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isWeekend = [0, 6].includes(today.getDay());

  const { summary, fullList, grouped } = buildWardrobeSummary(wardrobeItems);
  const hasShoes = grouped.shoes.length > 0;
  const hasAccessories = grouped.accessories.length > 0;

  const prompt = `
Today is ${dayName}, ${fullDate}. It is a ${isWeekend ? "weekend" : "weekday"}.

=== WARDROBE SUMMARY ===
${summary}

=== FULL ITEM LIST ===
${fullList}

=== YOUR TASK ===
Pick ONE perfect complete outfit for today.
- ${isWeekend ? "It's the weekend → go relaxed, creative, or stylishly casual" : "It's a weekday → lean professional, smart casual, or work-appropriate"}

The outfit MUST include:
- 1 top [tops] + 1 bottom [bottoms]  OR  1 dress [dresses]
- Optionally 1 outerwear if weather/style suits
- ${hasShoes ? "1 pair of shoes [shoes] — REQUIRED" : "No shoes — skip"}
- ${hasAccessories ? "1–2 accessories [accessories] if they elevate the look" : "No accessories — skip"}

Also suggest 3 generic complementary accessories NOT from the wardrobe (e.g. a bag, watch, or scarf).

Return JSON ONLY — raw JSON, no markdown:
{
  "name": "The Power Neutral",
  "description": "An elegant stylist sentence about this complete look.",
  "reason": "Why this outfit is perfect for today specifically.",
  "occasion": "Work",
  "vibe": ["Minimal", "Sharp"],
  "matchScore": 94,
  "items": [2, 5, 8, 11],
  "stylistNote": "A short poetic styling tip.",
  "accessories": [
    { "name": "Tan Leather Tote", "type": "Bag", "emoji": "👜" },
    { "name": "Gold Thin Watch", "type": "Watch", "emoji": "⌚" },
    { "name": "Silk Neck Scarf", "type": "Scarf", "emoji": "🧣" }
  ]
}
`;

  const text = await askGroq(prompt);
  const clean = text.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Failed to parse today's outfit. Please try again.");
  }
}
