import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo services",
  robots: { index: false, follow: false },
};

// The site's root layout is a dark, monospaced, max-width column with a header
// and a footer. Hiding those with a cascade override proved unreliable, so the
// demo takes the whole viewport instead: one fixed, scrolling, light surface
// that owes nothing to what is painted underneath it.
//
// The scoped rules below exist because form controls inherit the dark theme's
// colours otherwise — which is how a typed value ends up light grey on white.
const demoStyles = `
  .demo-root { color-scheme: light; }
  .demo-root input,
  .demo-root select,
  .demo-root textarea {
    color: #111827;
    background-color: #fff;
    font: inherit;
  }
  .demo-root input::placeholder,
  .demo-root textarea::placeholder { color: #9ca3af; }
  .demo-root a { text-decoration: none; }
  .demo-root ::selection { background: #b4d5fe; }
`;

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: demoStyles }} />
      <div
        className="demo-root fixed inset-0 z-[9999] overflow-y-auto bg-white text-neutral-900"
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {children}
      </div>
    </>
  );
}
