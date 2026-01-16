"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

// Building coordinates estimated from UC Davis campus map
// Reference: MU (38.5424, -121.7495), Olson (38.5400, -121.7476)
const BUILDINGS: Record<string, { name: string; lat: number; lng: number }> = {
  // Quad Area
  MU: { name: "Memorial Union", lat: 38.5424, lng: -121.7495 },
  SOCSCI: { name: "Social Sciences", lat: 38.5438, lng: -121.7490 },
  YOUNG: { name: "Young Hall", lat: 38.5435, lng: -121.7475 },

  // Central Area
  OLSON: { name: "Olson Hall", lat: 38.5400, lng: -121.7476 },
  WELLMA: { name: "Wellman Hall", lat: 38.5418, lng: -121.7510 },
  HUTCHI: { name: "Hutchison Hall", lat: 38.5412, lng: -121.7530 },
  CALIFO: { name: "California Hall", lat: 38.5415, lng: -121.7520 },
  KERR: { name: "Kerr Hall", lat: 38.5410, lng: -121.7515 },
  HART: { name: "Hart Hall", lat: 38.5400, lng: -121.7515 },
  SCC: { name: "Student Community Center", lat: 38.5395, lng: -121.7505 },
  VOORHI: { name: "Voorhies Hall", lat: 38.5408, lng: -121.7470 },

  // South-Central
  CHEMIS: { name: "Chemistry", lat: 38.5378, lng: -121.7495 },
  EVERSO: { name: "Everson Hall", lat: 38.5380, lng: -121.7485 },
  ROESSL: { name: "Roessler Hall", lat: 38.5368, lng: -121.7500 },
  BAINER: { name: "Bainer Hall", lat: 38.5363, lng: -121.7505 },

  // Southwest
  TLC: { name: "Teaching & Learning Complex", lat: 38.5373, lng: -121.7530 },
  GIEDT: { name: "Giedt Hall", lat: 38.5365, lng: -121.7545 },

  // South
  PHYSIC: { name: "Physics Building", lat: 38.5358, lng: -121.7510 },
  MEYER: { name: "Meyer Hall", lat: 38.5348, lng: -121.7555 },
  EARTH: { name: "Earth & Physical Sciences", lat: 38.5352, lng: -121.7520 },

  // Northwest
  CRUESS: { name: "Cruess Hall", lat: 38.5435, lng: -121.7555 },
  HOAGLA: { name: "Hoagland Hall", lat: 38.5428, lng: -121.7545 },
  STORER: { name: "Storer Hall", lat: 38.5405, lng: -121.7545 },
  KLEIBE: { name: "Kleiber Hall", lat: 38.5402, lng: -121.7550 },

  // North
  HUNT: { name: "Hunt Hall", lat: 38.5448, lng: -121.7515 },
  WICKSO: { name: "Wickson Hall", lat: 38.5432, lng: -121.7505 },

  // Northeast
  HICKEY: { name: "Hickey Gym", lat: 38.5448, lng: -121.7460 },
  WALKER: { name: "Walker Hall", lat: 38.5385, lng: -121.7460 },

  // West
  ARC: { name: "Activities & Recreation Center", lat: 38.5428, lng: -121.7588 },

  // Southeast
  MONDAV: { name: "Mondavi Center", lat: 38.5345, lng: -121.7445 },

  // Other buildings from CES system
  HEITM: { name: "Heitman Staff Learning Center", lat: 38.5370, lng: -121.7490 },
  ROBBIN: { name: "Robbins Hall", lat: 38.5405, lng: -121.7510 },
  ROCK: { name: "Rock Hall", lat: 38.5382, lng: -121.7478 },
  VEIHME: { name: "Veihmeyer Hall", lat: 38.5440, lng: -121.7535 },
  INTCTR: { name: "International Center", lat: 38.5450, lng: -121.7580 },
  ALUMNI: { name: "Alumni Center", lat: 38.5340, lng: -121.7460 },
  UCDCC: { name: "UC Davis Conference Center", lat: 38.5342, lng: -121.7455 },
  KHAIRA: { name: "Khaira Lecture Hall", lat: 38.5380, lng: -121.7530 },
};

