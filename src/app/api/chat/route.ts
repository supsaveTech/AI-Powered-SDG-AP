import { NextResponse } from "next/server";
import { sendChatMessage } from "@/services/aiService";
import { buildRAGContext } from "@/utils/ragContextBuilder";

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        role: "assistant",
        content: "No survey dataset is currently available for analysis."
      });
    }

    // Build RAG context directly from the client-provided data
    const ragContext = buildRAGContext(data);

    // Call the AI Service
    const aiResponseText = await sendChatMessage(messages, ragContext);

    return NextResponse.json({
      role: "assistant",
      content: aiResponseText,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
