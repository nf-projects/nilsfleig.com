import { DemoBanner } from "../_components/DemoBanner";
import { signedInAs } from "@/lib/demo/session";

export default function ClayLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-full bg-white">
      <DemoBanner service="clay" signedInAs={signedInAs("clay")} />
      {children}
    </div>
  );
}
