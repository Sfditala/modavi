// ============================================================
// lib/wardrobeDB.js
// ============================================================
// كل عمليات Supabase في مكان واحد
// الحماية تصير بتمرير userId من Clerk في كل query
// ============================================================

import { supabase } from "./supabase";

// ============================================================
// 👗 WARDROBE ITEMS
// ============================================================

// جلب كل ملابس المستخدم
export async function getWardrobeItems(userId) {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", userId) // ← فلتر بـ userId
    .order("created_at", { ascending: false }); // الأحدث أولاً

  if (error) throw new Error(error.message);
  return data || [];
}

// إضافة قطعة ملابس جديدة
// item = { title, category, color, description, image }
export async function addWardrobeItem(userId, item) {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert([
      {
        user_id: userId, // ← Clerk userId
        title: item.title,
        category: item.category,
        color: item.color || null,
        description: item.description || null,
        image: item.image || null, // ← Cloudinary URL
      },
    ])
    .select() // نرجع الصف المضاف مع id و created_at
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// حذف قطعة — نتأكد إنها للمستخدم الصح
export async function deleteWardrobeItem(itemId, userId) {
  const { error } = await supabase
    .from("wardrobe_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId); // ← ضمان إن المستخدم يحذف بياناته فقط

  if (error) throw new Error(error.message);
}

// ============================================================
// 👔 OUTFITS
// ============================================================

// جلب آخر outfits للمستخدم
export async function getOutfits(userId) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1); // آخر مجموعة فقط

  if (error) throw new Error(error.message);
  return data?.[0]?.data || null; // نرجع الـ JSON array المحفوظة
}

// حفظ outfits جديدة — نحذف القديمة أولاً
export async function saveOutfits(userId, outfitsArray) {
  // احذف القديمة
  await supabase.from("outfits").delete().eq("user_id", userId);

  // أضف الجديدة
  const { error } = await supabase.from("outfits").insert([
    {
      user_id: userId,
      data: outfitsArray, // يحفظها كـ JSONB
    },
  ]);

  if (error) throw new Error(error.message);
}

// ============================================================
// 📅 TODAY'S OUTFIT
// ============================================================

// جلب outfit اليوم — نتحقق من التاريخ
export async function getTodayOutfit(userId) {
  const todayKey = new Date().toDateString(); // "Thu Apr 30 2026"

  const { data, error } = await supabase
    .from("today_outfit")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayKey)
    .single();

  if (error) return null; // لو ما في outfit لهذا اليوم
  return data?.data || null;
}

// حفظ outfit اليوم
export async function saveTodayOutfit(userId, outfitData) {
  const todayKey = new Date().toDateString();

  // احذف القديم
  await supabase.from("today_outfit").delete().eq("user_id", userId);

  // أضف الجديد
  const { error } = await supabase.from("today_outfit").insert([
    {
      user_id: userId,
      data: outfitData,
      date: todayKey,
    },
  ]);

  if (error) throw new Error(error.message);
}
