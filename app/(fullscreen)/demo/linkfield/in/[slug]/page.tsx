import { notFound } from "next/navigation";
import Link from "next/link";
import { SignIn } from "../../../_components/SignIn";
import { accents } from "../../../_components/accents";
import { companyById, people, personBySlug } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export function generateStaticParams(): { slug: string }[] {
  return people.map((p) => ({ slug: p.slug }));
}

export default function LinkfieldProfilePage({
  params,
}: {
  params: { slug: string };
}): JSX.Element {
  const person = personBySlug(params.slug);
  if (!person) {
    notFound();
  }

  const who = signedInAs("linkfield");
  if (!who) {
    return (
      <SignIn
        service="linkfield"
        next={`/demo/linkfield/in/${params.slug}`}
        accent={accents.linkfield}
      />
    );
  }

  const company = companyById(person.companyId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <article className="rounded-lg border border-neutral-300 bg-white p-6">
        <h1 className="m-0 text-2xl font-semibold">{person.name}</h1>
        <p className="m-0 text-[15px] text-neutral-800">
          {person.title} at {company?.name}
        </p>
        <p className="m-0 text-sm text-neutral-500">
          {person.location} · {person.degree} degree
        </p>

        <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          About
        </h2>
        <p className="m-0 text-[15px] leading-relaxed">{person.about}</p>

        <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Experience
        </h2>
        <ul className="m-0 list-none p-0 text-[15px]">
          <li className="m-0">
            {person.title} · {company?.name} · {company?.hq}
          </li>
          {person.pastCompanies.map((c) => (
            <li key={c} className="m-0 text-neutral-700">
              Previously · {c}
            </li>
          ))}
        </ul>

        {person.school ? (
          <>
            <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Education
            </h2>
            <p className="m-0 text-[15px]">{person.school}</p>
          </>
        ) : null}

        {person.mutuals.length > 0 ? (
          <>
            <h2 className="mb-1 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Mutual connections
            </h2>
            <p className="m-0 text-[15px]">{person.mutuals.join(", ")}</p>
          </>
        ) : null}
      </article>

      <h2 className="mb-2 mt-8 text-lg font-semibold">Activity</h2>
      {person.posts.length === 0 ? (
        <p className="rounded-lg border border-neutral-300 bg-white p-4 text-sm text-neutral-600">
          {person.name} has not posted publicly.
        </p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {person.posts.map((post) => (
            <li
              key={post.date}
              className="m-0 rounded-lg border border-neutral-300 bg-white p-4"
            >
              <p className="m-0 mb-2 text-xs text-neutral-500">{post.date}</p>
              <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed">
                {post.text}
              </p>
              <p className="m-0 mt-2 text-xs text-neutral-500">
                {post.likes} reactions · {post.comments} comments
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm">
        <Link href="/demo/linkfield/search" className="text-blue-700">
          Back to people search
        </Link>
      </p>
    </main>
  );
}
