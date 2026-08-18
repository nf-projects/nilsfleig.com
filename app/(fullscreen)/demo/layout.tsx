import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo services",
  robots: { index: false, follow: false },
};

// The site's root layout wraps everything in a narrow dark column with a header
// and footer. These pages are full-bleed application mocks, so the chrome is
// switched off here — server-rendered, so there is no flash of the wrong shell.
const killSiteChrome = `
  body { background: #fff; color: #111; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
  body > div { max-width: none; padding: 0; margin: 0; }
  body > div > header, body > div > footer { display: none; }
`;

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: killSiteChrome }} />
      {children}
    </>
  );
}
