export default function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? "var(--sable)" : "var(--creme-dark)",
            fontSize: "14px",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
