import Link from "next/link";
import { DemoBanner } from "../_components/DemoBanner";
import { accents } from "../_components/accents";
import { signedInAs } from "@/lib/demo/session";

export default function MailroomLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const who = signedInAs("mailroom");
  return (
    <div className="min-h-screen bg-neutral-100">
      <DemoBanner service="mailroom" signedInAs={who} />
      {who ? (
        <header className="border-b border-neutral-300 bg-white">
          <nav
            aria-label="Mailroom"
            className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-2 text-sm"
          >
            <Link
              href="/demo/mailroom"
              className="text-lg font-bold no-underline"
              style={{ color: accents.mailroom }}
            >
              Mailroom
            </Link>
            <Link
              href="/demo/mailroom"
              className="text-neutral-700 no-underline"
            >
              Inbox
            </Link>
            <Link
              href="/demo/mailroom?folder=sent"
              className="text-neutral-700 no-underline"
            >
              Sent
            </Link>
            <Link
              href="/demo/mailroom/drafts"
              className="text-neutral-700 no-underline"
            >
              Drafts
            </Link>
            <Link
              href="/demo/mailroom/compose"
              className="rounded px-3 py-1 font-semibold text-white no-underline"
              style={{ background: accents.mailroom }}
            >
              Compose
            </Link>
            <span className="ml-auto text-neutral-600">{who}</span>
          </nav>
        </header>
      ) : null}
      {children}
    </div>
  );
}
