"use client";

import { useState, useEffect } from "react";
import FormFooter from "../../components/FormFooter";

interface SavedProposal {
  clientName: string;
  company: string;
  project: string;
  details: string;
  tone: string;
  language: string;
  output: string;
  deliverables?: string;
  timeline?: string;
  pricing?: string;
  goal?: string;
  cta?: string;
  proposalType?: string;
  industry?: string;
  templateStyle?: string;
}

export default function ProposalGenerator() {
  const [advancedMode, setAdvancedMode] = useState(false);

  // Basic fields
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [details, setDetails] = useState("");

  // Advanced fields
  const [deliverables, setDeliverables] = useState("");
  const [timeline, setTimeline] = useState("");
  const [pricing, setPricing] = useState("");
  const [goal, setGoal] = useState("");
  const [cta, setCta] = useState("");
  const [proposalType, setProposalType] = useState("General");
  const [industry, setIndustry] = useState("General");
  const [templateStyle, setTemplateStyle] = useState("Standard");

  // Shared fields
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");

  // Outputs
  const [outputA, setOutputA] = useState("");
  const [outputB, setOutputB] = useState("");

  const [loading, setLoading] = useState(false);
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<SavedProposal | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("savedProposals");
    if (stored) setSavedProposals(JSON.parse(stored));
  }, []);

  const refreshSavedProposals = (updated: SavedProposal[]) => {
    setSavedProposals(updated);
    localStorage.setItem("savedProposals", JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!clientName || !company || !project || !details) {
      alert("Please fill in at least the basic fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          company,
          project,
          details,
          tone,
          language,
          ...(advancedMode && {
            deliverables,
            timeline,
            pricing,
            goal,
            cta,
            proposalType,
            industry,
            templateStyle,
          }),
        }),
      });
      const data = await response.json();
      setOutputA(data.outputA || "Failed to generate version A.");
      setOutputB(data.outputB || "Failed to generate version B.");
    } catch {
      setOutputA("Failed to generate proposals. Try again.");
      setOutputB("");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (version: "A" | "B") => {
    const output = version === "A" ? outputA : outputB;
    if (!output) return;
    const newItem: SavedProposal = {
      clientName,
      company,
      project,
      details,
      tone,
      language,
      output,
      ...(advancedMode && {
        deliverables,
        timeline,
        pricing,
        goal,
        cta,
        proposalType,
        industry,
        templateStyle,
      }),
    };
    const updated = [...savedProposals, newItem];
    refreshSavedProposals(updated);
    alert(`Version ${version} saved!`);
  };

  const handleReset = () => {
    setClientName("");
    setCompany("");
    setProject("");
    setDetails("");
    setTone("Professional");
    setLanguage("English");
    setDeliverables("");
    setTimeline("");
    setPricing("");
    setGoal("");
    setCta("");
    setProposalType("General");
    setIndustry("General");
    setTemplateStyle("Standard");
    setOutputA("");
    setOutputB("");
  };

  const handleDownloadPDF = async (content?: string, name?: string) => {
    const pdfContent = content;
    const fileName = name || clientName || "proposal";
    if (!pdfContent) return;
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ProposalPDFComponent } = await import("../../components/ProposalPDF");

      const blob = await pdf(
        <ProposalPDFComponent
          title={`Proposal for ${fileName}`}
          description={details || "Project details not provided"}
          content={pdfContent}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      alert("Failed to copy. Please try again.");
    }
  };

  const handleDeleteSaved = (index: number) => {
    const updated = savedProposals.filter((_, i) => i !== index);
    refreshSavedProposals(updated);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Proposal Generator</h1>

      {/* Advanced Mode Toggle */}
      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={advancedMode}
            onChange={() => setAdvancedMode(!advancedMode)}
          />
          Advanced Mode
        </label>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Client Name"
          className="w-full border p-3 rounded"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Company Name"
          className="w-full border p-3 rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          type="text"
          placeholder="Project Name"
          className="w-full border p-3 rounded"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
        <textarea
          placeholder="Enter project details"
          className="w-full border p-3 rounded"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        {/* Advanced Fields */}
        {advancedMode && (
          <div className="space-y-4 mt-4 p-4 border rounded bg-gray-50">
            <input
              type="text"
              placeholder="Deliverables"
              className="w-full border p-2 rounded"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
            <input
              type="text"
              placeholder="Timeline (e.g., 2 weeks)"
              className="w-full border p-2 rounded"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
            <input
              type="text"
              placeholder="Pricing (e.g., $1,200 flat)"
              className="w-full border p-2 rounded"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
            />
            <input
              type="text"
              placeholder="Goal (e.g., win this project)"
              className="w-full border p-2 rounded"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <input
              type="text"
              placeholder="CTA (e.g., reply to confirm)"
              className="w-full border p-2 rounded"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
            />

            {/* Labels */}
            <div>
              <label className="block font-medium mb-1">Proposal Type</label>
              <select
                aria-label="Proposal Type"
                className="w-full border p-2 rounded"
                value={proposalType}
                onChange={(e) => setProposalType(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Technical">Technical</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Industry</label>
              <select
                aria-label="Industry"
                className="w-full border p-2 rounded"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Template Style</label>
              <select
                aria-label="Template Style"
                className="w-full border p-2 rounded"
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value)}
              >
                <option value="Standard">Standard</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Creative">Creative</option>
              </select>
            </div>
          </div>
        )}

        {/* Tone & Language */}
        <div className="flex gap-4">
          <select
            aria-label="Tone"
            className="flex-1 border p-3 rounded"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option>Professional</option>
            <option>Friendly</option>
            <option>Persuasive</option>
            <option>Casual</option>
          </select>
          <select
            aria-label="Language"
            className="flex-1 border p-3 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Portuguese</option>
            <option>Dutch</option>
            <option>Japanese</option>
            <option>Chinese (Simplified)</option>
            <option>Chinese (Traditional)</option>
            <option>Korean</option>
            <option>Vietnamese</option>
            <option>Italian</option>
            <option>Polish</option>
            <option>Arabic</option>
          </select>
        </div>

        <FormFooter
          loading={loading}
          onGenerate={handleGenerate}
          onReset={handleReset}
          onSave={() => {}}
        />
      </div>

      {/* Output A & B */}
      {(outputA || outputB) && (
        <div className="mt-8 space-y-6">
          {outputA && (
            <div className="p-4 border rounded bg-gray-50">
              <h2 className="font-semibold mb-2">Version A</h2>
              <p className="whitespace-pre-line">{outputA}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleCopy(outputA)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDownloadPDF(outputA, `${clientName}-A`)}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleSave("A")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Save A
                </button>
              </div>
            </div>
          )}
          {outputB && (
            <div className="p-4 border rounded bg-gray-50">
              <h2 className="font-semibold mb-2">Version B</h2>
              <p className="whitespace-pre-line">{outputB}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleCopy(outputB)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDownloadPDF(outputB, `${clientName}-B`)}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleSave("B")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Save B
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Proposals */}
      {savedProposals.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Saved Proposals</h2>
          <ul className="space-y-3">
            {savedProposals.map((proposal, index) => (
              <li
                key={index}
                className="p-4 border rounded flex justify-between items-center bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{proposal.clientName}</p>
                  <p className="text-sm text-gray-600">{proposal.project}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setShowModal(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteSaved(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedProposal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg w-11/12 max-w-2xl max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold p-4 border-b">Saved Proposal</h3>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="whitespace-pre-line">{selectedProposal.output}</p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => handleCopy(selectedProposal.output)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Copy
              </button>
              <button
                onClick={() =>
                  handleDownloadPDF(selectedProposal.output, selectedProposal.clientName)
                }
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
