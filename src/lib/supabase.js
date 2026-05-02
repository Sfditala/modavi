// ============================================================
// lib/supabase.js
// ============================================================
// 🔑 في .env.local أضف هذين السطرين:
//    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
//
// تجدهم في: Supabase → Settings → API
// ============================================================

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
