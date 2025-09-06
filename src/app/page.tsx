'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/providers/data-provider';
import type { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, Edit, BarChart, Sparkles, FileUp, FileDown } from 'lucide-react';
import ParticipantDialog from '@/components/participants/participant-dialog';
import ResultDialog from '@/components/results/result-dialog';
import InsightDialog from '@/components/insights/insight-dialog';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { participants, deleteParticipant } = useData();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isParticipantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [isResultDialogOpen, setResultDialogOpen] = useState(false);
  const [isInsightDialogOpen, setInsightDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setSelectedParticipant(null);
    setParticipantDialogOpen(true);
  };

  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setParticipantDialogOpen(true);
  };

  const handleAddResult = (participant: Participant) => {
    setSelectedParticipant(participant);
    setResultDialogOpen(true);
  };

  const handleViewInsights = (participant: Participant) => {
    setSelectedParticipant(participant);
    setInsightDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    // A confirmation dialog would be good here in a real app
    deleteParticipant(id);
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
          <CardTitle>Participants</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled><FileUp className="mr-2 h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm" disabled><FileDown className="mr-2 h-4 w-4" /> Export</Button>
            <Button onClick={handleAddNew} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Search by name or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">{participant.name}</TableCell>
                      <TableCell>{participant.team}</TableCell>
                      <TableCell>{participant.gender}</TableCell>
                      <TableCell>{participant.category}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddResult(participant)}>
                              <BarChart className="mr-2 h-4 w-4" /> Add Result
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewInsights(participant)}>
                              <Sparkles className="mr-2 h-4 w-4" /> Get Insights
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(participant)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(participant.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No participants found.
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
          participantId={selectedParticipant.id}
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
