import Link from "next/link";

interface DevpostLinkProps {
  url: string;
}

export function DevpostLink({ url }: DevpostLinkProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#003E54] text-white rounded-lg hover:bg-[#00526E] transition-colors font-mono"
    >
      <svg width="24" height="24" viewBox="0 0 280 242" fill="currentColor">
        <path d="M133.7 76H118v90h15.7c30.2 0 45.9-18.4 45.9-46.1C179.6 91.9 163.9 76 133.7 76zM163 119.9c0 20.3-10.5 33.6-29.3 33.6h-2.2v-64.9h2.2c18.8 0 29.3 13.2 29.3 31.3zM210.4 0H70.6L0 121l70.6 121h139.8L281 121 210.4 0zM186.9 166h-21.8l-1.1-5.6c-7.7 6.4-15.1 7.4-24.2 7.4-23.1 0-39.9-18.1-39.9-44.8 0-30.2 18.2-47.8 46.3-47.8h21.3v90.8h19.4V166z"/>
      </svg>
      View on Devpost
    </Link>
  );
}
