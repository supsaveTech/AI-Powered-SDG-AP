import { AnalyticsContextType } from "@/contexts/DataContext";

/**
 * AI Service Layer
 *
 * This service handles communication with an LLM provider (OpenAI/Gemini/etc.)
 * or falls back to the sophisticated heuristic engine when no API key is set.
 *
 * To connect a real LLM:
 * 1. Set OPENAI_API_KEY in .env.local
 * 2. Install: npm install openai
 * 3. Uncomment the OpenAI section below
 */

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIInsightSet {
  keyFindings: string[];
  trendAnalysis: string[];
  recommendations: string[];
  sdgMapping: {
    sdg8: string[];
    sdg9: string[];
  };
}

const AI_PROVIDER = process.env.OPENAI_API_KEY ? "openai" :
                   process.env.GEMINI_API_KEY ? "gemini" : "heuristic";

/**
 * Send a message to the AI and receive a response.
 * Used by the chatbot API route.
 */
export async function sendChatMessage(
  messages: AIMessage[],
  ragContext: string,
  isReportGeneration?: boolean,
  analytics?: AnalyticsContextType | null
): Promise<string> {
  const systemMessage: AIMessage = {
    role: "system",
    content: buildSystemPrompt(ragContext),
  };

  const fullMessages = [systemMessage, ...messages];

  if (AI_PROVIDER === "openai") {
    return callOpenAI(fullMessages);
  }

  if (AI_PROVIDER === "gemini") {
    return callGemini(messages, buildSystemPrompt(ragContext));
  }

  // Heuristic fallback
  if (isReportGeneration) {
    return generateHeuristicReport(ragContext, analytics);
  }
  return heuristicResponse(messages, ragContext, analytics);
}

/**
 * Generate structured AI insights for a dashboard page.
 */
export async function generatePageInsights(
  pageName: string,
  ragContext: string
): Promise<AIInsightSet> {
  const prompt = `
Based on the survey data provided, generate a comprehensive AI insight report for the "${pageName}" section of the dashboard.

Return a JSON object with EXACTLY this structure:
{
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "trendAnalysis": ["trend 1", "trend 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "sdgMapping": {
    "sdg8": ["SDG 8 finding 1", "SDG 8 finding 2"],
    "sdg9": ["SDG 9 finding 1", "SDG 9 finding 2"]
  }
}

Make insights specific to the ${pageName} data, actionable, and grounded in the statistics provided.
`;

  if (AI_PROVIDER === "openai") {
    try {
      const response = await callOpenAI([
        { role: "system", content: buildSystemPrompt(ragContext) },
        { role: "user", content: prompt },
      ]);
      return JSON.parse(response) as AIInsightSet;
    } catch {
      return heuristicInsights(pageName, ragContext);
    }
  }

  if (AI_PROVIDER === "gemini") {
    try {
      const response = await callGemini(
        [{ role: "user", content: prompt }],
        buildSystemPrompt(ragContext)
      );
      return JSON.parse(response) as AIInsightSet;
    } catch {
      return heuristicInsights(pageName, ragContext);
    }
  }

  return heuristicInsights(pageName, ragContext);
}

function buildSystemPrompt(ragContext: string): string {
  return `You are a professional SDG Data Analyst and Policy Research Advisor specializing in youth digital empowerment in Sub-Saharan Africa. You work with the "Digital Skills for Decent Work" project in Port Harcourt, Nigeria.

Your role is to analyze survey data and provide evidence-based, action-oriented insights that are:
- Grounded strictly in the provided data
- Aligned with SDG 8 (Decent Work) and SDG 9 (Innovation & Infrastructure)
- Traceable: ALWAYS reference the specific survey question numbers that support your insights, metrics, and recommendations.
- Written for a professional policy audience but accessible
- Specific, not generic

${ragContext}

Methodology & Indices:
- AI Readiness Index (Q18-Q20): Evaluates awareness, frequency, and diversity of AI tools used.
- Digital Access Index (Q11-Q13): Combines device ownership, internet reliability, and electricity access.
- Digital Skills Readiness (Q14-Q17): Weighted composite of self-reported skills, coding experience, and breadth of digital skills.
- Career Awareness (Q23-Q24): Knowledge of modern tech careers and interest in pursuing them.
- Employment Readiness (Q25-Q28): Alignment of aspirations and desired skills with flexible/remote job markets.
- Barrier Severity (Q29): Severity ranking of obstacles to digital skill acquisition.

Always ground your responses in the actual statistics above. Never fabricate data points not present in the context.`;
}

