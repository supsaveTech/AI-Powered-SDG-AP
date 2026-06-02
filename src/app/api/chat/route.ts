import { NextResponse } from "next/server";
import { sendChatMessage } from "@/services/aiService";
import { dataService } from "@/services/dataService";
import { buildRAGContext } from "@/utils/ragContextBuilder";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Fetch data and build RAG context for the chat
    const data = await dataService.fetchData();
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
