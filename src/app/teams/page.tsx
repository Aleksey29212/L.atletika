'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Team as TeamType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medal, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const teamCompositions = [
  { label: '3 Юноши + 3 Девушки', value: '3-3' },
  { label: '4 Юноши + 4 Девушки', value: '4-4' },
  { label: '5 Юношей + 5 Девушек', value: '5-5' },
  { label: '6 Юношей + 6 Девушек', value: '6-6' },
];

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

export default function TeamsPage() {
  const { participants } = useData();
  const [composition, setComposition] = useState('4-4');

  const { teams, unassignedParticipants } = useMemo<{
    teams: TeamType[];
    unassignedParticipants: Participant[];
  }>(() => {
    const [malesNeeded, femalesNeeded] = composition.split('-').map(Number);
    
    const participantsWithScores = participants
      .filter(p => p.result)
      .map(p => ({
        ...p,
        points: p.result!.points,
      }));

    const teamsByOriginalName: { [key: string]: Participant[] } = {};
    participantsWithScores.forEach(p => {
      if (!teamsByOriginalName[p.team]) {
        teamsByOriginalName[p.team] = [];
      }
      teamsByOriginalName[p.team].push(p);
    });
    
    const finalTeams: TeamType[] = [];
    const assignedIds = new Set<string>();

    Object.entries(teamsByOriginalName).forEach(([teamName, members]) => {
      const males = members.filter(m => m.gender === 'Male').sort((a, b) => (b as any).points - (a as any).points);
      const females = members.filter(m => m.gender === 'Female').sort((a, b) => (b as any).points - (a as any).points);

      if (males.length >= malesNeeded && females.length >= femalesNeeded) {
        const teamMembers = [...males.slice(0, malesNeeded), ...females.slice(0, femalesNeeded)];
        const totalPoints = teamMembers.reduce((sum, m) => sum + (m as any).points, 0);
        
        teamMembers.forEach(m => assignedIds.add(m.id));

        finalTeams.push({
          name: teamName,
          members: teamMembers,
          totalPoints: totalPoints,
        });
      }
    });

    finalTeams.sort((a, b) => b.totalPoints - a.totalPoints);
    const unassigned = participantsWithScores.filter(p => !assignedIds.has(p.id));

    return { teams: finalTeams, unassignedParticipants: unassigned };
  }, [participants, composition]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Рейтинги команд</CardTitle>
          <CardDescription>
            Команды формируются из лучших участников каждой исходной команды в соответствии с выбранным составом.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Выберите состав команды" />
              </SelectTrigger>
              <SelectContent>
                {teamCompositions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ранг</TableHead>
                  <TableHead>Команда</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead className="text-right">Всего очков</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length > 0 ? (
                  teams.map(({ name, totalPoints, members }, index) => {
                    const rank = index + 1;
                    return (
                      <TableRow key={name} className={cn(getRankClass(rank))}>
                        <TableCell className="font-bold text-lg">
                          <div className="flex items-center gap-2">
                            {getMedal(rank)}
                            <span>{rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                          <TooltipProvider>
                            {members.map(member => (
                              <Tooltip key={member.id}>
                                <TooltipTrigger asChild>
                                  <Avatar className="border-2 border-background">
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{member.name} ({(member as any).points.toFixed(2)} очк.)</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-base">{totalPoints.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Ни одна команда не соответствует выбранному составу.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Участники вне команд
          </CardTitle>
          <CardDescription>
            Эти участники не были включены в квалификационную команду по выбранным критериям. Они ранжированы по их очкам.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Исходная команда</TableHead>
                    <TableHead>Пол</TableHead>
                    <TableHead>Дистанция</TableHead>
                    <TableHead className="text-right">Очки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedParticipants.length > 0 ? (
                    unassignedParticipants
                      .sort((a,b) => (b as any).points - (a as any).points)
                      .map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.team}</TableCell>
                        <TableCell>{p.gender === 'Male' ? 'Мужской' : 'Женский'}</TableCell>
                        <TableCell>{p.result!.distance}</TableCell>
                        <TableCell className="text-right font-semibold text-base">
                          {(p as any).points.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Все квалифицированные участники распределены по командам.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