interface TimeSlot {
  hour: number;
  available: boolean;
  quarters: boolean[];
}

interface Room {
  id: string;
  name: string;
  capacity: number | null;
  availability: TimeSlot[];
}

interface RoomStatus {
  status: "available" | "soon" | "occupied";
  message: string;
  availableUntil?: string;
}

interface RoomWithStatus {
  room: Room;
  status: RoomStatus;
}

interface BuildingResult {
  buildingId: string;
  buildingName: string;
  distance: number;
  rooms: Room[];
  availableNow: RoomWithStatus[];
  error?: string;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

function getCurrentHour(): number {
  return new Date().getHours();
}

function formatTime(hour: number, minute: number = 0): string {
  const mStr = minute.toString().padStart(2, "0");
  if (hour === 0) return `12:${mStr} AM`;
  if (hour < 12) return `${hour}:${mStr} AM`;
  if (hour === 12) return `12:${mStr} PM`;
  return `${hour - 12}:${mStr} PM`;
}

function getPreciseAvailableUntil(availability: TimeSlot[], startHour: number, startQ: number): string {
  let currentHour = startHour;
  let currentQ = startQ;

  while (currentHour <= 23) {
    const slot = availability.find(s => s.hour === currentHour);
    // If slot missing or quarter not free, we found the end
    if (!slot || !slot.quarters[currentQ]) {
      // Return the time this quarter starts
      const min = currentQ * 15;
      return formatTime(currentHour, min);
    }

    currentQ++;
    if (currentQ > 3) {
      currentQ = 0;
      currentHour++;
    }
  }
  return "11:59 PM";
}

function calculateRoomStatus(room: Room, hour: number, minute: number): RoomStatus {
  const currentSlot = room.availability.find((s) => s.hour === hour);
  if (!currentSlot) return { status: "occupied", message: "Closed" };

  const qIndex = Math.floor(minute / 15);
  // Check if strict availability is needed or if we can accept "soon"
  
  // 1. Check current quarter
  if (currentSlot.quarters[qIndex]) {
    const until = getPreciseAvailableUntil(room.availability, hour, qIndex);
    return {
      status: "available",
      message: `Until ${until}`,
      availableUntil: until
    };
  }

  // 2. Check if available soon (within 20 mins)
  let nextHour = hour;
  let nextQ = qIndex + 1;
  if (nextQ > 3) {
    nextHour++;
    nextQ = 0;
  }

  // Calculate wait time until next quarter starts
  const currentTotalMinutes = hour * 60 + minute;
  const nextStartMinutes = nextHour * 60 + nextQ * 15;
  const waitMinutes = nextStartMinutes - currentTotalMinutes;

  if (waitMinutes <= 20) {
    const nextSlot = room.availability.find((s) => s.hour === nextHour);
    if (nextSlot && nextSlot.quarters[nextQ]) {
       const until = getPreciseAvailableUntil(room.availability, nextHour, nextQ);
       return {
         status: "soon",
         message: `Free in ${waitMinutes}m`,
         availableUntil: until
       };
    }
  }

  return { status: "occupied", message: "Occupied" };
}

interface RoomDetailPopup {
  buildingName: string;
  room: Room;
}

export default function RoomsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BuildingResult[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [roomDetailPopup, setRoomDetailPopup] = useState<RoomDetailPopup | null>(null);
  const [roomSearchInputs, setRoomSearchInputs] = useState<Record<string, string>>({});
  const [openAutocomplete, setOpenAutocomplete] = useState<string | null>(null);

  const hoursAhead = 2;
  const maxDistance = 1000; // meters
  const OUTDOOR_KEYWORDS = ["lobby", "courtyard", "lawn", "patio", "terrace", "garden", "plaza", "outdoor", "field", "quad", "deck"];

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(`Unable to get location: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.autocomplete-container')) {
        setOpenAutocomplete(null);
      }
    };

    if (openAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openAutocomplete]);

  const searchRooms = async () => {
    if (!location) return;

    setLoading(true);
    const [hourStr, minuteStr] = selectedTime.split(":");
    const currentHour = parseInt(hourStr);
    const today = new Date().toISOString().split("T")[0];

    // Filter buildings by distance
    const nearbyBuildings = Object.entries(BUILDINGS)
      .map(([id, data]) => ({
        id,
        ...data,
        distance: getDistance(location.lat, location.lng, data.lat, data.lng),
      }))
      .filter((b) => b.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyBuildings.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Fetch availability for all nearby buildings in parallel
    const fetchPromises = nearbyBuildings.map(async (building) => {
      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buildingId: building.id, date: today }),
        });

        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        const rooms: Room[] = data.rooms || [];

        // Filter and map rooms
        const availableNow: RoomWithStatus[] = [];
        
        rooms.forEach((room) => {
          // Always exclude outdoor/lobby spaces
          const nameLower = room.name.toLowerCase();
          if (OUTDOOR_KEYWORDS.some((kw) => nameLower.includes(kw))) {
            return;
          }

          const status = calculateRoomStatus(room, currentHour, parseInt(minuteStr));
          if (status.status === "available" || status.status === "soon") {
            availableNow.push({ room, status });
          }
        });

        return {
          buildingId: building.id,
          buildingName: building.name,
          distance: building.distance,
          rooms,
          availableNow,
        };
      } catch {
        return {
          buildingId: building.id,
          buildingName: building.name,
          distance: building.distance,
          rooms: [],
          availableNow: [],
          error: "Failed to fetch",
        };
      }
    });

    const buildingResults = await Promise.all(fetchPromises);
    setResults(buildingResults);
    setLoading(false);
  };

  const handleRoomSearch = (buildingId: string, buildingName: string, room?: Room) => {
    if (room) {
      setRoomDetailPopup({ buildingName, room });
      setRoomSearchInputs({ ...roomSearchInputs, [buildingId]: "" });
      setOpenAutocomplete(null);
      return;
    }

    const searchTerm = roomSearchInputs[buildingId]?.trim().toLowerCase();
    if (!searchTerm) return;

    const building = results.find((b) => b.buildingId === buildingId);
    if (!building) return;

    // Find room that matches the search term
    const matchingRoom = building.rooms.find(
      (room) => room.name.toLowerCase().includes(searchTerm) || room.id === searchTerm
    );

    if (matchingRoom) {
      setRoomDetailPopup({ buildingName, room: matchingRoom });
      setRoomSearchInputs({ ...roomSearchInputs, [buildingId]: "" });
      setOpenAutocomplete(null);
    }
  };

  const getFilteredRooms = (buildingId: string): Room[] => {
    const searchTerm = roomSearchInputs[buildingId]?.trim().toLowerCase();
    if (!searchTerm) return [];

    const building = results.find((b) => b.buildingId === buildingId);
    if (!building) return [];

    return building.rooms
      .filter((room) => 
        room.name.toLowerCase().includes(searchTerm) || 
        room.id === searchTerm ||
        room.name.toLowerCase().startsWith(searchTerm)
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  const hasBuildings = Object.keys(BUILDINGS).length > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">UC Davis Room Finder</h1>
      <p className="text-zinc-400 mb-6">Find available rooms near you on campus</p>

      {!hasBuildings && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-yellow-200">Building coordinates not yet configured. Please add building data.</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Your Location</label>
            {location ? (
              <p className="text-green-400 text-sm">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            ) : locationError ? (
              <p className="text-red-400 text-sm">{locationError}</p>
            ) : (
              <p className="text-zinc-500 text-sm">Requesting...</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm"
            />
          </div>

          <button
            onClick={searchRooms}
            disabled={!location || loading || !hasBuildings}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            {loading ? "Searching..." : "Find Rooms"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((building) => {
            const [hourStr] = selectedTime.split(":");
            const currentHour = parseInt(hourStr);
            return (
              <div key={building.buildingId} className="bg-zinc-900 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-semibold">{building.buildingName}</h2>
                    <p className="text-zinc-400 text-sm">{formatDistance(building.distance)} away</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      building.availableNow.length > 0 ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {building.availableNow.length} available
                  </span>
                </div>

                {building.error ? (
                  <p className="text-red-400 text-sm">{building.error}</p>
                ) : (
                  <>
                    {building.availableNow.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {building.availableNow.slice(0, 8).map(({ room, status }) => {
                          return (
                            <div
                              key={room.id}
                              className={`rounded px-3 py-2 text-sm cursor-pointer transition-colors ${
                                status.status === "soon" 
                                  ? "bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-900/50" 
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                              onClick={() => setRoomDetailPopup({ buildingName: building.buildingName, room })}
                            >
                              <p className="font-medium">{room.name}</p>
                              {room.capacity && <p className="text-zinc-400 text-xs">Capacity: {room.capacity}</p>}
                              <p className={`text-xs mt-1 ${
                                status.status === "soon" ? "text-yellow-500 font-medium" : "text-green-400"
                              }`}>
                                {status.message}
                              </p>
                            </div>
                          );
                        })}
                        {building.availableNow.length > 8 && (
                          <div className="bg-zinc-800 rounded px-3 py-2 text-sm text-zinc-400">
                            +{building.availableNow.length - 8} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-zinc-500 text-sm mb-4">No rooms available for the selected time</p>
                    )}

                    <div className="border-t border-zinc-800 pt-4">
                      <p className="text-xs text-zinc-500 mb-2">Search for a specific room in {building.buildingName}:</p>
                      <div className="relative flex gap-2">
                        <div className="flex-1 relative autocomplete-container">
                          <input
                            type="text"
                            placeholder="Room number or name..."
                            value={roomSearchInputs[building.buildingId] || ""}
                            onChange={(e) => {
                              setRoomSearchInputs({ ...roomSearchInputs, [building.buildingId]: e.target.value });
                              setOpenAutocomplete(building.buildingId);
                            }}
                            onFocus={() => {
                              if (roomSearchInputs[building.buildingId]) {
                                setOpenAutocomplete(building.buildingId);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRoomSearch(building.buildingId, building.buildingName);
                              } else if (e.key === "Escape") {
                                setOpenAutocomplete(null);
                              }
                            }}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
                          />
                          {openAutocomplete === building.buildingId && getFilteredRooms(building.buildingId).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {getFilteredRooms(building.buildingId).map((room) => (
                                <button
                                  key={room.id}
                                  onClick={() => handleRoomSearch(building.buildingId, building.buildingName, room)}
                                  className="w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors flex justify-between items-center"
                                >
                                  <div>
                                    <p className="text-sm font-medium">{room.name}</p>
                                    {room.capacity && (
                                      <p className="text-xs text-zinc-400">Capacity: {room.capacity}</p>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRoomSearch(building.buildingId, building.buildingName)}
                          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded px-4 py-1.5 text-sm transition-colors"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && location && hasBuildings && (
        <p className="text-zinc-500 text-center py-8">Click "Find Rooms" to search for available spaces</p>
      )}

      {/* Room Detail Popup */}
      {roomDetailPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setRoomDetailPopup(null)}
        >
          <div
            className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{roomDetailPopup.room.name}</h2>
                <p className="text-zinc-400">{roomDetailPopup.buildingName}</p>
                {roomDetailPopup.room.capacity && (
                  <p className="text-zinc-400 text-sm">Capacity: {roomDetailPopup.room.capacity}</p>
                )}
              </div>
              <button
                onClick={() => setRoomDetailPopup(null)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-3">Today's Availability</h3>
              <p className="text-xs text-zinc-400 mb-2 flex gap-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/50 rounded-sm"></span> Occupied</span>
              </p>
              <div className="grid grid-cols-1 gap-1">
                {roomDetailPopup.room.availability.map((slot) => (
                  <div
                    key={slot.hour}
                    className="flex items-center px-4 py-2 rounded bg-zinc-800"
                  >
                    <span className="font-medium w-20 text-sm">{formatTime(slot.hour)}</span>
                    <div className="flex-1 flex gap-1 h-6">
                      {slot.quarters.map((isFree, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-opacity hover:opacity-80 ${
                            isFree ? "bg-green-500" : "bg-red-500/50"
                          }`}
                          title={`${formatTime(slot.hour, i * 15)} - ${isFree ? "Available" : "Occupied"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
