// ============================================================
// app/(dashboard)/wardrobe/page.jsx
// ============================================================
// ✅ البيانات من Supabase (مش localStorage)
// ✅ userId من Clerk
// ✅ الصور من Cloudinary (item.image = Cloudinary URL)
// ============================================================

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import WardrobeCard from "@/components/wardrobe/card";
import AddItemModal from "@/components/wardrobe/modalAdd";
import { getWardrobeItems, addWardrobeItem } from "@/lib/Wardrobedb";

const filters = [
  { name: "All Pieces", value: "all" },
  { name: "Tops", value: "tops" },
  { name: "Bottoms", value: "bottoms" },
  { name: "Dresses", value: "dresses" },
  { name: "Shoes", value: "shoes" },
  { name: "Accessories", value: "accessories" },
  { name: "Outerwear", value: "outerwear" },
];

export default function Wardrobe() {
  const { user, isLoaded } = useUser(); // ← userId من Clerk
  const [active, setActive] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ جلب الملابس من Supabase عند تحميل الصفحة
  useEffect(() => {
    // ننتظر Clerk يتحمل ويعطينا user
    if (!isLoaded || !user) return;

    async function fetchItems() {
      try {
        setLoading(true);
        const data = await getWardrobeItems(user.id); // ← Clerk userId
        setItems(data);
      } catch (e) {
        console.error("Error fetching wardrobe:", e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [isLoaded, user]);

  // ✅ إضافة قطعة جديدة لـ Supabase
  // newItem يجي من AddItemModal وفيه image = Cloudinary URL
  const addNewItem = async (newItem) => {
    if (!user) return;
    try {
      const saved = await addWardrobeItem(user.id, newItem);
      // نضيف للـ state مباشرة بدون إعادة جلب كل البيانات
      setItems((prev) => [saved, ...prev]);
    } catch (e) {
      console.error("Error adding item:", e.message);
    }
  };

  const filteredItems =
    active === "all"
      ? items
      : items.filter(
          (item) => item.category.toLowerCase() === active.toLowerCase(),
        );

  // لو Clerk لسه يتحمل
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="text-[#6B2737] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl font-serif text-[#1C1C1C] mb-2">Wardrobe</h1>
          <p className="text-[10px] text-gray-400 italic tracking-widest uppercase mb-2">
            "Curating your essence, one piece at a time."
          </p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">
            Your digital atelier holds{" "}
            <span className="text-[#6B2737] font-bold">
              {items.length} curated items.
            </span>
          </p>
        </div>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#6B2737] text-white px-6 py-3 text-[10px] tracking-[0.2em] uppercase hover:bg-[#4a1a25] transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={14} />
          Upload New Item
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-10">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActive(filter.value)}
            className={`px-5 py-2 text-[10px] tracking-widest uppercase transition-all duration-300 border ${
              active === filter.value
                ? "bg-[#6B2737] border-[#6B2737] text-white"
                : "bg-white border-gray-100 text-gray-400 hover:border-gray-300 hover:text-black"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="text-[#6B2737] animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-32 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-300 text-[10px] tracking-[0.3em] uppercase mb-2">
            Your wardrobe is empty
          </p>
          <p className="text-gray-200 text-[9px] tracking-widest uppercase">
            Click "Upload New Item" to begin
          </p>
        </motion.div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <WardrobeCard
                  image={item.image} // ← Cloudinary URL مباشرة
                  category={item.category}
                  title={item.title}
                  description={item.description}
                  color={item.color}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addNewItem}
      />
    </div>
  );
}
