import Link from "next/link";
import { SignIn } from "../../_components/SignIn";
import { Avatar } from "../../_components/Avatar";
import { companies, companyById, people } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

// The query lives in the URL, so a result set is an address someone else can
// open — which is also what lets a report cite where a name came from.
export default function LinkedInSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; title?: string; industry?: string };
}): JSX.Element {
  const who = signedInAs("linkedin");
  if (!who) {
    return <SignIn service="linkedin" next="/demo/linkedin/search" />;
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
    <div className="mx-auto grid max-w-[1128px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <main>
        <h1 className="sr-only">People search</h1>

        <form
          method="get"
          action="/demo/linkedin/search"
          className="mb-2 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-300 bg-white p-4"
        >
          <div>
            <label htmlFor="q" className="mb-1 block text-[12px] font-medium">
              Keywords
            </label>
            <input
              id="q"
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="name, company, city"
              className="w-56 rounded border border-neutral-400 px-2.5 py-1.5 text-[14px]"
            />
          </div>
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-[12px] font-medium"
            >
              Title contains
            </label>
            <input
              id="title"
              name="title"
              defaultValue={searchParams.title ?? ""}
              placeholder="design"
              className="w-44 rounded border border-neutral-400 px-2.5 py-1.5 text-[14px]"
            />
          </div>
          <div>
            <label
              htmlFor="industry"
              className="mb-1 block text-[12px] font-medium"
            >
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={industry}
              className="w-52 rounded border border-neutral-400 px-2.5 py-1.5 text-[14px]"
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
            className="rounded-full px-4 py-1.5 text-[14px] font-semibold text-white"
            style={{ background: "#0a66c2" }}
          >
            Search
          </button>
        </form>

        <p className="mb-2 mt-3 text-[14px] text-neutral-600">
          About {results.length} {results.length === 1 ? "result" : "results"}
        </p>

        <ul className="m-0 list-none divide-y divide-neutral-200 rounded-lg border border-neutral-300 bg-white p-0">
          {results.map((person) => {
            const company = companyById(person.companyId);
            return (
              <li key={person.slug} className="m-0 flex gap-3 p-4">
                <Link href={`/demo/linkedin/in/${person.slug}`}>
                  <Avatar name={person.name} size={56} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/demo/linkedin/in/${person.slug}`}
                    className="text-[16px] font-semibold text-neutral-900 hover:text-[#0a66c2] hover:underline"
                  >
                    {person.name}
                  </Link>
                  <span className="ml-2 text-[14px] text-neutral-500">
                    · {person.degree}
                  </span>
                  <p className="m-0 text-[14px] text-neutral-800">
                    {person.title} at {company?.name}
                  </p>
                  <p className="m-0 text-[14px] text-neutral-500">
                    {person.location}
                  </p>
                  {person.mutuals.length > 0 ? (
                    <p className="m-0 mt-1 text-[12px] text-neutral-600">
                      {person.mutuals.join(" and ")}{" "}
                      {person.mutuals.length === 1 ? "is a" : "are"} mutual
                      connection
                      {person.mutuals.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
                <span className="self-start rounded-full border border-[#0a66c2] px-4 py-1 text-[14px] font-semibold text-[#0a66c2]">
                  Connect
                </span>
              </li>
            );
          })}
        </ul>
      </main>

      <aside className="hidden lg:block">
        <div className="rounded-lg border border-neutral-300 bg-white p-4 text-[13px] text-neutral-600">
          <p className="m-0 font-semibold text-neutral-900">About results</p>
          <p className="m-0 mt-1">
            Filters are carried in the address, so a filtered search can be
            shared or cited as a link.
          </p>
        </div>
      </aside>
    </div>
  );
}
