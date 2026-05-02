// ============================================================
// app/(dashboard)/outfits/page.jsx
// ============================================================
// ✅ wardrobeItems من Supabase
// ✅ outfits تُحفظ في Supabase
// ✅ userId من Clerk
// ============================================================

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, WandSparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import OutfitCard from "@/components/outfits/CardOutfit";
import { generateOutfits } from "@/lib/geminiAI";
import { getWardrobeItems, getOutfits, saveOutfits } from "@/lib/Wardrobedb";

function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-gray-100 overflow-hidden"
    >
      <div className="h-52 bg-gray-50 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="p-4 space-y-2.5">
        <div className="h-2 bg-gray-100 rounded w-1/4 animate-pulse" />
        <div className="h-3.5 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="h-2 bg-gray-100 rounded w-full animate-pulse" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-5 w-10 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export default function OutfitsPage() {
  const { user, isLoaded } = useUser();
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Reading your wardrobe...",
    "Consulting the AI Stylist...",
    "Crafting your looks...",
    "Finalizing ensembles...",
  ];

  // ✅ جلب الملابس + outfits محفوظة من Supabase
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadData() {
      try {
        setInitialLoad(true);
        // نجلب الاثنين بالتوازي
        const [items, savedOutfits] = await Promise.all([
          getWardrobeItems(user.id),
          getOutfits(user.id),
        ]);
        setWardrobeItems(items);
        if (savedOutfits) {
          setOutfits(savedOutfits);
          setHasGenerated(true);
        }
      } catch (e) {
        console.error("Load error:", e.message);
      } finally {
        setInitialLoad(false);
      }
    }

    loadData();
  }, [isLoaded, user]);

  // رسائل تحميل دوّارة
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setLoadingStep((p) => (p + 1) % loadingMessages.length);
    }, 1300);
    return () => clearInterval(id);
  }, [loading]);

  // ✅ توليد Outfits وحفظها في Supabase
  const handleGenerate = async () => {
    if (wardrobeItems.length < 2) {
      setError("Add at least 2 items to your wardrobe first.");
      return;
    }
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      const result = await generateOutfits(wardrobeItems);
      setOutfits(result);
      setHasGenerated(true);
      await saveOutfits(user.id, result); // ← Supabase
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="p-8 w-full min-h-screen bg-white">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-24">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-12"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <motion.h1
            className="text-4xl font-serif text-[#1C1C1C] mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Curated Ensembles
          </motion.h1>
          <motion.p
            className="text-[10px] text-gray-400 italic tracking-widest uppercase mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            "AI-styled looks, crafted from your own wardrobe."
          </motion.p>
          <motion.p
            className="text-[10px] text-gray-400 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Based on{" "}
            <span className="text-[#6B2737] font-bold">
              {wardrobeItems.length} curated items
            </span>
          </motion.p>
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2.5 bg-[#6B2737] text-white px-7 py-3.5
                     text-[10px] tracking-[0.25em] uppercase hover:bg-[#4a1a25]
                     transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                     relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          {loading ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Sparkles size={13} />
          )}
          <span className="relative z-10">
            {loading
              ? "Styling..."
              : hasGenerated
                ? "Regenerate"
                : "Generate New Outfit"}
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

      {/* Empty State */}
      {!hasGenerated && !loading && (
        <motion.div
          className="flex flex-col items-center justify-center py-40 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <WandSparkles size={38} className="text-gray-200 mb-5" />
          </motion.div>
          <p className="text-gray-300 text-[10px] tracking-[0.3em] uppercase mb-1">
            Your AI Stylist is ready
          </p>
          <p className="text-gray-200 text-[9px] tracking-widest uppercase">
            Click "Generate New Outfit" to begin
          </p>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-[#6B2737] rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.18,
                  }}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                className="text-[10px] text-gray-400 tracking-widest uppercase"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {loadingMessages[loadingStep]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Outfits Grid */}
      {!loading && hasGenerated && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {outfits.map((outfit, i) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                wardrobeItems={wardrobeItems}
                index={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* AI Note */}
      <AnimatePresence>
        {hasGenerated && !loading && (
          <motion.div
            className="mt-14 border border-gray-100 p-6 bg-[#FDF8F3] flex items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <p className="text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={8} /> Refine Your Style Engine
              </p>
              <p className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                Modavi AI learns from your choices. The more you "favorite" an
                outfit, the better we understand your silhouette preferences.
              </p>
            </div>
            <motion.button
              className="text-[9px] tracking-[0.2em] uppercase border border-[#6B2737] text-[#6B2737]
                         px-5 py-2.5 hover:bg-[#6B2737] hover:text-white transition-all whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Adjust Preferences
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
