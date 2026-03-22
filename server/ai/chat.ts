import Anthropic from "@anthropic-ai/sdk";
import { generateCoachingPrompt } from "./coaching-prompt.js";

function getClient() {
  return new Anthropic({
    apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  });
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamCoachingReply(
  lessonTitle: string,
  lessonContent: string,
  history: ChatHistoryMessage[],
  userName: string | undefined,
  onChunk: (text: string) => void,
): Promise<string> {
  const client = getClient();
  const systemPrompt = generateCoachingPrompt(lessonTitle, lessonContent, userName);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages: history,
  });

  let fullText = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const chunk = event.delta.text;
      fullText += chunk;
      onChunk(chunk);
    }
  }

  return fullText;
}
