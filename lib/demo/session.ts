import { cookies } from "next/headers";

export const demoServices = {
  linkedin: { label: "LinkedIn", path: "/demo/linkedin" },
  clay: { label: "Clay", path: "/demo/clay" },
  gmail: { label: "Gmail", path: "/demo/gmail" },
} as const;

export type DemoService = keyof typeof demoServices;

export function cookieName(service: DemoService): string {
  return `demo_${service}`;
}

/** The signed-in display name for a service, or null. */
export function signedInAs(service: DemoService): string | null {
  return cookies().get(cookieName(service))?.value ?? null;
}
