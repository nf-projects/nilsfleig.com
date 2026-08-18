import { Download } from "lucide-react";
import { SignIn } from "../../_components/SignIn";
import { Avatar } from "../../_components/Avatar";
import { connections, seller } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function LinkedInNetworkPage(): JSX.Element {
  const who = signedInAs("linkedin");
  if (!who) {
    return <SignIn service="linkedin" next="/demo/linkedin/network" />;
  }

  return (
    <div className="mx-auto grid max-w-[1128px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <main>
        <section className="rounded-lg border border-neutral-300 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <h1 className="m-0 text-[16px] font-semibold">
              {connections.length} Connections
            </h1>
            <a
              href="/demo/linkedin/network/connections.csv"
              download="connections.csv"
              className="flex items-center gap-2 rounded-full border border-neutral-500 px-4 py-1.5 text-[14px] font-semibold text-neutral-700"
            >
              <Download size={16} aria-hidden="true" />
              Export connections (CSV)
            </a>
          </div>
          <ul className="m-0 list-none divide-y divide-neutral-200 p-0">
            {connections.map((c) => (
              <li
                key={c.name}
                className="m-0 flex items-center gap-3 px-4 py-3"
              >
                <Avatar name={c.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[16px] font-semibold">{c.name}</p>
                  <p className="m-0 text-[14px] text-neutral-700">
                    {c.title} at {c.company}
                  </p>
                </div>
                <span className="text-[12px] text-neutral-500">
                  Connected {c.connectedOn}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <aside>
        <section className="rounded-lg border border-neutral-300 bg-white p-4">
          <h2 className="m-0 mb-2 text-[16px] font-semibold">Your details</h2>
          <ul className="m-0 list-none p-0 text-[14px] text-neutral-700">
            <li className="m-0">{seller.headline}</li>
            <li className="m-0 mt-2">Location: {seller.location}</li>
            <li className="m-0">Hometown: {seller.hometown}</li>
            <li className="m-0">Education: {seller.school}</li>
            <li className="m-0">
              Previously: {seller.pastCompanies.join(", ")}
            </li>
            <li className="m-0">Interests: {seller.interests.join(", ")}</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
