import { connections } from "@/lib/demo/data";

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function GET(): Response {
  const rows = [
    ["Name", "Title", "Company", "Connected On"],
    ...connections.map((c) => [c.name, c.title, c.company, c.connectedOn]),
  ];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="connections.csv"',
    },
  });
}
