import Link from "next/link";
import { demoServices, type DemoService } from "@/lib/demo/session";

/**
 * Always-visible marker. These pages imitate the shape of well-known tools so a
 * demo reads at a glance; the banner is what keeps that from being a pretence.
 */
export function DemoBanner({
  service,
  signedInAs,
}: {
  service: DemoService;
  signedInAs: string | null;
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-300 px-4 py-1.5 text-[13px] text-amber-950">
      <p className="m-0">
        <strong>Demo</strong> — {demoServices[service].label} is a mock service
        with invented data. It is not {demoServiceLooksLike[service]}.
      </p>
      <span className="flex items-center gap-3">
        {signedInAs ? (
          <>
            <span>Signed in as {signedInAs}</span>
            <form action="/demo/api/session" method="post" className="contents">
              <input type="hidden" name="service" value={service} />
              <input type="hidden" name="action" value="logout" />
              <input
                type="hidden"
                name="next"
                value={demoServices[service].path}
              />
              <button type="submit" className="underline">
                Sign out
              </button>
            </form>
          </>
        ) : null}
        <Link href="/demo" className="underline">
          All demo services
        </Link>
      </span>
    </div>
  );
}

const demoServiceLooksLike: Record<DemoService, string> = {
  linkfield: "LinkedIn",
  kiln: "Clay",
  mailroom: "Gmail",
};
