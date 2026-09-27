import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
}) {
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
        console.warn(`Model ${model} (attempt ${attempt + 1}) failed:`, err.message || err);
        // Wait before next attempt or next model
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Law Counsel Legal Intelligence Engine' });
  });

  // POST /api/analyze-contract
  app.post('/api/analyze-contract', async (req: Request, res: Response) => {
    try {
      const { contractText, category } = req.body;
      if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 20) {
        return res.status(400).json({ error: 'Please provide valid contract text (minimum 20 characters).' });
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
        contents: prompt,
        systemInstruction: 'You are an elite Indian legal readability and contract auditing engine. Be rigorous, grounded strictly in Indian statutes and court precedents, and explain terms in accessible plain English.',
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
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error analyzing contract:', err);
      return res.status(500).json({ error: 'Failed to analyze contract: ' + (err.message || 'Unknown error') });
    }
  });

  // POST /api/explain-clause
  app.post('/api/explain-clause', async (req: Request, res: Response) => {
    try {
      const { clauseText, queryType } = req.body;
      if (!clauseText || typeof clauseText !== 'string' || clauseText.trim().length < 5) {
        return res.status(400).json({ error: 'Please enter a valid clause text.' });
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
        contents: prompt,
        systemInstruction: 'You are an expert Indian advocate explaining legal clauses in simple terms. Cite Indian statutes accurately and draft constructive, courteous counter-offers.',
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
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error explaining clause:', err);
      return res.status(500).json({ error: 'Failed to explain clause: ' + (err.message || 'Unknown error') });
    }
  });

  // Mount Vite middleware in development or serve static in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
