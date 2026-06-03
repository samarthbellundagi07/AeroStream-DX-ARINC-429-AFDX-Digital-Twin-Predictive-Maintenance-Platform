'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating comprehensive AI-powered diagnostic reports for avionics bus systems.
 *
 * - generateAIDiagnosticReport - A function that triggers the diagnostic report generation process.
 * - AIDiagnosticReportInput - The input type for the generateAIDiagnosticReport function.
 * - AIDiagnosticReportOutput - The return type for the generateAIDiagnosticReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIDiagnosticReportInputSchema = z.object({
  arincStatistics: z.object({
    wordTransmissionRate: z.number().describe('Overall ARINC word transmission rate.'),
    labelFrequency: z.record(z.number()).describe('Frequency of each ARINC label.'),
    parityFailureRate: z.number().describe('Rate of parity failures in ARINC words.'),
    totalWordsProcessed: z.number().describe('Total number of ARINC words processed.'),
    totalParityErrors: z.number().describe('Total number of ARINC parity errors.')
  }).describe('Detailed ARINC 429 communication statistics.'),
  afdxStatistics: z.object({
    throughput: z.number().describe('Overall AFDX throughput in Mbps.'),
    latency: z.number().describe('Average AFDX frame latency in milliseconds.'),
    jitter: z.number().describe('Average AFDX frame jitter in milliseconds.'),
    bagCompliance: z.record(z.object({
      compliantFrames: z.number(),
      violatedFrames: z.number()
    })).describe('BAG compliance for each Virtual Link.'),
    virtualLinkLoad: z.record(z.number()).describe('Load percentage for each Virtual Link.'),
    frameDeliverySuccessRate: z.number().describe('Percentage of AFDX frames delivered successfully.'),
    totalFramesProcessed: z.number().describe('Total number of AFDX frames processed.'),
    totalCRCErrors: z.number().describe('Total number of AFDX CRC errors.'),
    totalSequenceErrors: z.number().describe('Total number of AFDX sequence errors.')
  }).describe('Detailed AFDX (ARINC 664) communication statistics.'),
  errorSummary: z.string().describe('A summary of all detected communication errors.'),
  injectedFaults: z.array(z.object({
    type: z.string().describe('Type of injected fault (e.g., "Parity error", "CRC error").'),
    location: z.string().describe('Location or context of the fault injection.'),
    severity: z.string().describe('Severity level of the injected fault.'),
    duration: z.string().describe('Duration of the fault injection.'),
    description: z.string().describe('Description of the injected fault.')
  })).describe('List of faults manually injected into the system.'),
  detectedAnomalies: z.array(z.object({
    type: z.string().describe('Type of anomaly detected (e.g., "Out-of-range value", "Missing packet").'),
    sensorId: z.string().optional().describe('ID of the sensor if it is a sensor anomaly.'),
    virtualLinkId: z.string().optional().describe('ID of the Virtual Link if it is a communication anomaly.'),
    timestamp: z.string().describe('Timestamp when the anomaly was detected.'),
    severityScore: z.number().describe('Severity score of the anomaly.'),
    confidenceScore: z.number().describe('Confidence score of the anomaly detection.'),
    details: z.string().describe('Detailed description of the anomaly.')
  })).describe('List of anomalies detected by the AI engine.'),
  digitalTwinStatus: z.object({
    engineHealth: z.string().describe('Health status of the engine subsystem (e.g., "Nominal", "Degraded").'),
    hydraulicHealth: z.string().describe('Health status of the hydraulic subsystem.'),
    electricalHealth: z.string().describe('Health status of the electrical subsystem.'),
    fuelHealth: z.string().describe('Health status of the fuel subsystem.'),
    overallSystemStatus: z.string().describe('Overall aircraft system status (e.g., "Healthy", "Warning", "Critical").')
  }).describe('Current status of the aircraft digital twin subsystems.')
}).describe('Input data for generating an AI-powered diagnostic report.');
export type AIDiagnosticReportInput = z.infer<typeof AIDiagnosticReportInputSchema>;

