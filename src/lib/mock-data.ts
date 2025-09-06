import type { Participant } from './types';
import { calculateScore } from './utils';

const generateResults = (participantId: string) => {
  const results = [];
  const r1_500_time = `01:${Math.floor(Math.random() * 20) + 35}.${Math.floor(Math.random() * 999)}`.padStart(9, '01:35.000');
  results.push({
    id: `${participantId}-1`,
    participantId,
    distance: '500m' as const,
    time: r1_500_time,
    score: calculateScore('500m', r1_500_time),
  });
  
  const r1_1000_time = `03:${Math.floor(Math.random() * 30) + 10}.${Math.floor(Math.random() * 999)}`.padStart(9, '03:10.000');
  results.push({
    id: `${participantId}-2`,
    participantId,
    distance: '1000m' as const,
    time: r1_1000_time,
    score: calculateScore('1000m', r1_1000_time),
  });

  return results;
};


export const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    team: 'Eagles',
    gender: 'Female',
    category: 'Senior',
    results: generateResults('1'),
  },
  {
    id: '2',
    name: 'Bob Smith',
    team: 'Lions',
    gender: 'Male',
    category: 'U20',
    results: generateResults('2'),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    team: 'Eagles',
    gender: 'Male',
    category: 'Senior',
    results: generateResults('3'),
  },
  {
    id: '4',
    name: 'Diana Prince',
    team: 'Tigers',
    gender: 'Female',
    category: 'U20',
    results: generateResults('4'),
  },
    {
    id: '5',
    name: 'Ethan Hunt',
    team: 'Lions',
    gender: 'Male',
    category: 'Masters',
    results: generateResults('5'),
  },
  {
    id: '6',
    name: 'Fiona Glenanne',
    team: 'Tigers',
    gender: 'Female',
    category: 'Senior',
    results: [],
  },
];
