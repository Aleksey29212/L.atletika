export interface Result {
  id: string;
  participantId: string;
  distance: '500m' | '1000m';
  time: string; // "MM:SS.ms" e.g., "01:30.123"
  score: number;
}

export const Genders = ['Male', 'Female'] as const;
export type Gender = typeof Genders[number];

export const Categories = ['U18', 'U20', 'Senior', 'Masters'] as const;
export type Category = typeof Categories[number];

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
  totalScore: number;
  members: Participant[];
}
