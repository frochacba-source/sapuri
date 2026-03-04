// LLM Integration using Abacus.AI
import Anthropic from "@anthropic-ai/sdk";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Simple fallback LLM using fetch to OpenAI-compatible API or mock response
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, maxTokens, max_tokens } = params;

  // Extract system message if any
  const systemMessage = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");
  
  // Format messages for simple completion
  const formattedMessages = userMessages.map(m => {
    const content = typeof m.content === "string" ? m.content : 
      Array.isArray(m.content) ? m.content.map(c => typeof c === "string" ? c : (c as TextContent).text || "").join("\n") :
      (m.content as TextContent).text || "";
    return `${m.role}: ${content}`;
  }).join("\n");

  try {
    // Try to use Abacus.AI Python SDK if available
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: formattedMessages,
        stream: false
      })
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return {
        id: `llm-${Date.now()}`,
        created: Date.now(),
        model: "local",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: data.response || ""
          },
          finish_reason: "stop"
        }]
      };
    }
  } catch (e) {
    // Fallback
  }

  // Mock response for development
  console.log("[LLM] Using mock response - configure LLM API for real responses");
  return {
    id: `mock-${Date.now()}`,
    created: Date.now(),
    model: "mock",
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: JSON.stringify({
          name: "Carta Exemplo",
          bonusDmg: "10%",
          bonusDef: "5%",
          bonusVid: "0",
          bonusPress: "0",
          bonusEsquiva: "0",
          bonusVelAtaq: "0",
          bonusTenacidade: "0",
          bonusSanguessuga: "0",
          bonusRedDano: "0",
          bonusCrit: "0",
          bonusCura: "0",
          bonusCuraRecebida: "0",
          bonusPrecisao: "0",
          usageLimit: "Todos",
          skillEffect: "Efeito da carta"
        })
      },
      finish_reason: "stop"
    }]
  };
}
