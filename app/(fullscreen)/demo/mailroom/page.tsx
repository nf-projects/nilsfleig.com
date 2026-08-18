import Link from "next/link";
import { SignIn } from "../_components/SignIn";
import { accents } from "../_components/accents";
import { emails } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function MailroomListPage({
  searchParams,
}: {
  searchParams: { folder?: string };
}): JSX.Element {
  const who = signedInAs("mailroom");
  if (!who) {
    return (
      <SignIn
        service="mailroom"
        next="/demo/mailroom"
        accent={accents.mailroom}
      />
    );
  }

  const folder = searchParams.folder === "sent" ? "sent" : "inbox";
  const rows = emails
    .filter((e) => e.folder === folder)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold capitalize">{folder}</h1>
      <ul className="list-none space-y-1 p-0">
        {rows.map((e) => (
          <li
            key={e.id}
            className="m-0 rounded border border-neutral-300 bg-white px-3 py-2"
          >
            <Link
              href={`/demo/mailroom/thread/${e.id}`}
              className="flex flex-wrap items-baseline gap-x-3 no-underline"
            >
              <span
                className={`text-sm text-neutral-900 ${e.read ? "" : "font-bold"}`}
              >
                {folder === "inbox" ? e.from : `To: ${e.to}`}
              </span>
              <span className="text-sm text-neutral-800">{e.subject}</span>
              <span className="ml-auto text-xs text-neutral-500">{e.date}</span>
            </Link>
          </li>
        ))}
      </ul>
      {folder === "sent" ? (
        <p className="mt-4 text-sm text-neutral-600">
          Sent mail is where the templates that worked live.
        </p>
      ) : null}
    </main>
  );
}
