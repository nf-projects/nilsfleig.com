import {
  Building2,
  Globe,
  MapPin,
  Users,
  Tag,
  Sparkles,
  Mail,
  Download,
  Table2,
  Plus,
  Filter,
} from "lucide-react";
import { SignIn } from "../_components/SignIn";
import { ClayLogo } from "../_components/Logos";
import { companies, peopleByCompany } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

const baseColumns = [
  { key: "name", label: "Company", Icon: Building2, width: "min-w-[190px]" },
  { key: "domain", label: "Domain", Icon: Globe, width: "min-w-[190px]" },
  { key: "hq", label: "HQ", Icon: MapPin, width: "min-w-[150px]" },
  { key: "employees", label: "Employees", Icon: Users, width: "min-w-[110px]" },
  { key: "industry", label: "Industry", Icon: Tag, width: "min-w-[150px]" },
];

const enrichedColumns = [
  {
    key: "designTeam",
    label: "Design team",
    Icon: Sparkles,
    width: "min-w-[200px]",
  },
  { key: "email", label: "Email pattern", Icon: Mail, width: "min-w-[210px]" },
  {
    key: "contacts",
    label: "Known contacts",
    Icon: Users,
    width: "min-w-[130px]",
  },
  { key: "signals", label: "Signals", Icon: Sparkles, width: "min-w-[320px]" },
];

export default function ClayTablePage({
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
  const who = signedInAs("clay");
  if (!who) {
    return <SignIn service="clay" next="/demo/clay" />;
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
  const columns = enriched ? [...baseColumns, ...enrichedColumns] : baseColumns;

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[220px] shrink-0 border-r border-neutral-200 bg-neutral-50 p-3 md:block">
          <div className="mb-4 px-1">
            <ClayLogo small />
          </div>
          <p className="m-0 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Workspace
          </p>
          <p className="m-0 rounded px-2 py-1.5 text-[13px] font-medium">
            Vizcom · Sales
          </p>
          <p className="m-0 mt-4 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Tables
          </p>
          <ul className="m-0 list-none p-0 text-[13px]">
            <li className="m-0 flex items-center gap-2 rounded bg-indigo-50 px-2 py-1.5 font-medium text-indigo-800">
              <Table2 size={14} aria-hidden="true" />
              Design-team accounts
            </li>
            <li className="m-0 flex items-center gap-2 rounded px-2 py-1.5 text-neutral-600">
              <Table2 size={14} aria-hidden="true" />
              Closed won 2026
            </li>
            <li className="m-0 flex items-center gap-2 rounded px-2 py-1.5 text-neutral-600">
              <Table2 size={14} aria-hidden="true" />
              Event follow-ups
            </li>
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-3 border-b border-neutral-200 px-4 py-2.5">
            <h1 className="m-0 text-[15px] font-semibold">
              Design-team accounts
            </h1>
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[12px] text-neutral-600">
              {rows.length} of {companies.length} rows
            </span>
            <span className="ml-auto flex items-center gap-2">
              <a
                href={`/demo/clay/companies.csv${exportQuery ? `?${exportQuery}` : ""}`}
                download="companies.csv"
                className="flex items-center gap-1.5 rounded border border-neutral-300 px-2.5 py-1.5 text-[13px] font-medium text-neutral-700"
              >
                <Download size={14} aria-hidden="true" />
                Export CSV
              </a>
              <span className="text-[13px] text-neutral-600">{who}</span>
            </span>
          </header>

          <form
            method="get"
            action="/demo/clay"
            className="flex flex-wrap items-end gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5"
          >
            <span className="flex items-center gap-1.5 self-center text-[13px] font-medium text-neutral-600">
              <Filter size={14} aria-hidden="true" />
              Filters
            </span>
            <div>
              <label
                htmlFor="industry"
                className="mb-0.5 block text-[11px] text-neutral-500"
              >
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                defaultValue={industry}
                className="w-48 rounded border border-neutral-300 px-2 py-1 text-[13px]"
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
                className="mb-0.5 block text-[11px] text-neutral-500"
              >
                Employees from
              </label>
              <input
                id="minEmployees"
                name="minEmployees"
                type="number"
                defaultValue={searchParams.minEmployees ?? ""}
                className="w-28 rounded border border-neutral-300 px-2 py-1 text-[13px]"
              />
            </div>
            <div>
              <label
                htmlFor="maxEmployees"
                className="mb-0.5 block text-[11px] text-neutral-500"
              >
                Employees to
              </label>
              <input
                id="maxEmployees"
                name="maxEmployees"
                type="number"
                defaultValue={searchParams.maxEmployees ?? ""}
                className="w-28 rounded border border-neutral-300 px-2 py-1 text-[13px]"
              />
            </div>
            <label className="flex items-center gap-2 self-center text-[13px]">
              <input
                type="checkbox"
                name="hasDesignTeam"
                defaultChecked={inHouseOnly}
              />
              In-house design team only
            </label>
            <label className="flex items-center gap-2 self-center text-[13px]">
              <input type="checkbox" name="enrich" defaultChecked={enriched} />
              <span className="flex items-center gap-1">
                <Sparkles size={13} aria-hidden="true" />
                Run enrichment
              </span>
            </label>
            <button
              type="submit"
              className="rounded px-3 py-1.5 text-[13px] font-semibold text-white"
              style={{ background: "#4f46e5" }}
            >
              Apply
            </button>
          </form>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <caption className="sr-only">
                Design-team accounts, {rows.length} rows
              </caption>
              <thead className="sticky top-0 bg-neutral-50">
                <tr>
                  <th className="w-10 border-b border-r border-neutral-200 px-2 py-2 text-right text-[11px] font-normal text-neutral-400">
                    #
                  </th>
                  {columns.map(({ key, label, Icon, width }) => (
                    <th
                      key={key}
                      className={`border-b border-r border-neutral-200 px-3 py-2 text-left font-medium text-neutral-700 ${width}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Icon
                          size={13}
                          className="text-neutral-400"
                          aria-hidden="true"
                        />
                        {label}
                      </span>
                    </th>
                  ))}
                  <th className="border-b border-neutral-200 px-3 py-2 text-left font-normal text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Plus size={13} aria-hidden="true" />
                      Add column
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c, index) => (
                  <tr key={c.id} className="align-top hover:bg-indigo-50/40">
                    <td className="border-b border-r border-neutral-200 px-2 py-2 text-right text-[11px] text-neutral-400">
                      {index + 1}
                    </td>
                    <td className="border-b border-r border-neutral-200 px-3 py-2 font-medium">
                      {c.name}
                    </td>
                    <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                      {c.domain}
                    </td>
                    <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                      {c.hq}
                    </td>
                    <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                      {c.employees}
                    </td>
                    <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                      {c.industry}
                    </td>
                    {enriched ? (
                      <>
                        <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                          {c.designTeam}
                        </td>
                        <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                          first.last@{c.domain}
                        </td>
                        <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                          {peopleByCompany(c.id).length}
                        </td>
                        <td className="border-b border-r border-neutral-200 px-3 py-2 text-neutral-700">
                          {c.signals.length > 0 ? c.signals.join("; ") : "—"}
                        </td>
                      </>
                    ) : null}
                    <td className="border-b border-neutral-200" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!enriched ? (
            <p className="m-0 border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-[12px] text-neutral-600">
              Enrichment columns are off. Tick <strong>Run enrichment</strong>{" "}
              to add design team, email pattern, known contacts and signals.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
