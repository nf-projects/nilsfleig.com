import { SignIn } from "../../_components/SignIn";
import { accents } from "../../_components/accents";
import { connections, seller } from "@/lib/demo/data";
import { signedInAs } from "@/lib/demo/session";

export default function LinkfieldNetworkPage(): JSX.Element {
  const who = signedInAs("linkfield");
  if (!who) {
    return (
      <SignIn
        service="linkfield"
        next="/demo/linkfield/network"
        accent={accents.linkfield}
      />
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold">My network</h1>
      <p className="mb-4 text-sm text-neutral-600">
        {connections.length} connections · {seller.name}
      </p>

      <p className="mb-6">
        <a
          href="/demo/linkfield/network/connections.csv"
          download="connections.csv"
          className="inline-block rounded px-3 py-1.5 text-sm font-semibold text-white no-underline"
          style={{ background: accents.linkfield }}
        >
          Export connections (CSV)
        </a>
      </p>

      <table className="w-full border-collapse bg-white text-sm">
        <caption className="sr-only">Connections</caption>
        <thead>
          <tr className="border-b border-neutral-300 text-left">
            <th className="p-2 font-semibold">Name</th>
            <th className="p-2 font-semibold">Title</th>
            <th className="p-2 font-semibold">Company</th>
            <th className="p-2 font-semibold">Connected on</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((c) => (
            <tr key={c.name} className="border-b border-neutral-200">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.title}</td>
              <td className="p-2">{c.company}</td>
              <td className="p-2 text-neutral-600">{c.connectedOn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-1 mt-8 text-base font-semibold">Profile details</h2>
      <ul className="m-0 list-none p-0 text-sm text-neutral-800">
        <li className="m-0">Location: {seller.location}</li>
        <li className="m-0">Hometown: {seller.hometown}</li>
        <li className="m-0">Education: {seller.school}</li>
        <li className="m-0">Previously: {seller.pastCompanies.join(", ")}</li>
        <li className="m-0">Interests: {seller.interests.join(", ")}</li>
      </ul>
    </main>
  );
}
