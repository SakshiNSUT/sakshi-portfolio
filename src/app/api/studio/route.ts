import { NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";

// // Helper to get local portfolio data
// async function getPortfolioData() {
//   try {
//     const filePath = path.join(process.cwd(), "src", "data", "portfolio.json");
//     const content = await fs.readFile(filePath, "utf8");
//     return JSON.parse(content);
//   } catch (error) {
//     console.error("Error reading portfolio data:", error);
//     return null;
//   }
// }
import portfolioData from "@/data/portfolio.json";

export async function POST(request: Request) {
  try {
    const { problem } = await request.json();
    if (!problem || problem.trim() === "") {
      return NextResponse.json({ error: "Problem description is required." }, { status: 400 });
    }

    // const portfolioData = await getPortfolioData();
    const apiKey = process.env.GEMINI_API_KEY;

    // --- DEMO MODE (FALLBACK IF NO API KEY IS CONFIGURED) ---
    if (!apiKey) {
      const prefix = "*(Demo Mode - Configure `GEMINI_API_KEY` for custom AI Product Studio teardowns)*\n\n";
      
      const analysisMarkdown = `### 1. Problem Framing
- **Core Challenge**: Optimizing user journey and workflow efficiency for: *"${problem}"*.
- **Target User**: Home-seekers, clients evaluating pricing, or internal product operations.
- **Success Metrics**: Increase lead conversion rate (CVR) by 8-10%, decrease drop-off rate at friction steps by 15%, and reduce operational turnaround time by 30%.

### 2. Should Analytics / AI Be Used?
- **Decision**: **Yes (Hybrid Approach)**. 
- **Rationale**: Basic analytics tracking (SQL + GA4/Mixpanel) must first be established to build a funnel baseline. Once bottlenecks are quantified (e.g., verifying user credentials), AI-assisted validation or personalized homepage recommendations can be layered on to boost click-through rates (CTR) and user engagement.

### 3. Suggested Workflow / Analytics Pipeline
1. **Data Ingestion**: Scrape or stream clickstream interaction events into a Databricks/SQL environment.
2. **Funnel Segmentation**: Use Cohort Analysis to isolate drop-off points by login method (e.g., standard login vs. Truecaller API) and platform device.
3. **Automated Monitoring**: Set up a Power BI / Mixpanel dashboard tracking conversion trends and re-engagement behaviors.
4. **Experimentation**: Launch A/B tests on the homepage first-fold layout (decluttering headers, inserting recommendations) to optimize CTR.

### 4. Risks, Tradeoffs, and Metrics
- **Risks**: Adding validation steps (like verification screens) reduces accidental submissions but might increase initial user drop-offs.
- **Tradeoffs**: Recommendations boost session duration (+15%) but require low-latency API calls to avoid hurting core page speeds.
- **Key Metrics to Track**: Marketing Qualified Leads (MQLs), Click-Through Rate (CTR), Bounce Rate, and Analytical Turnaround Time.`;

      return NextResponse.json({
        analysis: prefix + analysisMarkdown
      });
    }

    // --- LIVE AI RAG MODE USING GEMINI API ---
    const dataContext = portfolioData 
      ? JSON.stringify(portfolioData, null, 2) 
      : "Name: Sakshi, Role: Product & Data Analyst, Skills: SQL, Python, Power BI, Mixpanel, GA4, A/B Testing, Funnel Analysis";

    const studioPrompt = `You are the AI Product Studio engine representing Sakshi (Product & Data Analyst). 
A user has brought a product case problem to analyze. Your task is to output a high-quality, structured, professional product teardown showing how Sakshi would approach solving it using her background, skills, and previous project experiences.

Sakshi's Profile and Resume details:
-----------------
${dataContext}
-----------------

User Product Problem:
"${problem}"

Please write a structured analysis with the following 4 sections exactly. Use professional, clear, and bulleted Markdown formatting:

### 1. Problem Framing
(Restate the problem clearly, identify the core user, and define what success means for this problem. Focus on business value and user needs.)

### 2. Should AI / Advanced Analytics Be Used?
(Give a direct 'Yes', 'No', or 'Maybe' first. Then provide a clear rationale. Suggest non-AI alternatives like standard SQL tracking, funnels, or simple UX changes if AI isn't necessary, showing pragmatic product decision-making.)

### 3. Suggested Workflow / Analytics Pipeline
(Outline a step-by-step pipeline. Integrate Sakshi's skills—e.g. data pipelines in Python, dashboard design in Power BI, GA4 tracking, cohort segmentation, or A/B testing—to describe how we would measure, analyze, and test the solution.)

### 4. Risks, Tradeoffs, and Key Metrics
(Highlight implementation risks like data privacy, cost, or latency. Outline key product metrics to track—such as CVR, CTR, bounce rates, or turnaround time—and how to evaluate success.)`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: studioPrompt
              }
            ]
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Gemini API returned status ${apiResponse.status}`);
    }

    const resJson = await apiResponse.json();
    const analysisText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I could not generate the product analysis right now.";

    return NextResponse.json({
      analysis: analysisText
    });

  } catch (error: any) {
    console.error("Studio API error:", error);
    return NextResponse.json(
      { error: `Error generating analysis: ${error.message}` },
      { status: 500 }
    );
  }
}
