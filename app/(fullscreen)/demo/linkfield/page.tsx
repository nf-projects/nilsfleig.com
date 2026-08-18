import Link from "next/link";
import { SignIn } from "../_components/SignIn";
import { accents } from "../_components/accents";
import { companyById, people } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function LinkfieldFeedPage(): JSX.Element {
  const who = signedInAs("linkfield");
  if (!who) {
    return (
      <SignIn
        service="linkfield"
        next="/demo/linkfield"
        accent={accents.linkfield}
      />
    );
  }

  const feed = people
    .flatMap((person) => person.posts.map((post) => ({ person, post })))
    .sort((a, b) => b.post.date.localeCompare(a.post.date))
    .slice(0, 12);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Recent activity</h1>
      <ul className="list-none space-y-3 p-0">
        {feed.map(({ person, post }) => (
          <li
            key={`${person.slug}-${post.date}`}
            className="m-0 rounded-lg border border-neutral-300 bg-white p-4"
          >
            <p className="m-0 text-sm">
              <Link
                href={`/demo/linkfield/in/${person.slug}`}
                className="font-semibold no-underline"
                style={{ color: accents.linkfield }}
              >
                {person.name}
              </Link>{" "}
              <span className="text-neutral-600">
                · {person.title}, {companyById(person.companyId)?.name}
              </span>
            </p>
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
    </main>
  );
}
