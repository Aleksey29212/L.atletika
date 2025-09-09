"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Participant, Result } from '@/lib/types';
import { generateParticipants } from '@/lib/mock-data';
import { calculateScore } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock data on the client side to prevent hydration issues
    // and improve server startup time.
    const mockData = generateParticipants(300, 300);
    const initialParticipants = mockData.map(p => ({
      ...p,
      result: p.result ? {
        ...p.result,
        points: calculateScore(p.result.distance, p.result.time)
      } : null
    }));
    setParticipants(initialParticipants);
    setIsLoading(false);
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
  
  if (isLoading) {
    // Render a loading skeleton or null while waiting for client-side data
    return (
       <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
       </div>
    );
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
