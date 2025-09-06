'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating performance insights for track and field participants.
 *
 * It uses participant history to suggest areas for improvement and predictions.
 * @exports generatePerformanceInsights - The main function to trigger the insight generation flow.
 * @exports PerformanceInsightsInput - The input type for the generatePerformanceInsights function.
 * @exports PerformanceInsightsOutput - The output type for the generatePerformanceInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformanceInsightsInputSchema = z.object({
  participantName: z.string().describe('Имя участника для генерации инсайтов.'),
  participantHistory: z.string().describe('Исторические данные о выступлениях участника, включая время забегов и категории.'),
});
export type PerformanceInsightsInput = z.infer<typeof PerformanceInsightsInputSchema>;

const PerformanceInsightsOutputSchema = z.object({
  insights: z.string().describe('Инсайты, сгенерированные ИИ, о производительности участника, потенциальных областях для улучшения и прогнозах на основе исторических данных.'),
});
export type PerformanceInsightsOutput = z.infer<typeof PerformanceInsightsOutputSchema>;

export async function generatePerformanceInsights(input: PerformanceInsightsInput): Promise<PerformanceInsightsOutput> {
  return generatePerformanceInsightsFlow(input);
}

const performanceInsightsPrompt = ai.definePrompt({
  name: 'performanceInsightsPrompt',
  input: {schema: PerformanceInsightsInputSchema},
  output: {schema: PerformanceInsightsOutputSchema},
  prompt: `Вы — ИИ-помощник, предназначенный для предоставления аналитики для легкоатлетов. Ваш анализ должен быть основан на времени, где меньшее значение — лучше.

  На основе исторических данных участника (в формате ММ:СС.сс) предоставьте аналитику по его производительности, предложите потенциальные области для улучшения и сделайте прогнозы.
  Учитывайте имя и историю участника при составлении отчета.

  Имя участника: {{{participantName}}}
  История участника: {{{participantHistory}}}

  Инсайты:
  `,
});

const generatePerformanceInsightsFlow = ai.defineFlow(
  {
    name: 'generatePerformanceInsightsFlow',
    inputSchema: PerformanceInsightsInputSchema,
    outputSchema: PerformanceInsightsOutputSchema,
  },
  async input => {
    const {output} = await performanceInsightsPrompt(input);
    return output!;
  }
);
