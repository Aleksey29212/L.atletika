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
import { cn } from '@/lib/utils';

const formSchema = z.object({
  distance: z.enum(['500m', '1000m']),
  minutes: z.coerce.number().min(0, { message: "Минуты не могут быть отрицательными" }).max(59, { message: "Максимум 59 минут" }),
  seconds: z.coerce.number().min(0, { message: "Секунды не могут быть отрицательными" }).max(59, { message: "Максимум 59 секунд" }),
  hundredths: z.coerce.number().min(0, { message: "Сотые не могут быть отрицательными" }).max(99, { message: "Максимум 99" }),
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
      minutes: 0,
      seconds: 0,
      hundredths: 0,
    },
  });

  React.useEffect(() => {
    if (participant) {
      form.reset({
        distance: '500m',
        minutes: 0,
        seconds: 0,
        hundredths: 0,
      });
    }
  }, [participant, isOpen, form]);

  const onSubmit = (data: ResultFormValues) => {
    const time = `${String(data.minutes).padStart(2, '0')}:${String(data.seconds).padStart(2, '0')}.${String(data.hundredths).padStart(2, '0')}`;
    addResult(participantId, { distance: data.distance, time });
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
            <FormItem>
              <FormLabel>Время</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="ММ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="СС" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hundredths"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="сс" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>
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
