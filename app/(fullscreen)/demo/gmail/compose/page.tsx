"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { saveDraft } from "../drafts";

// Prefillable from the query string (?to=&subject=&body=), so a draft can be
// composed in one navigation and saved with one click.
export default function ComposePage(): JSX.Element {
  const params = useSearchParams();
  const [_to, _setTo] = useState(params.get("to") ?? "");
  const [_subject, _setSubject] = useState(params.get("subject") ?? "");
  const [_body, _setBody] = useState(params.get("body") ?? "");
  const [_saved, _setSaved] = useState(false);

  return (
    <div className="p-4">
      <form
        className="mx-auto max-w-[680px] overflow-hidden rounded-lg border border-neutral-200 shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          saveDraft({ to: _to, subject: _subject, body: _body });
          _setSaved(true);
        }}
      >
        <h1 className="m-0 bg-neutral-100 px-4 py-2.5 text-[14px] font-medium">
          New Message
        </h1>

        <div className="border-b border-neutral-200 px-4">
          <label htmlFor="to" className="sr-only">
            To
          </label>
          <input
            id="to"
            name="to"
            placeholder="To"
            value={_to}
            onChange={(e) => {
              _setTo(e.target.value);
              _setSaved(false);
            }}
            className="w-full border-0 py-2.5 text-[14px] outline-none"
          />
        </div>
        <div className="border-b border-neutral-200 px-4">
          <label htmlFor="subject" className="sr-only">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            placeholder="Subject"
            value={_subject}
            onChange={(e) => {
              _setSubject(e.target.value);
              _setSaved(false);
            }}
            className="w-full border-0 py-2.5 text-[14px] outline-none"
          />
        </div>
        <div className="px-4">
          <label htmlFor="body" className="sr-only">
            Message body
          </label>
          <textarea
            id="body"
            name="body"
            rows={16}
            value={_body}
            onChange={(e) => {
              _setBody(e.target.value);
              _setSaved(false);
            }}
            className="w-full resize-none border-0 py-3 text-[14px] leading-relaxed outline-none"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-neutral-200 px-4 py-2.5">
          <button
            type="button"
            disabled
            title="Sending is switched off in this demo"
            className="cursor-not-allowed rounded-full bg-neutral-200 px-6 py-2 text-[14px] font-medium text-neutral-500"
          >
            Send
          </button>
          <button
            type="submit"
            className="rounded-full border border-neutral-300 px-4 py-2 text-[14px] font-medium text-neutral-700"
          >
            Save draft
          </button>
          {_saved ? (
            <span className="text-[13px] text-green-700">
              Draft saved.{" "}
              <Link href="/demo/gmail/drafts" className="underline">
                Go to drafts
              </Link>
            </span>
          ) : null}
          <Trash2
            size={18}
            className="ml-auto text-neutral-500"
            aria-hidden="true"
          />
        </div>
      </form>

      <p className="mx-auto mt-4 max-w-[680px] text-[13px] text-neutral-500">
        Send is switched off on purpose. A draft is where this workflow ends; a
        person sends it.
      </p>
    </div>
  );
}