const AIDiagnosticReportOutputSchema = z.object({
  executiveSummary: z.string().describe('An overall summary of the system health, critical findings, and key recommendations.'),
  communicationAnalysis: z.object({
    arincSummary: z.string().describe('A summary of ARINC 429 communication statistics and findings.'),
    afdxSummary: z.string().describe('A summary of AFDX (ARINC 664) communication statistics and findings.'),
    overallErrorSummary: z.string().describe('An AI-generated summary of all detected communication errors and their impact.')
  }).describe('Detailed analysis of ARINC and AFDX communication.'),
  faultAnalysis: z.object({
    injectedFaultsSummary: z.string().describe('A summary of all manually injected faults and their observed effects.'),
    detectedAnomaliesSummary: z.string().describe('A summary of all detected anomalies, their types, and severity.'),
    rootCauseAssessment: z.string().describe('An AI-powered root cause assessment for detected anomalies and communication issues, considering the digital twin status and injected faults.')
  }).describe('Analysis of system faults and anomalies.'),
  performanceAnalysis: z.object({
    busMetricsSummary: z.string().describe('A summary of bus performance metrics including throughput, latency, and utilization.'),
    afdxMetricsSummary: z.string().describe('A summary of AFDX specific performance metrics like jitter and BAG compliance.'),
    arincMetricsSummary: z.string().describe('A summary of ARINC specific performance metrics like word transmission rate and label frequency.'),
    overallPerformanceAssessment: z.string().describe('An AI-generated overall assessment of the system performance.')
  }).describe('Analysis of bus and protocol performance.'),
  maintenanceRecommendations: z.string().describe('Actionable, AI-generated maintenance recommendations based on the diagnostic findings and root cause assessment.'),
  reliabilityAssessment: z.string().describe('An AI-generated assessment of the system\'s current and projected reliability.')
}).describe('Generated comprehensive diagnostic report.');
export type AIDiagnosticReportOutput = z.infer<typeof AIDiagnosticReportOutputSchema>;

const generateAIDiagnosticReportPrompt = ai.definePrompt({
  name: 'generateAIDiagnosticReportPrompt',
  input: { schema: AIDiagnosticReportInputSchema },
  output: { schema: AIDiagnosticReportOutputSchema },
  prompt: `You are a Senior Aerospace Software Engineer and Avionics Architect. Generate a professional diagnostic report based on the provided mission telemetry.

### Data Context:

#### ARINC 429:
Rate: {{{arincStatistics.wordTransmissionRate}}} w/s
Parity Fail Rate: {{{arincStatistics.parityFailureRate}}}%
Total Processed: {{{arincStatistics.totalWordsProcessed}}}

#### AFDX (ARINC 664):
Throughput: {{{afdxStatistics.throughput}}} Mbps
Latency: {{{afdxStatistics.latency}}} ms
BAG Compliance: {{json afdxStatistics.bagCompliance}}
Delivery Success: {{{afdxStatistics.frameDeliverySuccessRate}}}%

#### Anomalies & Faults:
Error Summary: {{{errorSummary}}}
{{#if injectedFaults}}
Injected:
{{#each injectedFaults}}
- {{{this.type}}} @ {{{this.location}}} ({{{this.severity}}})
{{/each}}
{{/if}}

#### Digital Twin:
System Health: {{{digitalTwinStatus.overallSystemStatus}}}
Engine: {{{digitalTwinStatus.engineHealth}}}
Hydraulic: {{{digitalTwinStatus.hydraulicHealth}}}

Provide a detailed analysis strictly adhering to the output schema.`,
});

const aiDiagnosticReportGeneratorFlow = ai.defineFlow(
  {
    name: 'aiDiagnosticReportGeneratorFlow',
    inputSchema: AIDiagnosticReportInputSchema,
    outputSchema: AIDiagnosticReportOutputSchema
  },
  async (input) => {
    const { output } = await generateAIDiagnosticReportPrompt(input);
    if (!output) {
      throw new Error('Failed to generate diagnostic report.');
    }
    return output;
  }
);

export async function generateAIDiagnosticReport(input: AIDiagnosticReportInput): Promise<AIDiagnosticReportOutput> {
  return aiDiagnosticReportGeneratorFlow(input);
}
