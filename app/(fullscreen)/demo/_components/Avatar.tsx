const palette = [
  "#0a66c2",
  "#b24020",
  "#1a7f5a",
  "#6b3fa0",
  "#a8761b",
  "#0f6f7a",
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Initials disc. No image hosting, no broken avatars, no external requests. */
export function Avatar({
  name,
  size = 48,
}: {
  name: string;
  size?: number;
}): JSX.Element {
  const hue = palette[name.length % palette.length];
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: hue,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials(name)}
    </span>
  );
}
