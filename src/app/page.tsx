"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import initialPortfolioData from "@/data/portfolio.json";

interface PersonalInfo {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}

interface Education {
  school: string;
  degree: string;
  gpa: string;
  years: string;
}

interface Skills {
  languagesAndDatabases: string[];
  biAndVisualization: string[];
  analyticsTools: string[];
  analyticalTechniques: string[];
  toolsAndPlatforms: string[];
  softSkills: string[];
}

interface Job {
  role: string;
  company: string;
  location: string;
  dates: string;
  description: string;
  bullets: string[];
}

interface CaseStudy {
  name: string;
  technologies: string[];
  bullets: string[];
}

interface PortfolioData {
  personalInfo: PersonalInfo;
  about: string;
  education: Education[];
  skills: Skills;
  experience: Job[];
  caseStudies: CaseStudy[];
  certifications: string[];
  books: string[];
  interests: string[];
  sectionOrder: string[];
}

export default function PortfolioHome() {
  const [data, setData] = useState<PortfolioData>(initialPortfolioData);
  const [activeSection, setActiveSection] = useState("home");

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: "Hi! I am Sakshi's AI Assistant. Ask me anything about her background, professional experience, or analytical skills. You can also test out the AI Product Studio on the right!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Product Studio State
  const [studioProblem, setStudioProblem] = useState("");
  const [studioOutput, setStudioOutput] = useState("");
  const [isStudioLoading, setIsStudioLoading] = useState(false);

  // Scrollspy logic
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // Trigger when the section dominates the center viewport
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = ["home", "about", "experience", "skills", "case-studies", "certifications", "books", "interests", "contact"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Sync scroll on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle Q&A Chat Submit
  const handleChatSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: textToSend }];
    setChatMessages(newMessages);
    if (!customText) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error("Failed to get response");
      const botResponse = await response.json();
      setChatMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I ran into an error. Please make sure the server is running." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Product Studio Submit
  const handleStudioSubmit = async (e?: React.FormEvent, customProblem?: string) => {
    if (e) e.preventDefault();
    const problemToSend = customProblem || studioProblem;
    if (!problemToSend.trim() || isStudioLoading) return;

    if (!customProblem) setStudioProblem("");
    setStudioOutput("");
    setIsStudioLoading(true);

    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problemToSend })
      });

      if (!response.ok) throw new Error("Failed to generate teardown");
      const result = await response.json();
      setStudioOutput(result.analysis || result.error || "No response received.");
    } catch (err) {
      console.error(err);
      setStudioOutput("Error generating product teardown. Please verify your connection.");
    } finally {
      setIsStudioLoading(false);
    }
  };

  // Smooth Scroll Helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // Helper to format bullets by highlighting key metrics
  const formatText = (text: string) => {
    const regex = /(\b\d+%\b|\b\d+\+\b|\b\d+-\d+%\b|\b\d+\s+industries\b|\b1\s+million\b|\b90%\b)/gi;
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <strong key={index} className="text-jasper font-semibold">{part}</strong>
      ) : (
        part
      )
    );
  };

  const navItems = [
    { label: "HOME", id: "home" },
    { label: "ABOUT", id: "about" },
    { label: "EXPERIENCE", id: "experience" },
    { label: "SKILLS", id: "skills" },
    { label: "CASE STUDIES", id: "case-studies" },
    { label: "CERTIFICATIONS", id: "certifications" },
    { label: "BOOKS", id: "books" },
    { label: "INTERESTS", id: "interests" },
    { label: "CONTACT", id: "contact" }
  ];

  return (
    <div className="flex-1 font-sans antialiased text-ink bg-bone-soft">
      {/* HEADER SECTION (EXACTLY MATCHING THE REFERENCE TABS) */}
      <header className="sticky top-3 z-50 px-3 pt-3 sm:px-5 max-w-7xl mx-auto w-full">
        <div className="backdrop-blur-md bg-bone-card/90 border border-bone-border rounded-full py-3 px-5 sm:px-6 flex items-center justify-between shadow-xs">
          {/* Logo Monogram */}
          <button onClick={() => scrollToSection("home")} className="flex items-center gap-3 shrink-0 group text-left cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-teal text-white flex items-center justify-center font-display font-extrabold text-sm shadow-inner group-hover:scale-105 transition-transform">
              SS
            </div>
            <span className="whitespace-nowrap text-sm font-extrabold tracking-tight text-eggplant leading-none hidden sm:inline">
              {data.personalInfo.name}
            </span>
          </button>

          {/* Navigation Tabs (Scrollspy enabled & horizontally scrollable on mobile) */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none px-2 flex-1 justify-center sm:justify-end lg:justify-center mx-2 max-w-full">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSection === item.id
                    ? "text-teal bg-teal/5 font-extrabold scale-102"
                    : "text-muted hover:text-eggplant"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Visual Editor Trigger button */}
          <div className="shrink-0 flex items-center">
            <Link
              href="/editor"
              className="bg-jasper hover:bg-jasper-hover text-white text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all hover:-translate-y-0.5"
            >
              Editor
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col gap-14">
        {/* HOME SECTION (HERO + AI PLATFORMS) */}
        <section id="home" className="flex flex-col gap-10 pt-4 scroll-mt-24">
          <div className="text-center py-4 max-w-4xl mx-auto">
            <p className="inline-flex rounded-full bg-teal/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-teal mb-4">
              PORTFOLIO & COGNITIVE ENGINE
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-eggplant tracking-tight leading-tight">
              Yeah, This Portfolio Talks Back.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              I build dashboards in <span className="text-teal font-semibold">Power BI</span>, automate workflows in <span className="text-teal font-semibold">Python</span>, and extract insights with <span className="text-teal font-semibold">SQL</span>. Ask about my experience, or try the AI Product Studio.
            </p>
          </div>

          {/* AI CAPABILITIES GRID */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* COLUMN 1: RESUME Q&A CHAT */}
            <div className="bg-bone-card rounded-[2rem] border border-bone-border p-6 flex flex-col min-h-[460px] shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between border-b border-bone-border/50 pb-4 mb-4">
                <div>
                  <p className="inline-flex rounded-full bg-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                    Q&A Chatbot
                  </p>
                  <h2 className="text-2xl font-display font-extrabold text-eggplant mt-2">Ask directly.</h2>
                  <p className="text-xs text-muted mt-1">Grounded in Sakshi's official resume details.</p>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleChatSubmit(undefined, "Tell me about your Analyst role at Alvarez & Marsal.")}
                  className="text-xs bg-white hover:bg-bone-soft text-eggplant font-semibold border border-bone-border/80 px-3 py-2 rounded-full transition-all"
                >
                  💼 Alvarez & Marsal Experience
                </button>
                <button
                  onClick={() => handleChatSubmit(undefined, "What did you accomplish during your Housing.com internship?")}
                  className="text-xs bg-white hover:bg-bone-soft text-eggplant font-semibold border border-bone-border/80 px-3 py-2 rounded-full transition-all"
                >
                  🏠 Housing.com metrics
                </button>
                <button
                  onClick={() => handleChatSubmit(undefined, "List your technical skills and certifications.")}
                  className="text-xs bg-white hover:bg-bone-soft text-eggplant font-semibold border border-bone-border/80 px-3 py-2 rounded-full transition-all"
                >
                  🛠️ Skills & Certifications
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto max-h-[300px] border border-bone-border/40 rounded-xl p-3 bg-white/60 space-y-3 mb-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        msg.role === "user"
                          ? "bg-teal text-white rounded-br-none"
                          : "bg-bone-card text-ink border border-bone-border rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-bone-card text-muted text-xs italic rounded-2xl px-4 py-2.5 border border-bone-border">
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about my SQL skills, B.Tech, or projects..."
                  className="flex-1 text-sm bg-white border border-bone-border/80 rounded-full px-4 py-2.5 focus:outline-hidden focus:border-teal text-ink placeholder:text-muted/70"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-teal hover:bg-teal-hover disabled:bg-teal/40 text-white font-bold px-5 py-2 rounded-full transition-all text-sm cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>

            {/* COLUMN 2: AI PRODUCT STUDIO */}
            <div className="bg-eggplant text-white rounded-[2rem] p-6 flex flex-col min-h-[460px] shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                    AI Product Studio
                  </p>
                  <h2 className="text-2xl font-display font-extrabold text-white mt-2">Product Case Teardowns.</h2>
                  <p className="text-xs text-white/70 mt-1">Submit a problem; watch the AI construct an analytics workflow.</p>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleStudioSubmit(undefined, "How do we reduce drop-offs in a real estate mobile onboarding flow?")}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/10 px-3 py-2 rounded-full transition-all"
                >
                  📈 Optimize Mobile Onboarding
                </button>
                <button
                  onClick={() => handleStudioSubmit(undefined, "Suggest a data pipeline to monitor client billing leaks in RAPID.")}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/10 px-3 py-2 rounded-full transition-all"
                >
                  🔍 RAPID Leakage Detection
                </button>
              </div>

              {/* Studio Teardown Output */}
              <div className="flex-1 overflow-y-auto max-h-[300px] border border-white/10 rounded-xl p-3 bg-black/20 space-y-3 mb-4 scrollbar-thin scrollbar-thumb-white/10">
                {studioOutput ? (
                  <div className="text-sm leading-relaxed whitespace-pre-line text-white/90">
                    {studioOutput}
                  </div>
                ) : isStudioLoading ? (
                  <div className="text-sm italic text-white/50 animate-pulse">
                    Analyzing product challenge, mapping data workflows, evaluating tradeoffs...
                  </div>
                ) : (
                  <div className="text-sm italic text-white/40 text-center py-10">
                    Type a product challenge below or select a prompt to generate a structural teardown.
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleStudioSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={studioProblem}
                  onChange={(e) => setStudioProblem(e.target.value)}
                  placeholder="e.g. Optimize user conversion on search click..."
                  className="flex-1 text-sm bg-white/10 border border-white/20 rounded-full px-4 py-2.5 focus:outline-hidden focus:border-teal text-white placeholder:text-white/40"
                />
                <button
                  type="submit"
                  disabled={isStudioLoading || !studioProblem.trim()}
                  className="bg-white hover:bg-white/90 text-eggplant font-extrabold px-5 py-2 rounded-full transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  Analyze
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* DYNAMIC SECTIONS LOADED BY SECTION ORDER CONFIG */}
        <div className="flex flex-col gap-12">
          {data.sectionOrder.map((sectionId) => {
            if (sectionId === "about") {
              return (
                <section key={sectionId} id="about" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">01 // Profile</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-4">About Me</h2>
                  <p className="text-sm sm:text-base text-muted leading-relaxed font-normal whitespace-pre-line mb-8">
                    {data.about}
                  </p>
                  
                  {/* Integrated Education Block */}
                  <div className="border-t border-bone-border/50 pt-6">
                    <h4 className="font-display font-bold text-lg text-eggplant mb-4">Academic Credentials</h4>
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-white/50 border border-bone-border/40 rounded-2xl p-4">
                        <div>
                          <h5 className="font-display font-bold text-sm sm:text-base text-eggplant">{edu.school}</h5>
                          <p className="text-xs sm:text-sm font-semibold text-teal mt-1">{edu.degree}</p>
                          <p className="text-xs text-muted mt-0.5">GPA: <span className="font-bold text-jasper">{edu.gpa}</span></p>
                        </div>
                        <span className="text-xs font-bold bg-eggplant/10 text-eggplant px-3 py-1 rounded-full">
                          {edu.years}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionId === "experience") {
              return (
                <section key={sectionId} id="experience" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">02 // Timeline</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Professional Experience</h2>

                  <div className="relative pl-6 border-l-2 border-bone-border/60 ml-3 space-y-10">
                    {data.experience.map((job, idx) => (
                      <div key={idx} className="relative group">
                        {/* Bullet Marker */}
                        <div className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-teal bg-bone-soft group-hover:bg-teal transition-colors" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                          <div>
                            <h3 className="font-display font-extrabold text-lg sm:text-xl text-eggplant">
                              {job.role}
                            </h3>
                            <p className="text-sm font-semibold text-teal mt-0.5">
                              {job.company} — <span className="text-xs text-muted font-normal">{job.location}</span>
                            </p>
                          </div>
                          <span className="text-xs font-bold bg-jasper/15 text-jasper px-3 py-1 rounded-full w-fit">
                            {job.dates}
                          </span>
                        </div>

                        <p className="text-xs italic text-muted mb-3 leading-relaxed">
                          {job.description}
                        </p>

                        <ul className="list-disc pl-4 text-sm text-ink/90 space-y-2 leading-relaxed">
                          {job.bullets.map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className="pl-1">
                              {formatText(bullet)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionId === "skills") {
              return (
                <section key={sectionId} id="skills" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">03 // Capabilities</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Technical & Analytical Skills</h2>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Languages & Databases */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">Languages & Databases</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.languagesAndDatabases.map((s, i) => (
                          <span key={i} className="text-xs bg-teal/5 text-teal font-medium px-2.5 py-1 rounded-full border border-teal/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* BI & Visualization */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">BI & Visualization</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.biAndVisualization.map((s, i) => (
                          <span key={i} className="text-xs bg-jasper/5 text-jasper font-medium px-2.5 py-1 rounded-full border border-jasper/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Analytics Tools */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">Analytics Tools</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.analyticsTools.map((s, i) => (
                          <span key={i} className="text-xs bg-teal/5 text-teal font-medium px-2.5 py-1 rounded-full border border-teal/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Analytical Techniques */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">Analytical Techniques</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.analyticalTechniques.map((s, i) => (
                          <span key={i} className="text-xs bg-jasper/5 text-jasper font-medium px-2.5 py-1 rounded-full border border-jasper/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tools & Platforms */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">Tools & Platforms</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.toolsAndPlatforms.map((s, i) => (
                          <span key={i} className="text-xs bg-teal/5 text-teal font-medium px-2.5 py-1 rounded-full border border-teal/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Soft Skills */}
                    <div className="bg-white/60 rounded-2xl p-5 border border-bone-border/50">
                      <h4 className="font-display font-bold text-base text-eggplant mb-3">Soft Skills / Business</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.softSkills.map((s, i) => (
                          <span key={i} className="text-xs bg-jasper/5 text-jasper font-medium px-2.5 py-1 rounded-full border border-jasper/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            if (sectionId === "caseStudies") {
              return (
                <section key={sectionId} id="case-studies" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">04 // Deep Dives</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Case Studies</h2>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {data.caseStudies.map((proj, idx) => (
                      <div key={idx} className="bg-white/60 border border-bone-border/50 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {proj.technologies.map((t, ti) => (
                              <span key={ti} className="text-[10px] bg-teal/10 text-teal font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                {t}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-display font-extrabold text-xl text-eggplant mb-3">
                            {proj.name}
                          </h3>
                          <ul className="list-disc pl-4 text-sm text-ink/90 space-y-2 leading-relaxed">
                            {proj.bullets.map((bullet, bi) => (
                              <li key={bi} className="pl-1">
                                {formatText(bullet)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionId === "certifications") {
              return (
                <section key={sectionId} id="certifications" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">05 // Accomplishments</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Certifications</h2>

                  <div className="flex flex-wrap gap-2.5">
                    {data.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="bg-white/60 hover:bg-white text-eggplant border border-bone-border/70 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <svg className="h-4 w-4 text-jasper shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {cert}
                      </span>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionId === "books") {
              return (
                <section key={sectionId} id="books" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">06 // Reading List</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Books I Read</h2>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {data.books.map((book, idx) => (
                      <div key={idx} className="bg-white/60 border border-bone-border/50 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                        <span className="text-jasper font-display font-extrabold text-lg">📖</span>
                        <p className="text-sm font-semibold text-eggplant leading-relaxed">{book}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionId === "interests") {
              return (
                <section key={sectionId} id="interests" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
                  <span className="text-xs uppercase tracking-widest text-teal font-extrabold">07 // Passions</span>
                  <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Interests</h2>

                  <div className="flex flex-wrap gap-2">
                    {data.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="bg-teal/5 text-teal border border-teal/10 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      >
                        ⚡ {interest}
                      </span>
                    ))}
                  </div>
                </section>
              );
            }

            return null;
          })}
        </div>

        {/* CONTACT SECTION */}
        <section id="contact" className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs scroll-mt-24">
          <span className="text-xs uppercase tracking-widest text-teal font-extrabold">08 // Connect</span>
          <h2 className="text-3xl font-display font-extrabold text-eggplant mt-1 mb-6">Get in Touch</h2>

          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h3 className="font-display font-bold text-xl text-eggplant">Available for analyst opportunities</h3>
              <p className="text-sm text-muted">Gurugram/Gurgaon, India | Connect directly via links</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`mailto:${data.personalInfo.email}`}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-teal/10 text-teal hover:bg-teal hover:text-white px-5 py-2.5 rounded-full transition-colors border border-teal/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              <a
                href={data.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-eggplant/10 text-eggplant hover:bg-eggplant hover:text-white px-5 py-2.5 rounded-full transition-colors border border-eggplant/20"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href={data.personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-zinc-800/10 text-zinc-800 hover:bg-zinc-800 hover:text-white px-5 py-2.5 rounded-full transition-colors border border-zinc-800/20"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-bone-card border-t border-bone-border py-10 px-4 sm:px-8 text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-semibold">
            &copy; {new Date().getFullYear()} Sakshi. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span>Built from scratch with</span>
            <span className="text-jasper font-bold">Next.js + Tailwind v4 + Gemini API</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-eggplant">
            <button onClick={() => scrollToSection("home")} className="hover:underline cursor-pointer">Home</button>
            <Link href="/editor" className="hover:underline">Visual Editor</Link>
            <a href={`mailto:${data.personalInfo.email}`} className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
