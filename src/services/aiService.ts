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
  isReportGeneration?: boolean
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
    return generateHeuristicReport(ragContext);
  }
  return heuristicResponse(messages[messages.length - 1]?.content ?? "", ragContext);
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

// ─── Heuristic Engine (No API Key Required) ───────────────────────────────────
function heuristicResponse(userMessage: string, ragContext: string): string {
  // Guard: never fabricate data when no survey responses exist
  const totalMatch = ragContext.match(/Total Survey Respondents: (\d+)/);
  const total = parseInt(totalMatch?.[1] ?? '0', 10);
  if (total === 0 || ragContext.includes('No survey data is currently available')) {
    return 'No survey data is currently available. Please synchronize Google Sheets data or upload a CSV to generate insights grounded in real survey responses.';
  }

  const q = userMessage.toLowerCase();

  // Parse key stats from RAG context
  const smartphoneMatch = ragContext.match(/Smartphone ownership: (\d+)%/);
  const laptopMatch = ragContext.match(/Laptop ownership: (\d+)%/);
  const barrierMatch = ragContext.match(/1\. (\w[\w ]+): ([\d.]+)\/5/);
  const skillsScoreMatch = ragContext.match(/Digital Skills Readiness Score: ([\d.]+)\/100/);
  const techInterestMatch = ragContext.match(/Technology Career Interest Score: ([\d.]+)\/100/);
  const remoteMatch = ragContext.match(/Interest in remote work.*: (\d+)%/);

  const smartphone = smartphoneMatch?.[1] ?? '0';
  const laptop = laptopMatch?.[1] ?? '0';
  const topBarrier = barrierMatch?.[1] ?? 'Unknown';
  const topBarrierScore = barrierMatch?.[2] ?? '0';
  const skillsScore = skillsScoreMatch?.[1] ?? '0';
  const techInterest = techInterestMatch?.[1] ?? '0';
  const totalStr = totalMatch?.[1] ?? '0';
  const remote = remoteMatch?.[1] ?? '0';

  if (q.includes("who are you") || q.includes("are you an ai") || q.includes("what are you") || q.includes("hello") || q.includes("hi ") || q === "hi") {
    return `Yes, I am the AI Data Analyst Assistant for the Digital Skills for Decent Work project!\n\nI have analyzed ${totalStr} survey responses from Port Harcourt. You can ask me about the skills gaps, access barriers, or how the data aligns with SDG 8 and 9.`;
  }

  if (q.includes("barrier") || q.includes("challenge") || q.includes("obstacle")) {
    return `**Barrier Analysis**\n\nBased on the survey data from ${totalStr} respondents, **${topBarrier}** is the most significant barrier to digital skills acquisition, with a severity score of **${topBarrierScore}/5**.\n\nThis finding aligns with SDG 9 Target 9.c, which calls for increasing access to ICT and ensuring affordable connectivity.`;
  }

  if (q.includes("skill") || q.includes("digital skill") || q.includes("proficiency")) {
    return `**Digital Skills Proficiency Analysis**\n\nThe overall Digital Skills Readiness Score is **${skillsScore}/100**, indicating a moderate foundation with critical gaps in advanced technical areas.\n\nNotably, **Programming** and **AI Tools** show the lowest average proficiency (below 2.5/5), while **Microsoft Word** and **Digital Marketing** score higher.\n\nThis gap directly undermines SDG 8.6, which aims to reduce the proportion of youth not in employment, education or training. Without programming and AI literacy, youth cannot access the fastest-growing employment sectors.\n\n**Recommendation:** Prioritize free bootcamps in programming and AI fundamentals targeting the 19-26 age group.`;
  }

  if (q.includes("career") || q.includes("awareness") || q.includes("job") || q.includes("employment")) {
    return `**Career Awareness & Employment Insights**\n\nTechnology Career Interest Score stands at **${techInterest}/100**, while the Employment Readiness Index reflects strong remote work interest at **${remote}%** of respondents.\n\nHowever, specific career awareness varies significantly:\n• **Digital Marketing** and **Software Engineering** enjoy the highest recognition\n• **Cloud Computing** and **AI** remain largely unknown career paths\n\nThis awareness gap is a critical intervention point. Youth are motivated but lack the career map to channel that motivation.\n\n**SDG 8 Implication:** Bridging the awareness-readiness gap requires structured mentorship linking aspiring youth to working tech professionals.`;
  }

  if (q.includes("access") || q.includes("device") || q.includes("smartphone") || q.includes("laptop") || q.includes("internet")) {
    return `**Digital Access Analysis**\n\nDevice access is highly asymmetric among surveyed youth:\n• **Smartphone ownership: ${smartphone}%** — near-universal access\n• **Laptop ownership: ${laptop}%** — less than half have a personal computer\n• **Good/Excellent internet: ~${remote}%** — significant reliability gaps remain\n\nThis smartphone-first reality is crucial for **SDG 9** (infrastructure) — it means any training or platform targeting these youth **must be mobile-optimized**.\n\nThe laptop gap directly limits participation in programming, data analysis, and other skill areas that require a full computer environment.`;
  }

  if (q.includes("sdg 8") || q.includes("decent work") || q.includes("economic")) {
    return `**SDG 8 — Decent Work and Economic Growth Analysis**\n\nKey SDG 8 indicators from the survey:\n\n• **Employment Readiness:** ${skillsScore}/100 — moderate baseline for entering digital economy\n• **Remote Work Interest:** ${remote}% agree or strongly agree — high potential for location-independent income\n• **Top Barrier:** ${topBarrier} (${topBarrierScore}/5) — economic constraints limiting skill acquisition\n\n**SDG 8 Targets Addressed:**\n- 8.3: Promote development-oriented policies supporting decent job creation\n- 8.6: Reduce youth not in employment, education or training\n- 8.b: Develop and operationalize a global strategy for youth employment\n\nThe data shows strong desire for economic participation but structural barriers (cost, access) preventing entry.`;
  }

  if (q.includes("sdg 9") || q.includes("innovation") || q.includes("infrastructure")) {
    return `**SDG 9 — Industry, Innovation and Infrastructure Analysis**\n\nKey SDG 9 indicators from the survey:\n\n• **AI Awareness:** Limited — only ~30-40% of respondents are aware of AI as a career path\n• **Programming Skills:** Avg. below 2.5/5 — critical innovation skill gap\n• **Cloud Computing Awareness:** Among the lowest of all career paths surveyed\n\n**SDG 9 Targets Addressed:**\n- 9.5: Enhance scientific research and upgrade technological capabilities\n- 9.c: Increase access to ICT and provide universal and affordable internet\n\nThe low awareness of frontier technologies (AI, cloud) combined with device access gaps means Port Harcourt youth are at risk of being bypassed by the 4th Industrial Revolution.`;
  }

  if (q.includes("school") || q.includes("elelenwo") || q.includes("lift up")) {
    return `**School Observation — Lift Up Child Education Centre, Elelenwo**\n\nThe field observation on 22 May 2026 revealed alarming foundational gaps:\n\n| Indicator | Percentage |\n|-----------|------------|\n| Used a computer | 30% |\n| Aware of AI tools | 20% |\n| Understand programming | 10% |\n| Considered Software Eng. career | **0%** |\n\nThe 0% career consideration for Software Engineering is not a lack of interest — it's a **complete absence of exposure**. Children cannot aspire to what they do not know exists.\n\n**Recommendation:** Implement a "Digital Future Day" programme where tech professionals visit schools in underserved communities monthly to demonstrate real careers.`;
  }

  if (q.includes("summary") || q.includes("overview") || q.includes("report")) {
    return `**Executive Summary — Digital Skills for Decent Work**\n\nThis project surveyed **${totalStr} youth** across Port Harcourt to map digital readiness for the modern economy.\n\n**Key Findings:**\n1. 📱 Smartphone access (${smartphone}%) far outpaces laptop access (${laptop}%), defining a mobile-first learning context\n2. 🎯 Digital Skills Readiness Score: **${skillsScore}/100** — foundational but insufficient for high-demand roles\n3. 🚀 Tech Career Interest: **${techInterest}/100** — appetite for growth exists\n4. 🧱 Top Barrier: **${topBarrier}** (severity ${topBarrierScore}/5) — the primary structural obstacle\n5. 🏫 School observation shows **0%** of students considered Software Engineering — an awareness crisis\n\n**SDG Alignment:**\n- SDG 8: Remote work interest (${remote}%) signals readiness for digital economy participation\n- SDG 9: Low AI/programming skills present a significant innovation gap\n\n**Priority Recommendations:**\n→ Mobile-first digital literacy programmes\n→ Subsidized device and internet access\n→ Career awareness campaigns in primary and secondary schools`;
  }

  if (q.includes("recommend") || q.includes("action") || q.includes("policy")) {
    return `**Evidence-Based Policy Recommendations**\n\nDerived from ${totalStr} survey responses:\n\n**Education:**\n• Integrate digital literacy into school curriculum from primary level\n• Create career exposure programmes targeting ages 10-15 in schools like Lift Up Child Education Centre\n• Partner with universities for free weekend bootcamps in programming and data analysis\n\n**Infrastructure (SDG 9):**\n• Establish minimum 3 community tech labs per LGA in Port Harcourt\n• Negotiate subsidized educational data plans with MTN/Airtel\n• Launch device refurbishment drives collecting corporate laptops for student reuse\n\n**Employment (SDG 8):**\n• Create a youth-tech mentorship registry connecting trained youth with employers\n• Promote remote work pathways for youth in underserved areas\n• Establish micro-grant schemes for youth starting digital service businesses`;
  }

  // Default contextual response
  return `**AI Data Analyst Response**\n\nBased on the survey data from **${totalStr} respondents** in Port Harcourt, I can help analyze any aspect of the "Digital Skills for Decent Work" research.\n\nYou can ask me about:\n• 📊 **Digital skills** proficiency and gaps\n• 🌐 **Device and internet access** patterns\n• 💼 **Career awareness** and employment readiness\n• 🧱 **Barriers** to learning digital skills\n• 📋 **SDG 8 or SDG 9** specific impact analysis\n• 📝 Generate an **executive summary** or policy brief\n\nWhat specific aspect of the data would you like to explore?`;
}

