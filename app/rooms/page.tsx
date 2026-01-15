"use client";

import { useState, useEffect, useCallback } from "react";

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
}

interface Room {
  id: string;
  name: string;
  capacity: number | null;
  availability: TimeSlot[];
}

interface BuildingResult {
  buildingId: string;
  buildingName: string;
  distance: number;
  rooms: Room[];
  availableNow: Room[];
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

export default function RoomsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BuildingResult[]>([]);
  const [hoursAhead, setHoursAhead] = useState(2);
  const [maxDistance, setMaxDistance] = useState(1000); // meters
  const [excludeOutdoor, setExcludeOutdoor] = useState(true);

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

  const searchRooms = async () => {
    if (!location) return;

    setLoading(true);
    const currentHour = getCurrentHour();
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

        // Filter rooms that are available for the next N hours
        const availableNow = rooms.filter((room) => {
          // Exclude outdoor/lobby spaces if checkbox is checked
          if (excludeOutdoor) {
            const nameLower = room.name.toLowerCase();
            if (OUTDOOR_KEYWORDS.some((kw) => nameLower.includes(kw))) {
              return false;
            }
          }

          for (let h = currentHour; h < currentHour + hoursAhead && h <= 23; h++) {
            const slot = room.availability.find((s) => s.hour === h);
            if (!slot?.available) return false;
          }
          return true;
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

      <div className="bg-zinc-900 rounded-lg p-4 mb-6 space-y-4">
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
            <label className="block text-sm text-zinc-400 mb-1">Max Distance</label>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm"
            >
              <option value={300}>300m</option>
              <option value={500}>500m</option>
              <option value={1000}>1km</option>
              <option value={2000}>2km</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Free for next</label>
            <select
              value={hoursAhead}
              onChange={(e) => setHoursAhead(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm"
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
            </select>
          </div>

          <button
            onClick={searchRooms}
            disabled={!location || loading || !hasBuildings}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            {loading ? "Searching..." : "Find Rooms"}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeOutdoor}
            onChange={(e) => setExcludeOutdoor(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500"
          />
          Exclude outdoor spaces (lobbies, patios, lawns, etc.)
        </label>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((building) => (
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
              ) : building.availableNow.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {building.availableNow.slice(0, 8).map((room) => (
                    <div key={room.id} className="bg-zinc-800 rounded px-3 py-2 text-sm">
                      <p className="font-medium">{room.name}</p>
                      {room.capacity && <p className="text-zinc-400 text-xs">Capacity: {room.capacity}</p>}
                    </div>
                  ))}
                  {building.availableNow.length > 8 && (
                    <div className="bg-zinc-800 rounded px-3 py-2 text-sm text-zinc-400">
                      +{building.availableNow.length - 8} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No rooms available for the selected time</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && location && hasBuildings && (
        <p className="text-zinc-500 text-center py-8">Click "Find Rooms" to search for available spaces</p>
      )}
    </div>
  );
}
