import { generateAIResponse, ChatMessage } from "@/lib/openai";
import { withHighlightError } from "@/highlight-error";

async function _chatHandler(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Validate message format
    const validMessages = messages.filter(
      (msg: unknown): msg is ChatMessage => {
        if (!msg || typeof msg !== "object" || msg === null) return false;
        if (!("role" in msg) || !("content" in msg)) return false;
        const typedMsg = msg as { role: string; content: string };
        return (
          ["user", "assistant", "system"].includes(typedMsg.role) &&
          typeof typedMsg.content === "string"
        );
      }
    );

    if (validMessages.length === 0) {
      return Response.json(
        { error: "No valid messages provided" },
        { status: 400 }
      );
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(validMessages);

    return Response.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withHighlightError(_chatHandler);
