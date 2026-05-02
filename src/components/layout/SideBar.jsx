"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Sparkles, Calendar, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/today", label: "Today", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-56 bg-[#FDF8F3] border-r border-gray-100 flex flex-col z-50"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-10">
        <motion.h1
          className="text-xl font-serif text-[#6B2737] tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Modavi Atelier
        </motion.h1>
        <p className="text-xs tracking-widest text-gray-400 uppercase mt-1">
          Personal Stylist
        </p>
      </div>

      {/* Links */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map(({ href, label, icon: Icon }, i) => {
          const active = pathname === href;
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            >
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 group ${
                  active
                    ? "bg-[#6B2737] text-white"
                    : "text-gray-500 hover:text-[#6B2737] hover:bg-[#f5ece9]"
                }`}
              >
                <Icon
                  size={16}
                  className={`transition-all duration-300 ${
                    active
                      ? "text-white"
                      : "text-gray-400 group-hover:text-[#6B2737]"
                  }`}
                />
                <span className="tracking-wide">{label}</span>

                {/* active indicator */}
                {active && (
                  <motion.div
                    className="ml-auto w-1 h-4 bg-white rounded-full opacity-60"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User */}
      <motion.div
        className="px-6 pb-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <UserButton afterSignOutUrl="/" />
        <div>
          <p className="text-xs font-medium text-[#1C1C1C]">Tala Safadi</p>
          <p className="text-xs text-gray-400">Core Member</p>
        </div>
      </motion.div>
      <motion.div
        className="px-6 pb-4 border-t border-gray-100 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-black-300 tracking-wide">
          © 2026 Modavi Atelier
        </p>
        <p className="text-xs text-gray-300">All rights reserved.</p>
      </motion.div>
    </motion.aside>
  );
}
