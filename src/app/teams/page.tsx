'use client';

import React, { useMemo } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TeamRankingEntry = {
  rank: number;
  name: string;
  totalScore: number;
  members: Participant[];
};

export default function TeamsPage() {
  const { participants } = useData();

  const teamRankings = useMemo<TeamRankingEntry[]>(() => {
    const teams: { [key: string]: { totalScore: number; members: Participant[] } } = {};

    participants.forEach(p => {
      if (!teams[p.team]) {
        teams[p.team] = { totalScore: 0, members: [] };
      }
      teams[p.team].members.push(p);
      teams[p.team].totalScore += p.results.reduce((sum, r) => sum + r.score, 0);
    });

    return Object.entries(teams)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [participants]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamRankings.length > 0 ? (
                teamRankings.map(({ rank, name, totalScore, members }) => (
                  <TableRow key={name}>
                    <TableCell className="font-bold text-lg">{rank}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                      <TooltipProvider>
                        {members.map(member => (
                          <Tooltip key={member.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="border-2 border-card">
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{member.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{totalScore}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No teams to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
