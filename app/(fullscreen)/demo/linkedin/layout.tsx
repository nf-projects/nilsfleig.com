import Link from "next/link";
import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
} from "lucide-react";
import { DemoBanner } from "../_components/DemoBanner";
import { LinkedInLogo } from "../_components/Logos";
import { Avatar } from "../_components/Avatar";
import { signedInAs } from "@/lib/demo/session";

const navItems = [
  { href: "/demo/linkedin", label: "Home", Icon: Home },
  { href: "/demo/linkedin/network", label: "My Network", Icon: Users },
  { href: "/demo/linkedin/search", label: "People", Icon: Briefcase },
  { href: "/demo/linkedin", label: "Messaging", Icon: MessageSquare },
  { href: "/demo/linkedin", label: "Notifications", Icon: Bell },
];

export default function LinkedInLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const who = signedInAs("linkedin");
  return (
    <div className="min-h-full" style={{ background: "#f4f2ee" }}>
      <DemoBanner service="linkedin" signedInAs={who} />
      {who ? (
        <header className="sticky top-0 z-10 border-b border-neutral-300 bg-white">
          <div className="mx-auto flex h-[52px] max-w-[1128px] items-center gap-2 px-4">
            <Link href="/demo/linkedin" aria-label="LinkedIn home">
              <LinkedInLogo small />
            </Link>

            <form
              method="get"
              action="/demo/linkedin/search"
              className="ml-2 hidden items-center gap-2 rounded px-3 py-1.5 sm:flex"
              style={{ background: "#edf3f8" }}
            >
              <Search
                size={16}
                className="text-neutral-600"
                aria-hidden="true"
              />
              <label htmlFor="nav-search" className="sr-only">
                Search
              </label>
              <input
                id="nav-search"
                name="q"
                placeholder="Search"
                className="w-[220px] border-0 bg-transparent text-sm outline-none"
                style={{ background: "transparent" }}
              />
            </form>

            <nav aria-label="Primary" className="ml-auto flex items-center">
              {navItems.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex w-[80px] flex-col items-center justify-center gap-0.5 py-1 text-[12px] text-neutral-600 hover:text-neutral-900"
                >
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <span className="ml-2 flex w-[80px] flex-col items-center gap-0.5 py-1 text-[12px] text-neutral-600">
                <Avatar name={who} size={24} />
                Me
              </span>
            </nav>
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
