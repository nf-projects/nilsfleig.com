import Link from "next/link";
import { Star } from "lucide-react";
import { SignIn } from "../_components/SignIn";
import { emails } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function GmailListPage({
  searchParams,
}: {
  searchParams: { folder?: string; q?: string };
}): JSX.Element {
  const who = signedInAs("gmail");
  if (!who) {
    return <SignIn service="gmail" next="/demo/gmail" />;
  }

  const folder = searchParams.folder === "sent" ? "sent" : "inbox";
  const q = (searchParams.q ?? "").toLowerCase().trim();

  const rows = emails
    .filter((e) => e.folder === folder)
    .filter((e) =>
      q
        ? [e.from, e.to, e.subject, e.body].join(" ").toLowerCase().includes(q)
        : true,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <h1 className="sr-only">{folder === "sent" ? "Sent" : "Inbox"}</h1>
      <ul className="m-0 list-none divide-y divide-neutral-100 p-0">
        {rows.map((e) => (
          <li key={e.id} className="m-0">
            <Link
              href={`/demo/gmail/thread/${e.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:shadow-[inset_0_0_0_1px_#e5e7eb]"
              style={{ background: e.read ? "#fff" : "#f2f6fc" }}
            >
              <input
                type="checkbox"
                aria-label={`Select ${e.subject}`}
                className="shrink-0"
              />
              <Star
                size={16}
                className="shrink-0 text-neutral-400"
                aria-hidden="true"
              />
              <span
                className={`w-[180px] shrink-0 truncate text-[14px] ${e.read ? "text-neutral-700" : "font-bold text-neutral-900"}`}
              >
                {folder === "inbox" ? e.from : e.to}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px]">
                <span className={e.read ? "text-neutral-800" : "font-bold"}>
                  {e.subject}
                </span>
                <span className="text-neutral-500">
                  {" "}
                  — {e.body.replace(/\s+/g, " ").slice(0, 90)}
                </span>
              </span>
              <span
                className={`shrink-0 text-[12px] ${e.read ? "text-neutral-500" : "font-bold text-neutral-900"}`}
              >
                {e.date}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-[14px] text-neutral-500">
          No messages here.
        </p>
      ) : null}
      {folder === "sent" ? (
        <p className="border-t border-neutral-100 px-4 py-3 text-[13px] text-neutral-500">
          Sent mail is where the templates that worked live.
        </p>
      ) : null}
    </>
  );
}
