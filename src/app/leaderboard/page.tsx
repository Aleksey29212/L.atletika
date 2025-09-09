'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Gender, Category, Distance } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardEntry = {
  rank: number;
  participant: Participant;
};

const getRankClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-400/10 dark:bg-yellow-400/10';
    case 2:
      return 'bg-gray-400/10 dark:bg-gray-400/10';
    case 3:
      return 'bg-orange-500/10 dark:bg-orange-500/10';
    default:
      return '';
  }
};

const getMedal = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-500" />;
    case 3:
      return <Medal className="h-5 w-5 text-orange-600" />;
    default:
      return null;
  }
}

const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Ранг</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Команда</TableHead>
          <TableHead>Дистанция</TableHead>
          <TableHead>Время</TableHead>
          <TableHead className="text-right">Очки</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map(({ rank, participant }) => (
            <TableRow key={participant.id} className={cn(getRankClass(rank))}>
              <TableCell className="font-bold text-lg">
                <div className="flex items-center gap-2">
                  {getMedal(rank)}
                  <span>{rank}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{participant.name}</TableCell>
              <TableCell>{participant.team}</TableCell>
              <TableCell>
                 <Badge variant="secondary">{participant.result!.distance}</Badge>
              </TableCell>
              <TableCell className="font-mono">{participant.result!.time}</TableCell>
              <TableCell className="text-right font-semibold">{participant.result!.points.toFixed(2)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              Нет результатов для отображения.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default function LeaderboardPage() {
  const { participants } = useData();
  const [genderFilter, setGenderFilter] = useState<Gender | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [distanceFilter, setDistanceFilter] = useState<Distance | 'All'>('All');


  const leaderboardEntries = useMemo((): LeaderboardEntry[] => {
    return participants
      .filter(p => p.result) 
      .filter(p => 
        (genderFilter === 'All' || p.gender === genderFilter) &&
        (categoryFilter === 'All' || p.category === categoryFilter) &&
        (distanceFilter === 'All' || p.result!.distance === distanceFilter)
      )
      .sort((a, b) => b.result!.points - a.result!.points)
      .map((entry, index) => ({ rank: index + 1, participant: entry }));
  }, [participants, genderFilter, categoryFilter, distanceFilter]);
  
  const availableDistances = useMemo(() => {
    const distances = new Set<Distance>();
    participants.forEach(p => {
      if (p.result) distances.add(p.result.distance);
    });
    return Array.from(distances).sort();
  }, [participants]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Личные рейтинги</CardTitle>
        <CardDescription>
          Таблица лидеров участников, отсортированная по их баллам. Используйте фильтры для уточнения результатов.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4">
            <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as Gender | 'All')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Фильтр по полу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                {Genders.map(g => <SelectItem key={g} value={g}>{g === 'Male' ? 'Мужской' : 'Женский'}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Category | 'All')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Фильтр по категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все категории</SelectItem>
                {Categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={distanceFilter} onValueChange={(value) => setDistanceFilter(value as Distance | 'All')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Фильтр по дистанции" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все дистанции</SelectItem>
                {availableDistances.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <LeaderboardTable entries={leaderboardEntries} />
      </CardContent>
    </Card>
  );
}
