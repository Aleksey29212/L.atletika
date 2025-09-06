'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Gender, Category, Distance } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeToSeconds } from '@/lib/utils';

type LeaderboardEntry = {
  rank: number;
  participant: Participant;
  time: string;
};

const LeaderboardTable = ({ entries, distance }: { entries: LeaderboardEntry[]; distance: Distance | 'Overall' }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Ранг</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Команда</TableHead>
          <TableHead>Пол</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Лучшее время ({distance})</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map(({ rank, participant, time }) => (
            <TableRow key={participant.id}>
              <TableCell className="font-bold text-lg">{rank}</TableCell>
              <TableCell className="font-medium">{participant.name}</TableCell>
              <TableCell>{participant.team}</TableCell>
              <TableCell>{participant.gender}</TableCell>
              <TableCell>{participant.category}</TableCell>
              <TableCell className="font-semibold">{time}</TableCell>
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

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => 
      (genderFilter === 'All' || p.gender === genderFilter) &&
      (categoryFilter === 'All' || p.category === categoryFilter)
    );
  }, [participants, genderFilter, categoryFilter]);
  
  const getBestTime = (participant: Participant, distance: Distance) => {
    const bestResult = participant.results
      .filter(r => r.distance === distance)
      .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))[0];
    return bestResult ? bestResult.time : null;
  };
  
  const distanceLeaderboard = (distance: Distance): LeaderboardEntry[] => {
    return filteredParticipants
      .map(p => ({
        participant: p,
        time: getBestTime(p, distance),
      }))
      .filter((entry): entry is { participant: Participant; time: string } => entry.time !== null)
      .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))
      .map((p, index) => ({ ...p, rank: index + 1 }));
  };

  const overallLeaderboard = useMemo((): LeaderboardEntry[] => {
     // For "Overall", we just show the 1000m leaderboard as a default.
     // A true "overall" score is not well-defined with just time.
    return distanceLeaderboard('1000m');
  }, [filteredParticipants]);

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
        <Tabs defaultValue="1000m" className="w-full">
          <TabsList>
            <TabsTrigger value="500m">500м</TabsTrigger>
            <TabsTrigger value="1000m">1000м</TabsTrigger>
          </TabsList>
          <TabsContent value="500m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard('500m')} distance="500m" />
          </TabsContent>
          <TabsContent value="1000m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard('1000m')} distance="1000m"/>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
