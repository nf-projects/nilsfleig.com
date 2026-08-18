export type Draft = {
  id: string;
  to: string;
  subject: string;
  body: string;
  savedAt: string;
};

const key = "demo_mailroom_drafts";

// Drafts live in the browser, not on a server. That is deliberate: the demo
// point is that the mailbox belongs to the browser profile the person signed
// into, and that a draft written there is still there after a pause, a resume,
// or a fork of that machine.
export function readDrafts(): Draft[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
}

export function saveDraft(draft: Omit<Draft, "id" | "savedAt">): Draft {
  const entry: Draft = {
    ...draft,
    id: `d${Date.now()}`,
    savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  const next = [entry, ...readDrafts()];
  window.localStorage.setItem(key, JSON.stringify(next));
  return entry;
}

export function deleteDraft(id: string): void {
  const next = readDrafts().filter((d) => d.id !== id);
  window.localStorage.setItem(key, JSON.stringify(next));
}
