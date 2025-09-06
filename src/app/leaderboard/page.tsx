'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Gender, Category, Distance, Result } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type LeaderboardEntry = {
  rank: number;
  participant: Participant;
  totalPoints: number;
  bestResults: { [key in Distance]?: { time: string; points: number } };
};

const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Ранг</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Команда</TableHead>
          <TableHead>Очки (500м)</TableHead>
          <TableHead>Очки (1000м)</TableHead>
          <TableHead className="text-right">Всего очков</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map(({ rank, participant, totalPoints, bestResults }) => (
            <TableRow key={participant.id}>
              <TableCell className="font-bold text-lg">{rank}</TableCell>
              <TableCell className="font-medium">{participant.name}</TableCell>
              <TableCell>{participant.team}</TableCell>
              <TableCell>{bestResults['500m']?.points.toFixed(2) ?? '–'}</TableCell>
              <TableCell>{bestResults['1000m']?.points.toFixed(2) ?? '–'}</TableCell>
              <TableCell className="text-right font-semibold">{totalPoints.toFixed(2)}</TableCell>
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

  const leaderboardEntries = useMemo((): LeaderboardEntry[] => {
    const filteredParticipants = participants.filter(p => 
      (genderFilter === 'All' || p.gender === genderFilter) &&
      (categoryFilter === 'All' || p.category === categoryFilter)
    );

    return filteredParticipants
      .map(p => {
        const best500m = p.results
          .filter(r => r.distance === '500m')
          .sort((a, b) => b.points - a.points)[0];
        
        const best1000m = p.results
          .filter(r => r.distance === '1000m')
          .sort((a, b) => b.points - a.points)[0];

        const totalPoints = (best500m?.points || 0) + (best1000m?.points || 0);
        
        return {
          participant: p,
          totalPoints,
          bestResults: {
            '500m': best500m,
            '1000m': best1000m,
          },
        };
      })
      .filter(entry => entry.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [participants, genderFilter, categoryFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Личные рейтинги</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
            <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as Gender | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по полу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все</SelectItem>
                {Genders.map(g => <SelectItem key={g} value={g}>{g === 'Male' ? 'Мужской' : 'Женский'}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Category | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Все категории</SelectItem>
                {Categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <LeaderboardTable entries={leaderboardEntries} />
      </CardContent>
    </Card>
  );
}
