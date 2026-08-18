import Link from "next/link";
import { DemoBanner } from "../_components/DemoBanner";
import { signedInAs } from "@/lib/demo/session";
import { accents } from "../_components/accents";

const accent = accents.linkfield;

export default function LinkfieldLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const who = signedInAs("linkfield");
  return (
    <div className="min-h-screen bg-neutral-100">
      <DemoBanner service="linkfield" signedInAs={who} />
      {who ? (
        <header className="border-b border-neutral-300 bg-white">
          <nav
            aria-label="Linkfield"
            className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-2 text-sm"
          >
            <Link
              href="/demo/linkfield"
              className="text-lg font-bold no-underline"
              style={{ color: accent }}
            >
              Linkfield
            </Link>
            <Link
              href="/demo/linkfield"
              className="no-underline text-neutral-700"
            >
              Home
            </Link>
            <Link
              href="/demo/linkfield/search"
              className="no-underline text-neutral-700"
            >
              People search
            </Link>
            <Link
              href="/demo/linkfield/network"
              className="no-underline text-neutral-700"
            >
              My network
            </Link>
            <span className="ml-auto text-neutral-600">{who}</span>
          </nav>
        </header>
      ) : null}
      {children}
    </div>
  );
}
