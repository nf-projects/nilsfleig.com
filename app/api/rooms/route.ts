import { NextRequest, NextResponse } from "next/server";

const UC_DAVIS_API = "https://ces-apps.ucdavis.edu/Public/plan/space/spaceAvail2.cfm";

export async function POST(request: NextRequest) {
  try {
    const { buildingId, date } = await request.json();

    if (!buildingId || !date) {
      return NextResponse.json({ error: "Missing buildingId or date" }, { status: 400 });
    }

    // Format date for API (YYYYMMDD and MM/DD/YYYY)
    const dateObj = new Date(date);
    const yyyymmdd = dateObj.toISOString().slice(0, 10).replace(/-/g, "");
    const mmddyyyy = `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${dateObj.getFullYear()}`;

    const formData = new URLSearchParams({
      bldgid: buildingId,
      roomid: "",
      date: yyyymmdd,
      getDate: mmddyyyy,
    });

    const response = await fetch(UC_DAVIS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://ces-apps.ucdavis.edu",
        "Referer": "https://ces-apps.ucdavis.edu/Public/plan/space/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: formData.toString(),
    });

    const html = await response.text();
    const rooms = parseRoomAvailability(html);

    return NextResponse.json({ rooms, buildingId });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    return NextResponse.json({ error: "Failed to fetch room availability" }, { status: 500 });
  }
}

interface TimeSlot {
  hour: number;
  available: boolean;
  quarters: boolean[]; // Availability for :00-:15, :15-:30, :30-:45, :45-:60
}

interface Room {
  id: string;
  name: string;
  capacity: number | null;
  availability: TimeSlot[];
}

function parseRoomAvailability(html: string): Room[] {
  const rooms: Room[] = [];

  // Split HTML by dataRows to get each room section
  // This handles nested <tr> tags inside each room row
  const sections = html.split('<tr class="dataRows">');

  for (const section of sections) {
    // Extract room info from the section
    const roomInfoMatch = section.match(/roomInfo\('(\d+)'\).*?showtip\(this,event,'([^']+)'\)/);
    if (!roomInfoMatch) continue;

    const roomId = roomInfoMatch[1];
    const roomTooltip = roomInfoMatch[2];

    // Parse room name and capacity from tooltip (e.g., "101 OLSON (36)")
    const nameCapMatch = roomTooltip.match(/^(.+?)\s*\((\d+)\)$/);
    const roomName = nameCapMatch ? nameCapMatch[1].trim() : roomTooltip;
    const capacity = nameCapMatch ? parseInt(nameCapMatch[2]) : null;

    // Find all time slot cells by data-index attribute
    // data-index goes from 1 to 76 (19 hours × 4 quarters)
    const slotRegex = /class="(space-[^"]+)"\s+data-index="(\d+)"/g;
    const slotMatches = Array.from(section.matchAll(slotRegex));


    // Build a map of slot index to availability
    const slotMap: Record<number, boolean> = {};
    for (const match of slotMatches) {
      const className = match[1];
      const index = parseInt(match[2]);
      slotMap[index] = className === "space-white";
    }

    // Group slots into hours (4 slots per hour, starting at 5am)
    // data-index 1-4 = 5am, 5-8 = 6am, etc.
    const availability: TimeSlot[] = [];
    for (let hour = 5; hour <= 23; hour++) {
      const hourIndex = hour - 5;
      const startSlot = hourIndex * 4 + 1; // data-index is 1-based

      const quarters: boolean[] = [];
      let availableCount = 0;
      for (let i = 0; i < 4; i++) {
        const isFree = slotMap[startSlot + i] === true; // Strict check for true
        quarters.push(isFree);
        if (isFree) availableCount++;
      }

      availability.push({
        hour,
        available: availableCount >= 2, // At least half the hour is free
        quarters,
      });
    }

    rooms.push({
      id: roomId,
      name: roomName,
      capacity,
      availability,
    });
  }

  return rooms;
}
