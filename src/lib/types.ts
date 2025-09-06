export type Distance = '500m' | '1000m';

export interface Result {
  id: string;
  participantId: string;
  distance: Distance;
  time: string; // "MM:SS.ss" e.g., "01:30.12"
}

export const Genders = ['Male', 'Female'] as const;
export type Gender = (typeof Genders)[number];

export const Categories = ['U18', 'U20', 'Senior', 'Masters'] as const;
export type Category = (typeof Categories)[number];

export interface Participant {
  id: string;
  name: string;
  team: string;
  gender: Gender;
  category: Category;
  results: Result[];
}

export interface Team {
  name: string;
  totalTime: number; // in seconds
  totalTimeString: string;
  members: Participant[];
}