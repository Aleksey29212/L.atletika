'use client';

import React, { useState, useEffect } from 'react';
import type { Participant } from '@/lib/types';
import { generatePerformanceInsights } from '@/ai/flows/generate-performance-insights';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InsightDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  participant: Participant;
}

export default function InsightDialog({ isOpen, setIsOpen, participant }: InsightDialogProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    const participantHistory = participant.result
      ? `${participant.result.distance}: ${participant.result.time}`
      : 'Результаты еще не записаны.';

    try {
      const result = await generatePerformanceInsights({
        participantName: participant.name,
        participantHistory,
      });
      setInsights(result.insights);
    } catch (e) {
      console.error(e);
      setError('Не удалось сгенерировать инсайты. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
        handleGenerateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setInsights(null);
        setError(null);
        setIsLoading(false);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Анализ результатов для {participant.name}</DialogTitle>
          <DialogDescription>
            Инсайты, сгенерированные ИИ на основе результатов участника.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 min-h-[200px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Генерация инсайтов...</p>
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {insights && (
            <div className="prose prose-sm max-w-none text-foreground bg-accent/50 p-4 rounded-md border border-accent">
                {insights}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Закрыть
          </Button>
           {insights && !isLoading && (
            <Button onClick={handleGenerateInsights}>
                <Sparkles className="mr-2 h-4 w-4" />
                Сгенерировать заново
            </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
