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
  distance: z.enum(['500m', '1000m']),
  time: z.string().regex(/^\d{2}:\d{2}\.\d{2}$/, { message: "Время должно быть в формате ММ:СС.сс (например, 01:30.12)" }),
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
      distance: '500m',
      time: '',
    },
  });

  React.useEffect(() => {
    // Set default distance based on gender when dialog opens
    if (participant) {
      form.reset({
        distance: '500m',
        time: '',
      });
    }
  }, [participant, isOpen, form]);

  const onSubmit = (data: ResultFormValues) => {
    addResult(participantId, data);
    setIsOpen(false);
    form.reset();
  };

  const availableDistances: Distance[] = participant?.gender === 'Female' ? ['500m'] : ['500m', '1000m'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить результат для {participant?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дистанция</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите дистанцию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDistances.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                  <FormLabel>Время</FormLabel>
                  <FormControl>
                    <Input placeholder="ММ:СС.сс (например, 01:30.12)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
              <Button type="submit">Добавить результат</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
