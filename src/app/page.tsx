'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, Edit, BarChart, Sparkles, FileUp, FileDown, CheckCircle, Calculator } from 'lucide-react';
import ParticipantDialog from '@/components/participants/participant-dialog';
import ResultDialog from '@/components/results/result-dialog';
import InsightDialog from '@/components/insights/insight-dialog';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Papa from 'papaparse';

export default function Home() {
  const { participants, deleteParticipant, recalculateAllScores } = useData();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isParticipantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [isResultDialogOpen, setResultDialogOpen] = useState(false);
  const [isInsightDialogOpen, setInsightDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleRecalculate = () => {
    recalculateAllScores();
    toast({
      title: "Результаты обновлены",
      description: "Баллы для всех участников были успешно пересчитаны.",
    });
  };

  const handleAddNew = () => {
    setSelectedParticipant(null);
    setParticipantDialogOpen(true);
  };

  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setParticipantDialogOpen(true);
  };

  const handleAddOrEditResult = (participant: Participant) => {
    setSelectedParticipant(participant);
    setResultDialogOpen(true);
  };

  const handleViewInsights = (participant: Participant) => {
    if (participant.result) {
      setSelectedParticipant(participant);
      setInsightDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    deleteParticipant(id);
  };

  const handleExport = () => {
    const dataToExport = participants.map(p => ({
      'Имя': p.name,
      'Команда': p.team,
      'Пол': p.gender === 'Male' ? 'Мужской' : 'Женский',
      'Категория': p.category,
      'Дистанция': p.result?.distance || 'N/A',
      'Время': p.result?.time || 'N/A',
      'Очки': p.result?.points.toFixed(2) || 'N/A'
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Экспорт завершен",
      description: "Данные участников были успешно выгружены в CSV файл.",
    });
  };
  
  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;
    return participants.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [participants, searchQuery]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Участники</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled><FileUp className="mr-2 h-4 w-4" /> Импорт</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Экспорт</Button>
            <Button onClick={handleRecalculate} size="sm" variant="secondary">
              <Calculator className="mr-2 h-4 w-4" />
              Вычислить результаты
            </Button>
            <Button onClick={handleAddNew} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить участника
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Поиск по имени или команде..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Команда</TableHead>
                  <TableHead>Пол</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Результат</TableHead>
                  <TableHead>Очки</TableHead>
                  <TableHead className="w-[120px] text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.team}</TableCell>
                      <TableCell>{participant.gender === 'Male' ? 'Мужской' : 'Женский'}</TableCell>
                      <TableCell>{participant.category}</TableCell>
                      <TableCell>
                        {participant.result ? (
                          <Badge variant="secondary" className="font-mono">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            {participant.result.distance}: {participant.result.time}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Нет результата</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                         {participant.result ? participant.result.points.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                         <TooltipProvider>
                          <div className="flex items-center justify-end gap-2">
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAddOrEditResult(participant)}>
                                  <BarChart className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{participant.result ? 'Редактировать результат' : 'Добавить результат'}</p>
                              </TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(participant)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Редактировать участника</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Открыть меню</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewInsights(participant)} disabled={!participant.result}>
                                    <Sparkles className="mr-2 h-4 w-4" /> Получить инсайты
                                  </DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                               <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие нельзя отменить. Это навсегда удалит участника и все его результаты.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(participant.id)} className="bg-destructive hover:bg-destructive/90">
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Участники не найдены.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {isParticipantDialogOpen && (
        <ParticipantDialog
          isOpen={isParticipantDialogOpen}
          setIsOpen={setParticipantDialogOpen}
          participant={selectedParticipant}
        />
      )}

      {isResultDialogOpen && selectedParticipant && (
        <ResultDialog
          isOpen={isResultDialogOpen}
          setIsOpen={setResultDialogOpen}
          participant={selectedParticipant}
        />
      )}
      
      {isInsightDialogOpen && selectedParticipant && (
        <InsightDialog
          isOpen={isInsightDialogOpen}
          setIsOpen={setInsightDialogOpen}
          participant={selectedParticipant}
        />
      )}
    </div>
  );
}
