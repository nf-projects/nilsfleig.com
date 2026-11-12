import type { Metadata } from "next";
import Lab from "./_components/Lab";

export const metadata: Metadata = {
  title: "ECS 171 Group 15: Readmission demo",
  description: "Interactive demo of an XGBoost model for 30-day hospital readmission.",
};

export default function Page(): JSX.Element {
  return <Lab />;
}
