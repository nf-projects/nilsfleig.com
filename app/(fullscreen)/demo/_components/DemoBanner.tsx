import Link from "next/link";
import { demoServices, type DemoService } from "@/lib/demo/session";

/**
 * A thin marker. These pages copy the shape of real products so a demo reads at
 * a glance, and the strip is what keeps that from being a pretence. One line,
 * out of the way of the product chrome below it.
 */
export function DemoBanner({
  service,
  signedInAs,
}: {
  service: DemoService;
  signedInAs: string | null;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 bg-amber-200 px-4 py-1 text-[12px] leading-5 text-amber-950">
      <p className="m-0">
        <strong>Demo</strong> — a mock of {demoServices[service].label} with
        invented data. Not the real service.
      </p>
      <span className="flex items-center gap-3 whitespace-nowrap">
        {signedInAs ? (
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
        ) : null}
        <Link href="/demo" className="underline">
          Demo index
        </Link>
      </span>
    </div>
  );
}
