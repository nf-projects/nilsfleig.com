import Link from "next/link";
import { seller } from "@/lib/demo/data";

const services = [
  {
    href: "/demo/linkfield",
    name: "Linkfield",
    looksLike: "a professional network",
    accent: "#0a5fb4",
    what: "People search, profiles, activity feeds, and a connections export.",
  },
  {
    href: "/demo/kiln",
    name: "Kiln",
    looksLike: "a list-building and enrichment tool",
    accent: "#b1471f",
    what: "A company table with filters, enrichment columns, and a CSV export.",
  },
  {
    href: "/demo/mailroom",
    name: "Mailroom",
    looksLike: "a mailbox",
    accent: "#c5361f",
    what: "Inbox, sent mail worth copying, compose, and a drafts folder.",
  },
];

export default function DemoIndexPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-2 inline-block rounded bg-amber-300 px-2 py-0.5 text-xs font-semibold text-amber-950">
        DEMO — mock services, invented data
      </p>
      <h1 className="mb-4 text-3xl font-semibold">Demo services</h1>
      <p className="mb-4 max-w-2xl text-[15px] leading-relaxed text-neutral-700">
        Three stand-in tools for a live agent demo. They imitate the shape of
        the real things so a workflow is recognisable on a screen, and every
        record in them is invented. Nothing here connects to a real account, and
        nothing sends mail.
      </p>
      <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-neutral-700">
        The scenario: <strong>{seller.name}</strong>, {seller.title} at{" "}
        <a
          href="https://vizcom.com"
          className="text-blue-700 underline"
          rel="noreferrer"
        >
          Vizcom
        </a>
        , sells sketch-to-render software to in-house industrial design teams
        and is working an outbound campaign. Sign in to each service as her.
      </p>

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-3">
        {services.map((s) => (
          <li key={s.href} className="m-0">
            <Link
              href={s.href}
              className="block h-full rounded-lg border border-neutral-300 p-4 no-underline transition-colors hover:border-neutral-500"
            >
              <span
                className="mb-1 block text-lg font-semibold"
                style={{ color: s.accent }}
              >
                {s.name}
              </span>
              <span className="mb-2 block text-xs uppercase tracking-wide text-neutral-500">
                {s.looksLike}
              </span>
              <span className="block text-sm text-neutral-700">{s.what}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-neutral-600">
        The agent&apos;s briefing for this scenario is at{" "}
        <a href="/demo/context.txt" className="text-blue-700 underline">
          /demo/context.txt
        </a>
        . It describes who Dana is and which tool is which — and deliberately
        contains none of the work: no target list, no ideal customer profile, no
        reasons to reach out.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        These pages are excluded from search indexing.
      </p>
    </main>
  );
}
