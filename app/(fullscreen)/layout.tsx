import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Write",
  description: "A stream of consciousness journaling experiment",
};

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        {children}
      </body>
    </html>
  );
}
