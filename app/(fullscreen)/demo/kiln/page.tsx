import Link from "next/link";
import { DemoBanner } from "../_components/DemoBanner";
import { SignIn } from "../_components/SignIn";
import { accents } from "../_components/accents";
import { companies, peopleByCompany } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

// A list-building table. Filters live in the URL so a filtered view is a link,
// and "enrich" is a column set you switch on rather than a background job.
export default function KilnPage({
  searchParams,
}: {
  searchParams: {
    industry?: string;
    minEmployees?: string;
    maxEmployees?: string;
    hasDesignTeam?: string;
    enrich?: string;
  };
}): JSX.Element {
  const who = signedInAs("kiln");
  if (!who) {
    return <SignIn service="kiln" next="/demo/kiln" accent={accents.kiln} />;
  }

  const industry = searchParams.industry ?? "";
  const min = Number(searchParams.minEmployees ?? "") || 0;
  const max =
    Number(searchParams.maxEmployees ?? "") || Number.MAX_SAFE_INTEGER;
  const inHouseOnly = searchParams.hasDesignTeam === "on";
  const enriched = searchParams.enrich === "on";

  const rows = companies.filter((c) => {
    if (industry && c.industry !== industry) {
      return false;
    }
    if (c.employees < min || c.employees > max) {
      return false;
    }
    if (inHouseOnly && !c.designTeam.toLowerCase().includes("in-house")) {
      return false;
    }
    return true;
  });

  const industries = Array.from(
    new Set(companies.map((c) => c.industry)),
  ).sort();
  const exportQuery = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => Boolean(v)) as [
      string,
      string,
    ][],
  ).toString();

  return (
    <div className="min-h-screen bg-neutral-100">
      <DemoBanner service="kiln" signedInAs={who} />
      <header className="border-b border-neutral-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
          <Link
            href="/demo/kiln"
            className="text-lg font-bold no-underline"
            style={{ color: accents.kiln }}
          >
            Kiln
          </Link>
          <span className="text-sm text-neutral-600">
            Table: <strong>Design-team accounts</strong>
          </span>
          <span className="ml-auto text-sm text-neutral-600">{who}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <form
          method="get"
          action="/demo/kiln"
          className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-300 bg-white p-4"
        >
          <div>
            <label
              htmlFor="industry"
              className="mb-1 block text-xs font-medium"
            >
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={industry}
              className="w-52 rounded border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">All industries</option>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="minEmployees"
              className="mb-1 block text-xs font-medium"
            >
              Employees from
            </label>
            <input
              id="minEmployees"
              name="minEmployees"
              type="number"
              defaultValue={searchParams.minEmployees ?? ""}
              className="w-28 rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="maxEmployees"
              className="mb-1 block text-xs font-medium"
            >
              Employees to
            </label>
            <input
              id="maxEmployees"
              name="maxEmployees"
              type="number"
              defaultValue={searchParams.maxEmployees ?? ""}
              className="w-28 rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="hasDesignTeam"
              defaultChecked={inHouseOnly}
            />
            In-house design team only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enrich" defaultChecked={enriched} />
            Run enrichment
          </label>
          <button
            type="submit"
            className="rounded px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: accents.kiln }}
          >
            Apply
          </button>
        </form>

        <div className="mb-3 flex items-center gap-4">
          <p className="m-0 text-sm text-neutral-600">
            {rows.length} of {companies.length} rows
          </p>
          <a
            href={`/demo/kiln/companies.csv${exportQuery ? `?${exportQuery}` : ""}`}
            download="companies.csv"
            className="rounded border border-neutral-400 px-3 py-1 text-sm no-underline"
          >
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Company list</caption>
            <thead>
              <tr className="border-b border-neutral-300 text-left">
                <th className="p-2 font-semibold">Company</th>
                <th className="p-2 font-semibold">Domain</th>
                <th className="p-2 font-semibold">HQ</th>
                <th className="p-2 font-semibold">Employees</th>
                <th className="p-2 font-semibold">Industry</th>
                {enriched ? (
                  <>
                    <th className="p-2 font-semibold">Design team</th>
                    <th className="p-2 font-semibold">Email pattern</th>
                    <th className="p-2 font-semibold">Known contacts</th>
                    <th className="p-2 font-semibold">Signals</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-neutral-200 align-top"
                >
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="p-2 text-neutral-700">{c.domain}</td>
                  <td className="p-2 text-neutral-700">{c.hq}</td>
                  <td className="p-2 text-neutral-700">{c.employees}</td>
                  <td className="p-2 text-neutral-700">{c.industry}</td>
                  {enriched ? (
                    <>
                      <td className="p-2 text-neutral-700">{c.designTeam}</td>
                      <td className="p-2 text-neutral-700">
                        first.last@{c.domain}
                      </td>
                      <td className="p-2 text-neutral-700">
                        {peopleByCompany(c.id).length}
                      </td>
                      <td className="p-2 text-neutral-700">
                        {c.signals.length > 0 ? c.signals.join("; ") : "—"}
                      </td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!enriched ? (
          <p className="mt-3 text-sm text-neutral-600">
            Enrichment columns (design team, email pattern, known contacts,
            signals) are off. Tick <strong>Run enrichment</strong> to add them.
          </p>
        ) : null}
      </main>
    </div>
  );
}
