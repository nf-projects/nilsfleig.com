"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { saveDraft } from "../drafts";
import { accents } from "../../_components/accents";

// Prefillable from the query string (?to=&subject=&body=) so a draft can be
// composed in one navigation and then saved with one click.
export default function ComposePage(): JSX.Element {
  const params = useSearchParams();
  const [_to, _setTo] = useState(params.get("to") ?? "");
  const [_subject, _setSubject] = useState(params.get("subject") ?? "");
  const [_body, _setBody] = useState(params.get("body") ?? "");
  const [_saved, _setSaved] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">New message</h1>

      <form
        className="space-y-3 rounded-lg border border-neutral-300 bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          saveDraft({ to: _to, subject: _subject, body: _body });
          _setSaved(true);
        }}
      >
        <div>
          <label htmlFor="to" className="mb-1 block text-xs font-medium">
            To
          </label>
          <input
            id="to"
            name="to"
            value={_to}
            onChange={(e) => {
              _setTo(e.target.value);
              _setSaved(false);
            }}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="subject" className="mb-1 block text-xs font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            value={_subject}
            onChange={(e) => {
              _setSubject(e.target.value);
              _setSaved(false);
            }}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="body" className="mb-1 block text-xs font-medium">
            Message
          </label>
          <textarea
            id="body"
            name="body"
            rows={12}
            value={_body}
            onChange={(e) => {
              _setBody(e.target.value);
              _setSaved(false);
            }}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: accents.mailroom }}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled
            title="Sending is disabled in this demo"
            className="cursor-not-allowed rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-400"
          >
            Send (disabled)
          </button>
          {_saved ? (
            <span className="text-sm text-green-700">
              Saved.{" "}
              <Link href="/demo/mailroom/drafts" className="underline">
                Go to drafts
              </Link>
            </span>
          ) : null}
        </div>
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        Sending is switched off on purpose. A draft is the end of the workflow;
        a person sends it.
      </p>
    </main>
  );
}
