'use server';

/**
 * @fileOverview An automated test grading AI agent.
 *
 * - automatedTestGrading - A function that handles the automated test grading process.
 * - AutomatedTestGradingInput - The input type for the automatedTestGrading function.
 * - AutomatedTestGradingOutput - The return type for the automatedTestGrading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedTestGradingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student's answer sheet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  answerKeyDataUri: z
    .string()
    .describe(
      'A photo of the official answer key, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
  testId: z.string().describe('The ID of the test being graded.'),
  studentId: z.string().describe('The ID of the student whose test is being graded.'),
});
export type AutomatedTestGradingInput = z.infer<typeof AutomatedTestGradingInputSchema>;

const AutomatedTestGradingOutputSchema = z.object({
  corrections: z
    .array(z.object({questionId: z.string(), correct: z.boolean()}))
    .describe('An array of corrections for each question.'),
  results: z.object({
    correctCount: z.number().describe('The number of correct answers.'),
    incorrectCount: z.number().describe('The number of incorrect answers.'),
    accuracy: z.number().describe('The accuracy of the test as a percentage.'),
  }),
});
export type AutomatedTestGradingOutput = z.infer<typeof AutomatedTestGradingOutputSchema>;

export async function automatedTestGrading(
  input: AutomatedTestGradingInput
): Promise<AutomatedTestGradingOutput> {
  return automatedTestGradingFlow(input);
}

const automatedTestGradingPrompt = ai.definePrompt({
  name: 'automatedTestGradingPrompt',
  input: {schema: AutomatedTestGradingInputSchema},
  output: {schema: AutomatedTestGradingOutputSchema},
  prompt: `You are an AI test grading assistant. You will be provided with a photo of a student's answer sheet and a photo of the official answer key. Your task is to compare the student's answers with the answer key and determine which answers are correct and which are incorrect.

  Here is the student's answer sheet:
  {{media url=photoDataUri}}

  Here is the official answer key:
  {{media url=answerKeyDataUri}}

  Test ID: {{{testId}}}
  Student ID: {{{studentId}}}

  Based on your comparison, generate a JSON object containing the corrections for each question and the overall results of the test. The \"corrections\" array should contain objects with the \"questionId\" and \"correct\" fields for each question. The \"results\" object should contain the \"correctCount\", \"incorrectCount\", and \"accuracy\" fields, where accuracy is the percentage of correct answers.

  Ensure that the output is a valid JSON object that conforms to the following schema:
  ${JSON.stringify(AutomatedTestGradingOutputSchema.shape, null, 2)}`,
});

const automatedTestGradingFlow = ai.defineFlow(
  {
    name: 'automatedTestGradingFlow',
    inputSchema: AutomatedTestGradingInputSchema,
    outputSchema: AutomatedTestGradingOutputSchema,
  },
  async input => {
    const {output} = await automatedTestGradingPrompt(input);
    return output!;
  }
);
