import Link from "next/link";
import {
  Search,
  Inbox,
  Star,
  Send,
  FileText,
  Pencil,
  Menu,
} from "lucide-react";
import { DemoBanner } from "../_components/DemoBanner";
import { GmailLogo } from "../_components/Logos";
import { Avatar } from "../_components/Avatar";
import { emails } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

const folders = [
  { href: "/demo/gmail", label: "Inbox", Icon: Inbox },
  { href: "/demo/gmail", label: "Starred", Icon: Star },
  { href: "/demo/gmail?folder=sent", label: "Sent", Icon: Send },
  { href: "/demo/gmail/drafts", label: "Drafts", Icon: FileText },
];

export default function GmailLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const who = signedInAs("gmail");
  const unread = emails.filter((e) => e.folder === "inbox" && !e.read).length;

  if (!who) {
    return (
      <div className="min-h-full bg-white">
        <DemoBanner service="gmail" signedInAs={null} />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col" style={{ background: "#f6f8fc" }}>
      <DemoBanner service="gmail" signedInAs={who} />

      <header className="flex items-center gap-4 px-4 py-2">
        <Menu size={20} className="text-neutral-600" aria-hidden="true" />
        <Link href="/demo/gmail" aria-label="Gmail inbox">
          <GmailLogo />
        </Link>
        <form
          method="get"
          action="/demo/gmail"
          className="ml-4 flex max-w-[720px] flex-1 items-center gap-3 rounded-lg px-4 py-2"
          style={{ background: "#eaf1fb" }}
        >
          <Search size={18} className="text-neutral-600" aria-hidden="true" />
          <label htmlFor="mail-search" className="sr-only">
            Search mail
          </label>
          <input
            id="mail-search"
            name="q"
            placeholder="Search mail"
            className="w-full border-0 text-[15px] outline-none"
            style={{ background: "transparent" }}
          />
        </form>
        <span className="ml-auto flex items-center gap-2 text-[13px] text-neutral-600">
          {who}
          <Avatar name={who} size={32} />
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2">
        <nav
          aria-label="Mail folders"
          className="hidden w-[220px] shrink-0 sm:block"
        >
          <Link
            href="/demo/gmail/compose"
            className="mb-4 ml-2 inline-flex items-center gap-3 rounded-2xl px-5 py-4 text-[14px] font-medium text-neutral-800 shadow-sm"
            style={{ background: "#c2e7ff" }}
          >
            <Pencil size={18} aria-hidden="true" />
            Compose
          </Link>
          <ul className="m-0 list-none p-0">
            {folders.map(({ href, label, Icon }) => (
              <li key={label} className="m-0">
                <Link
                  href={href}
                  className={`flex items-center gap-4 rounded-r-full py-1.5 pl-5 pr-4 text-[14px] ${
                    label === "Inbox"
                      ? "bg-[#d3e3fd] font-semibold text-neutral-900"
                      : "text-neutral-700"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                  {label === "Inbox" && unread > 0 ? (
                    <span className="ml-auto text-[12px] font-semibold">
                      {unread}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 overflow-hidden rounded-2xl bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
