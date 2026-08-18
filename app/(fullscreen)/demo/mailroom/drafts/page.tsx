"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteDraft, readDrafts, type Draft } from "../drafts";

export default function DraftsPage(): JSX.Element {
  const [_drafts, _setDrafts] = useState<Draft[]>([]);

  // localStorage is not available while rendering on the server, so the list is
  // read once the component is mounted.
  useEffect(() => {
    _setDrafts(readDrafts());
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Drafts</h1>

      {_drafts.length === 0 ? (
        <p className="rounded-lg border border-neutral-300 bg-white p-4 text-sm text-neutral-600">
          No drafts yet.{" "}
          <Link href="/demo/mailroom/compose" className="text-blue-700">
            Compose one
          </Link>
          .
        </p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {_drafts.map((d) => (
            <li
              key={d.id}
              className="m-0 rounded-lg border border-neutral-300 bg-white p-4"
            >
              <p className="m-0 text-sm text-neutral-700">To: {d.to}</p>
              <p className="m-0 text-base font-semibold">{d.subject}</p>
              <p className="m-0 mb-2 text-xs text-neutral-500">
                Saved {d.savedAt}
              </p>
              <p className="m-0 whitespace-pre-line text-[15px] leading-relaxed">
                {d.body}
              </p>
              <p className="m-0 mt-3 flex gap-3 text-sm">
                <Link
                  href={`/demo/mailroom/compose?to=${encodeURIComponent(d.to)}&subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`}
                  className="text-blue-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="text-red-700 underline"
                  onClick={() => {
                    deleteDraft(d.id);
                    _setDrafts(readDrafts());
                  }}
                >
                  Delete
                </button>
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
