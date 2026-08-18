"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteDraft, readDrafts, type Draft } from "../drafts";

export default function DraftsPage(): JSX.Element {
  const [_drafts, _setDrafts] = useState<Draft[]>([]);

  // localStorage is not readable while rendering on the server, so the list is
  // loaded once the component is mounted.
  useEffect(() => {
    _setDrafts(readDrafts());
  }, []);

  return (
    <>
      <h1 className="sr-only">Drafts</h1>

      {_drafts.length === 0 ? (
        <p className="p-8 text-center text-[14px] text-neutral-500">
          No saved drafts.{" "}
          <Link href="/demo/gmail/compose" className="text-blue-700 underline">
            Compose one
          </Link>
          .
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-neutral-100 p-0">
          {_drafts.map((d) => (
            <li key={d.id} className="m-0 px-4 py-3">
              <p className="m-0 flex items-baseline gap-2 text-[14px]">
                <span className="font-semibold text-red-700">Draft</span>
                <span className="text-neutral-700">To: {d.to}</span>
                <span className="ml-auto text-[12px] text-neutral-500">
                  {d.savedAt}
                </span>
              </p>
              <p className="m-0 text-[14px] font-semibold">{d.subject}</p>
              <p className="m-0 mt-1 whitespace-pre-line text-[14px] leading-relaxed text-neutral-700">
                {d.body}
              </p>
              <p className="m-0 mt-2 flex gap-4 text-[13px]">
                <Link
                  href={`/demo/gmail/compose?to=${encodeURIComponent(d.to)}&subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`}
                  className="text-blue-700 underline"
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
    </>
  );
}
