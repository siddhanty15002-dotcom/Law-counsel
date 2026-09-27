import type { Handler, HandlerEvent } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function cleanAndParseJson(text: string | undefined): any {
  if (!text) return {};
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned);
}

async function generateWithFallback(params: {
  apiKey: string;
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
}) {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: params.responseSchema,
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed in Netlify explain-clause:`, err?.message || err);
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is empty.' }),
      };
    }

    const { clauseText, queryType } = JSON.parse(event.body);
    if (!clauseText || typeof clauseText !== 'string' || clauseText.trim().length < 5) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please enter a valid clause text (minimum 5 characters).' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'GEMINI_API_KEY environment variable is not configured on Netlify.',
        }),
      };
    }

    const prompt = `Analyze this specific clause under Indian law:
=== CLAUSE ===
${clauseText}
=== END CLAUSE ===

Focus area: ${queryType || 'all'}

Provide:
1. riskLevel: 'high' (void/illegal/predatory), 'warning' (unfavorable/onerous), or 'fair' (standard)
2. riskTitle: short summary title of the legal issue
3. plainMeaning: clear explanation of real-world impact in plain English
4. statutoryContext: precise section of Indian law (e.g. Indian Contract Act 1872 Section 27, Transfer of Property Act Section 108, Model Tenancy Act, Payment of Gratuity Act, Copyright Act, etc.) and Indian Supreme Court/High Court judicial doctrine
5. statutoryLawTag: short badge name of statute
6. negotiationScript: ready-to-send polite WhatsApp or email message to propose fair modification
7. hrQuestions: array of 3 practical questions to ask the counterparty on a call
8. suggestedReplacement: fair, balanced clause text to replace it with`;

    const response = await generateWithFallback({
      apiKey,
      contents: prompt,
      systemInstruction:
        'You are an expert Indian advocate explaining legal clauses in simple terms. Cite Indian statutes accurately and draft constructive, courteous counter-offers.',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, description: "'high', 'warning', or 'fair'" },
          riskTitle: { type: Type.STRING },
          plainMeaning: { type: Type.STRING },
          statutoryContext: { type: Type.STRING },
          statutoryLawTag: { type: Type.STRING },
          negotiationScript: { type: Type.STRING },
          hrQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggestedReplacement: { type: Type.STRING },
        },
        required: [
          'riskLevel',
          'riskTitle',
          'plainMeaning',
          'statutoryContext',
          'statutoryLawTag',
          'negotiationScript',
          'hrQuestions',
          'suggestedReplacement',
        ],
      },
    });

    const parsed = cleanAndParseJson(response.text);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error('Error explaining clause in Netlify function:', err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to explain clause: ' + (err?.message || 'Unknown error'),
      }),
    };
  }
};