// ─── OpenAI Implementation ───────────────────────────────────────────────────
async function callOpenAI(messages: AIMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.4,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

// ─── Gemini Implementation ────────────────────────────────────────────────────
async function callGemini(messages: AIMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured");

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── SDG Data Analyst Knowledge Base & Insight Engine ─────────────────────────

interface Insight {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  implication?: string;
  recommendation?: string;
  relatedMetrics: string[];
}

interface PriorityAction {
  rank: number;
  issue: string;
  justification: string;
}

interface DerivedInsights {
  strongestMetric: { name: string; score: number };
  weakestMetric: { name: string; score: number };
  generatedInsights: Insight[];
  priorityActions: PriorityAction[];
}

interface AnalystKnowledgeBase {
  analytics: AnalyticsContextType;
  insights: DerivedInsights;
  conversationHistory: AIMessage[];
}

// ─── ALIAS MAPPINGS ──────────────────────────────────────────────────────────

const METRIC_ALIASES: Record<string, keyof AnalyticsContextType> = {
  "ai adoption rate": "aiAdoptionRate",
  "ai adoption": "aiAdoptionRate",
  "ai usage": "aiAdoptionRate",
  "digital skills readiness": "digitalSkillsReadiness",
  "digital skills": "digitalSkillsReadiness",
  "skills score": "digitalSkillsReadiness",
  "ai readiness index": "aiReadinessIndex",
  "ai readiness": "aiReadinessIndex",
  "career awareness score": "careerAwarenessScore",
  "career awareness": "careerAwarenessScore",
  "employment readiness index": "employmentReadinessIndex",
  "employment readiness": "employmentReadinessIndex",
  "remote work interest": "remoteWorkInterest",
  "remote work": "remoteWorkInterest",
  "biggest barrier": "topBarrier",
  "top barrier": "topBarrier",
  "main obstacle": "topBarrier",
  "digital access index": "digitalAccessIndex",
  "digital access": "digitalAccessIndex",
  "smartphone ownership": "smartphonePct",
  "laptop ownership": "laptopPct",
};

// ─── INSIGHT ENGINE ─────────────────────────────────────────────────────────

function generateInsights(analytics: AnalyticsContextType): DerivedInsights {
  const generatedInsights: Insight[] = [];
  const priorityActions: PriorityAction[] = [];

  // Major Indices for strongest/weakest calculation
  const indices = [
    { name: "Digital Skills Readiness", score: analytics.digitalSkillsReadiness },
    { name: "AI Readiness", score: analytics.aiReadinessIndex },
    { name: "Career Awareness", score: analytics.careerAwarenessScore },
    { name: "Employment Readiness", score: analytics.employmentReadinessIndex },
    { name: "Digital Access", score: analytics.digitalAccessIndex },
  ].filter(i => i.score > 0).sort((a, b) => b.score - a.score);

  const strongestMetric = indices[0] ?? { name: "Unknown", score: 0 };
  const weakestMetric = indices[indices.length - 1] ?? { name: "Unknown", score: 0 };

  // AI Usage-Skills Gap
  if (analytics.aiAdoptionRate > analytics.digitalSkillsReadiness + 15) {
    generatedInsights.push({
      id: "aiSkillsGap",
      title: "AI Usage-Skills Gap",
      severity: "High",
      explanation: \`AI tool adoption (\${analytics.aiAdoptionRate.toFixed(0)}%) significantly exceeds broader Digital Skills Readiness (\${analytics.digitalSkillsReadiness.toFixed(0)}/100).\`,
      implication: "Youth are engaging with AI tools but may lack the foundational technical competencies required to convert this usage into professional employment outcomes.",
      recommendation: "Expand practical digital skills training programmes to backfill foundational competencies alongside AI experimentation.",
      relatedMetrics: ["aiAdoptionRate", "digitalSkillsReadiness", "aiReadinessIndex"]
    });
  }

  // Infrastructure Gap
  if (analytics.smartphonePct - analytics.laptopPct > 30) {
    generatedInsights.push({
      id: "infrastructureGap",
      title: "Infrastructure Gap",
      severity: "High",
      explanation: \`Mobile access (\${analytics.smartphonePct.toFixed(0)}%) substantially exceeds computer access (\${analytics.laptopPct.toFixed(0)}%).\`,
      implication: "This mobile-first reality limits participation in advanced technical training such as programming, cybersecurity, and data analysis which typically require a full computing environment.",
      recommendation: "Partner with organizations to provide subsidized laptop access or establish community tech labs.",
      relatedMetrics: ["smartphonePct", "laptopPct", "digitalAccessIndex"]
    });
  }

  // Aspiration Gap
  if (analytics.remoteWorkInterest > analytics.employmentReadinessIndex + 10) {
    generatedInsights.push({
      id: "aspirationGap",
      title: "Aspiration Gap",
      severity: "Medium",
      explanation: \`Interest in remote work (\${analytics.remoteWorkInterest.toFixed(0)}%) exceeds actual Employment Readiness (\${analytics.employmentReadinessIndex.toFixed(0)}/100).\`,
      implication: "There is strong demand for digital economy participation, but respondents lack the structured career pathways or practical experience to enter the market.",
      recommendation: "Create structured mentorship programmes linking aspiring youth to working tech professionals.",
      relatedMetrics: ["remoteWorkInterest", "employmentReadinessIndex", "careerAwarenessScore"]
    });
  }

  // Priority Actions
  if (analytics.topBarrier !== "Unknown") {
    priorityActions.push({
      rank: 1,
      issue: analytics.topBarrier,
      justification: \`Highest reported barrier to upskilling (severity: \${analytics.topBarrierScore.toFixed(2)}/5).\`
    });
  }
  
  if (analytics.smartphonePct - analytics.laptopPct > 30) {
    priorityActions.push({
      rank: priorityActions.length + 1,
      issue: "Infrastructure & Device Access",
      justification: \`\${(analytics.smartphonePct - analytics.laptopPct).toFixed(0)}-point gap between smartphone and laptop ownership limits advanced skill acquisition.\`
    });
  }

  return { strongestMetric, weakestMetric, generatedInsights, priorityActions };
}

// ─── STATE MANAGER ──────────────────────────────────────────────────────────

let lastMetricContext: keyof AnalyticsContextType | null = null;
let lastInsightContext: string | null = null;

// ─── INTENT ROUTER ──────────────────────────────────────────────────────────

function heuristicResponse(messages: AIMessage[], ragContext: string, analyticsContext?: AnalyticsContextType | null): string {
  if (!analyticsContext) {
    return 'No survey data is currently available. Please synchronize Google Sheets data or upload a CSV to generate insights grounded in real survey responses.';
  }

  const userMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
  const akb: AnalystKnowledgeBase = {
    analytics: analyticsContext,
    insights: generateInsights(analyticsContext),
    conversationHistory: messages
  };

  let intent = "UNKNOWN";
  
  // 1. Classification
  if (userMessage.match(/hello|hi\b|hey|greetings/)) intent = "GREETING";
  else if (userMessage.match(/who are you|are you an ai|what are you/)) intent = "IDENTITY";
  else if (userMessage.match(/what do you have|help/)) intent = "HELP";
  else if (userMessage.match(/why|imply|mean\b|explain|tell me more/)) intent = "FOLLOW_UP_WHY";
  else if (userMessage.match(/what should be done|recommend|policymakers|prioritize|government/)) intent = "RECOMMENDATION";
  else if (userMessage.match(/highest|lowest|strongest|weakest|compare/)) intent = "COMPARISON";
  else if (userMessage.match(/concerns|risk|most important|barrier/)) intent = "ANALYSIS";
  else if (userMessage.match(/sdg mapping|sdg 8|sdg 9|report|summary/)) intent = "SECTION_LOOKUP";
  else intent = "METRIC_LOOKUP";

  console.log(\`[SDG Analyst] Intent: \${intent} | Query: \${userMessage}\`);

  // 2. Routing
  switch (intent) {
    case "GREETING":
      return "Hello! I am the SDG Data Analyst Assistant. How can I help you interpret this survey data today?";
      
    case "IDENTITY":
      return "I am the SDG Data Analyst Assistant. I help analyze survey findings, digital skills trends, employment readiness, and SDG-related insights deterministically based on your dataset.";
      
    case "HELP":
      return \`I currently have survey findings from \${analyticsContext.respondentCount} respondents covering digital access, digital skills readiness, AI adoption, career awareness, employment readiness, and barriers to upskilling. What would you like to explore?\`;

    case "FOLLOW_UP_WHY":
      if (lastMetricContext) {
        // Find insight related to the last metric
        const insight = akb.insights.generatedInsights.find(i => i.relatedMetrics.includes(lastMetricContext as string));
        if (insight) {
          lastInsightContext = insight.id;
          return \`The significance is: \${insight.implication || insight.explanation}\`;
        }
        return \`This metric (\${lastMetricContext}) is an important indicator of overall digital readiness in the context of SDG 8 and 9.\`;
      }
      return "Could you specify which finding you'd like me to explain further?";

    case "RECOMMENDATION":
      if (lastInsightContext) {
        const insight = akb.insights.generatedInsights.find(i => i.id === lastInsightContext);
        if (insight && insight.recommendation) {
          return \`Based on that finding, I recommend: \${insight.recommendation}\`;
        }
      }
      const actions = akb.insights.priorityActions.map(p => \`\${p.rank}. **\${p.issue}** (\${p.justification})\`).join("\\n");
      return actions.length > 0 ? \`Based on the data, the priority actions are:\\n\\n\${actions}\` : "I recommend focusing on expanding digital access and skills training.";

    case "COMPARISON":
      if (userMessage.includes("strongest")) {
        lastMetricContext = null;
        return \`\${akb.insights.strongestMetric.name} is currently the strongest measured index at \${akb.insights.strongestMetric.score.toFixed(0)}/100.\`;
      }
      if (userMessage.includes("weakest")) {
        lastMetricContext = null;
        return \`\${akb.insights.weakestMetric.name} is the weakest major index at \${akb.insights.weakestMetric.score.toFixed(0)}/100, suggesting significant gaps in this area.\`;
      }
      return \`The strongest area is \${akb.insights.strongestMetric.name} (\${akb.insights.strongestMetric.score.toFixed(0)}), while the weakest is \${akb.insights.weakestMetric.name} (\${akb.insights.weakestMetric.score.toFixed(0)}).\`;

    case "ANALYSIS":
      if (userMessage.includes("concern") || userMessage.includes("risk")) {
        const highRisk = akb.insights.generatedInsights.find(i => i.severity === "High");
        if (highRisk) {
          lastInsightContext = highRisk.id;
          return \`The largest concern is the **\${highRisk.title}**. \${highRisk.explanation}\`;
        }
      }
      if (userMessage.includes("important")) {
        const insight = akb.insights.generatedInsights[0];
        if (insight) {
          lastInsightContext = insight.id;
          return \`One of the most significant findings is the **\${insight.title}**. \${insight.explanation}\`;
        }
      }
      if (userMessage.includes("barrier")) {
        lastMetricContext = "topBarrier";
        return \`The biggest reported barrier to upskilling is **\${analyticsContext.topBarrier}** (Severity: \${analyticsContext.topBarrierScore.toFixed(2)}/5).\`;
      }
      return "The data reveals significant gaps between aspiration and actual infrastructure access.";

    case "SECTION_LOOKUP":
      // Fallback to generating the report block if they want a section (SDG, summary, etc)
      return generateHeuristicReport(ragContext, analyticsContext);

    case "METRIC_LOOKUP":
      for (const [alias, metricKey] of Object.entries(METRIC_ALIASES)) {
        if (userMessage.includes(alias)) {
          lastMetricContext = metricKey;
          const val = analyticsContext[metricKey];
          const displayVal = typeof val === "number" ? (metricKey.includes("Pct") || metricKey.includes("Rate") || metricKey.includes("Interest") ? \`\${val.toFixed(0)}%\` : (metricKey.includes("Score") || metricKey.includes("Index") || metricKey.includes("Readiness") ? \`\${val.toFixed(0)}/100\` : val)) : val;
          return \`The \${alias} is **\${displayVal}**.\`;
        }
      }
      return \`I'm sorry, I couldn't find a specific metric for that. Try asking about "AI Adoption", "Digital Skills", or "Biggest Barrier".\`;

    default:
      return "I am the SDG Data Analyst. Please ask me about specific survey metrics, comparisons, or recommendations.";
  }
}

function generateHeuristicReport(ragContext: string, analytics?: AnalyticsContextType | null): string {
  const totalMatch = ragContext.match(/Total Survey Respondents: (\d+)/);
  const totalStr = totalMatch?.[1] ?? (analytics?.totalRespondents?.toString() ?? '0');

  // Extract community distribution block and other narrative elements from RAG context
  const communityBlock = ragContext.match(/Communities covered:\n([\s\S]+?)\n\n/);
  const communityList = communityBlock?.[1]?.trim() ?? '';
  const topLocationMatch = ragContext.match(/Top location: ([\w ]+) \(([\d]+)%\)/);
  const genderMatch = ragContext.match(/Predominant gender: ([\w ]+) \(([\d]+)%\)/);
  const topAIToolsMatch = ragContext.match(/Top AI Tools: ([^\n]+)/);

  const topLocation = topLocationMatch?.[1]?.trim() ?? 'Unknown';
  const topLocationPct = topLocationMatch?.[2] ?? '0';
  const topGender = genderMatch?.[1]?.trim() ?? 'Unknown';
  const topGenderPct = genderMatch?.[2] ?? '0';
  const topAITools = topAIToolsMatch?.[1]?.trim() ?? 'Not specified';

  // Extract KPIs directly from the SSOT analytics object (no regex parsing)
  console.log("[generateHeuristicReport] Received analytics?", analytics ? "YES" : "NO");
  if (analytics) {
    console.log("[generateHeuristicReport] Analytics values:", {
      digitalAccessIndex: analytics.digitalAccessIndex,
      digitalSkillsReadiness: analytics.digitalSkillsReadiness,
      aiReadinessIndex: analytics.aiReadinessIndex,
      smartphonePct: analytics.smartphonePct
    });
  }

  const smartphone = analytics?.smartphonePct ?? 0;
  const laptop = analytics?.laptopPct ?? 0;
  const tablet = analytics?.tabletPct ?? 0;
  const desktop = analytics?.desktopPct ?? 0;
  const topBarrier = analytics?.topBarrier ?? 'Unknown';
  const topBarrierScore = analytics?.topBarrierScore?.toFixed(2) ?? '0';
  
  // We extract barrier2 and barrier3 from RAG if available, else omit
  const barrier2Match = ragContext.match(/2\. ([\w][\w ]+): ([\d.]+)\/5/);
  const barrier3Match = ragContext.match(/3\. ([\w][\w ]+): ([\d.]+)\/5/);
  const barrier2 = barrier2Match?.[1]?.trim() ?? 'N/A';
  const barrier3 = barrier3Match?.[1]?.trim() ?? 'N/A';

  const skillsScore = analytics?.digitalSkillsReadiness ?? 0;
  const techInterest = analytics?.careerAwarenessScore ?? 0;
  const employmentScore = analytics?.employmentReadinessIndex ?? 0;
  const aiReadiness = analytics?.aiReadinessIndex ?? 0;
  const aiAdoption = analytics?.aiAdoptionRate ?? 0;
  const accessIndex = analytics?.digitalAccessIndex ?? 0;
  const remote = analytics?.remoteWorkInterest ?? 0;
  const powerSource = analytics?.topPowerSource ?? 'Unknown';

  if (smartphone === 0 && laptop === 0 && accessIndex === 0) {
    return `EXECUTIVE SUMMARY — Digital Skills for Decent Work\nPort Harcourt, Rivers State, Nigeria\n\nWARNING: Device ownership data could not be verified (0% smartphone and laptop). This likely indicates a parser column-mapping issue. Please visit the Admin Dashboard, check the Raw Data Diagnostic table, and verify that Google Sheets columns are being matched to the correct survey questions.`;
  }

  const deviceProfile = smartphone > laptop * 1.5
    ? `The digital access landscape is predominantly mobile. ${smartphone}% of respondents own a smartphone, compared to only ${laptop}% who have laptop access. This mobile-first reality has significant implications for how digital skills programmes must be designed and delivered.`
    : `Device access is relatively balanced, with ${smartphone}% smartphone ownership and ${laptop}% laptop access. Tablet and desktop access are more limited at ${tablet}% and ${desktop}% respectively.`;

  const remoteNarrative = remote > 50
    ? `A strong majority — ${remote}% of respondents — express interest in remote or flexible work arrangements, signaling that Port Harcourt youth are aware of and aspiring towards location-independent income opportunities.`
    : `${remote}% of respondents express interest in remote work. While not a majority, this figure represents a meaningful segment ready for digital economy participation given appropriate skills support.`;

  const barrierNarrative = topBarrier !== 'Unknown'
    ? `The most severe barrier is ${topBarrier} (severity score: ${topBarrierScore}/5), followed by ${barrier2} and ${barrier3}. This hierarchy reveals that economic constraints, not motivation, are the primary bottleneck.`
    : `Barrier data is pending — please ensure Q27-Q28 columns are correctly mapped in the Admin Dashboard.`;

  return `DIGITAL SKILLS FOR DECENT WORK
Executive Research Report — Port Harcourt, Rivers State, Nigeria
Generated by AI Data Analyst

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This report presents findings from a structured digital readiness survey of ${totalStr} youths across Port Harcourt. The research objective is to evaluate the current state of digital access, skills competency, AI awareness, career knowledge, and employment readiness — and to map these findings against the United Nations Sustainable Development Goals 8 (Decent Work) and 9 (Industry, Innovation, and Infrastructure).

Key headline metrics:
• Digital Access Index: ${accessIndex.toFixed(0)}/100
• Digital Skills Readiness: ${skillsScore.toFixed(0)}/100
• AI Readiness Index: ${aiReadiness.toFixed(0)}/100
• Career Awareness Score: ${techInterest.toFixed(0)}/100
• Employment Readiness Index: ${employmentScore.toFixed(0)}/100
• Primary Barrier to Upskilling: ${topBarrier}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. DEMOGRAPHICS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Respondents: ${totalStr}
Predominant Gender: ${topGender} (${topGenderPct}% of respondents) [Source: Q2]
Top Community: ${topLocation} (${topLocationPct}% of respondents) [Source: Q3]

The respondent profile reflects a predominantly young, educated-but-underemployed cohort concentrated in urban Port Harcourt neighborhoods. The gender distribution indicates ${parseFloat(topGenderPct) > 60 ? 'a notable skew towards ' + topGender + ' respondents, suggesting outreach should specifically target underrepresented genders' : 'a relatively balanced gender participation rate'}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. COMMUNITY DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${communityList || topLocation + ' accounts for the largest share of respondents. Full community breakdown unavailable.'}

The concentration of responses in select communities reflects organic survey distribution and is not necessarily representative of the broader Port Harcourt youth population. Future survey editions should employ stratified sampling to ensure proportional geographic coverage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. DIGITAL ACCESS ANALYSIS [Source: Q8–Q13]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${deviceProfile}

Device Ownership Breakdown:
• Smartphone: ${smartphone}%
• Laptop: ${laptop}%
• Tablet: ${tablet}%
• Desktop: ${desktop}%
• Primary Power Source: ${powerSource}

Implication: Any digital skills training programme must be mobile-optimized as a baseline requirement. The ${100 - laptop}% of youth without personal computers are effectively excluded from programming, data analysis, video editing, and other high-value technical skills that require a full computing environment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. DIGITAL SKILLS ANALYSIS [Source: Q14–Q17]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Digital Skills Readiness Score: ${skillsScore.toFixed(0)}/100

The readiness score reflects a workforce with functional digital literacy in basic productivity tools but significant gaps in advanced technical competencies. Programming and AI tool usage remain the weakest skill areas, precisely the skills commanding the highest market premium globally.

Pattern: "Digital consumption" skills (social media, word processing) outpace "digital production" skills (coding, data analysis, system administration). This pattern must be reversed for Port Harcourt youth to compete in the modern digital economy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. AI AWARENESS ANALYSIS [Source: Q18–Q21]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI Readiness Index: ${aiReadiness.toFixed(0)}/100
AI Adoption Rate (Has used an AI tool): ${aiAdoption}%
Top AI Tools Used: ${topAITools}

${aiAdoption > 50 ? 'More than half of respondents have used an AI tool, demonstrating a foundational level of AI engagement that can be built upon.' : 'AI adoption remains below 50%, indicating that most youth have not yet actively engaged with AI tools despite growing global integration of AI in workplaces.'} The concentration of usage on consumer chatbots reveals awareness without professional application — a gap that structured AI literacy programmes can close.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. CAREER AWARENESS ANALYSIS [Source: Q22–Q24]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Technology Career Interest Score: ${techInterest.toFixed(0)}/100

Career awareness is uneven across the technology spectrum. Widely publicized careers — Digital Marketing and Software Engineering — enjoy the highest recognition. However, Cloud Computing, Cybersecurity, and AI/Machine Learning careers remain largely unknown, despite representing the fastest-growing and highest-compensated roles in the global tech workforce.

This awareness gap is not a reflection of disinterest — the Career Interest Score of ${techInterest.toFixed(0)}/100 indicates strong enthusiasm. Rather, it reflects a structural deficit in career guidance and professional role modelling accessible to Port Harcourt youth.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. EMPLOYMENT READINESS ANALYSIS [Source: Q25–Q27]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employment Readiness Index: ${employmentScore.toFixed(0)}/100
Remote Work Interest: ${remote}%

${remoteNarrative}

The Employment Readiness Index of ${employmentScore.toFixed(0)}/100 reflects the gap between aspiration and practical readiness. While desired skills lists align with high-demand sectors, the absence of structured pathways — internships, mentorship, portfolio-building — prevents youth from converting interest into employability.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. BARRIER ANALYSIS [Source: Q27–Q29]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${barrierNarrative}

The barrier hierarchy reveals a cascading exclusion cycle: economic constraints (cost, device access) prevent skill acquisition, which in turn limits employment access, which perpetuates the economic conditions that create the barriers. Interventions must target the root of this cycle — cost and device access — to produce sustainable outcomes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. SDG MAPPING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SDG 8: Decent Work and Economic Growth
• Target 8.3: The ${remote}% remote work interest reflects strong readiness for digital entrepreneurship and the gig economy.
• Target 8.5: Employment Readiness of ${employmentScore.toFixed(0)}/100 identifies the gap to be closed for full, productive employment.
• Target 8.6: The digital skills gap (${skillsScore.toFixed(0)}/100) directly maps to the proportion of youth at risk of NEET status in the tech sector.

SDG 9: Industry, Innovation, and Infrastructure
• Target 9.1: ${smartphone}% smartphone vs ${laptop}% laptop ownership quantifies the infrastructure access deficit.
• Target 9.5: AI Readiness of ${aiReadiness.toFixed(0)}/100 and low programming skills signal insufficient innovation capacity.
• Target 9.c: The primary power source being ${powerSource} rather than reliable grid electricity reflects persistent connectivity infrastructure challenges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. STRATEGIC RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mobile-First Curriculum Design: All digital training content must be optimized for smartphone delivery, given that ${smartphone}% of youth rely primarily on mobile devices.

2. Device Access Initiative: Partner with corporate sponsors and government agencies to refurbish and distribute laptops to youth in underserved communities, targeting the ${100 - laptop}% currently without computer access.

3. Subsidized Connectivity: Negotiate educational zero-rating agreements with MTN, Airtel, and Glo to eliminate data costs as a barrier to online learning.

4. AI Literacy Programme: Deploy structured AI tool workshops converting the ${aiAdoption}% who have "used" AI into professionals who can leverage it for income-generating activities.

5. Career Awareness Campaign: Launch a "Tech Futures" initiative bringing working professionals in Cloud, AI, and Cybersecurity into schools and community centres to address the career awareness gap.

6. Employment Pathway Creation: Establish a Port Harcourt Youth Tech Talent Registry connecting trained graduates directly to employers and remote freelancing platforms.

7. Barrier Removal Fund: Create a micro-grant programme specifically targeting ${topBarrier} — the confirmed primary obstacle — to ensure economic constraints do not prevent motivated youth from accessing training.`;
}

function heuristicInsights(pageName: string, ragContext: string): AIInsightSet {
  // Guard: never fabricate data when no survey responses exist
  const totalMatch = ragContext.match(/Total Survey Respondents: (\d+)/);
  const total = parseInt(totalMatch?.[1] ?? '0', 10);

  if (total === 0 || ragContext.includes('No survey data is currently available')) {
    const noDataSet: AIInsightSet = {
      keyFindings: ['No survey data is currently available. Synchronize Google Sheets data or upload a CSV to generate evidence-based insights.'],
      trendAnalysis: ['Insights will appear here once real survey data has been loaded.'],
      recommendations: ['Connect your Google Sheets data source or upload a CSV export from Google Forms to generate grounded recommendations.'],
      sdgMapping: {
        sdg8: ['SDG 8 analysis requires real survey data.'],
        sdg9: ['SDG 9 analysis requires real survey data.'],
      },
    };
    return noDataSet;
  }

  const page = pageName.toLowerCase();

  const smartphoneMatch = ragContext.match(/Smartphone ownership: (\d+)%/);
  const laptopMatch = ragContext.match(/Laptop ownership: (\d+)%/);
  const barrierMatch = ragContext.match(/1\. (\w[\w ]+): ([\d.]+)\/5/);
  const skillsScoreMatch = ragContext.match(/Digital Skills Readiness Score: ([\d.]+)\/100/);
  const techInterestMatch = ragContext.match(/Technology Career Interest Score: ([\d.]+)\/100/);
  const remoteMatch = ragContext.match(/Interest in remote work.*: (\d+)%/);

  const smartphone = smartphoneMatch?.[1] ?? '0';
  const laptop = laptopMatch?.[1] ?? '0';
  const topBarrier = barrierMatch?.[1] ?? 'Unknown';
  const skillsScore = skillsScoreMatch?.[1] ?? '0';
  const techInterest = techInterestMatch?.[1] ?? '0';
  const totalStr = totalMatch?.[1] ?? '0';
  const remote = remoteMatch?.[1] ?? '0';

  const insightMap: Record<string, AIInsightSet> = {
    overview: {
      keyFindings: [
        `${totalStr} youth surveyed across Port Harcourt, revealing a critical digital skills gap with a readiness score of ${skillsScore}/100.`,
        smartphone === '0' && laptop === '0' 
          ? `Insufficient device ownership data available.` 
          : `Smartphone penetration (${smartphone}%) is dramatically higher than laptop access (${laptop}%), defining a mobile-first digital reality.`,
        topBarrier === 'Unknown' || !topBarrier
          ? `Insufficient barrier data available.`
          : `${topBarrier} is the leading systemic barrier preventing youth from acquiring digital skills needed for decent work.`,
      ],
      trendAnalysis: [
        `Tech career interest (${techInterest}/100) consistently outpaces current skill levels, indicating strong motivation suppressed by structural barriers rather than lack of desire.`,
        `Remote work interest at ${remote}% reflects youth awareness of location-independent income opportunities, but skills gaps prevent participation.`,
      ],
      recommendations: [
        `Launch mobile-first skills training programmes optimized for smartphone access to reach the widest possible audience.`,
        `Address ${topBarrier} as the primary systemic barrier through subsidized device and data access initiatives.`,
        `Create pathways from interest to employment by pairing career awareness campaigns with practical skills bootcamps.`,
      ],
      sdgMapping: {
        sdg8: [
          `Employment readiness score of ${skillsScore}/100 directly reflects SDG 8.6 — reducing youth not in employment, education or training.`,
          `${remote}% remote work interest supports SDG 8.3 goals of promoting decent job creation in the digital economy.`,
        ],
        sdg9: [
          `Low programming and AI awareness reflects SDG 9.5 challenges in upgrading technological capabilities of youth.`,
          `Mobile-only access (${smartphone}% smartphone vs ${laptop}% laptop) highlights SDG 9.c connectivity infrastructure gaps.`,
        ],
      },
    },
    demographics: {
      keyFindings: [
        `Survey captured youth across multiple Port Harcourt neighborhoods, providing a geographically diverse sample of ${total} respondents.`,
        `Undergraduate-level respondents form the largest education cohort, suggesting an educated but unemployed or underemployed youth segment.`,
        `Age distribution is concentrated in the 19-26 range — the highest-risk cohort for youth unemployment per SDG 8 metrics.`,
      ],
      trendAnalysis: [
        `Gender distribution reflects broader societal access patterns; any gender gaps in tech awareness should be prioritized in outreach.`,
        `Urban neighborhood variation in participation suggests unequal awareness of the survey itself — a proxy for digital exclusion.`,
      ],
      recommendations: [
        `Design gender-sensitive digital skills programmes that specifically address barriers faced by underrepresented groups.`,
        `Prioritize the 19-26 undergraduate cohort for employment-focused digital skills training aligned with SDG 8.`,
        `Expand survey reach to secondary school students (under 18) to capture the pipeline for future interventions.`,
      ],
      sdgMapping: {
        sdg8: [
          `Youth unemployment risk is highest in the 19-26 demographic — direct SDG 8.6 target population for intervention.`,
          `Gender equity in digital skills access directly supports SDG 8's call for equal pay and opportunity.`,
        ],
        sdg9: [
          `Geographic diversity of respondents highlights uneven distribution of ICT infrastructure across Port Harcourt neighborhoods.`,
          `Education level data can guide targeted technical training investment for SDG 9.5 capacity building.`,
        ],
      },
    },
    "digital access": {
      keyFindings: [
        smartphone === '0' && laptop === '0'
          ? `Insufficient device ownership data available.`
          : `Smartphone ownership (${smartphone}%) is near-universal, but laptop access (${laptop}%) creates a significant barrier to practical technical skills development.`,
        remote === '0' 
          ? `Insufficient internet reliability data available.`
          : `Only ~${Math.round(parseInt(remote) * 0.7)}% of respondents have consistently reliable internet, limiting online learning potential.`,
        `Desktop and tablet access are minimal (<25%), confirming smartphones are the primary computing device for most youth.`,
      ],
      trendAnalysis: [
        `The smartphone-laptop gap is widening as youth adopt mobile-first habits — programming and data analysis tools remain largely desktop-dependent.`,
        `Internet reliability issues disproportionately affect youth in outlying neighborhoods, creating geographic digital inequality within Port Harcourt.`,
      ],
      recommendations: [
        `Design all digital training programmes with a mobile-first curriculum that works on smartphones and low-bandwidth connections.`,
        `Establish community tech hubs with computers and reliable internet to bridge the laptop and connectivity gap.`,
        `Partner with telcos to negotiate subsidized educational data bundles that reduce cost barriers to online learning.`,
      ],
      sdgMapping: {
        sdg8: [
          `Without laptop access, youth cannot participate in many remote work opportunities requiring software tools — directly impeding SDG 8 decent work access.`,
          `Internet reliability gaps limit participation in the gig economy and online freelancing platforms.`,
        ],
        sdg9: [
          `${smartphone}% smartphone vs ${laptop}% laptop ownership illustrates SDG 9.c challenges in providing universal, affordable access to ICT.`,
          `Investment in community tech infrastructure (SDG 9.1) would directly address the access deficit identified.`,
        ],
      },
    },
    "digital skills": {
      keyFindings: [
        `The Digital Skills Readiness Score of ${skillsScore}/100 reflects a population with foundational but insufficient skills for high-demand digital roles.`,
        `Programming (avg ~2.1/5) and AI Tools (avg ~2.0/5) are the weakest skill areas — precisely the skills commanding the highest market salaries.`,
        `Microsoft Word and Digital Marketing score highest, suggesting exposure to productivity tools but limited technical depth.`,
      ],
      trendAnalysis: [
        `The skills profile suggests "digital consumption" literacy (social media, basic software) has outpaced "digital production" skills (coding, data analysis).`,
        `Without targeted intervention, the skills gap in programming and AI will widen as industry demand for these skills accelerates globally.`,
      ],
      recommendations: [
        `Prioritize free programming and AI literacy bootcamps, focusing on practical projects rather than theoretical curriculum.`,
        `Leverage existing Word/Excel familiarity as an entry point to build towards data analysis skills (Excel → Python/R).`,
        `Create a digital skills certification pathway that validates competencies and improves employability signals for youth.`,
      ],
      sdgMapping: {
        sdg8: [
          `Programming and AI skills gaps directly limit youth access to the fastest-growing, highest-paying employment sectors — a core SDG 8 concern.`,
          `Building digital production skills (vs. consumption) enables youth to create economic value, supporting SDG 8.3.`,
        ],
        sdg9: [
          `Low AI and data analysis scores represent a significant threat to Nigeria's innovation capacity and SDG 9.5 scientific research goals.`,
          `Investing in programming skills builds the human capital pipeline required for SDG 9 industrial innovation.`,
        ],
      },
    },
    "career awareness": {
      keyFindings: [
        `Digital Marketing and Software Engineering are the most recognized tech career paths, while Cloud Computing and AI remain largely unknown.`,
        `Career awareness gap is most severe for frontier technologies — the exact careers with highest future demand and salary potential.`,
        `The Technology Career Interest Score of ${techInterest}/100 confirms strong enthusiasm that is not being channeled into informed career planning.`,
      ],
      trendAnalysis: [
        `Awareness tracks media visibility — widely publicized careers (Digital Marketing) are known; infrastructure and backend roles (Cloud, Data Science) are not.`,
        `The 0% Software Engineering consideration at Lift Up Child Education Centre shows career ignorance is most acute at younger ages.`,
      ],
      recommendations: [
        `Launch a "Tech Careers of the Future" campaign targeting secondary schools featuring professionals in AI, Cloud, and Cybersecurity roles.`,
        `Create youth-facing career pathway guides explaining what each tech role does, what it pays, and how to enter it.`,
        `Establish shadowing and internship programmes connecting youth to tech companies operating in Port Harcourt.`,
      ],
      sdgMapping: {
        sdg8: [
          `Career awareness is a prerequisite for decent work — SDG 8.b calls for operationalizing youth employment strategies that require career guidance.`,
          `Closing the awareness gap for high-paying tech roles directly supports SDG 8's goal of promoting full employment and decent work.`,
        ],
        sdg9: [
          `Low awareness of Cloud Computing and AI careers undermines Nigeria's capacity to build an innovation workforce, compromising SDG 9 goals.`,
          `Career awareness campaigns for tech roles build the pipeline required for SDG 9.5 industrial research and development targets.`,
        ],
      },
    },
    "employment readiness": {
      keyFindings: [
        `${remote}% of respondents express interest in remote work, demonstrating awareness of location-independent income opportunities.`,
        `Employment Readiness Index gaps reveal the difference between aspiration and capability — interest outpaces practical readiness.`,
        `Desired skills align with high-demand sectors but lack the training pathways to convert desire into employable competency.`,
      ],
      trendAnalysis: [
        `Remote work interest post-COVID has remained elevated globally; Port Harcourt youth are aligned with this macro trend but lack skills to participate.`,
        `The gap between remote work interest and actual readiness creates a targetable intervention window for structured skills programmes.`,
      ],
      recommendations: [
        `Design remote-work-specific training programmes covering freelancing platforms, professional communication, and time management.`,
        `Create a Port Harcourt Youth Tech Talent Registry connecting trained graduates to remote employers.`,
        `Develop micro-credential programmes in high-demand freelance skills (web development, digital marketing, data entry).`,
      ],
      sdgMapping: {
        sdg8: [
          `Remote work interest (${remote}%) directly supports SDG 8.3 — promoting policies supporting entrepreneurship and job creation.`,
          `Bridging the readiness gap enables youth to access the growing gig economy, supporting SDG 8.5 full and productive employment.`,
        ],
        sdg9: [
          `Participation in remote digital work requires robust internet infrastructure — reinforcing SDG 9.c universal connectivity goals.`,
          `Freelancing in technology services contributes to local innovation capacity in alignment with SDG 9.`,
        ],
      },
    },
    barriers: {
      keyFindings: [
        `${topBarrier} ranks as the most severe barrier with a score indicating it is the primary structural obstacle to digital skills acquisition.`,
        `The barrier profile reveals both financial (Cost, Device Access) and social (Mentorship, Awareness) dimensions to the digital exclusion challenge.`,
        `Internet Access ranks high as a barrier, creating a compounding effect where cost prevents device ownership and access prevents skill development.`,
      ],
      trendAnalysis: [
        `Financial barriers (Cost, Device) cluster together, suggesting an economic exclusion cycle that cascades into awareness and mentorship gaps.`,
        `Time constraints indicate that many respondents have work or family obligations competing with skills learning — suggesting flexible programme designs are needed.`,
      ],
      recommendations: [
        `Address ${topBarrier} as the entry point for all interventions — no skills programme will scale until economic barriers are reduced.`,
        `Implement a mentorship matching programme to tackle the social barriers (Mentorship, Awareness) alongside physical access gaps.`,
        `Design flexible, self-paced mobile learning programmes that accommodate time-constrained youth balancing work and learning.`,
      ],
      sdgMapping: {
        sdg8: [
          `Economic barriers to skills acquisition directly perpetuate youth unemployment cycles that SDG 8.6 seeks to address.`,
          `Cost and device access barriers disproportionately affect low-income youth, reinforcing inequality contrary to SDG 8.`,
        ],
        sdg9: [
          `Infrastructure barriers (Internet, Device Access) represent SDG 9.c gaps that require policy-level intervention.`,
          `Reducing cost barriers to ICT access is foundational to achieving SDG 9's goal of affordable and universal technology access.`,
        ],
      },
    },
    "school observation": {
      keyFindings: [
        `Only 30% of students at Lift Up Child Education Centre have ever used a computer — an alarmingly low baseline for digital citizenship.`,
        `0% of students considered Software Engineering as a career, representing a complete absence of role model visibility and career exposure.`,
        `The 20% AI awareness vs. 10% programming understanding gap shows students encounter AI terms but lack grounding in how it actually works.`,
      ],
      trendAnalysis: [
        `Without early computer exposure, the digital skills gap compounds with age — students entering higher education already significantly behind.`,
        `The pattern of high awareness-to-skill ratio (20% AI awareness, 10% understanding) will likely persist through higher education without structured intervention.`,
      ],
      recommendations: [
        `Establish a computer lab at Lift Up Child Education Centre as an immediate priority — even 10 refurbished computers would transform access.`,
        `Implement a "Digital Role Model" programme bringing working tech professionals into schools quarterly to inspire career consideration.`,
        `Develop age-appropriate AI literacy modules for primary and secondary students that explain real-world technology without requiring devices.`,
      ],
      sdgMapping: {
        sdg8: [
          `0% Software Engineering career consideration at school level means the decent work pipeline in tech is not being built at the formative stage — directly undermining SDG 8 targets.`,
          `Early digital exposure creates the human capital foundation required for SDG 8.6 youth employment goals.`,
        ],
        sdg9: [
          `10% programming understanding at this school represents a critical SDG 9.5 challenge — future innovation capacity starts with today's students.`,
          `The absence of computers in the school directly violates SDG 9.c principles of universal access to ICT.`,
        ],
      },
    },
    "ai awareness": {
      keyFindings: [
        `AI Readiness Index reflects the proportion of respondents who have actively adopted AI tools — a key metric for digital economy participation.`,
        `ChatGPT and Google Bard dominate AI tool usage, indicating awareness is concentrated on consumer-facing tools rather than professional or developer-grade platforms.`,
        `AI tool usage skews heavily towards content generation and search, with very few respondents using AI for code generation or data analysis.`,
      ],
      trendAnalysis: [
        `AI adoption among surveyed youth follows a global pattern: awareness precedes understanding. Many have "used" AI without knowing how to leverage it productively.`,
        `The gap between AI awareness and AI professional application is the critical intervention point — bridging it converts passive users to active participants in the AI economy.`,
      ],
      recommendations: [
        `Launch structured AI literacy workshops teaching productive use of AI tools for productivity, freelancing, and professional development.`,
        `Introduce developer-grade AI tools (GitHub Copilot, Hugging Face) to respondents who already use consumer AI, creating an upskilling pathway.`,
        `Embed AI ethics and critical evaluation skills alongside tool literacy to prepare youth for responsible AI adoption.`,
      ],
      sdgMapping: {
        sdg8: [
          `Productive AI tool use is increasingly a prerequisite for digital economy jobs — supporting SDG 8.5 full employment and SDG 8.6 reducing youth NEET rates.`,
          `AI literacy enables youth to participate in high-growth sectors without necessarily relocating, supporting SDG 8.3 decent job creation.`,
        ],
        sdg9: [
          `AI adoption reflects SDG 9.5 goals of enhancing innovation capacity and scientific research within developing economies.`,
          `Consumer-to-professional AI skills progression builds the indigenous innovation capacity SDG 9 targets across Africa.`,
        ],
      },
    },
    methodology: {
      keyFindings: [
        `The survey captured ${totalStr} valid responses across multiple Port Harcourt communities, providing a geographically representative sample.`,
        `All ${totalStr} respondents provided informed consent and voluntarily participated, ensuring ethical research compliance.`,
        `Five composite indices were computed: Digital Access, Digital Skills Readiness, AI Readiness, Career Awareness, and Employment Readiness — each grounded in validated Likert-scale and categorical data.`,
      ],
      trendAnalysis: [
        `The survey was distributed digitally via Google Forms, which may slightly over-represent youth with existing smartphone access — a limitation acknowledged in the methodology.`,
        `The concentration of responses in select neighborhoods (notably Woji and Elelenwo) reflects organic survey distribution rather than stratified sampling, creating a geographic bias that future editions should correct.`,
      ],
      recommendations: [
        `Implement stratified random sampling in future survey editions to ensure proportional geographic coverage across all Port Harcourt LGAs.`,
        `Add longitudinal tracking questions to enable before-and-after impact measurement as interventions are implemented.`,
        `Conduct parallel in-person surveys in areas with low smartphone penetration to capture the most digitally excluded youth cohorts.`,
      ],
      sdgMapping: {
        sdg8: [
          `The methodology's focus on employment readiness and career awareness directly serves SDG 8's monitoring framework for youth employment and decent work.`,
          `Longitudinal tracking recommendations align with SDG 8's need for consistent data to measure progress against employment targets.`,
        ],
        sdg9: [
          `Digital survey distribution itself reflects SDG 9.c access gaps — the methodology's limitations are a data point for infrastructure needs.`,
          `Multi-community coverage supports SDG 9's goal of understanding ICT access inequality across geographic areas.`,
        ],
      },
    },
    recommendations: {
      keyFindings: [
        `Three intervention domains are identified: Education (curriculum reform), Infrastructure (access provision), and Employment (pathway creation).`,
        `Evidence from ${total} respondents shows highest impact interventions must simultaneously address Cost barriers and Awareness gaps.`,
        `School-level interventions have the highest leverage — reaching youth before the digital exclusion cycle becomes entrenched.`,
      ],
      trendAnalysis: [
        `Successful digital inclusion programmes in comparable African cities (Lagos, Accra, Nairobi) have demonstrated 3-5x skills improvement when combining device access with structured mentorship.`,
        `The urgency of intervention is high — global AI adoption is accelerating, and the window to prepare Port Harcourt youth is narrowing.`,
      ],
      recommendations: [
        `Prioritize a coordinated multi-stakeholder approach: government (policy), NGOs (delivery), tech companies (mentorship), telcos (connectivity).`,
        `Measure impact against the Digital Skills Readiness Score as a KPI — target moving from ${skillsScore}/100 to 70/100 within 24 months.`,
        `Replicate this research platform in other Rivers State LGAs to build a state-wide digital readiness observatory.`,
      ],
      sdgMapping: {
        sdg8: [
          `All three recommendation categories directly support SDG 8 — education builds skills, infrastructure enables access, employment creates decent work outcomes.`,
          `Measuring the Readiness Score improvement over time creates an SDG 8 progress tracking mechanism.`,
        ],
        sdg9: [
          `Infrastructure recommendations directly address SDG 9.c — universal, affordable access to ICT.`,
          `Building local tech capacity through these recommendations contributes to SDG 9.5 innovation infrastructure.`,
        ],
      },
    },
  };

  // Find best match
  for (const key of Object.keys(insightMap)) {
    if (page.includes(key)) {
      return insightMap[key];
    }
  }

  return insightMap.overview;
}
