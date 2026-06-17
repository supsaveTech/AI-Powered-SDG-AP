import { NextResponse } from "next/server";
import { sendChatMessage } from "@/services/aiService";
import { buildRAGContext } from "@/utils/ragContextBuilder";

export async function POST(req: Request) {
  try {
    const { messages, data, analytics, isReportGeneration } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        role: "assistant",
        content: "No survey dataset is currently available for analysis."
      });
    }

    console.log("[API /chat] Received analytics object:", analytics ? "YES" : "NO");
    if (analytics) {
      console.log("[API /chat] digitalAccessIndex:", analytics.digitalAccessIndex);
      console.log("[API /chat] digitalSkillsReadiness:", analytics.digitalSkillsReadiness);
      console.log("[API /chat] smartphonePct:", analytics.smartphonePct);
    }

    // Build RAG context using client-provided data and SSOT analytics
    const ragContext = buildRAGContext(data, analytics);

    // Call the AI Service
    const aiResponseText = await sendChatMessage(messages, ragContext, isReportGeneration, analytics);

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
