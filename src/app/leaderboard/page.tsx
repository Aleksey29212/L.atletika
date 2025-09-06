'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Result } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
              {time && <TableCell>{time}</TableCell>}
              <TableCell className="text-right font-semibold">{score}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
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

  const overallLeaderboard = useMemo<LeaderboardEntry[]>(() => {
    return participants
      .map(p => ({
        participant: p,
        score: p.results.reduce((sum, r) => sum + r.score, 0),
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({ ...p, rank: index + 1 }));
  }, [participants]);

  const distanceLeaderboard500 = useMemo<LeaderboardEntry[]>(() => {
    return participants
      .flatMap(p => p.results.filter(r => r.distance === '500m').map(r => ({ ...r, participant: p })))
      .sort((a, b) => b.score - a.score)
      .map((r, index) => ({
        rank: index + 1,
        participant: r.participant,
        score: r.score,
        time: r.time,
      }));
  }, [participants]);

  const distanceLeaderboard1000 = useMemo<LeaderboardEntry[]>(() => {
    return participants
      .flatMap(p => p.results.filter(r => r.distance === '1000m').map(r => ({ ...r, participant: p })))
      .sort((a, b) => b.score - a.score)
      .map((r, index) => ({
        rank: index + 1,
        participant: r.participant,
        score: r.score,
        time: r.time,
      }));
  }, [participants]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall" className="w-full">
          <TabsList>
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="500m">500m</TabsTrigger>
            <TabsTrigger value="1000m">1000m</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" className="mt-4">
            <LeaderboardTable entries={overallLeaderboard} />
          </TabsContent>
          <TabsContent value="500m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard500} />
          </TabsContent>
          <TabsContent value="1000m" className="mt-4">
            <LeaderboardTable entries={distanceLeaderboard1000} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
