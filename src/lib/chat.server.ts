import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { FRAMEWORKS } from "./frameworks";
import { generateSahayakResponse, type SchemeRecord } from "./ai/sahayak-engine";

async function loadSchemes(): Promise<SchemeRecord[]> {
  try {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];

    if (!key || !url) return [];

    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data, error } = await sb
      .from("schemes")
      .select(
        "slug,title,ministry,level,state_name,sector,category,beneficiary_types,summary,eligibility,benefits,official_url,last_verified,is_demo,min_age,max_age,genders,max_annual_income,social_categories,occupations,residence,requires_bpl,requires_disability"
      )
      .eq("status", "published");

    if (error) {
      console.warn("Error fetching schemes from Supabase:", error.message);
      return [];
    }
    return (data as SchemeRecord[]) ?? [];
  } catch (err) {
    console.warn("Exception fetching schemes:", err);
    return [];
  }
}

function extractUserText(messages: UIMessage[]): string {
  if (!messages || messages.length === 0) return "";
  const last = messages[messages.length - 1];
  if (!last) return "";
  if (Array.isArray(last.parts)) {
    return last.parts
      .filter((p) => p.type === "text" && typeof (p as { text?: string }).text === "string")
      .map((p) => (p as { text: string }).text)
      .join(" ");
  }
  if (typeof (last as unknown as { content?: string }).content === "string") {
    return (last as unknown as { content: string }).content;
  }
  return "";
}

export async function handleChat(request: Request): Promise<Response> {
  const { messages } = (await request.json()) as { messages: UIMessage[] };
  const schemes = await loadSchemes();
  const userText = extractUserText(messages);

  const apiKey = process.env["AI_API_KEY"] || process.env["OPENAI_API_KEY"];

  const rawBaseURL =
    process.env["AI_BASE_URL"] ||
    process.env["OPENAI_BASE_URL"] ||
    "https://apinex.bond/v1";

  // Normalize base URL (handles /vi typo -> /v1, and trailing slashes)
  const baseURL = rawBaseURL
    .replace(/\/+$/, "")
    .replace(/\/vi$/, "/v1");

  const modelName =
    process.env["AI_MODEL"] ||
    "free/qwen-3.8-max";

  const instructions = `You are Sahayak, the NAGSI AI scheme assistant (an academic prototype, NOT an official government service).
Help citizens, students, startups, MSMEs, researchers and institutions discover Indian government schemes (yojanas) — AI initiatives plus welfare, education, agriculture, business, health, pension and more.
When the user shares their age, income, category, occupation etc., use the structured eligibility fields to list potential matches and suggest the /eligibility finder.
Rules:
- Answer ONLY from the scheme directory and frameworks below. If unsure, say so and point to the official source.
- Matches are "potential matches", never confirmed eligibility. Applications happen on the official portal.
- Always label demo entries as "DEMO — NOT A REAL GOVERNMENT SCHEME".
- Cite the official URL and last verified date for real schemes. Link scheme pages as /schemes/<slug>.
- Be concise; use short markdown lists and headers. Reply in the user's language (English/Hindi etc).
You can also explain AI governance using these primary sources (cite URLs): ${JSON.stringify(FRAMEWORKS)}
Scheme directory (JSON):
${JSON.stringify(schemes)}`;

  if (apiKey) {
    try {
      const provider = createOpenAI({
        baseURL: baseURL.endsWith("/v1") ? baseURL : `${baseURL}/v1`,
        apiKey,
      });
      const modelMessages = await convertToModelMessages(messages);
      const result = streamText({
        model: provider(modelName),
        system: instructions,
        messages: modelMessages,
        abortSignal: request.signal,
      });
      return result.toUIMessageStreamResponse();
    } catch (e) {
      console.warn("AI API call failed, falling back to local Sahayak engine:", e);
    }
  }

  // Built-in grounded Sahayak retrieval engine (fallback)
  const fullResponse = generateSahayakResponse(userText, schemes);
  const partId = `part-${Date.now()}`;

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: partId });

      const chunks = fullResponse.split(/(?<=\s)/);
      for (const chunk of chunks) {
        if (request.signal.aborted) break;
        writer.write({ type: "text-delta", id: partId, delta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      writer.write({ type: "text-end", id: partId });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
