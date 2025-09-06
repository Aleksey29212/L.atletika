import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Distance } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeToSeconds(time: string): number {
  if (!time || !time.includes(':')) return 0;
  const parts = time.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const secondsAndMs = parseFloat(parts[1]) || 0;
  return minutes * 60 + secondsAndMs;
}

export function secondsToTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
}

// Scoring parameters for each distance
const scoreParams = {
  '500m': { bestTime: 90, baseTime: 125, maxPoints: 100 },
  '1000m': { bestTime: 180, baseTime: 250, maxPoints: 100 },
  '1500m': { bestTime: 270, baseTime: 360, maxPoints: 100 },
};

/**
 * Calculates the score for a given distance and time using linear interpolation.
 * The faster the time, the higher the score.
 * @param distance The race distance ('500m', '1000m' or '1500m').
 * @param time The time achieved in "MM:SS.ms" format.
 * @returns The calculated score, rounded to the nearest integer.
 */
export function calculateScore(distance: Distance, time: string): number {
  const seconds = timeToSeconds(time);
  if (seconds === 0) return 0;

  const params = scoreParams[distance];
  if (!params) return 0;

  const { bestTime, baseTime, maxPoints } = params;

  // If time is better than or equal to the best possible time, award max points
  if (seconds <= bestTime) {
    return maxPoints;
  }
  
  // If time is worse than or equal to the base time, award 0 points
  if (seconds >= baseTime) {
    return 0;
  }

  // Linear interpolation: score = maxPoints * (baseTime - seconds) / (baseTime - bestTime)
  const score = maxPoints * ((baseTime - seconds) / (baseTime - bestTime));
  
  return Math.round(score);
}
