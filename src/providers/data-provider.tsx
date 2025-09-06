"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Participant, Result } from '@/lib/types';
import { MOCK_PARTICIPANTS } from '@/lib/mock-data';
import { calculateScore } from '@/lib/utils';

interface DataContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id' | 'results'>) => void;
  updateParticipant: (id: string, participant: Omit<Participant, 'id' | 'results'>) => void;
  deleteParticipant: (id: string) => void;
  addResult: (participantId: string, result: Omit<Result, 'id' | 'participantId' | 'points'>) => void;
  getParticipantById: (id: string) => Participant | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const initialParticipants = useMemo(() => MOCK_PARTICIPANTS.map(p => ({
      ...p,
      results: p.results.map(r => ({
        ...r,
        points: calculateScore(r.distance, r.time)
      }))
  })), []);

  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);

  const addParticipant = (participantData: Omit<Participant, 'id' | 'results'>) => {
    const newParticipant: Participant = {
      ...participantData,
      id: new Date().toISOString(),
      results: [],
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const updateParticipant = (id: string, participantData: Omit<Participant, 'id' | 'results'>) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...participantData } : p))
    );
  };

  const deleteParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const addResult = (participantId: string, resultData: Omit<Result, 'id' | 'participantId' | 'points'>) => {
    const newResult: Result = {
      ...resultData,
      id: new Date().toISOString(),
      participantId: participantId,
      points: calculateScore(resultData.distance, resultData.time)
    };

    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, results: [...p.results, newResult] }
          : p
      )
    );
  };

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  }

  return (
    <DataContext.Provider
      value={{
        participants,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addResult,
        getParticipantById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
