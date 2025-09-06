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
  participantName: z.string().describe('The name of the participant to generate insights for.'),
  participantHistory: z.string().describe('Historical performance data of the participant, including race times and categories.'),
});
export type PerformanceInsightsInput = z.infer<typeof PerformanceInsightsInputSchema>;

const PerformanceInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights into the participant performance, potential areas for improvement, and predictions based on historical data.'),
});
export type PerformanceInsightsOutput = z.infer<typeof PerformanceInsightsOutputSchema>;

export async function generatePerformanceInsights(input: PerformanceInsightsInput): Promise<PerformanceInsightsOutput> {
  return generatePerformanceInsightsFlow(input);
}

const performanceInsightsPrompt = ai.definePrompt({
  name: 'performanceInsightsPrompt',
  input: {schema: PerformanceInsightsInputSchema},
  output: {schema: PerformanceInsightsOutputSchema},
  prompt: `You are an AI assistant designed to provide insights for track and field athletes.

  Based on the participant's historical data, provide insights into their performance, suggest potential areas for improvement, and offer predictions.
  Consider the participant's name and history when generating the report.

  Participant Name: {{{participantName}}}
  Participant History: {{{participantHistory}}}

  Insights:
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
