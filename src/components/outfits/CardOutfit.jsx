// components/outfits/OutfitCard.jsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, Sparkles, Eye } from "lucide-react";
import OutfitModal from "./OutfitModal";

export default function OutfitCard({
  outfit,
  wardrobeItems,
  index = 0,
  onFavorite,
}) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const outfitItems = (outfit.items || [])
    .map((i) => wardrobeItems[i])
    .filter(Boolean);

  const handleLike = (e) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    if (onFavorite) onFavorite(outfit.id, next);
  };

  return (
    <>
      <motion.div
        // ✅ حذفنا layoutId من هون — كان هو السبب اللي يخلي المودال يتمدد من مكان الكارد
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          delay: index * 0.12,
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="bg-white border border-gray-100 overflow-hidden cursor-pointer relative"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setIsModalOpen(true)}
        whileHover={{ y: -7, boxShadow: "0 24px 56px rgba(107,39,55,0.09)" }}
        whileTap={{ scale: 0.98 }}
      >
        {/* قسم الصور */}
        <div className="relative h-52 bg-[#FDF8F3] overflow-hidden">
          <div className="grid grid-cols-2 gap-[2px] h-full p-2">
            {outfitItems.slice(0, 4).map((item, i) => (
              <motion.div
                key={i}
                className="relative overflow-hidden bg-white"
                animate={{ scale: hovered ? 1.05 : 1 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FDF8F3]">
                    <span className="text-[7px] text-gray-300 tracking-widest uppercase">
                      {item?.category}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div className="absolute top-2.5 left-2.5 bg-[#6B2737] text-white text-[7px] tracking-[0.12em] uppercase px-2 py-1 flex items-center gap-1">
            <Sparkles size={7} /> AI Styled
          </motion.div>

          <motion.button
            onClick={handleLike}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full z-10"
            whileTap={{ scale: 0.7 }}
            whileHover={{ scale: 1.2 }}
          >
            <AnimatePresence mode="wait">
              {liked ? (
                <motion.div
                  key="liked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Heart size={13} className="text-[#6B2737] fill-[#6B2737]" />
                </motion.div>
              ) : (
                <motion.div
                  key="unliked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Heart size={13} className="text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-0 bg-[#1C1C1C]/25 backdrop-blur-[1px] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 bg-white text-[#1C1C1C] text-[9px] tracking-[0.2em] uppercase px-5 py-2.5">
                  <Eye size={10} /> View Details
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* معلومات الـ Outfit */}
        <div className="p-4">
          <p className="text-[7.5px] text-gray-400 tracking-[0.22em] uppercase mb-1.5">
            {outfit.occasion}
          </p>
          <h3 className="font-serif text-[#1C1C1C] text-[15px] leading-tight mb-2">
            {outfit.name}
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {(outfit.vibe || []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[7px] tracking-[0.15em] uppercase border border-gray-100 text-gray-400 px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[#6B2737]"
          initial={{ width: "0%" }}
          animate={{ width: hovered ? "100%" : "0%" }}
        />
      </motion.div>

      <OutfitModal
        outfit={outfit}
        outfitItems={outfitItems}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
