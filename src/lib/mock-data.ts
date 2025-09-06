import type { Participant, Result, Gender, Category } from './types';
import { Categories } from './types';

const MALE_NAMES = ['Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Иван', 'Михаил', 'Никита', 'Егор'];
const FEMALE_NAMES = ['Анастасия', 'Мария', 'Анна', 'Екатерина', 'София', 'Дарья', 'Виктория', 'Полина', 'Арина', 'Елизавета'];
const LAST_NAMES = ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Федоров', 'Морозов', 'Волков'];

const generateSchoolName = () => {
  const type = Math.random() > 0.3 ? 'СОШ' : 'Гимназия';
  const number = Math.floor(Math.random() * 150) + 1;
  return `${type} №${number}`;
};

const SCHOOLS = Array.from({ length: 100 }, generateSchoolName);

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateTime = (distance: '500m' | '1000m'): string => {
  if (distance === '500m') {
    // 01:30.00 to 02:15.00
    const seconds = Math.floor(Math.random() * 45) + 90;
    const hundredths = Math.floor(Math.random() * 100);
    const totalSeconds = seconds + hundredths / 100;
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
  } else { // 1000m
    // 03:10.00 to 04:30.00
    const seconds = Math.floor(Math.random() * 80) + 190;
    const hundredths = Math.floor(Math.random() * 100);
    const totalSeconds = seconds + hundredths / 100;
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
  }
};

const generateResults = (participantId: string, gender: Gender): Result[] => {
  const results: Omit<Result, 'id' | 'participantId' | 'points'>[] = [];
  
  // All participants have at least one 500m result
  results.push({
    distance: '500m',
    time: generateTime('500m'),
  });

  // Males also have a 1000m result
  if (gender === 'Male') {
    results.push({
      distance: '1000m',
      time: generateTime('1000m'),
    });
  }

  // Some participants have a second 500m result
  if (Math.random() > 0.5) {
     results.push({
      distance: '500m',
      time: generateTime('500m'),
    });
  }
  
  return results.map((r, index) => ({
    ...r,
    id: `${participantId}-${index + 1}`,
    participantId,
    points: 0 // Points will be calculated in the provider
  }));
};

const generateParticipants = (count: number): Participant[] => {
  const participants: Participant[] = [];
  for (let i = 1; i <= count; i++) {
    const gender: Gender = Math.random() > 0.5 ? 'Male' : 'Female';
    const firstName = gender === 'Male' ? getRandomItem(MALE_NAMES) : getRandomItem(FEMALE_NAMES);
    const lastName = getRandomItem(LAST_NAMES) + (gender === 'Female' ? 'а' : '');
    const category = getRandomItem(Categories);
    
    const participantId = i.toString();
    
    participants.push({
      id: participantId,
      name: `${firstName} ${lastName}`,
      team: getRandomItem(SCHOOLS),
      gender,
      category,
      results: generateResults(participantId, gender),
    });
  }
  return participants;
};

export const MOCK_PARTICIPANTS: Participant[] = generateParticipants(600);
