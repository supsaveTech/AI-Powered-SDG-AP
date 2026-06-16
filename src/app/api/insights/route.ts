import { NextResponse } from "next/server";
import { generatePageInsights } from "@/services/aiService";
import { buildPageContext } from "@/utils/ragContextBuilder";
import { SurveyResponse } from "@/types";

export async function POST(req: Request) {
  try {
    const { data, pageName } = await req.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    if (data.length === 0) {
       return NextResponse.json({ 
         error: "No survey data available. Connect Google Sheets or upload a CSV to generate AI insights." 
       }, { status: 400 });
    }

    // Build RAG context from the client-provided data
    const ragContext = buildPageContext(data as SurveyResponse[], pageName);

    // Generate insights via AI service (LLM or heuristic engine)
    const insights = await generatePageInsights(pageName, ragContext);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights." },
      { status: 500 }
    );
  }
}
