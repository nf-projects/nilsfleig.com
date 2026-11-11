import type { Metadata } from "next";
import Deck from "./_components/Deck";

export const metadata: Metadata = {
  title: "ECS 171 Group 15: Readmission Prediction",
  description: "Slides and an in-browser demo of an XGBoost model for 30-day hospital readmission.",
};

export default function Page(): JSX.Element {
  return <Deck />;
}
