"use client";
import { useState } from "react";
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
  const activeImg = images.find((i) => i.id === active) ?? cover;

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
    <div
      style={{
        background: "var(--lavande-pale)",
        padding: "36px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Image principale */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          height: "320px",
          position: "relative",
          border: "1px solid var(--creme-dark)",
          overflow: "hidden",
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
      </div>

      {/* Vignettes */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: "10px" }}>
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActive(img.id)}
              style={{
                flex: 1,
                height: "70px",
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
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
