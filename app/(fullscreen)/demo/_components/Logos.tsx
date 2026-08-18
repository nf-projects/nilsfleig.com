// Wordmarks drawn in plain text and CSS rather than copied artwork. They carry
// the shape a person recognises without lifting anyone's logo files.

export function LinkedInLogo({
  small = false,
}: {
  small?: boolean;
}): JSX.Element {
  return (
    <span className="inline-flex items-baseline gap-[2px]">
      <span
        className={`font-semibold tracking-tight ${small ? "text-[20px]" : "text-[30px]"}`}
        style={{ color: "#0a66c2" }}
      >
        Linked
      </span>
      <span
        className={`inline-flex items-center justify-center rounded-[3px] font-semibold text-white ${
          small
            ? "h-[18px] w-[18px] text-[13px]"
            : "h-[26px] w-[26px] text-[19px]"
        }`}
        style={{ background: "#0a66c2" }}
      >
        in
      </span>
    </span>
  );
}

export function ClayLogo({ small = false }: { small?: boolean }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center rounded-[6px] font-bold text-white ${
          small
            ? "h-[22px] w-[22px] text-[13px]"
            : "h-[28px] w-[28px] text-[16px]"
        }`}
        style={{ background: "#4f46e5" }}
      >
        C
      </span>
      <span
        className={`font-semibold tracking-tight text-neutral-900 ${small ? "text-[16px]" : "text-[22px]"}`}
      >
        Clay
      </span>
    </span>
  );
}

const googleColors = [
  "#4285f4",
  "#ea4335",
  "#fbbc05",
  "#4285f4",
  "#34a853",
  "#ea4335",
];

export function GoogleLogo(): JSX.Element {
  return (
    <span className="text-[22px] font-medium tracking-tight">
      {"Google".split("").map((letter, i) => (
        <span key={`${letter}-${i}`} style={{ color: googleColors[i] }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

export function GmailLogo(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-flex h-[26px] w-[34px] items-center justify-center rounded-[3px] text-[15px] font-bold text-white"
        style={{ background: "#c2361d" }}
      >
        M
      </span>
      <span className="text-[22px] font-normal text-neutral-600">Gmail</span>
    </span>
  );
}
