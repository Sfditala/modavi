"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          className="text-7xl font-serif text-[#6B2737] mb-4 tracking-widest"
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.2em" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          MODAVI
        </motion.h1>

        <motion.p
          className="text-[#1C1C1C] text-lg mb-10 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Your Wardrobe. Reimagined by AI.
        </motion.p>

        <motion.button
          onClick={() => router.push("/sign-up")}
          className="bg-[#6B2737] text-white px-10 py-3 text-sm tracking-widest hover:bg-[#4a1a25] transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          GET STARTED
        </motion.button>
      </motion.div>
    </main>
  );
}
