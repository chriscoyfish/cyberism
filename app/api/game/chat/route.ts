import { NextRequest, NextResponse } from 'next/server';
import {
  getGeminiModel,
  extractChoices,
  extractDiceRolls,
  extractStateUpdates,
  cleanStoryNarration,
  isGameOver,
  ChatMessage,
} from '@/lib/gemini';
import { INITIAL_USER_PROMPT } from '@/lib/prompt';

export const dynamic = 'force-dynamic';

const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
];

export async function POST(req: NextRequest) {
  try {
    const { history = [], message = '', customApiKey } = await req.json();

    // Filter and map valid messages (ignore system messages)
    const rawHistory = history
      .filter((m: ChatMessage) => m.text && m.text.trim().length > 0 && m.role !== 'system')
      .map((m: ChatMessage) => ({
        role: (m.role === 'model' || m.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
        text: m.text.trim(),
      }));

    // If history begins with model, prepend initial user prompt
    if (rawHistory.length > 0 && rawHistory[0].role === 'model') {
      rawHistory.unshift({
        role: 'user',
        text: INITIAL_USER_PROMPT,
      });
    }

    // Merge consecutive messages of the same role to maintain strict user -> model -> user alternating turns
    const formattedHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
    for (const msg of rawHistory) {
      if (
        formattedHistory.length > 0 &&
        formattedHistory[formattedHistory.length - 1].role === msg.role
      ) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n\n' + msg.text;
      } else {
        formattedHistory.push({
          role: msg.role,
          parts: [{ text: msg.text }],
        });
      }
    }

    const userPrompt = message.trim() || (formattedHistory.length === 0 ? INITIAL_USER_PROMPT : 'Continue.');

    let responseText = '';
    let lastError: Error | null = null;

    // Try candidate models in order if temporary 503/capacity issues occur
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = getGeminiModel(customApiKey, modelName);
        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.9,
          },
        });

        const result = await chat.sendMessage(userPrompt);
        responseText = result.response.text();
        if (responseText) {
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Model ${modelName} returned error, attempting fallback:`, lastError.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All neural models unavailable.');
    }

    const choices = extractChoices(responseText);
    const diceRolls = extractDiceRolls(responseText);
    const stateUpdates = extractStateUpdates(responseText);
    const cleanedText = cleanStoryNarration(responseText);
    const gameOver = isGameOver(responseText);

    return NextResponse.json({
      text: cleanedText || responseText,
      rawText: responseText,
      choices,
      diceRolls,
      stateUpdates,
      isGameOver: gameOver,
      userPrompt,
    });
  } catch (err: unknown) {
    console.error('Gemini Game Master API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown neural interface anomaly';
    return NextResponse.json(
      {
        error: `Neural link disrupted: ${errorMessage}`,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
