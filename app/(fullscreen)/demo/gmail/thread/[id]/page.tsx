import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Reply, Forward } from "lucide-react";
import { SignIn } from "../../../_components/SignIn";
import { Avatar } from "../../../_components/Avatar";
import { emails } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export function generateStaticParams(): { id: string }[] {
  return emails.map((e) => ({ id: e.id }));
}

export default function GmailThreadPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const email = emails.find((e) => e.id === params.id);
  if (!email) {
    notFound();
  }

  const who = signedInAs("gmail");
  if (!who) {
    return <SignIn service="gmail" next={`/demo/gmail/thread/${params.id}`} />;
  }

  return (
    <article className="px-6 py-4">
      <p className="m-0 mb-4">
        <Link
          href="/demo/gmail"
          className="inline-flex items-center gap-2 text-[13px] text-neutral-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to inbox
        </Link>
      </p>

      <h1 className="m-0 mb-4 text-[22px] font-normal">{email.subject}</h1>

      <div className="flex gap-3">
        <Avatar name={email.from} size={40} />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[14px]">
            <span className="font-semibold">{email.from}</span>{" "}
            <span className="text-neutral-500">&lt;{email.fromEmail}&gt;</span>
            <span className="float-right text-[12px] text-neutral-500">
              {email.date}
            </span>
          </p>
          <p className="m-0 text-[12px] text-neutral-500">to {email.to}</p>
          <p className="mb-0 mt-4 whitespace-pre-line text-[14px] leading-relaxed">
            {email.body}
          </p>

          <div className="mt-6 flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-[14px] text-neutral-700">
              <Reply size={16} aria-hidden="true" />
              Reply
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-[14px] text-neutral-700">
              <Forward size={16} aria-hidden="true" />
              Forward
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
