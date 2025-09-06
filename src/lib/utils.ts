import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Distance } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeToSeconds(time: string): number {
  if (!time || !time.includes(':')) return Infinity;
  const parts = time.split(':');
  const minutes = parseInt(parts[0], 10);
  const seconds = parseFloat(parts[1]);
  if (isNaN(minutes) || isNaN(seconds)) return Infinity;
  return minutes * 60 + seconds;
}

export function secondsToTime(seconds: number): string {
  if (seconds === Infinity || isNaN(seconds)) return 'N/A';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
}

const scoreConfig = {
  '500m': { gold: timeToSeconds('01:30.00'), base: timeToSeconds('02:15.00') },
  '1000m': { gold: timeToSeconds('03:10.00'), base: timeToSeconds('04:30.00') },
};

export function calculateScore(distance: Distance, time: string): number {
  const timeInSeconds = timeToSeconds(time);
  const config = scoreConfig[distance];

  if (timeInSeconds >= config.base) return 0;
  if (timeInSeconds <= config.gold) return 100;

  const score = ((config.base - timeInSeconds) / (config.base - config.gold)) * 100;
  
  return Math.round(score);
}
