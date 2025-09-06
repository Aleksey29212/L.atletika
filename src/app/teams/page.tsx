'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Gender, Category } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TeamRankingEntry = {
  rank: number;
  name: string;
  totalScore: number;
  members: Participant[];
};

export default function TeamsPage() {
  const { participants } = useData();
  const [genderFilter, setGenderFilter] = useState<Gender | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');

  const teamRankings = useMemo<TeamRankingEntry[]>(() => {
    const teams: { [key: string]: { totalScore: number; members: Participant[] } } = {};

    participants
      .filter(p => 
        (genderFilter === 'All' || p.gender === genderFilter) &&
        (categoryFilter === 'All' || p.category === categoryFilter)
      )
      .forEach(p => {
        if (!teams[p.team]) {
          teams[p.team] = { totalScore: 0, members: [] };
        }
        teams[p.team].members.push(p);
        teams[p.team].totalScore += p.results.reduce((sum, r) => sum + r.score, 0);
      });

    return Object.entries(teams)
      .map(([name, data]) => ({ name, ...data }))
      .filter(team => team.totalScore > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [participants, genderFilter, categoryFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Rankings</CardTitle>
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
                    No teams to display for the selected filters.
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
