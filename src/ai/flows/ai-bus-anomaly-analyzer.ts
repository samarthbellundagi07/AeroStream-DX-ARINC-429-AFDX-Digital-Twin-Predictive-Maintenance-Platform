'use server';
/**
 * @fileOverview This file implements a Genkit flow for the AeroStream DX application.
 * It acts as an AI-powered diagnostic tool for avionics bus anomalies, providing
 * potential mechanical root causes and recommended actions to maintenance engineers.
 *
 * - aiBusAnomalyAnalyzer - A function that handles the AI-powered anomaly analysis process.
 * - AIBusAnomalyAnalyzerInput - The input type for the aiBusAnomalyAnalyzer function.
 * - AIBusAnomalyAnalyzerOutput - The return type for the aiBusAnomalyAnalyzer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnomalySchema = z.object({
  type: z.string().describe('The type of anomaly detected (e.g., "CRC failure", "Out-of-range value", "Missing packet").'),
  description: z.string().describe('A detailed explanation of the anomaly.'),
  timestamp: z.string().datetime().describe('The timestamp when the anomaly occurred in ISO 8601 format.'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity level of the anomaly.'),
  dataContext: z.string().describe('Relevant bus data context around the anomaly (e.g., specific ARINC word, AFDX frame, or sensor reading).'),
});

const AIBusAnomalyAnalyzerInputSchema = z.object({
  busDataSummary: z.string().describe('A summary of the real-time bus data, including overall metrics like throughput, latency, error rates, and general bus health.'),
  anomalies: z.array(AnomalySchema).describe('An array of detected anomalies, each with detailed information.'),
});
export type AIBusAnomalyAnalyzerInput = z.infer<typeof AIBusAnomalyAnalyzerInputSchema>;

const AIBusAnomalyAnalyzerOutputSchema = z.object({
  rootCauseSuggestions: z.array(z.string()).describe('An array of potential mechanical root causes for the detected anomalies.'),
  severityScore: z.number().min(0).max(100).describe('A numerical score (0-100) indicating the overall severity of the detected issues.'),
  confidenceScore: z.number().min(0).max(100).describe('A numerical score (0-100) indicating the AI\'s confidence in its suggestions.'),
  recommendedActions: z.array(z.string()).describe('An array of recommended corrective actions based on the diagnosis.'),
});
export type AIBusAnomalyAnalyzerOutput = z.infer<typeof AIBusAnomalyAnalyzerOutputSchema>;

export async function aiBusAnomalyAnalyzer(input: AIBusAnomalyAnalyzerInput): Promise<AIBusAnomalyAnalyzerOutput> {
  return aiBusAnomalyAnalyzerFlow(input);
}

const aiBusAnomalyAnalyzerPrompt = ai.definePrompt({
  name: 'aiBusAnomalyAnalyzerPrompt',
  input: { schema: AIBusAnomalyAnalyzerInputSchema },
  output: { schema: AIBusAnomalyAnalyzerOutputSchema },
  prompt: `You are a highly experienced Senior Aerospace Software Engineer, Avionics Systems Architect, and Aircraft Maintenance Diagnostics Expert specializing in ARINC 429 and AFDX bus systems. Your task is to analyze real-time avionics bus data and identified anomalies to determine potential mechanical root causes and suggest corrective actions.

Carefully review the provided bus data summary and the list of detected anomalies. Consider the context of each anomaly, its type, severity, and any associated data context. Based on your expert knowledge of aircraft systems and avionics buses, infer the most probable mechanical failures or system misconfigurations that could lead to these observed communication issues.

Bus Data Summary:
{{{busDataSummary}}}

Detected Anomalies:
{{#if anomalies}}
  {{#each anomalies}}
    - Type: {{this.type}}
    - Description: {{this.description}}
    - Timestamp: {{this.timestamp}}
    - Severity: {{this.severity}}
    - Data Context: {{this.dataContext}}
  {{/each}}
{{else}}
  No specific anomalies detected. Analyze the bus data summary for any potential underlying issues.
{{/if}}

Provide your analysis in the specified JSON format, including a list of potential mechanical root causes, an overall severity score for the situation, your confidence in the diagnosis, and a list of actionable recommendations.`,
});

const aiBusAnomalyAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiBusAnomalyAnalyzerFlow',
    inputSchema: AIBusAnomalyAnalyzerInputSchema,
    outputSchema: AIBusAnomalyAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await aiBusAnomalyAnalyzerPrompt(input);
    return output!;
  }
);
