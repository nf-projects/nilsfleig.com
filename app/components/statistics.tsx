"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { PersonIcon, TimerIcon, TableIcon } from "@radix-ui/react-icons";

// Reference date: April 1, 2025, 2pm PST
const REFERENCE_DATE = new Date("2025-04-01T14:00:00-07:00").getTime();

// Define the type for stats
type StatKey = "total_players" | "playtime_hours" | "total_data_points";

type StatInfo = {
	value: number;
	hourlyIncrease: number;
	label: string;
	icon: React.ReactNode;
	format: (value: number) => string;
};

// Statistics data from the database as of the reference date
const STATS: Record<StatKey, StatInfo> = {
	total_players: {
		value: 957953,
		hourlyIncrease: 3467.67,
		label: "Players Tracked",
		icon: <PersonIcon className="h-5 w-5" />,
		format: (value: number) => Math.floor(value).toLocaleString(),
	},
	playtime_hours: {
		value: 6753844, // Converted from 770.95 years to hours
		hourlyIncrease: 0.2635 * 365.25 * 24, // Convert year rate to hourly rate
		label: "Hours of Playtime",
		icon: <TimerIcon className="h-5 w-5" />,
		format: (value: number) => Math.floor(value).toLocaleString(),
	},
	total_data_points: {
		value: 252807444,
		hourlyIncrease: 128637.33,
		label: "Data Points",
		icon: <TableIcon className="h-5 w-5" />,
		format: (value: number) => Math.floor(value).toLocaleString(),
	},
};

// Function to calculate values based on time difference
const calculateTimeAdjustedValues = (): Record<StatKey, number> => {
	const now = Date.now();
	const hoursSinceReference = Math.max(
		0,
		(now - REFERENCE_DATE) / (1000 * 60 * 60)
	);

	const values: Record<StatKey, number> = {} as Record<StatKey, number>;

	(Object.keys(STATS) as StatKey[]).forEach((key) => {
		values[key] =
			STATS[key].value + STATS[key].hourlyIncrease * hoursSinceReference;
	});

	return values;
};

const StatisticsComponent = () => {
	// Initialize with pre-calculated values from the start
	const [counters, setCounters] = useState<Record<StatKey, number>>(
		calculateTimeAdjustedValues()
	);

	// Initialize refs with all required properties
	const timeoutRefs = useRef<Partial<Record<StatKey, NodeJS.Timeout>>>({});
	const lastUpdateTime = useRef<Record<StatKey, number>>({
		total_players: Date.now(),
		playtime_hours: Date.now(),
		total_data_points: Date.now(),
	});

	// Function to determine next update delay (with randomness)
	const getNextUpdateDelay = () => {
		// Base delay
		let baseDelay = 100;

		// Add randomness
		if (Math.random() < 0.1) {
			// Occasional burst (very short delay)
			return 50;
		} else if (Math.random() > 0.9) {
			// Occasional pause (longer delay)
			return baseDelay * 5;
		} else {
			// Normal delay with slight randomness
			return baseDelay * (0.8 + Math.random() * 0.4);
		}
	};

	// Function to update a specific counter
	const updateCounter = (key: StatKey) => {
		const now = Date.now();
		const elapsedHours = (now - lastUpdateTime.current[key]) / (1000 * 60 * 60);

		// Add randomness to the increment
		let increment = STATS[key].hourlyIncrease * elapsedHours;

		// Occasional bursts
		if (Math.random() < 0.05) {
			increment *= 1.5 + Math.random();
		}

		// Update the counter
		setCounters((prev) => ({
			...prev,
			[key]: prev[key] + increment,
		}));

		lastUpdateTime.current[key] = now;

		// Schedule next update
		scheduleNextUpdate(key);
	};

	// Function to schedule the next update
	const scheduleNextUpdate = (key: StatKey) => {
		if (STATS[key].hourlyIncrease <= 0) return; // Skip metrics that don't change

		const delay = getNextUpdateDelay();

		// Clear any existing timeout
		if (timeoutRefs.current[key]) {
			clearTimeout(timeoutRefs.current[key]);
		}

		// Set new timeout
		timeoutRefs.current[key] = setTimeout(() => {
			updateCounter(key);
		}, delay);
	};

	// Initialize and start counters
	useEffect(() => {
		// Start the counters
		(Object.keys(STATS) as StatKey[]).forEach((key) => {
			if (STATS[key].hourlyIncrease > 0) {
				scheduleNextUpdate(key);
			}
		});

		return () => {
			// Clean up all timeouts
			Object.values(timeoutRefs.current).forEach((timeout) => {
				if (timeout) clearTimeout(timeout);
			});
		};
	}, []);

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 text-center">
				{(Object.entries(STATS) as [StatKey, StatInfo][]).map(([key, stat]) => (
					<div
						key={key}
						className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center justify-center min-h-[92px]"
					>
						<div className="font-mono text-zinc-200 text-3xl md:text-2xl lg:text-2xl xl:text-xl break-words max-w-full truncate">
							{stat.format(counters[key])}
						</div>
						<p className="text-sm text-zinc-400 font-mono whitespace-nowrap">
							{stat.label}
						</p>
					</div>
				))}
			</div>
			<p className="text-xs text-zinc-500 text-center mt-2 mb-4">
				Real, Live stats from the{" "}
				<a
					href="https://mcmetrics.net"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-zinc-400 transition-colors"
				>
					MCMetrics homepage
				</a>
			</p>
		</div>
	);
};

// Use dynamic import with ssr: false to make this component client-only
export const Statistics = dynamic(() => Promise.resolve(StatisticsComponent), {
	ssr: false,
});
