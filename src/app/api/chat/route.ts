import { NextResponse } from "next/server";
// 
import portfolioData from "@/data/portfolio.json";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const latestMessage = messages[messages.length - 1]?.content || "";
    const lowerMessage = latestMessage.toLowerCase();

    // const portfolioData = await getPortfolioData();
    const apiKey = process.env.GEMINI_API_KEY;

    // --- DEMO MODE (FALLBACK IF NO API KEY IS CONFIGURED) ---
    if (!apiKey) {
      let reply = "";
      const prefix = "*(Demo Mode - Configure `GEMINI_API_KEY` in your environment variables for live AI responses)*\n\n";

      if (lowerMessage.includes("experience") || lowerMessage.includes("work") || lowerMessage.includes("job") || lowerMessage.includes("company") || lowerMessage.includes("alvarez") || lowerMessage.includes("housing")) {
        reply = "Sakshi is an experienced analyst with strong skills in product analytics and business intelligence:\n\n" +
          "1. **Analyst | Alvarez & Marsal** (Aug 2025 - Present):\n" +
          "   - Conducts deep-dive diagnostics for cost improvements (5-10% potential identified).\n" +
          "   - Designs dashboards in **RAPID**, a prescriptive analytics tool for pricing and leakage evaluation.\n" +
          "   - Built AI-assisted quality check workflows, reducing turnaround by 30%.\n\n" +
          "2. **Product Analyst Intern | Housing.com** (Apr 2025 - Jul 2025):\n" +
          "   - Analyzed the Buy journey via GA4 and SQL, driving UX changes that led to a **10.2% conversion**.\n" +
          "   - Redesigned the Truecaller login flow, boosting Marketing Qualified Leads (MQLs) by **70%**.\n" +
          "   - Revamped the homepage's first fold, boosting search visits by **26%** and CTR by **14.6%**.";
      } else if (lowerMessage.includes("skill") || lowerMessage.includes("tool") || lowerMessage.includes("python") || lowerMessage.includes("sql") || lowerMessage.includes("power bi") || lowerMessage.includes("mixpanel")) {
        reply = "Sakshi's core skill set spans languages, analytics platforms, and BI tools:\n\n" +
          "- **Languages & Databases**: SQL, Python (Pandas, NumPy, Matplotlib, Seaborn), Excel (DAX)\n" +
          "- **BI & Visualization**: Power BI, Tableau, Alteryx\n" +
          "- **Analytics Tools**: Google Analytics 4 (GA4), Mixpanel\n" +
          "- **Analytical Techniques**: A/B Testing, Funnel Analysis, Cohort Analysis, Root Cause Analysis (RCA), Data Storytelling\n" +
          "- **Platforms**: Databricks, JIRA, Confluence";
      } else if (lowerMessage.includes("project") || lowerMessage.includes("fantasy") || lowerMessage.includes("cricket") || lowerMessage.includes("rando")) {
        reply = "Sakshi has engineered impact-driven analytics projects:\n\n" +
          "1. **Fantasy Cricket Squad Optimization** (Power BI, Pandas, DAX):\n" +
          "   - Engineered a data pipeline scraping 1M+ T20 player stats from ESPNcricinfo.\n" +
          "   - Built an interactive Power BI dashboard determining optimal compositions, boosting team win probability to **90%**.\n\n" +
          "2. **Rando San - SaaS App** (Mixpanel, Python):\n" +
          "   - Analyzed a dataset of 100k users to track daily activities and product usage metrics.\n" +
          "   - Leveraged attention, retention, and behavioral cohort metrics to enhance growth.";
      } else if (lowerMessage.includes("education") || lowerMessage.includes("college") || lowerMessage.includes("degree") || lowerMessage.includes("nsut") || lowerMessage.includes("university")) {
        reply = "Sakshi holds a **Bachelor of Technology (B.Tech)** degree from **Netaji Subhas University of Technology (NSUT), Delhi** (Class of 2021 – 2025). She graduated with a strong cumulative GPA of **8.21/10**.";
      } else if (lowerMessage.includes("certif") || lowerMessage.includes("credential") || lowerMessage.includes("school")) {
        reply = "Sakshi holds the following professional certifications:\n\n" +
          "- **Product Analytics Certification** by Product School\n" +
          "- **Advanced Google Analytics 4** by LinkedIn\n" +
          "- **PwC PowerBI Virtual Experience Program**\n" +
          "- **Introduction to Tableau** by Simplilearn\n" +
          "- **Career Essential in Business Analysis** by Microsoft & LinkedIn";
      } else if (lowerMessage.includes("contact") || lowerMessage.includes("email") || lowerMessage.includes("phone") || lowerMessage.includes("reach") || lowerMessage.includes("linkedin")) {
        reply = "You can connect with Sakshi directly through:\n\n" +
          "- **Email**: sakshinsut102@gmail.com\n" +
          "- **Phone**: +91-9990999345\n" +
          "- **LinkedIn**: [linkedin.com/in/sakshi-srivastava](https://linkedin.com/in/sakshi-srivastava)\n" +
          "- **GitHub**: [github.com/SakshiNSUT](https://github.com/SakshiNSUT)";
      } else {
        reply = "Hi! I am Sakshi's AI portfolio assistant. You can ask me questions like:\n\n" +
          "- *Tell me about Sakshi's professional experience.*\n" +
          "- *What analytical skills does she possess?*\n" +
          "- *Tell me about the Fantasy Cricket project she built.*\n" +
          "- *Where did she study and what was her GPA?*";
      }

      return NextResponse.json({
        role: "model",
        content: prefix + reply
      });
    }

    // --- LIVE AI RAG MODE USING GEMINI API ---
    const dataContext = portfolioData 
      ? JSON.stringify(portfolioData, null, 2) 
      : "Name: Sakshi, Role: Product & Data Analyst, Contact: sakshinsut102@gmail.com";

    const systemPrompt = `You are Sakshi's personal AI Portfolio Assistant. Your goal is to represent Sakshi professionally, accurately, and enthusiastically based ONLY on the provided resume details.

Here is Sakshi's official resume data (Knowledge Base):
-----------------
${dataContext}
-----------------

Instructions:
1. Act as Sakshi's virtual representative. You should speak in first-person as her AI representative (e.g. "Sakshi is...", "She has experience in...") or represent her directly if appropriate, but maintain a helpful and professional tone.
2. Ground all answers strictly in the resume details. Do not fabricate experience, companies, or metrics.
3. If the user asks something that is NOT in the resume data (e.g., about her favorite food, or unrelated topics), politely explain that this information isn't in her portfolio resume context, and offer her email (sakshinsut102@gmail.com) for direct contact.
4. Keep answers concise, bulleted, and structured so they are easy to read in a chat bubble. Use Markdown.
5. If the user is asking simple greeting questions (e.g., "Hi", "Hello"), respond warmly and invite them to ask about Sakshi's analytics background, projects, or visual editor.`;

    // Map conversation history to Gemini format. Prepend system instructions.
    // Gemini 1.5 Flash API body
    const promptText = `${systemPrompt}\n\nUser Question: ${latestMessage}`;

    // const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
                text: promptText
              }
            ]
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Gemini API error details:", errorData);
      throw new Error(`Gemini API returned status ${apiResponse.status}`);
    }

    const resJson = await apiResponse.json();
    const botText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I could not formulate an answer right now. Please try again.";

    return NextResponse.json({
      role: "model",
      content: botText
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { role: "model", content: `Error communicating with AI model: ${error.message}. Please verify your network connection and API key.` },
      { status: 500 }
    );
  }
}
