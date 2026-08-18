import Link from "next/link";
import { SignIn } from "../../_components/SignIn";
import { accents } from "../../_components/accents";
import { companies, companyById, people } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

// Server-rendered search: the query lives in the URL, so a result set is a
// citable address rather than a UI state nobody else can reach.
export default function LinkfieldSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; title?: string; industry?: string };
}): JSX.Element {
  const who = signedInAs("linkfield");
  if (!who) {
    return (
      <SignIn
        service="linkfield"
        next="/demo/linkfield/search"
        accent={accents.linkfield}
      />
    );
  }

  const q = (searchParams.q ?? "").toLowerCase().trim();
  const title = (searchParams.title ?? "").toLowerCase().trim();
  const industry = searchParams.industry ?? "";

  const results = people.filter((person) => {
    const company = companyById(person.companyId);
    if (!company) {
      return false;
    }
    if (industry && company.industry !== industry) {
      return false;
    }
    if (title && !person.title.toLowerCase().includes(title)) {
      return false;
    }
    if (!q) {
      return true;
    }
    return [person.name, person.title, company.name, person.location]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const industries = Array.from(
    new Set(companies.map((c) => c.industry)),
  ).sort();

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">People search</h1>

      <form
        method="get"
        action="/demo/linkfield/search"
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-300 bg-white p-4"
      >
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-medium">
            Keywords
          </label>
          <input
            id="q"
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="name, company, city"
            className="w-56 rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-xs font-medium">
            Title contains
          </label>
          <input
            id="title"
            name="title"
            defaultValue={searchParams.title ?? ""}
            placeholder="design"
            className="w-44 rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="industry" className="mb-1 block text-xs font-medium">
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
        <button
          type="submit"
          className="rounded px-3 py-1.5 text-sm font-semibold text-white"
          style={{ background: accents.linkfield }}
        >
          Search
        </button>
      </form>

      <p className="mb-3 text-sm text-neutral-600">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      <ul className="list-none space-y-2 p-0">
        {results.map((person) => {
          const company = companyById(person.companyId);
          return (
            <li
              key={person.slug}
              className="m-0 rounded-lg border border-neutral-300 bg-white p-4"
            >
              <Link
                href={`/demo/linkfield/in/${person.slug}`}
                className="text-base font-semibold no-underline"
                style={{ color: accents.linkfield }}
              >
                {person.name}
              </Link>
              <p className="m-0 text-sm text-neutral-800">
                {person.title} at {company?.name}
              </p>
              <p className="m-0 text-xs text-neutral-500">
                {person.location} · {person.degree} degree
                {person.mutuals.length > 0
                  ? ` · ${person.mutuals.length} mutual connections`
                  : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
