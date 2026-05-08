"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

export default function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const cover = images.find((i) => i.is_cover) ?? images[0];
  const [active, setActive] = useState(cover?.id ?? "");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImg = images.find((i) => i.id === active) ?? cover;
  const activeIndex = images.findIndex((i) => i.id === active);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % images.length;
    setActive(images[next].id);
  }, [activeIndex, images]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + images.length) % images.length;
    setActive(images[prev].id);
  }, [activeIndex, images]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goNext, goPrev]);

  if (!images.length) {
    return (
      <div
        style={{
          background: "var(--lavande-pale)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            height: "320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
            border: "1px solid var(--creme-dark)",
          }}
        >
          🧶
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: "var(--lavande-pale)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Image principale — cliquable pour zoom */}
        <button
          onClick={() => setLightboxOpen(true)}
          aria-label="Agrandir l'image"
          style={{
            background: "#fff",
            borderRadius: "16px",
            height: "320px",
            position: "relative",
            border: "1px solid var(--creme-dark)",
            overflow: "hidden",
            cursor: "zoom-in",
            padding: 0,
            display: "block",
            width: "100%",
          }}
        >
          {activeImg && (
            <Image
              src={activeImg.url}
              alt={activeImg.alt_text || productName}
              fill
              className="object-contain"
              sizes="50vw"
              priority
            />
          )}
          {/* Icône zoom */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "rgba(107,42,90,0.75)",
              color: "#fff",
              borderRadius: "8px",
              padding: "4px 8px",
              fontSize: "18px",
              lineHeight: 1,
              pointerEvents: "none",
            }}
          >
            ⊕
          </span>
        </button>

        {/* Vignettes */}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: "10px" }}>
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(img.id)}
                style={{
                  flex: 1,
                  aspectRatio: "1 / 1",
                  background: "#fff",
                  borderRadius: "12px",
                  border: `2px solid ${
                    active === img.id ? "var(--prune)" : "transparent"
                  }`,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  padding: 0,
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || productName}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vue agrandie"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Fermer"
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "36px",
              cursor: "pointer",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            ×
          </button>

          {/* Navigation précédente */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Image précédente"
              style={{
                position: "absolute",
                left: "16px",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                fontSize: "32px",
                borderRadius: "50%",
                width: "52px",
                height: "52px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              ‹
            </button>
          )}

          {/* Image en grand */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(90vw, 900px)",
              height: "min(85vh, 700px)",
            }}
          >
            {activeImg && (
              <Image
                src={activeImg.url}
                alt={activeImg.alt_text || productName}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            )}
          </div>

          {/* Navigation suivante */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Image suivante"
              style={{
                position: "absolute",
                right: "16px",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                fontSize: "32px",
                borderRadius: "50%",
                width: "52px",
                height: "52px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              ›
            </button>
          )}

          {/* Compteur */}
          {images.length > 1 && (
            <span
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
              }}
            >
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
