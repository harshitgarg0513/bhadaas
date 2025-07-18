import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Ask Google for a streaming completion given the prompt
    const streamingResponse = await genAI
      .getGenerativeModel({ model: 'gemini-1.5-flash' })
      .generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(streamingResponse);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    // General error handling
    console.error('An unexpected error occurred:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}