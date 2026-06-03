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
  prompt: `You are a Senior Aerospace Software Engineer, Avionics Systems Architect, and Aircraft Maintenance Diagnostics Expert. Your task is to generate a comprehensive diagnostic report for an avionics bus system, based on the provided data.

The report must address the following aspects and provide detailed, actionable insights.

### Report Sections:

1.  **Executive Summary**: Provide an overall assessment of the system's health, highlight critical findings, and summarize key recommendations.
2.  **Communication Analysis**:
    *   **ARINC 429 Summary**: Analyze the provided ARINC statistics, focusing on rates, frequencies, and parity errors.
    *   **AFDX (ARINC 664) Summary**: Analyze the provided AFDX statistics, focusing on throughput, latency, jitter, BAG compliance, virtual link load, and frame delivery success.
    *   **Overall Error Summary**: Summarize all detected communication errors (ARINC and AFDX) and their potential impact on system operation and reliability.
3.  **Fault Analysis**:
    *   **Injected Faults Summary**: Summarize the manually injected faults, their types, locations, severities, durations, and observed effects.
    *   **Detected Anomalies Summary**: Summarize all detected anomalies, including their types (sensor/communication), associated IDs (sensor/VL), timestamps, severity, confidence scores, and detailed descriptions. Discuss their potential impact.
    *   **Root Cause Assessment**: Provide a detailed, AI-powered root cause assessment for the detected anomalies and communication issues. Analyze the interdependencies between communication problems, performance degradation, digital twin status, and any injected faults to determine underlying causes.
4.  **Performance Analysis**:
    *   **Bus Metrics Summary**: Summarize general bus performance metrics like overall throughput, latency, and utilization.
    *   **AFDX Metrics Summary**: Summarize AFDX specific performance metrics such as jitter and BAG compliance for virtual links.
    *   **ARINC Metrics Summary**: Summarize ARINC specific performance metrics like word transmission rate and label frequencies.
    *   **Overall Performance Assessment**: Provide an AI-generated overall assessment of the system's current performance state and potential risks.
5.  **Maintenance Recommendations**: Formulate clear, actionable, and prioritized maintenance recommendations based on all diagnostic findings, especially focusing on addressing identified root causes and improving system reliability.
6.  **Reliability Assessment**: Provide an AI-generated assessment of the system's current and projected reliability, considering the detected issues and overall performance.

---

### Provided Data for Analysis:

#### ARINC 429 Statistics:
Word Transmission Rate: {{{arincStatistics.wordTransmissionRate}}} words/sec
Label Frequency: {{json arincStatistics.labelFrequency}}
Parity Failure Rate: {{{arincStatistics.parityFailureRate}}}%
Total Words Processed: {{{arincStatistics.totalWordsProcessed}}}
Total Parity Errors: {{{arincStatistics.totalParityErrors}}}

#### AFDX (ARINC 664) Statistics:
Throughput: {{{afdxStatistics.throughput}}} Mbps
Latency: {{{afdxStatistics.latency}}} ms
Jitter: {{{afdxStatistics.jitter}}} ms
BAG Compliance: {{json afdxStatistics.bagCompliance}}
Virtual Link Load: {{json afdxStatistics.virtualLinkLoad}}
Frame Delivery Success Rate: {{{afdxStatistics.frameDeliverySuccessRate}}}%
Total Frames Processed: {{{afdxStatistics.totalFramesProcessed}}}
Total CRC Errors: {{{afdxStatistics.totalCRCErrors}}}
Total Sequence Errors: {{{afdxStatistics.totalSequenceErrors}}}

#### Overall Communication Error Summary:
{{{errorSummary}}}

#### Injected Faults:
{{#if injectedFaults}}
{{#each injectedFaults}}
- Type: {{{this.type}}}, Location: {{{this.location}}}, Severity: {{{this.severity}}}, Duration: {{{this.duration}}}, Description: {{{this.description}}}
{{/each}}
{{else}}
No faults were manually injected into the system during this period.
{{/if}}

#### Detected Anomalies:
{{#if detectedAnomalies}}
{{#each detectedAnomalies}}
- Type: {{{this.type}}}
{{#if this.sensorId}}, Sensor ID: {{{this.sensorId}}}{{/if}}
{{#if this.virtualLinkId}}, Virtual Link ID: {{{this.virtualLinkId}}}{{/if}}
, Timestamp: {{{this.timestamp}}}, Severity Score: {{{this.severityScore}}}, Confidence Score: {{{this.confidenceScore}}}, Details: {{{this.details}}}
{{/each}}
{{else}}
No anomalies were detected by the AI engine.
{{/if}}

#### Digital Twin Subsystem Status:
Engine Health: {{{digitalTwinStatus.engineHealth}}}
Hydraulic Health: {{{digitalTwinStatus.hydraulicHealth}}}
Electrical Health: {{{digitalTwinStatus.electricalHealth}}}
Fuel Health: {{{digitalTwinStatus.fuelHealth}}}
Overall System Status: {{{digitalTwinStatus.overallSystemStatus}}}

---

Please generate the comprehensive diagnostic report in JSON format, strictly adhering to the `AIDiagnosticReportOutputSchema`. Ensure all fields are thoroughly populated based on the provided data and your expert analysis as an Aerospace Software Engineer, Avionics Systems Architect, and Aircraft Maintenance Diagnostics Expert.
`
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
