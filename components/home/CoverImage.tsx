import Image from "next/image";

export default function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ background: "#fff", padding: "40px 40px" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 5", overflow: "hidden", borderRadius: "4px" }}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
    </div>
  );
}
