'use client';

import { ai } from './firebase';
import { getGenerativeModel, Schema } from 'firebase/ai';

export type PIICategory = "PERSON" | "EMAIL" | "PHONE" | "ORG" | "SECRET" | "FINANCIAL" | "LOCATION";

export interface RedactedEntity {
  original: string;
  placeholder: string;
  category: PIICategory;
}

export interface RedactionResult {
  sanitizedText: string;
  entities: RedactedEntity[];
  bytesKeptLocal: number;
  durationMs: number;
  inferenceSource: "ON_DEVICE" | "IN_CLOUD";
}

const piiSchema = Schema.object({
  properties: {
    entities: Schema.array({
      items: Schema.object({
        properties: {
          original: Schema.string(),
          category: Schema.enumString({ 
            enum: ["PERSON", "EMAIL", "PHONE", "ORG", "SECRET", "FINANCIAL", "LOCATION"] 
          })
        },
        required: ["original", "category"]
      })
    })
  },
  required: ["entities"]
});

const DETERMINISTIC_REGEX = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  API_KEY: /(sk-|AIza|ghp_)[a-zA-Z0-9_-]{20,}/g,
  CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

export async function detectAndRedactPII(
  rawText: string, 
  options: { strictOnDevice: boolean; fallbackModel: string }
): Promise<RedactionResult> {
  if (!ai) throw new Error("Firebase AI not initialized. Check configuration.");
  const start = performance.now();
  const inferenceMode = options.strictOnDevice ? "ONLY_ON_DEVICE" : "PREFER_ON_DEVICE";
  
  const model = getGenerativeModel(ai, {
    model: options.fallbackModel,
    inferenceMode: inferenceMode as any,
    onDeviceParams: {
      promptOptions: {
        responseConstraint: JSON.parse(JSON.stringify(piiSchema))
      }
    },
    inCloudParams: {
      generationConfig: {
        responseSchema: piiSchema
      }
    }
  });

  const prompt = `Identify all PII (names, emails, phones, locations, orgs, secrets) in the following text. Output ONLY a JSON object matching the schema.
  
  Text: ${rawText}`;

  let aiEntities: any[] = [];
  let inferenceSource: "ON_DEVICE" | "IN_CLOUD" = "ON_DEVICE";

  try {
    const result = await model.generateContent(prompt);
    inferenceSource = (result.response as any).inferenceSource || "IN_CLOUD";
    const parsed = JSON.parse(result.response.text());
    aiEntities = parsed.entities || [];
  } catch (e) {
    console.warn("AI Redaction failed, falling back to deterministic regex only", e);
  }

  const entities: RedactedEntity[] = [];
  const categoryMap: Record<string, number> = {};

  const addEntity = (original: string, category: PIICategory) => {
    if (!categoryMap[category]) categoryMap[category] = 1;
    const placeholder = `[${category}_${categoryMap[category]++}]`;
    entities.push({ original, placeholder, category });
  };

  aiEntities.forEach(e => addEntity(e.original, e.category as PIICategory));

  Object.entries(DETERMINISTIC_REGEX).forEach(([cat, regex]) => {
    const matches = rawText.matchAll(regex);
    for (const match of matches) {
      if (!entities.some(e => e.original === match[0])) {
        addEntity(match[0], cat === 'API_KEY' ? 'SECRET' : cat as PIICategory);
      }
    }
  });

  entities.sort((a, b) => b.original.length - a.original.length);

  let sanitizedText = rawText;
  entities.forEach(e => {
    sanitizedText = sanitizedText.split(e.original).join(e.placeholder);
  });

  const bytesKeptLocal = entities.reduce((acc, e) => acc + new TextEncoder().encode(e.original).length, 0);

  return {
    sanitizedText,
    entities,
    bytesKeptLocal,
    durationMs: Math.round(performance.now() - start),
    inferenceSource
  };
}

export async function runCloudReasoning(
  sanitizedText: string,
  taskInstruction: string,
  entities: RedactedEntity[],
  cloudModelName: string
) {
  if (!ai) throw new Error("Firebase AI not initialized.");
  const start = performance.now();
  const model = getGenerativeModel(ai, {
    model: cloudModelName,
    inferenceMode: "ONLY_IN_CLOUD" as any,
    inCloudParams: {
      generationConfig: { temperature: 0.4 }
    }
  });

  const systemInstruction = `You are a secure data assistant. You will receive text with placeholders like [PERSON_1] or [ORG_1]. 
  You MUST preserve these placeholders verbatim in your response. Do not attempt to guess the underlying data. 
  Perform the following task: ${taskInstruction}`;

  const result = await model.generateContent(`${systemInstruction}\n\nText: ${sanitizedText}`);
  const sanitizedResponse = result.response.text();

  let rehydratedResponse = sanitizedResponse;
  entities.forEach(e => {
    rehydratedResponse = rehydratedResponse.split(e.placeholder).join(e.original);
  });

  return {
    sanitizedResponse,
    rehydratedResponse,
    inferenceSource: (result.response as any).inferenceSource || "IN_CLOUD",
    modelUsed: cloudModelName,
    durationMs: Math.round(performance.now() - start)
  };
}

export async function runOfflineLocalTask(
  rawText: string,
  taskInstruction: string,
  fallbackModel: string
) {
  if (!ai) throw new Error("Firebase AI not initialized.");
  const start = performance.now();
  const model = getGenerativeModel(ai, {
    model: fallbackModel,
    inferenceMode: "PREFER_ON_DEVICE" as any
  });

  const result = await model.generateContent(`Task: ${taskInstruction}\n\nText: ${rawText}`);
  
  return {
    response: result.response.text(),
    inferenceSource: (result.response as any).inferenceSource || "ON_DEVICE",
    durationMs: Math.round(performance.now() - start)
  };
}
