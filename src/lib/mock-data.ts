import type { Participant } from './types';

const generateResults = (participantId: string) => {
  const results = [];
  const r1_500_time = `01:${(Math.floor(Math.random() * 20) + 35).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  results.push({
    id: `${participantId}-1`,
    participantId,
    distance: '500m' as const,
    time: r1_500_time,
  });
  
  const r1_1000_time = `03:${(Math.floor(Math.random() * 30) + 10).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
  results.push({
    id: `${participantId}-2`,
    participantId,
    distance: '1000m' as const,
    time: r1_1000_time,
  });

  return results;
};


export const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Alice Johnson', team: 'Eagles', gender: 'Female', category: 'Senior', results: generateResults('1') },
  { id: '2', name: 'Bob Smith', team: 'Lions', gender: 'Male', category: 'U20', results: generateResults('2') },
  { id: '3', name: 'Charlie Brown', team: 'Eagles', gender: 'Male', category: 'Senior', results: generateResults('3') },
  { id: '4', name: 'Diana Prince', team: 'Tigers', gender: 'Female', category: 'U20', results: generateResults('4') },
  { id: '5', name: 'Ethan Hunt', team: 'Lions', gender: 'Male', category: 'Masters', results: generateResults('5') },
  { id: '6', name: 'Fiona Glenanne', team: 'Tigers', gender: 'Female', category: 'Senior', results: generateResults('6') },
  { id: '7', name: 'George Costanza', team: 'Vipers', gender: 'Male', category: 'Senior', results: generateResults('7') },
  { id: '8', name: 'Helen Troy', team: 'Vipers', gender: 'Female', category: 'U20', results: generateResults('8') },
  { id: '9', name: 'Ian Malcolm', team: 'Raptors', gender: 'Male', category: 'Masters', results: generateResults('9') },
  { id: '10', name: 'Jane Eyre', team: 'Raptors', gender: 'Female', category: 'Senior', results: generateResults('10') },
  { id: '11', name: 'Kyle Reese', team: 'Eagles', gender: 'Male', category: 'Senior', results: generateResults('11') },
  { id: '12', name: 'Lara Croft', team: 'Eagles', gender: 'Female', category: 'Senior', results: generateResults('12') },
  { id: '13', name: 'Michael Scott', team: 'Bears', gender: 'Male', category: 'Senior', results: generateResults('13') },
  { id: '14', name: 'Nancy Drew', team: 'Bears', gender: 'Female', category: 'Senior', results: generateResults('14') },
  { id: '15', name: 'Oscar Wilde', team: 'Lions', gender: 'Male', category: 'U20', results: generateResults('15') },
  { id: '16', name: 'Pamela Beesly', team: 'Lions', gender: 'Female', category: 'U20', results: generateResults('16') },
  { id: '17', name: 'Quentin Coldwater', team: 'Tigers', gender: 'Male', category: 'Senior', results: generateResults('17') },
  { id: '18', name: 'Rachel Green', team: 'Tigers', gender: 'Female', category: 'Senior', results: generateResults('18') },
  { id: '19', name: 'Steve Rogers', team: 'Vipers', gender: 'Male', category: 'Senior', results: generateResults('19') },
  { id: '20', name: 'Trinity', team: 'Vipers', gender: 'Female', category: 'Senior', results: generateResults('20') },
  { id: '21', name: 'Ulysses Everett McGill', team: 'Raptors', gender: 'Male', category: 'Masters', results: generateResults('21') },
  { id: '22', name: 'Veronica Mars', team: 'Raptors', gender: 'Female', category: 'U20', results: generateResults('22') },
  { id: '23', name: 'Walter White', team: 'Bears', gender: 'Male', category: 'Masters', results: generateResults('23') },
  { id: '24', name: 'Xena', team: 'Bears', gender: 'Female', category: 'Masters', results: generateResults('24') },
  { id: '25', name: 'Yoda', team: 'Eagles', gender: 'Male', category: 'Masters', results: generateResults('25') },
  { id: '26', name: 'Zelda', team: 'Eagles', gender: 'Female', category: 'Masters', results: generateResults('26') },
];
