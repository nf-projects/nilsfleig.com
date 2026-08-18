import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SignIn } from "../../../_components/SignIn";
import { Avatar } from "../../../_components/Avatar";
import { companyById, people, personBySlug } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export function generateStaticParams(): { slug: string }[] {
  return people.map((p) => ({ slug: p.slug }));
}

export default function LinkedInProfilePage({
  params,
}: {
  params: { slug: string };
}): JSX.Element {
  const person = personBySlug(params.slug);
  if (!person) {
    notFound();
  }

  const who = signedInAs("linkedin");
  if (!who) {
    return (
      <SignIn service="linkedin" next={`/demo/linkedin/in/${params.slug}`} />
    );
  }

  const company = companyById(person.companyId);

  return (
    <main className="mx-auto max-w-[790px] px-4 py-6">
      <h1 className="sr-only">{person.name}</h1>

      <section className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
        <div
          className="h-[134px]"
          style={{
            background: "linear-gradient(120deg, #b8c6d3 0%, #dfe6ec 100%)",
          }}
        />
        <div className="px-6 pb-6">
          <span className="-mt-[76px] inline-block rounded-full border-4 border-white">
            <Avatar name={person.name} size={152} />
          </span>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="m-0 text-[24px] font-semibold leading-tight">
                {person.name}
              </p>
              <p className="m-0 text-[16px] text-neutral-800">
                {person.title} at {company?.name}
              </p>
              <p className="m-0 mt-1 flex items-center gap-1 text-[14px] text-neutral-500">
                <MapPin size={14} aria-hidden="true" />
                {person.location}
                <span className="mx-1">·</span>
                <Link href="/demo/linkedin/network" className="text-[#0a66c2]">
                  Contact info
                </Link>
              </p>
              {person.mutuals.length > 0 ? (
                <p className="m-0 mt-1 text-[14px] text-neutral-600">
                  {person.mutuals.join(", ")} — mutual connection
                  {person.mutuals.length === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <span
                className="rounded-full px-4 py-1.5 text-[14px] font-semibold text-white"
                style={{ background: "#0a66c2" }}
              >
                Connect
              </span>
              <span className="rounded-full border border-neutral-500 px-4 py-1.5 text-[14px] font-semibold text-neutral-700">
                Message
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-2 rounded-lg border border-neutral-300 bg-white p-6">
        <h2 className="m-0 mb-2 text-[20px] font-semibold">About</h2>
        <p className="m-0 text-[14px] leading-relaxed">{person.about}</p>
      </section>

      <section className="mt-2 rounded-lg border border-neutral-300 bg-white p-6">
        <h2 className="m-0 mb-3 text-[20px] font-semibold">Experience</h2>
        <ul className="m-0 list-none space-y-4 p-0">
          <li className="m-0 flex gap-3">
            <Avatar name={company?.name ?? "?"} size={40} />
            <div>
              <p className="m-0 text-[14px] font-semibold">{person.title}</p>
              <p className="m-0 text-[14px] text-neutral-700">
                {company?.name} · Full-time
              </p>
              <p className="m-0 text-[13px] text-neutral-500">{company?.hq}</p>
            </div>
          </li>
          {person.pastCompanies.map((c) => (
            <li key={c} className="m-0 flex gap-3">
              <Avatar name={c} size={40} />
              <div>
                <p className="m-0 text-[14px] font-semibold">{c}</p>
                <p className="m-0 text-[13px] text-neutral-500">Previously</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {person.school ? (
        <section className="mt-2 rounded-lg border border-neutral-300 bg-white p-6">
          <h2 className="m-0 mb-3 text-[20px] font-semibold">Education</h2>
          <div className="flex gap-3">
            <Avatar name={person.school} size={40} />
            <p className="m-0 text-[14px] font-semibold">{person.school}</p>
          </div>
        </section>
      ) : null}

      <section className="mt-2 rounded-lg border border-neutral-300 bg-white p-6">
        <h2 className="m-0 mb-3 text-[20px] font-semibold">Activity</h2>
        {person.posts.length === 0 ? (
          <p className="m-0 text-[14px] text-neutral-600">
            {person.name} has not posted publicly.
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-neutral-200 p-0">
            {person.posts.map((post) => (
              <li key={post.date} className="m-0 py-4 first:pt-0 last:pb-0">
                <p className="m-0 mb-1 text-[12px] text-neutral-500">
                  {person.name} posted this · {post.date}
                </p>
                <p className="m-0 whitespace-pre-line text-[14px] leading-relaxed">
                  {post.text}
                </p>
                <p className="m-0 mt-2 text-[12px] text-neutral-500">
                  {post.likes} reactions · {post.comments} comments
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
