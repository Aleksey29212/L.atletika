'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Result, Gender, Category } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type LeaderboardEntry = {
  rank: number;
  participant: Participant;
  score: number;
  time?: string;
};

const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Category</TableHead>
          {entries[0]?.time && <TableHead>Time</TableHead>}
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length > 0 ? (
          entries.map(({ rank, participant, score, time }) => (
            <TableRow key={participant.id}>
              <TableCell className="font-bold text-lg">{rank}</TableCell>
              <TableCell className="font-medium">{participant.name}</TableCell>
              <TableCell>{participant.team}</TableCell>
              <TableCell>{participant.gender}</TableCell>
              <TableCell>{participant.category}</TableCell>
              {time && <TableCell>{time}</TableCell>}
              <TableCell className="text-right font-semibold">{score}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No results to display.
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

  const overallLeaderboard = useMemo<LeaderboardEntry[]>(() => {
    return filteredParticipants
      .map(p => ({
        participant: p,
        score: p.results.reduce((sum, r) => sum + r.score, 0),
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({ ...p, rank: index + 1 }));
  }, [filteredParticipants]);

  const distanceLeaderboard = (distance: '500m' | '1000m' | '1500m') => {
    return filteredParticipants
      .flatMap(p => p.results.filter(r => r.distance === distance).map(r => ({ ...r, participant: p })))
      .sort((a, b) => b.score - a.score)
      .map((r, index) => ({
        rank: index + 1,
        participant: r.participant,
        score: r.score,
        time: r.time,
      }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
            <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value as Gender | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genders</SelectItem>
                {Genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Category | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {Categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <Tabs defaultValue="overall" className="w-full">
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="500m">500m</TabsTrigger>
            <TabsTrigger value="1000m">1000m</TabsTrigger>
            <TabsTrigger value="1500m">1500m</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="mt-4">
            <LeaderboardTable entries={overallLeaderboard} />
          </TabsContent>
          <TabsContent value="500m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard('500m')} />
          </TabsContent>
          <TabsContent value="1000m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard('1000m')} />
          </TabsContent>
           <TabsContent value="1500m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard('1500m')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
