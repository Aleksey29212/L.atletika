'use client';

import React, { useState } from 'react';
import type { Participant } from '@/lib/types';
import { generatePerformanceInsights } from '@/ai/flows/generate-performance-insights';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { timeToSeconds } from '@/lib/utils';

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

    const participantHistory = participant.results.length > 0
      ? participant.results
          .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time))
          .map(r => `${r.distance}: ${r.time}`)
          .join('; ')
      : 'No results recorded yet.';

    try {
      const result = await generatePerformanceInsights({
        participantName: participant.name,
        participantHistory,
      });
      setInsights(result.insights);
    } catch (e) {
      console.error(e);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset state on close
        setInsights(null);
        setError(null);
        setIsLoading(false);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Performance Insights for {participant.name}</DialogTitle>
          <DialogDescription>
            Generate AI-powered insights based on the participant's performance history.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!insights && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/50 rounded-lg">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Click below to generate insights for {participant.name}.</p>
              <Button onClick={handleGenerateInsights}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Generating insights...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {insights && (
            <div className="prose prose-sm max-w-none text-foreground bg-accent/10 p-4 rounded-md border border-accent/20">
              <p style={{ whiteSpace: 'pre-wrap' }}>{insights}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
