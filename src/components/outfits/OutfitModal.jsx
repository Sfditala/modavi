// components/outfits/OutfitModal.jsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export default function OutfitModal({ outfit, outfitItems, isOpen, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!outfit) return null;

  const scoreColor =
    outfit.matchScore >= 90
      ? "#22c55e"
      : outfit.matchScore >= 75
        ? "#f59e0b"
        : "#9ca3af";

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Wrapper: covers full screen, centers the modal via flex ── */
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal — يتمركز تلقائياً داخل الـ flex wrapper */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "740px",
              maxHeight: "calc(100vh - 48px)",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderBottom: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#6B2737",
                    color: "#fff",
                    fontSize: 7,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Sparkles size={7} /> AI Styled
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: scoreColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={9} /> {outfit.matchScore}% Match
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} color="#555" />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
              {/* Left: صور */}
              <div
                style={{
                  width: "42%",
                  background: "#FDF8F3",
                  padding: 14,
                  overflowY: "auto",
                  flexShrink: 0,
                  borderRight: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {outfitItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        aspectRatio: "3/4",
                        background: "#fff",
                        border: "1px solid #eee",
                        overflow: "hidden",
                      }}
                    >
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8,
                            color: "#ccc",
                            textTransform: "uppercase",
                          }}
                        >
                          {item?.category}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: تفاصيل */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "22px 26px",
                  overflowY: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: 7,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    marginBottom: 5,
                  }}
                >
                  {outfit.occasion}
                </p>
                <h2
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 26,
                    color: "#1C1C1C",
                    lineHeight: 1.2,
                    marginBottom: 10,
                    fontWeight: "normal",
                  }}
                >
                  {outfit.name}
                </h2>

                {outfit.description && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#777",
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      borderLeft: "2px solid #6B2737",
                      paddingLeft: 12,
                      marginBottom: 18,
                    }}
                  >
                    "{outfit.description}"
                  </p>
                )}

                {outfit.vibe?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p
                      style={{
                        fontSize: 7,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#aaa",
                        marginBottom: 7,
                        fontWeight: 700,
                      }}
                    >
                      Style Vibe
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {outfit.vibe.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 7,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            border: "1px solid rgba(107,39,55,0.3)",
                            color: "#6B2737",
                            padding: "4px 10px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <p
                    style={{
                      fontSize: 7,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#aaa",
                      marginBottom: 7,
                      fontWeight: 700,
                    }}
                  >
                    Pieces · {outfitItems.length} items
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    {outfitItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          paddingBottom: 5,
                          borderBottom: "1px solid #f5f5f5",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            background: "#FDF8F3",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {item?.image && (
                            <img
                              src={item.image}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "#1C1C1C",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item?.title}
                          </p>
                          {item?.brand && (
                            <p style={{ fontSize: 7, color: "#aaa" }}>
                              {item.brand}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 6,
                            color: "#ccc",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            flexShrink: 0,
                          }}
                        >
                          {item?.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1 }} />

                <motion.button
                  whileHover={{ background: "#6B2737" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    background: "#1C1C1C",
                    color: "#fff",
                    border: "none",
                    padding: "13px 0",
                    fontSize: 8,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    marginTop: 10,
                    transition: "background 0.4s",
                  }}
                >
                  Mark as Worn Today
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
