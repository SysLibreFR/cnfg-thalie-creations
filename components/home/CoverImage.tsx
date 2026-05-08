import Image from "next/image";

export default function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 5", overflow: "hidden" }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
    </div>
  );
}
