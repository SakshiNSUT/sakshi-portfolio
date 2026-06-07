"use client";

import { useState } from "react";
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

export default function PortfolioEditor() {
  const [data, setData] = useState<PortfolioData>(initialPortfolioData);
  const [activeTab, setActiveTab] = useState<"order" | "profile" | "experience" | "cases" | "skills" | "books" | "education">("order");
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Drag and Drop Handlers for Section Order
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("draggedIndex", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("draggedIndex"));
    if (draggedIndex === targetIndex) return;

    const updatedOrder = [...data.sectionOrder];
    const [removed] = updatedOrder.splice(draggedIndex, 1);
    updatedOrder.splice(targetIndex, 0, removed);

    setData({
      ...data,
      sectionOrder: updatedOrder
    });
  };

  // Save changes to local file
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/save-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSaveStatus({
          type: "success",
          message: result.mode === "production" 
            ? "Changes saved to active browser state (Server writes are disabled in Vercel demo build)." 
            : "Successfully saved changes to src/data/portfolio.json!"
        });
      } else {
        throw new Error(result.error || "Failed to save portfolio data.");
      }
    } catch (err: any) {
      console.error(err);
      setSaveStatus({
        type: "error",
        message: `Error saving changes: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update deeply nested states
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  };

  const updateExperience = (jobIndex: number, field: keyof Job, value: any) => {
    const updatedJobs = [...data.experience];
    updatedJobs[jobIndex] = {
      ...updatedJobs[jobIndex],
      [field]: value
    };
    setData({
      ...data,
      experience: updatedJobs
    });
  };

  const updateCaseStudy = (caseIndex: number, field: keyof CaseStudy, value: any) => {
    const updatedCases = [...data.caseStudies];
    updatedCases[caseIndex] = {
      ...updatedCases[caseIndex],
      [field]: value
    };
    setData({
      ...data,
      caseStudies: updatedCases
    });
  };

  const updateEducation = (eduIndex: number, field: keyof Education, value: string) => {
    const updatedEdu = [...data.education];
    updatedEdu[eduIndex] = {
      ...updatedEdu[eduIndex],
      [field]: value
    };
    setData({
      ...data,
      education: updatedEdu
    });
  };

  return (
    <div className="flex-1 font-sans bg-bone-soft text-ink p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
      {/* EDITOR HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-bone-border pb-5">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-eggplant">Visual Portfolio Editor</h1>
          <p className="text-sm text-muted mt-1">Customize details and drag to rearrange sections. Hit Save to persist changes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="border border-bone-border hover:bg-bone-card font-bold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            ← View Portfolio
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-jasper hover:bg-jasper-hover disabled:bg-jasper/50 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* SAVE STATUS NOTIFICATION */}
      {saveStatus.message && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold ${
            saveStatus.type === "success"
              ? "bg-teal/10 border-teal/20 text-teal"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* EDITOR CONTAINER */}
      <div className="grid gap-6 md:grid-cols-[220px_1fr] flex-1">
        {/* LEFT TAB NAVIGATION */}
        <aside className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-bone-border/50 pr-0 md:pr-4">
          <button
            onClick={() => setActiveTab("order")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "order" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            ↕️ Section Order
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "profile" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            👤 Profile & About
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "experience" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            💼 Experience
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "cases" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            🚀 Case Studies
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "skills" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            🛠️ Skills & Certs
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "books" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            📚 Books & Passions
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`whitespace-nowrap text-left text-xs uppercase tracking-wider font-extrabold px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "education" ? "bg-teal text-white" : "text-muted hover:bg-bone-card"
            }`}
          >
            🎓 Education
          </button>
        </aside>

        {/* RIGHT CONTROL PANEL */}
        <div className="bg-bone-card border border-bone-border rounded-3rem p-6 sm:p-8 shadow-xs flex-1">
          {/* TAB: SECTION ORDER */}
          {activeTab === "order" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Rearrange Page Sections</h3>
                <p className="text-xs text-muted mt-1">Drag and drop the blocks to change the vertical layout order of your portfolio home page.</p>
              </div>

              <div className="space-y-2 max-w-md">
                {data.sectionOrder.map((section, idx) => (
                  <div
                    key={section}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="flex items-center justify-between p-4 bg-white border border-bone-border/80 rounded-xl shadow-xs hover:shadow-sm cursor-grab active:cursor-grabbing transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full">{idx + 1}</span>
                      <span className="font-semibold text-sm capitalize text-eggplant">
                        {section === "caseStudies" ? "Case Studies" : section}
                      </span>
                    </div>
                    <span className="text-muted text-lg">☰</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PROFILE & ABOUT */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Profile & About Details</h3>
                <p className="text-xs text-muted mt-1">Update your general headlines, contact coordinates, and About Me narrative block.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Name</label>
                  <input
                    type="text"
                    value={data.personalInfo.name}
                    onChange={(e) => updatePersonalInfo("name", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Role Title</label>
                  <input
                    type="text"
                    value={data.personalInfo.role}
                    onChange={(e) => updatePersonalInfo("role", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Email</label>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Phone</label>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">LinkedIn Link</label>
                  <input
                    type="text"
                    value={data.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">GitHub Link</label>
                  <input
                    type="text"
                    value={data.personalInfo.github}
                    onChange={(e) => updatePersonalInfo("github", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Location</label>
                  <input
                    type="text"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">About Me Narrative</label>
                  <textarea
                    rows={6}
                    value={data.about}
                    onChange={(e) => setData({ ...data, about: e.target.value })}
                    className="bg-white border border-bone-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-teal resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Work History</h3>
                <p className="text-xs text-muted mt-1">Edit companies, dates, job summaries, and bullet deliverables.</p>
              </div>

              <div className="space-y-10">
                {data.experience.map((job, idx) => (
                  <div key={idx} className="p-5 bg-white border border-bone-border/60 rounded-2xl flex flex-col gap-4">
                    <h4 className="font-display font-bold text-base text-eggplant border-b border-bone-border/30 pb-2">
                      Job Entry #{idx + 1}: {job.company}
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Role</label>
                        <input
                          type="text"
                          value={job.role}
                          onChange={(e) => updateExperience(idx, "role", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Company Name</label>
                        <input
                          type="text"
                          value={job.company}
                          onChange={(e) => updateExperience(idx, "company", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Location</label>
                        <input
                          type="text"
                          value={job.location}
                          onChange={(e) => updateExperience(idx, "location", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Dates (e.g. Aug 2025 - Present)</label>
                        <input
                          type="text"
                          value={job.dates}
                          onChange={(e) => updateExperience(idx, "dates", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Company Description</label>
                        <input
                          type="text"
                          value={job.description}
                          onChange={(e) => updateExperience(idx, "description", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Bullet Points (One per line)</label>
                        <textarea
                          rows={6}
                          value={job.bullets.join("\n")}
                          onChange={(e) => updateExperience(idx, "bullets", e.target.value.split("\n"))}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CASE STUDIES */}
          {activeTab === "cases" && (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Case Studies</h3>
                <p className="text-xs text-muted mt-1">Manage project details, technologies utilized, and impact descriptions for case studies.</p>
              </div>

              <div className="space-y-10">
                {data.caseStudies.map((proj, idx) => (
                  <div key={idx} className="p-5 bg-white border border-bone-border/60 rounded-2xl flex flex-col gap-4">
                    <h4 className="font-display font-bold text-base text-eggplant border-b border-bone-border/30 pb-2">
                      Case Entry #{idx + 1}: {proj.name}
                    </h4>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Case Study Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => updateCaseStudy(idx, "name", e.target.value)}
                        className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Technologies (Comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies.join(", ")}
                        onChange={(e) => updateCaseStudy(idx, "technologies", e.target.value.split(",").map(t => t.trim()))}
                        className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted">Deliverables & Metrics (One per line)</label>
                      <textarea
                        rows={4}
                        value={proj.bullets.join("\n")}
                        onChange={(e) => updateCaseStudy(idx, "bullets", e.target.value.split("\n"))}
                        className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Skills & Certifications</h3>
                <p className="text-xs text-muted mt-1">Edit technical skill categories and certifications. Use comma-separated formats.</p>
              </div>

              <div className="grid gap-5 bg-white border border-bone-border/50 rounded-2xl p-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Languages & Databases</label>
                  <input
                    type="text"
                    value={data.skills.languagesAndDatabases.join(", ")}
                    onChange={(e) => setData({
                      ...data,
                      skills: { ...data.skills, languagesAndDatabases: e.target.value.split(",").map(s => s.trim()) }
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">BI & Visualization</label>
                  <input
                    type="text"
                    value={data.skills.biAndVisualization.join(", ")}
                    onChange={(e) => setData({
                      ...data,
                      skills: { ...data.skills, biAndVisualization: e.target.value.split(",").map(s => s.trim()) }
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Analytics Tools</label>
                  <input
                    type="text"
                    value={data.skills.analyticsTools.join(", ")}
                    onChange={(e) => setData({
                      ...data,
                      skills: { ...data.skills, analyticsTools: e.target.value.split(",").map(s => s.trim()) }
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Analytical Techniques</label>
                  <input
                    type="text"
                    value={data.skills.analyticalTechniques.join(", ")}
                    onChange={(e) => setData({
                      ...data,
                      skills: { ...data.skills, analyticalTechniques: e.target.value.split(",").map(s => s.trim()) }
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Certifications (One per line)</label>
                  <textarea
                    rows={5}
                    value={data.certifications.join("\n")}
                    onChange={(e) => setData({
                      ...data,
                      certifications: e.target.value.split("\n").filter(c => c.trim() !== "")
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKS & PASSIONS */}
          {activeTab === "books" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Books & Personal Interests</h3>
                <p className="text-xs text-muted mt-1">Manage reading list books and personal/professional interests. Put one entry per line.</p>
              </div>

              <div className="grid gap-5 bg-white border border-bone-border/50 rounded-2xl p-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Books I Read (One per line)</label>
                  <textarea
                    rows={5}
                    value={data.books.join("\n")}
                    onChange={(e) => setData({
                      ...data,
                      books: e.target.value.split("\n").filter(b => b.trim() !== "")
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal resize-y"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Interests & Passions (One per line)</label>
                  <textarea
                    rows={5}
                    value={data.interests.join("\n")}
                    onChange={(e) => setData({
                      ...data,
                      interests: e.target.value.split("\n").filter(i => i.trim() !== "")
                    })}
                    className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-eggplant">Education Credentials</h3>
                <p className="text-xs text-muted mt-1">Modify your school, degrees, and academic GPA details.</p>
              </div>

              <div className="space-y-6">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-5 bg-white border border-bone-border/60 rounded-2xl flex flex-col gap-4">
                    <h4 className="font-display font-bold text-base text-eggplant border-b border-bone-border/30 pb-2">
                      Academic Entry #{idx + 1}: {edu.school}
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">School Name</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(idx, "school", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Degree / Stream</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">GPA</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Years attended (e.g. 2021 – 2025)</label>
                        <input
                          type="text"
                          value={edu.years}
                          onChange={(e) => updateEducation(idx, "years", e.target.value)}
                          className="bg-bone-soft border border-bone-border/80 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-teal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
