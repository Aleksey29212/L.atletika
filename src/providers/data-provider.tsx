"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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
  importParticipants: (newParticipants: Omit<Participant, 'id' | 'result'>[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isDataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    // We wrap this in a setTimeout to avoid the hydration error.
    // This ensures the data is only loaded on the client-side.
    setTimeout(() => {
      const initialParticipants = MOCK_PARTICIPANTS.map(p => ({
        ...p,
        result: p.result ? {
          ...p.result,
          points: calculateScore(p.result.distance, p.result.time)
        } : null
      }));
      setParticipants(initialParticipants);
      setDataInitialized(true);
    }, 0);
  }, []);

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
    const newResult: Result = {
      ...resultData,
      id: new Date().toISOString(),
      participantId: participantId,
      points: calculateScore(resultData.distance, resultData.time)
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
  
  const importParticipants = (newParticipants: Omit<Participant, 'id' | 'result'>[]) => {
    const participantsToAdd: Participant[] = newParticipants.map((p, index) => ({
      ...p,
      id: `${new Date().toISOString()}-import-${index}`,
      result: null,
    }));
    setParticipants(prev => [...prev, ...participantsToAdd]);
  };

  const getParticipantById = (id: string) => {
    return participants.find(p => p.id === id);
  }
  
  if (!isDataInitialized) {
    // You can return a loader here if you want
    return null;
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
        importParticipants,
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
