'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/providers/data-provider';
import type { Participant } from '@/lib/types';
import { Genders, Categories } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов." }),
  team: z.string().min(2, { message: "Название команды должно содержать не менее 2 символов." }),
  gender: z.enum(Genders),
  category: z.enum(Categories),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  participant: Participant | null;
}

export default function ParticipantDialog({ isOpen, setIsOpen, participant }: ParticipantDialogProps) {
  const { addParticipant, updateParticipant } = useData();
  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      team: '',
      gender: 'Male',
      category: 'Senior',
    },
  });

  useEffect(() => {
    if (participant) {
      form.reset({
        name: participant.name,
        team: participant.team,
        gender: participant.gender,
        category: participant.category,
      });
    } else {
      form.reset({
        name: '',
        team: '',
        gender: 'Male',
        category: 'Senior',
      });
    }
  }, [participant, form, isOpen]);

  const onSubmit = (data: ParticipantFormValues) => {
    if (participant) {
      updateParticipant(participant.id, data);
    } else {
      addParticipant(data);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{participant ? 'Редактировать участника' : 'Добавить участника'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Команда</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Орлы" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пол</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пол" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Genders.map(gender => <SelectItem key={gender} value={gender}>{gender === 'Male' ? 'Мужской' : 'Женский'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Отмена</Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
