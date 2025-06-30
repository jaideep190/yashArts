'use server';
/**
 * @fileOverview An AI flow to generate artistic descriptions for images.
 *
 * - describeArtwork - A function that generates a description for an artwork image.
 * - DescribeArtworkInput - The input type for the describeArtwork function.
 * - DescribeArtworkOutput - The return type for the describeArtwork function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DescribeArtworkInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DescribeArtworkInput = z.infer<typeof DescribeArtworkInputSchema>;

const DescribeArtworkOutputSchema = z.object({
    description: z.string().describe("An artistic and engaging description of the artwork provided, in 2-3 sentences.")
});
export type DescribeArtworkOutput = z.infer<typeof DescribeArtworkOutputSchema>;


const prompt = ai.definePrompt({
    name: 'describeArtworkPrompt',
    input: { schema: DescribeArtworkInputSchema },
    output: { schema: DescribeArtworkOutputSchema },
    prompt: `You are an art critic with a poetic and insightful voice. Analyze the following image of an artwork. Write a short, engaging description suitable for an artist's portfolio. Focus on the mood, style, color palette, and potential themes or emotions conveyed by the piece.

Artwork Image: {{media url=photoDataUri}}`,
});


const describeArtworkFlow = ai.defineFlow(
  {
    name: 'describeArtworkFlow',
    inputSchema: DescribeArtworkInputSchema,
    outputSchema: DescribeArtworkOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function describeArtwork(input: DescribeArtworkInput): Promise<DescribeArtworkOutput> {
  const result = await describeArtworkFlow(input);
  return result;
}
