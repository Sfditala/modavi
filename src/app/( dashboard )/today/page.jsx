// ============================================================
// app/(dashboard)/today/page.jsx
// ============================================================
// ✅ wardrobeItems من Supabase
// ✅ today outfit تُحفظ في Supabase
// ✅ userId من Clerk
// ============================================================

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Calendar,
  Star,
  Shirt,
  ShoppingBag,
  Watch,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { generateTodayOutfit } from "@/lib/geminiAI";
import {
  getWardrobeItems,
  getTodayOutfit,
  saveTodayOutfit,
} from "@/lib/Wardrobedb";

function TodaySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      <div className="relative overflow-hidden bg-gray-50 h-96">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="space-y-4 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-3 bg-gray-100 rounded animate-pulse"
            style={{ width: `${[25, 75, 100, 85, 60][i - 1]}%` }}
          />
        ))}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 bg-gray-100 rounded w-1/3 animate-pulse" />
              <div className="h-2 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { user, isLoaded } = useUser();
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [wornToday, setWornToday] = useState(false);

  const today = new Date();
  const dayName = today.toLocaleDateString("en", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
  });

  const loadingMessages = [
    "Checking today's vibe...",
    "Curating your look...",
    "Picking the perfect pieces...",
    "Almost ready...",
  ];

  // ✅ جلب الملابس + outfit اليوم من Supabase
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadData() {
      try {
        setInitialLoad(true);
        const [items, todayData] = await Promise.all([
          getWardrobeItems(user.id),
          getTodayOutfit(user.id), // لو نفس اليوم يرجعه، غير كذلك null
        ]);
        setWardrobeItems(items);
        if (todayData) setOutfit(todayData);
      } catch (e) {
        console.error("Load error:", e.message);
      } finally {
        setInitialLoad(false);
      }
    }

    loadData();
  }, [isLoaded, user]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setLoadingStep((p) => (p + 1) % loadingMessages.length);
    }, 1200);
    return () => clearInterval(id);
  }, [loading]);

  // ✅ توليد outfit اليوم وحفظه في Supabase
  const fetchTodayOutfit = async () => {
    if (wardrobeItems.length < 2) {
      setError("Add at least 2 items to your wardrobe first.");
      return;
    }
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      const result = await generateTodayOutfit(wardrobeItems);
      setOutfit(result);
      await saveTodayOutfit(user.id, result); // ← Supabase
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const outfitItems = outfit
    ? (outfit.items || []).map((i) => wardrobeItems[i]).filter(Boolean)
    : [];

  if (initialLoad) {
    return (
      <div className="p-8 w-full min-h-screen bg-white">
        <TodaySkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      {/* Header */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Calendar size={12} className="text-gray-400" />
          <span className="text-[9px] text-gray-400 tracking-[0.25em] uppercase">
            {dayName}, {dateStr}
          </span>
        </motion.div>
        <motion.h1
          className="text-5xl font-serif text-[#1C1C1C] mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          What should I wear today?
        </motion.h1>
        <motion.p
          className="text-[10px] text-gray-400 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Curating your aesthetic for the moments that matter
        </motion.p>
      </motion.div>

      {/* Tabs + Generate Button */}
      <motion.div
        className="flex gap-3 mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {["Casual", "Work", "Formal", "Sport"].map((tab, i) => (
          <motion.button
            key={tab}
            className={`px-5 py-2 text-[9px] tracking-[0.2em] uppercase border transition-all
              ${
                outfit?.occasion === tab
                  ? "bg-[#6B2737] border-[#6B2737] text-white"
                  : "border-gray-100 text-gray-400 hover:border-gray-300 hover:text-black"
              }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {tab}
          </motion.button>
        ))}

        <motion.button
          onClick={fetchTodayOutfit}
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-[#6B2737] text-white px-6 py-2
                     text-[9px] tracking-[0.22em] uppercase hover:bg-[#4a1a25] transition-colors
                     disabled:opacity-60 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          {loading ? (
            <RefreshCw size={11} className="animate-spin" />
          ) : (
            <Sparkles size={11} />
          )}
          <span className="relative z-10">
            {loading
              ? loadingMessages[loadingStep]
              : outfit
                ? "Refresh Look"
                : "Generate Look"}
          </span>
        </motion.button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-[#6B2737] text-[10px] tracking-widest uppercase mb-8
                       border border-[#6B2737]/20 bg-[#6B2737]/5 px-4 py-3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && <TodaySkeleton />}

      {/* Empty */}
      {!loading && !outfit && (
        <motion.div
          className="flex flex-col items-center justify-center py-40 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Shirt size={38} className="text-gray-200 mb-5" />
          </motion.div>
          <p className="text-gray-300 text-[10px] tracking-[0.3em] uppercase mb-1">
            Let AI dress you for today
          </p>
          <p className="text-gray-200 text-[9px] tracking-widest uppercase">
            Click "Generate Look" to start
          </p>
        </motion.div>
      )}

      {/* Main Outfit */}
      {!loading && outfit && (
        <AnimatePresence mode="wait">
          <motion.div
            key={outfit.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
              {/* يسار: صور */}
              <motion.div
                className="relative bg-[#FDF8F3] overflow-hidden"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="grid grid-cols-2 gap-1 p-4 h-96">
                  {outfitItems.slice(0, 4).map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative overflow-hidden bg-white"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F5EFE8]">
                          <span className="text-[8px] text-gray-300 tracking-widest uppercase">
                            {item?.category}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {Array.from({
                    length: Math.max(0, 4 - outfitItems.length),
                  }).map((_, i) => (
                    <div
                      key={`ph-${i}`}
                      className="bg-[#F5EFE8] border border-dashed border-[#E8DDD5]"
                    />
                  ))}
                </div>
                <motion.div
                  className="absolute top-6 left-6 bg-[#6B2737] text-white text-[7px] tracking-[0.15em] uppercase px-3 py-1.5 flex items-center gap-1.5"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles size={8} /> AI Style Suggestion
                </motion.div>
                {outfit.matchScore && (
                  <motion.div
                    className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Star size={10} className="text-[#6B2737] fill-[#6B2737]" />
                    <span className="text-[8px] tracking-widest uppercase text-gray-600">
                      {outfit.matchScore}% Match
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* يمين: تفاصيل */}
              <motion.div
                className="flex flex-col justify-center py-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.p
                  className="text-[8px] text-gray-400 tracking-[0.28em] uppercase mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {outfit.occasion}
                </motion.p>
                <motion.h2
                  className="text-3xl font-serif text-[#1C1C1C] mb-4 leading-tight"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {outfit.name}
                </motion.h2>
                <motion.p
                  className="text-[11px] text-gray-500 leading-relaxed mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  {outfit.description}
                </motion.p>
                {outfit.reason && (
                  <motion.p
                    className="text-[10px] text-[#6B2737]/70 italic leading-relaxed mb-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    "{outfit.reason}"
                  </motion.p>
                )}
                <motion.div
                  className="flex gap-2 flex-wrap mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  {(outfit.vibe || []).map((tag) => (
                    <span
                      key={tag}
                      className="text-[7px] tracking-[0.15em] uppercase border border-gray-100 text-gray-400 px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {/* قائمة القطع */}
                <div className="space-y-3 mb-6">
                  {outfitItems.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 border border-gray-50 bg-[#FDFAF8] p-2.5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-12 h-12 bg-white overflow-hidden flex-shrink-0">
                        {item?.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <Shirt size={14} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#1C1C1C] font-medium truncate">
                          {item?.title}
                        </p>
                        <p className="text-[9px] text-gray-400 tracking-widest uppercase">
                          {item?.category}
                        </p>
                      </div>
                      {item?.color && (
                        <div className="text-[8px] text-gray-400 tracking-widest uppercase">
                          {item.color}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {outfit.stylistNote && (
                  <motion.div
                    className="border-l-2 border-[#6B2737]/20 pl-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <p className="text-[9px] text-gray-400 tracking-[0.15em] uppercase mb-1">
                      Stylist Note
                    </p>
                    <p className="text-[10px] text-gray-500 italic leading-relaxed">
                      {outfit.stylistNote}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => setWornToday(!wornToday)}
                  className={`flex items-center gap-2 px-6 py-3 text-[9px] tracking-[0.22em] uppercase
                    transition-all self-start ${wornToday ? "bg-[#1C1C1C] text-white" : "bg-[#6B2737] text-white hover:bg-[#4a1a25]"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.span
                    key={wornToday ? "worn" : "not"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {wornToday ? "✓ Wearing This Today" : "I'm wearing this"}
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>

            {/* Accessories */}
            {outfit.accessories?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="text-[10px] text-gray-400 tracking-[0.28em] uppercase mb-5 flex items-center gap-2">
                  <span className="w-6 h-px bg-gray-200" />
                  Complementary Accessories
                  <span className="flex-1 h-px bg-gray-100" />
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {outfit.accessories.map((acc, i) => (
                    <motion.div
                      key={i}
                      className="border border-gray-100 bg-[#FDF8F3] p-5 text-center hover:border-[#6B2737]/20 transition-colors cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 1.1 + i * 0.1 }}
                      whileHover={{
                        y: -4,
                        boxShadow: "0 10px 30px rgba(107,39,55,0.07)",
                      }}
                    >
                      <motion.div
                        className="text-3xl mb-3"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {acc.emoji || "✨"}
                      </motion.div>
                      <p className="text-[7px] text-gray-400 tracking-[0.2em] uppercase mb-1">
                        {acc.type}
                      </p>
                      <p className="text-[11px] text-[#1C1C1C] font-serif">
                        {acc.name}
                      </p>
                      <motion.div
                        className="mt-3 mx-auto h-px bg-[#6B2737]"
                        initial={{ width: "0%" }}
                        whileHover={{ width: "60%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.p
              className="text-center text-[8px] text-gray-300 tracking-[0.25em] uppercase mt-14 pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Modavi Style · AI Powered by Groq · Wellbeing
            </motion.p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
