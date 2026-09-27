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
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed in Netlify function:`, err?.message || err);
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

    const { contractText, category } = JSON.parse(event.body);
    if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 20) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please provide valid contract text (minimum 20 characters).' }),
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

    const prompt = `You are Law Counsel, an expert legal analyst in Indian contract law, tenancy regulations (Transfer of Property Act 1882, Model Tenancy Act), employment law (Indian Contract Act 1872 Section 27, Shops & Commercial Establishments Acts), and commercial law.

Analyze the following contract text carefully:
=== CONTRACT TEXT ===
${contractText}
=== END CONTRACT TEXT ===

Category hint: ${category || 'general'}

Your task:
1. Extract the key operational clauses and identify one-sided, unfair, or legally vulnerable terms.
2. Evaluate an overall fairnessScore from 0 (heavily predatory/unfavorable to lessee/employee/contractor) to 100 (balanced and fair).
3. Count totalClauses, highConcern (predatory or illegal under Indian law), worthNoting (unfavorable or unusual), and standardFair (customary and balanced).
4. For each key clause, provide:
   - clauseNumber and title
   - subject (e.g., Security Deposit, Non-Compete, Termination, Notice Period, Indemnity, IP Assignment)
   - severity ('high' | 'warning' | 'fair')
   - severityLabel (e.g. '🚨 High Concern • Restraint of Trade' or '⚠️ Worth Noting' or '✅ Standard & Fair')
   - originalText (exact quote from the agreement)
   - plainMeaning (what it practically means for the person signing, in clear simple English without legalese)
   - statutoryContext (Indian law reference, e.g. Section 27 Indian Contract Act 1872, Model Tenancy Act Chapter IV, Section 74 damages, etc.)
   - statutoryLaw (short statute name)
   - suggestedFix (practical, fair counter-proposal)
   - counterRequestCopy (1-2 sentence polite request to change this specific clause)
5. Generate a polite, diplomatic emailSubject and complete emailBody (ready to send via email or WhatsApp to the counterparty requesting reasonable amendments).`;

    const response = await generateWithFallback({
      apiKey,
      contents: prompt,
      systemInstruction:
        'You are an elite Indian legal readability and contract auditing engine. Be rigorous, grounded strictly in Indian statutes and court precedents, and explain terms in accessible plain English.',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fairnessScore: { type: Type.INTEGER, description: 'Fairness score 0-100' },
          categoryKey: { type: Type.STRING, description: 'Category identifier' },
          totalClauses: { type: Type.INTEGER, description: 'Total clauses evaluated' },
          highConcern: { type: Type.INTEGER, description: 'Count of high risk clauses' },
          worthNoting: { type: Type.INTEGER, description: 'Count of moderate caution clauses' },
          standardFair: { type: Type.INTEGER, description: 'Count of standard fair clauses' },
          primaryActionRequired: { type: Type.STRING, description: 'Primary action summary before signing' },
          clauses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                clauseNumber: { type: Type.STRING },
                title: { type: Type.STRING },
                subject: { type: Type.STRING },
                severity: { type: Type.STRING, description: "'high', 'warning', or 'fair'" },
                severityLabel: { type: Type.STRING },
                originalText: { type: Type.STRING },
                plainMeaning: { type: Type.STRING },
                statutoryContext: { type: Type.STRING },
                statutoryLaw: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
                counterRequestCopy: { type: Type.STRING },
              },
              required: [
                'id',
                'clauseNumber',
                'title',
                'subject',
                'severity',
                'severityLabel',
                'originalText',
                'plainMeaning',
                'statutoryContext',
                'statutoryLaw',
              ],
            },
          },
          emailSubject: { type: Type.STRING },
          emailBody: { type: Type.STRING },
        },
        required: [
          'fairnessScore',
          'totalClauses',
          'highConcern',
          'worthNoting',
          'standardFair',
          'primaryActionRequired',
          'clauses',
          'emailSubject',
          'emailBody',
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
    console.error('Error analyzing contract in Netlify function:', err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to analyze contract: ' + (err?.message || 'Unknown error'),
      }),
    };
  }
};
