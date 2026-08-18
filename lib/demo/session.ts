import { cookies } from "next/headers";

export const demoServices = {
  linkfield: { label: "Linkfield", path: "/demo/linkfield" },
  kiln: { label: "Kiln", path: "/demo/kiln" },
  mailroom: { label: "Mailroom", path: "/demo/mailroom" },
} as const;

export type DemoService = keyof typeof demoServices;

export function cookieName(service: DemoService): string {
  return `demo_${service}`;
}

/** The signed-in display name for a service, or null. */
export function signedInAs(service: DemoService): string | null {
  return cookies().get(cookieName(service))?.value ?? null;
}
