"use client";
import Image from "next/image";

// استلام البيانات عبر الـ Props لجعل الكارد قابل لإعادة الاستخدام
export default function WardrobeCard({
  image,
  category,
  title,
  description,
  color,
}) {
  return (
    <div className="max-w-[320px] bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 1. حاوية الصورة - Image Container */}
      <div className="relative aspect-[3/4] w-full mb-4 overflow-hidden rounded-lg bg-[#f9f9f9]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain p-2" // object-contain للحفاظ على أبعاد الجاكيت
        />
      </div>

      {/* 2. تفاصيل المنتج - Product Info */}
      <div className="space-y-3">
        {/* الصف العلوي: الفئة واللون */}
        <div className="flex justify-between items-center">
          <span className="bg-[#ebe7e4] text-[#4a4a4a] text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest">
            {category}
          </span>
          {/* دائرة اللون */}
          <div
            className="w-5 h-5 rounded-full border border-gray-200 shadow-inner"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* العنوان والوصف */}
        <div className="space-y-1">
          <h2 className="text-2xl font-serif text-[#2d2d2d] leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 text-sm font-light">{description}</p>
        </div>
      </div>
    </div>
  );
}
