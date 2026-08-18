import Link from "next/link";
import { notFound } from "next/navigation";
import { SignIn } from "../../../_components/SignIn";
import { accents } from "../../../_components/accents";
import { emails } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export function generateStaticParams(): { id: string }[] {
  return emails.map((e) => ({ id: e.id }));
}

export default function MailroomThreadPage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  const email = emails.find((e) => e.id === params.id);
  if (!email) {
    notFound();
  }

  const who = signedInAs("mailroom");
  if (!who) {
    return (
      <SignIn
        service="mailroom"
        next={`/demo/mailroom/thread/${params.id}`}
        accent={accents.mailroom}
      />
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <article className="rounded-lg border border-neutral-300 bg-white p-6">
        <h1 className="m-0 text-xl font-semibold">{email.subject}</h1>
        <p className="m-0 mt-1 text-sm text-neutral-700">
          From {email.from} &lt;{email.fromEmail}&gt;
        </p>
        <p className="m-0 text-sm text-neutral-700">To {email.to}</p>
        <p className="m-0 text-xs text-neutral-500">{email.date}</p>
        <hr className="my-4 border-neutral-200" />
        <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed">
          {email.body}
        </p>
      </article>
      <p className="mt-6 text-sm">
        <Link href="/demo/mailroom" className="text-blue-700">
          Back to inbox
        </Link>
      </p>
    </main>
  );
}
