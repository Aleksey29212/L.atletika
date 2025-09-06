export type Distance = '500m' | '1000m';

export interface Result {
  id: string;
  participantId: string;
  distance: Distance;
  time: string; // "MM:SS.ss" e.g., "01:30.12"
  points: number;
}

export const Genders = ['Male', 'Female'] as const;
export type Gender = (typeof Genders)[number];

export const Categories = ['Младшая', 'Средняя', 'Старшая'] as const;
export type Category = (typeof Categories)[number];

export interface Participant {
  id: string;
  name: string;
  team: string;
  gender: Gender;
  category: Category;
  result: Result | null; // Changed from results: Result[]
}

export interface Team {
  name: string;
  totalPoints: number;
  members: (Participant & { bestTimeString?: string; points?: number })[];
}
