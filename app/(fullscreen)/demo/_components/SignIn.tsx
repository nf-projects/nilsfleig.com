import { seller } from "@/lib/demo/data";
import { demoServices, type DemoService } from "@/lib/demo/session";

/**
 * The mock sign-in screen. Any credentials work. It exists so the sign-in is a
 * real thing a person does in the shared browser, and so the session then
 * persists in that browser profile the way a real one would.
 */
export function SignIn({
  service,
  next,
  accent,
}: {
  service: DemoService;
  next: string;
  accent: string;
}): JSX.Element {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-2xl font-semibold" style={{ color: accent }}>
        {demoServices[service].label}
      </h1>
      <p className="mb-8 text-sm text-neutral-600">
        Sign in to continue. This is a demo service — any email and password are
        accepted.
      </p>
      <form action="/demo/api/session" method="post" className="space-y-4">
        <input type="hidden" name="service" value={service} />
        <input type="hidden" name="next" value={next} />
        <div>
          <label
            htmlFor="demo-name"
            className="mb-1 block text-sm font-medium text-neutral-800"
          >
            Name
          </label>
          <input
            id="demo-name"
            name="name"
            defaultValue={seller.name}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="demo-email"
            className="mb-1 block text-sm font-medium text-neutral-800"
          >
            Email
          </label>
          <input
            id="demo-email"
            name="email"
            type="email"
            defaultValue={seller.email}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="demo-password"
            className="mb-1 block text-sm font-medium text-neutral-800"
          >
            Password
          </label>
          <input
            id="demo-password"
            name="password"
            type="password"
            defaultValue="demo"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded px-4 py-2 text-sm font-semibold text-white"
          style={{ background: accent }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
