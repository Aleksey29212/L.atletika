"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Participant, Result } from '@/lib/types';
import { MOCK_PARTICIPANTS } from '@/lib/mock-data';
import { calculateScore } from '@/lib/utils';

interface DataContextType {
  participants: Participant[];
  addParticipant: (participant: Omit<Participant, 'id' | 'result'>) => void;
  updateParticipant: (id: string, participant: Omit<Participant, 'id' | 'result'>) => void;
  deleteParticipant: (id: string) => void;
  addOrUpdateResult: (participantId: string, resultData: Omit<Result, 'id' | 'participantId' | 'points'>) => void;
  getParticipantById: (id: string) => Participant | undefined;
  recalculateAllScores: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const initialParticipants = useMemo(() => MOCK_PARTICIPANTS.map(p => ({
      ...p,
      result: p.result ? {
        ...p.result,
        points: calculateScore(p.result.distance, p.result.time)
      } : null
  })), []);

  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);

  const addParticipant = (participantData: Omit<Participant, 'id' | 'result'>) => {
    const newParticipant: Participant = {
      ...participantData,
      id: new Date().toISOString(),
      result: null,
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const updateParticipant = (id: string, participantData: Omit<Participant, 'id' | 'result'>) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...participantData } : p))
    );
  };

  const deleteParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const addOrUpdateResult = (participantId: string, resultData: Omit<Result, 'id' | 'participantId' | 'points'>) => {
    // Points are now initialized to 0 and calculated later.
    const newResult: Result = {
      ...resultData,
      id: new Date().toISOString(),
      participantId: participantId,
      points: 0 
    };

    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? { ...p, result: newResult }
          : p
      )
    );
  };
  
  const recalculateAllScores = useCallback(() => {
    setParticipants(prev => 
      prev.map(p => {
        if (p.result) {
          const newPoints = calculateScore(p.result.distance, p.result.time);
          return {
            ...p,
            result: {
              ...p.result,
              points: newPoints
            }
          };
        }
        return p;
      })
    );
  }, []);

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
        addOrUpdateResult,
        getParticipantById,
        recalculateAllScores,
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
