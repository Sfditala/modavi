"use client";
import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddItemModal({ isOpen, onClose, onAdd }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "tops",
    description: "",
    color: "#6B2737",
    image: null,
  });

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!formData.image) return null;

    const data = new FormData();
    data.append("file", formData.image);
    data.append("upload_preset", "Modavi_upload"); // الـ Preset الخاص بكِ

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dvtxzohgb/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );
      const file = await res.json();
      return file.secure_url;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await handleUpload();

    if (imageUrl) {
      onAdd({
        ...formData,
        image: imageUrl,
        id: Date.now(),
      });
      setFormData({
        title: "",
        category: "tops",
        description: "",
        color: "#6B2737",
        image: null,
      });
      onClose();
    } else {
      alert("فشل رفع الصورة، تأكدي من إعدادات Cloudinary");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-none border-t-4 border-[#6B2737] p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-serif mb-6 tracking-tight text-[#1C1C1C]">
          New Atelier Piece
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* محطة الرفع */}
          <div className="group relative border border-dashed border-gray-200 p-8 text-center hover:bg-gray-50 transition-all cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              required
            />
            <Upload className="mx-auto text-gray-300 mb-2 group-hover:text-[#6B2737] transition-colors" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              {formData.image ? formData.image.name : "Select Garment Image"}
            </p>
          </div>

          <input
            type="text"
            placeholder="Piece Title"
            className="w-full border-b border-gray-100 py-2 outline-none text-xs tracking-widest uppercase focus:border-[#6B2737] transition-colors"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <select
            className="w-full border-b border-gray-100 py-2 outline-none text-xs tracking-widest uppercase bg-transparent"
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="dresses">Dresses</option>
            <option value="outerwear">Outerwear</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>

          <input
            type="text"
            placeholder="Material / Note"
            className="w-full border-b border-gray-100 py-2 outline-none text-xs tracking-widest uppercase focus:border-[#6B2737]"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="flex items-center gap-4 py-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              Base Color:
            </span>
            <input
              type="color"
              className="w-6 h-6 rounded-full cursor-pointer border-none overflow-hidden bg-transparent"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C1C1C] text-white py-4 text-[10px] tracking-[0.2em] uppercase hover:bg-[#6B2737] transition-all disabled:bg-gray-200 flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Add to Wardrobe"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
