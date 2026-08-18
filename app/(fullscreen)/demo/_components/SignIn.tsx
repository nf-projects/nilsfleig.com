import { seller } from "@/lib/demo/data";
import { demoServices, type DemoService } from "@/lib/demo/session";
import { accents } from "./accents";
import { LinkedInLogo, ClayLogo, GoogleLogo } from "./Logos";

const copy: Record<DemoService, { heading: string; sub: string; cta: string }> =
  {
    linkedin: {
      heading: "Sign in",
      sub: "Stay updated on your professional world",
      cta: "Sign in",
    },
    clay: {
      heading: "Log in to Clay",
      sub: "Welcome back. Enter your details to continue.",
      cta: "Log in",
    },
    gmail: {
      heading: "Sign in",
      sub: "Use your Google Account",
      cta: "Next",
    },
  };

/**
 * The sign-in screen. Any credentials are accepted. It exists so the sign-in is
 * a thing a person does in the shared browser, and so the session then lives in
 * that browser profile the way a real one would.
 */
export function SignIn({
  service,
  next,
}: {
  service: DemoService;
  next: string;
}): JSX.Element {
  const text = copy[service];
  // Gmail's own red is the product mark, not its sign-in button — that screen
  // is Google's, and its button is Google blue.
  const accent = service === "gmail" ? "#1a73e8" : accents[service];
  const rounded = service === "linkedin" ? "rounded-full" : "rounded";

  return (
    <div
      className="min-h-full"
      style={{ background: service === "linkedin" ? "#f4f2ee" : "#fff" }}
    >
      <div className="px-6 py-6">
        {service === "linkedin" ? <LinkedInLogo /> : null}
      </div>

      <main className="mx-auto max-w-[400px] px-6 pb-16">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          {service === "clay" ? (
            <div className="mb-4">
              <ClayLogo />
            </div>
          ) : null}
          {service === "gmail" ? (
            <div className="mb-4 flex justify-center">
              <GoogleLogo />
            </div>
          ) : null}

          <h1
            className={`m-0 text-[28px] font-semibold ${service === "gmail" ? "text-center" : ""}`}
          >
            {text.heading}
          </h1>
          <p
            className={`mb-6 mt-1 text-sm text-neutral-600 ${service === "gmail" ? "text-center" : ""}`}
          >
            {text.sub}
          </p>

          <form action="/demo/api/session" method="post" className="space-y-4">
            <input type="hidden" name="service" value={service} />
            <input type="hidden" name="next" value={next} />

            <div>
              <label
                htmlFor="demo-name"
                className="mb-1 block text-[13px] font-medium text-neutral-700"
              >
                Name
              </label>
              <input
                id="demo-name"
                name="name"
                defaultValue={seller.name}
                className={`w-full border border-neutral-400 px-3 py-2.5 text-[15px] ${rounded}`}
              />
            </div>
            <div>
              <label
                htmlFor="demo-email"
                className="mb-1 block text-[13px] font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="demo-email"
                name="email"
                type="email"
                defaultValue={seller.email}
                className={`w-full border border-neutral-400 px-3 py-2.5 text-[15px] ${rounded}`}
              />
            </div>
            <div>
              <label
                htmlFor="demo-password"
                className="mb-1 block text-[13px] font-medium text-neutral-700"
              >
                Password
              </label>
              <input
                id="demo-password"
                name="password"
                type="password"
                defaultValue="demo"
                className={`w-full border border-neutral-400 px-3 py-2.5 text-[15px] ${rounded}`}
              />
            </div>

            <button
              type="submit"
              className={`w-full px-4 py-2.5 text-[16px] font-semibold text-white ${rounded}`}
              style={{ background: accent }}
            >
              {text.cta}
            </button>
          </form>

          <p className="mb-0 mt-5 text-[13px] text-neutral-500">
            This is a demonstration of {demoServices[service].label} with
            invented data. Any email and password will do.
          </p>
        </div>
      </main>
    </div>
  );
}