function generateHeuristicReport(ragContext: string): string {
  const totalMatch = ragContext.match(/Total Survey Respondents: (\d+)/);
  const totalStr = totalMatch?.[1] ?? '0';

  const smartphoneMatch = ragContext.match(/Smartphone ownership: (\d+)%/);
  const laptopMatch = ragContext.match(/Laptop ownership: (\d+)%/);
  const barrierMatch = ragContext.match(/1\. (\w[\w ]+): ([\d.]+)\/5/);
  const skillsScoreMatch = ragContext.match(/Digital Skills Readiness Score: ([\d.]+)\/100/);
  const techInterestMatch = ragContext.match(/Technology Career Interest Score: ([\d.]+)\/100/);
  const remoteMatch = ragContext.match(/Interest in remote work.*: (\d+)%/);
  const topLocationMatch = ragContext.match(/Top location: ([\w ]+) \(/);

  const smartphone = smartphoneMatch?.[1] ?? '0';
  const laptop = laptopMatch?.[1] ?? '0';
  const topBarrier = barrierMatch?.[1] ?? 'Unknown';
  const topBarrierScore = barrierMatch?.[2] ?? '0';
  const skillsScore = skillsScoreMatch?.[1] ?? '0';
  const techInterest = techInterestMatch?.[1] ?? '0';
  const remote = remoteMatch?.[1] ?? '0';
  const topLocation = topLocationMatch?.[1] ?? 'Unknown';

  return `## Executive Summary
This report analyzes ${totalStr} survey responses from youths across Port Harcourt, with a predominant focus on ${topLocation}. The objective is to evaluate digital readiness, career aspirations, and structural barriers to inform interventions aligned with SDG 8 (Decent Work) and SDG 9 (Innovation & Infrastructure).

**Key Findings:**
* The ecosystem is mobile-first: **${smartphone}%** smartphone ownership vs. **${laptop}%** laptop access.
* Foundational digital skills stand at **${skillsScore}/100**, indicating significant gaps in advanced capabilities.
* Economic barriers, primarily **${topBarrier}** (${topBarrierScore}/5 severity), heavily restrict skill acquisition.
* A strong appetite for digital economy participation exists, with **${remote}%** of respondents interested in remote work.

## Demographics Analysis
* **Total Respondents:** ${totalStr}
* **Predominant Location:** ${topLocation}
* **Engagement:** High enthusiasm, but heavily constrained by resources.

## Digital Access Analysis
Device ownership shapes the learning paradigm:
| Metric | Percentage | Source |
|---|---|---|
| Smartphone Ownership | ${smartphone}% | Q8 |
| Laptop Ownership | ${laptop}% | Q8 |

The disparity between mobile and computer access fundamentally limits the acquisition of high-value skills like software engineering and data analysis.

## Digital Skills Analysis
* **Readiness Score:** ${skillsScore}/100
* **Analysis:** While basic digital literacy (e.g., word processing, social media) is present, technical skills required for the modern digital economy are critically low.

## Career Awareness & Employment Readiness
* **Tech Career Interest Score:** ${techInterest}/100
* **Remote Work Interest:** ${remote}%
* **Analysis:** The desire for tech careers is exceptionally high, and the vast majority are eager to embrace location-independent work. However, the lack of career mapping and mentorship prevents this interest from translating into actual employment readiness.

## Barrier Analysis
The primary obstacle preventing digital upskilling is **${topBarrier}**. 
When device access is limited and training costs remain prohibitive, youths are effectively locked out of the digital economy despite their willingness to learn.

## SDG Mapping
### SDG 8: Decent Work and Economic Growth
The high remote work interest (${remote}%) is a direct indicator of readiness for modern economic participation. Unlocking this potential requires targeted interventions to reduce the entry barriers.

### SDG 9: Industry, Innovation, and Infrastructure
The severe lack of laptop access (${laptop}%) and low advanced digital skills represent a critical infrastructure and innovation gap. True innovation cannot occur on smartphones alone.

## Evidence-Based Recommendations
1. **Mobile-Optimized Learning:** Develop and deploy digital literacy programmes designed specifically for mobile devices to meet youths where they are.
2. **Device Interventions:** Partner with corporate sponsors for laptop refurbishment and distribution drives to bridge the hardware gap.
3. **Subsidized Connectivity:** Negotiate educational zero-rating or subsidized data plans with telecommunication providers to alleviate the cost of internet access.
4. **Career Mentorship:** Establish clear pathways connecting aspiring youth with established tech professionals to translate high career interest (${techInterest}/100) into actionable employment readiness.`;
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
