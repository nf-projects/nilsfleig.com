import { NextResponse } from "next/server";
import { cookieName, demoServices, type DemoService } from "@/lib/demo/session";

// Mock sign-in for the three demo services. Any credentials are accepted —
// there is nothing to protect here, and the point of the screen is that a
// person performs the sign-in themselves in the browser the agent shares.
export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData();
  const service = String(form.get("service") ?? "") as DemoService;
  const next = String(form.get("next") ?? "");
  const action = String(form.get("action") ?? "login");
  const name = String(form.get("name") ?? "").trim();

  if (!(service in demoServices)) {
    return NextResponse.json({ error: "unknown service" }, { status: 400 });
  }

  const destination = next.startsWith("/demo/")
    ? next
    : demoServices[service].path;
  const response = NextResponse.redirect(
    new URL(destination, request.url),
    303,
  );

  if (action === "logout") {
    response.cookies.delete(cookieName(service));
    return response;
  }

  response.cookies.set(cookieName(service), name || "Dana Whitfield", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
