const DEFAULT_ITEMS = [
  "Livraison soignée",
  "Fait main avec amour",
  "Commandes personnalisées",
  "Pièces uniques",
  "Matières douces & naturelles",
];

export default function Bandeau({ items }: { items?: string[] }) {
  const list = items?.length ? items : DEFAULT_ITEMS;
  const doubled = [...list, ...list];

  return (
    <div
      style={{
        background: "var(--prune)",
        padding: "12px 0",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <div className="bandeau-inner" style={{ display: "inline-flex", gap: "40px" }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "9px",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.8)",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "4px",
                height: "4px",
                background: "var(--rose)",
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
