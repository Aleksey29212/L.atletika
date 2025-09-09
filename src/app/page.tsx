'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant, Gender, Category } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import * as XLSX from 'xlsx';

export default function Home() {
  const { participants, deleteParticipant, recalculateAllScores, importParticipants } = useData();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isParticipantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [isResultDialogOpen, setResultDialogOpen] = useState(false);
  const [isInsightDialogOpen, setInsightDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Участники");
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create blob
    const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants_export.xlsx');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Экспорт завершен",
      description: "Данные участников были успешно выгружены в Excel файл.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const newParticipants = json.map((row: any, index: number) => {
            const name = row['Имя']?.trim();
            const team = row['Команда']?.trim();
            const genderRaw = row['Пол']?.trim();
            const categoryRaw = row['Категория']?.trim();

            if (!name || !team || !genderRaw || !categoryRaw) {
               throw new Error(`Неверные данные в строке ${index + 2}. Все поля (Имя, Команда, Пол, Категория) обязательны.`);
            }
            
            const gender: Gender | undefined = Genders.find(g => (g === 'Male' && genderRaw === 'Мужской') || (g === 'Female' && genderRaw === 'Женский'));
            const category: Category | undefined = Categories.find(c => c === categoryRaw);

            if (!gender || !category) {
              throw new Error(`Неверный пол или категория в строке ${index + 2}: ${JSON.stringify(row)}`);
            }

            return { name, team, gender, category };
          });

          importParticipants(newParticipants as Omit<Participant, 'id' | 'result'>[]);
          toast({
            title: "Импорт завершен",
            description: `Успешно добавлено ${newParticipants.length} участников.`,
          });
        } catch (error: any) {
           toast({
            variant: "destructive",
            title: "Ошибка импорта",
            description: error.message || 'Не удалось обработать файл. Проверьте формат и данные.',
          });
        }
      };
      reader.onerror = (error) => {
        toast({
            variant: "destructive",
            title: "Ошибка при чтении файла",
            description: "Не удалось прочитать файл.",
          });
      }
      reader.readAsBinaryString(file);
      
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
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
        <CardHeader className="flex-row flex-wrap items-start gap-4">
          <div className="flex-1">
             <CardTitle>Управление участниками</CardTitle>
             <CardDescription>Добавляйте, редактируйте и управляйте участниками и их результатами.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNew} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить участника
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
             <Input 
              placeholder="Поиск по имени или команде..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center gap-2 flex-wrap">
               <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
               <Button variant="outline" size="sm" onClick={handleImportClick}><FileUp className="mr-2 h-4 w-4" /> Импорт Excel</Button>
               <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" /> Экспорт Excel</Button>
               <Button onClick={handleRecalculate} size="sm" variant="secondary">
                  <Calculator className="mr-2 h-4 w-4" />
                  Пересчитать все
                </Button>
            </div>
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
                      <TableCell className="font-mono text-base">
                         {participant.result ? participant.result.points.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                         <TooltipProvider>
                          <div className="flex items-center justify-end gap-1">
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
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
