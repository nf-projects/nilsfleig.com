import Link from "next/link";
import { ThumbsUp, MessageCircle, Repeat2, Send } from "lucide-react";
import { SignIn } from "../_components/SignIn";
import { Avatar } from "../_components/Avatar";
import { companyById, people, seller } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function LinkedInFeedPage(): JSX.Element {
  const who = signedInAs("linkedin");
  if (!who) {
    return <SignIn service="linkedin" next="/demo/linkedin" />;
  }

  const feed = people
    .flatMap((person) => person.posts.map((post) => ({ person, post })))
    .sort((a, b) => b.post.date.localeCompare(a.post.date));

  return (
    <div className="mx-auto grid max-w-[1128px] gap-6 px-4 py-6 lg:grid-cols-[225px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
          <div className="h-14" style={{ background: "#a0b4c8" }} />
          <div className="px-3 pb-4 text-center">
            <span className="-mt-8 inline-block">
              <Avatar name={who} size={64} />
            </span>
            <p className="m-0 mt-2 text-[16px] font-semibold">{who}</p>
            <p className="m-0 text-[12px] text-neutral-600">
              {seller.headline}
            </p>
            <p className="m-0 mt-1 text-[12px] text-neutral-500">
              {seller.location}
            </p>
          </div>
          <div className="border-t border-neutral-200 px-3 py-2 text-[12px]">
            <Link
              href="/demo/linkedin/network"
              className="flex justify-between text-neutral-600"
            >
              <span>Connections</span>
              <span className="font-semibold text-[#0a66c2]">10</span>
            </Link>
          </div>
        </div>
      </aside>

      <main>
        <h1 className="sr-only">Feed</h1>
        <ul className="m-0 list-none space-y-2 p-0">
          {feed.map(({ person, post }) => {
            const company = companyById(person.companyId);
            return (
              <li
                key={`${person.slug}-${post.date}`}
                className="m-0 rounded-lg border border-neutral-300 bg-white"
              >
                <article className="p-4">
                  <div className="flex items-start gap-2">
                    <Link href={`/demo/linkedin/in/${person.slug}`}>
                      <Avatar name={person.name} size={48} />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/demo/linkedin/in/${person.slug}`}
                        className="text-[14px] font-semibold text-neutral-900 hover:text-[#0a66c2] hover:underline"
                      >
                        {person.name}
                      </Link>
                      <p className="m-0 text-[12px] leading-4 text-neutral-600">
                        {person.title} at {company?.name}
                      </p>
                      <p className="m-0 text-[12px] leading-4 text-neutral-500">
                        {post.date}
                      </p>
                    </div>
                  </div>

                  <p className="mb-0 mt-3 whitespace-pre-line text-[14px] leading-[1.45]">
                    {post.text}
                  </p>

                  <p className="m-0 mt-3 border-b border-neutral-200 pb-2 text-[12px] text-neutral-600">
                    {post.likes} reactions · {post.comments} comments
                  </p>

                  <div className="mt-1 flex text-[14px] font-medium text-neutral-600">
                    {[
                      { label: "Like", Icon: ThumbsUp },
                      { label: "Comment", Icon: MessageCircle },
                      { label: "Repost", Icon: Repeat2 },
                      { label: "Send", Icon: Send },
                    ].map(({ label, Icon }) => (
                      <span
                        key={label}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 hover:bg-neutral-100"
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
