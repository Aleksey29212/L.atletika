import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

export function calculateScore(distance: '500m' | '1000m', time: string): number {
  const seconds = timeToSeconds(time);
  if (seconds === 0) return 0;

  if (distance === '500m') {
    if (seconds < 90) return 100;
    if (seconds <= 105) return 80;
    if (seconds <= 120) return 60;
    return 40;
  } else { // 1000m
    if (seconds < 180) return 100;
    if (seconds <= 210) return 80;
    if (seconds <= 240) return 60;
    return 40;
  }
}
