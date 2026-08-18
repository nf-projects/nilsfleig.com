import { companies, peopleByCompany } from "@/lib/demo/data";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Same filters as the table, so an export matches what the person is looking at.
export function GET(request: Request): Response {
  const params = new URL(request.url).searchParams;
  const industry = params.get("industry") ?? "";
  const min = Number(params.get("minEmployees") ?? "") || 0;
  const max =
    Number(params.get("maxEmployees") ?? "") || Number.MAX_SAFE_INTEGER;
  const inHouseOnly = params.get("hasDesignTeam") === "on";

  const rows = companies.filter((c) => {
    if (industry && c.industry !== industry) {
      return false;
    }
    if (c.employees < min || c.employees > max) {
      return false;
    }
    if (inHouseOnly && !c.designTeam.toLowerCase().includes("in-house")) {
      return false;
    }
    return true;
  });

  const table = [
    [
      "Company",
      "Domain",
      "HQ",
      "Employees",
      "Industry",
      "Segment",
      "Design team",
      "Email pattern",
      "Known contacts",
      "Last funding",
      "Signals",
    ],
    ...rows.map((c) => [
      c.name,
      c.domain,
      c.hq,
      c.employees,
      c.industry,
      c.segment,
      c.designTeam,
      `first.last@${c.domain}`,
      peopleByCompany(c.id).length,
      c.lastFunding ?? "",
      c.signals.join("; "),
    ]),
  ];

  return new Response(table.map((r) => r.map(csvCell).join(",")).join("\n") + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="companies.csv"',
    },
  });
}
