'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/providers/data-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Distance } from '@/lib/types';

const formSchema = z.object({
  distance: z.enum(['500m', '1000m', '1500m']),
  time: z.string().regex(/^\d{2}:\d{2}\.\d{3}$/, { message: "Time must be in MM:SS.ms format (e.g., 01:30.123)" }),
});

type ResultFormValues = z.infer<typeof formSchema>;

interface ResultDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  participantId: string;
}

export default function ResultDialog({ isOpen, setIsOpen, participantId }: ResultDialogProps) {
  const { addResult, getParticipantById } = useData();
  const participant = getParticipantById(participantId);

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distance: '1500m',
      time: '',
    },
  });

  const onSubmit = (data: ResultFormValues) => {
    addResult(participantId, data);
    setIsOpen(false);
  };

  const distances: Distance[] = ['500m', '1000m', '1500m'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Result for {participant?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a distance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {distances.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input placeholder="MM:SS.ms (e.g., 01:30.123)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Add Result</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
