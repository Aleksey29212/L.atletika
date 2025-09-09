import type { Participant, Result, Gender, Category, Distance } from './types';
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

const generateResult = (participantId: string, gender: Gender): Result | null => {
  if (Math.random() < 0.1) {
    return null;
  }
  
  let distance: Distance;
  if (gender === 'Female') {
    distance = '500m';
  } else {
    distance = Math.random() > 0.5 ? '1000m' : '500m';
  }
  
  return {
    id: `${participantId}-result`,
    participantId,
    distance,
    time: generateTime(distance),
    points: 0
  };
};

export const generateParticipants = (maleCount: number, femaleCount: number): Participant[] => {
  const participants: Participant[] = [];
  let idCounter = 1;

  // Generate males
  for (let i = 0; i < maleCount; i++) {
    const gender: Gender = 'Male';
    const firstName = getRandomItem(MALE_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const category = getRandomItem(Categories);
    const participantId = (idCounter++).toString();
    
    participants.push({
      id: participantId,
      name: `${firstName} ${lastName}`,
      team: getRandomItem(SCHOOLS),
      gender,
      category,
      result: generateResult(participantId, gender),
    });
  }

  // Generate females
  for (let i = 0; i < femaleCount; i++) {
    const gender: Gender = 'Female';
    const firstName = getRandomItem(FEMALE_NAMES);
    const lastName = getRandomItem(LAST_NAMES) + 'а';
    const category = getRandomItem(Categories);
    const participantId = (idCounter++).toString();
    
    participants.push({
      id: participantId,
      name: `${firstName} ${lastName}`,
      team: getRandomItem(SCHOOLS),
      gender,
      category,
      result: generateResult(participantId, gender),
    });
  }

  return participants;
};
