'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Team as TeamType, Distance } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeToSeconds, secondsToTime } from '@/lib/utils';
import { Users, Info } from 'lucide-react';

const teamCompositions = [
  { label: '3 Мужчины + 3 Женщины', value: '3-3' },
  { label: '4 Мужчины + 4 Женщины', value: '4-4' },
  { label: '5 Мужчин + 5 Женщин', value: '5-5' },
  { label: '6 Мужчин + 6 Женщин', value: '6-6' },
];

export default function TeamsPage() {
  const { participants } = useData();
  const [distance, setDistance] = useState<Distance>('1000m');
  const [composition, setComposition] = useState('4-4');

  const { teams, unassignedParticipants } = useMemo<{
    teams: TeamType[];
    unassignedParticipants: Participant[];
  }>(() => {
    const [malesNeeded, femalesNeeded] = composition.split('-').map(Number);
    const teamSize = malesNeeded + femalesNeeded;

    const participantsWithTimes = participants
      .map(p => {
        const bestResult = p.results
          .filter(r => r.distance === distance)
          .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))[0];
        
        return {
          ...p,
          bestTime: bestResult ? timeToSeconds(bestResult.time) : Infinity,
          bestTimeString: bestResult ? bestResult.time : 'N/A',
        };
      })
      .filter(p => p.bestTime !== Infinity);

    const teamsByOriginalName: { [key: string]: Participant[] } = {};
    participantsWithTimes.forEach(p => {
      if (!teamsByOriginalName[p.team]) {
        teamsByOriginalName[p.team] = [];
      }
      teamsByOriginalName[p.team].push(p);
    });
    
    const finalTeams: TeamType[] = [];
    const assignedIds = new Set<string>();

    Object.entries(teamsByOriginalName).forEach(([teamName, members]) => {
      const males = members.filter(m => m.gender === 'Male').sort((a, b) => a.bestTime - b.bestTime);
      const females = members.filter(m => m.gender === 'Female').sort((a, b) => a.bestTime - b.bestTime);

      if (males.length >= malesNeeded && females.length >= femalesNeeded) {
        const teamMembers = [...males.slice(0, malesNeeded), ...females.slice(0, femalesNeeded)];
        const totalTime = teamMembers.reduce((sum, m) => sum + m.bestTime, 0);
        
        teamMembers.forEach(m => assignedIds.add(m.id));

        finalTeams.push({
          name: teamName,
          members: teamMembers,
          totalTime: totalTime,
          totalTimeString: secondsToTime(totalTime),
        });
      }
    });

    finalTeams.sort((a, b) => a.totalTime - b.totalTime);
    const unassigned = participantsWithTimes.filter(p => !assignedIds.has(p.id));

    return { teams: finalTeams, unassignedParticipants: unassigned };
  }, [participants, distance, composition]);

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
            <Select value={distance} onValueChange={(value) => setDistance(value as Distance)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите дистанцию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500m">500м</SelectItem>
                <SelectItem value="1000m">1000м</SelectItem>
              </SelectContent>
            </Select>
            <Select value={composition} onValueChange={setComposition}>
              <SelectTrigger className="w-[220px]">
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
                  <TableHead className="text-right">Общее время</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length > 0 ? (
                  teams.map(({ name, totalTimeString, members }, index) => (
                    <TableRow key={name}>
                      <TableCell className="font-bold text-lg">{index + 1}</TableCell>
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
                                <p>{member.name} ({member.bestTimeString})</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{totalTimeString}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Ни одна команда не соответствует выбранному составу и дистанции.
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
            <Users className="h-6 w-6" />
            Участники вне команд
          </CardTitle>
          <CardDescription>
            Эти участники не были включены в квалификационную команду по выбранным критериям. Они ранжированы по их лучшему индивидуальному времени на выбранной дистанции.
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
                    <TableHead>Категория</TableHead>
                    <TableHead className="text-right">Лучшее время ({distance})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedParticipants.length > 0 ? (
                    unassignedParticipants
                      .sort((a,b) => a.bestTime - b.bestTime)
                      .map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.team}</TableCell>
                        <TableCell>{p.gender === 'Male' ? 'Мужской' : 'Женский'}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {(p as any).bestTimeString}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Все участники распределены по командам.
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
