"use client";

import { useState, useEffect } from "react";
import FormFooter from "../../components/FormFooter";

interface SavedObjection {
  objection: string;
  product: string;
  tone: string;
  language: string;
  templateStyle?: string;
  context?: string;
  output: string;
}

export default function ObjectionHandlerGenerator() {
  const [advancedMode, setAdvancedMode] = useState(false);

  // Basic fields
  const [objection, setObjection] = useState("");
  const [product, setProduct] = useState("");

  // Advanced fields
  const [context, setContext] = useState("");
  const [templateStyle, setTemplateStyle] = useState("Standard");

  // Shared fields
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");

  // Outputs
  const [outputA, setOutputA] = useState("");
  const [outputB, setOutputB] = useState("");

  const [loading, setLoading] = useState(false);
  const [savedObjections, setSavedObjections] = useState<SavedObjection[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<SavedObjection | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("savedObjections");
    if (stored) setSavedObjections(JSON.parse(stored));
  }, []);

  const refreshSavedObjections = (updated: SavedObjection[]) => {
    setSavedObjections(updated);
    localStorage.setItem("savedObjections", JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!objection || !product) {
      alert("Please fill in the basic fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate-objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objection,
          product,
          tone,
          language,
          ...(advancedMode && {
            context,
            templateStyle,
          }),
        }),
      });
      const data = await response.json();
      setOutputA(data.outputA || "Failed to generate Version A.");
      setOutputB(data.outputB || "Failed to generate Version B.");
    } catch {
      setOutputA("Failed to generate objection responses. Try again.");
      setOutputB("");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (version: "A" | "B") => {
    const output = version === "A" ? outputA : outputB;
    if (!output) return;
    const newItem: SavedObjection = {
      objection,
      product,
      tone,
      language,
      templateStyle,
      context,
      output,
    };
    const updated = [...savedObjections, newItem];
    refreshSavedObjections(updated);
    alert(`Version ${version} saved!`);
  };

  const handleReset = () => {
    setObjection("");
    setProduct("");
    setContext("");
    setTemplateStyle("Standard");
    setTone("Professional");
    setLanguage("English");
    setOutputA("");
    setOutputB("");
  };

  const handleDownloadPDF = async (content?: string, name?: string) => {
    const pdfContent = content;
    const fileName = name || "objection-handler";
    if (!pdfContent) return;
    setLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ProposalPDFComponent } = await import("../../components/ProposalPDF");

      const blob = await pdf(
        <ProposalPDFComponent
          title={`Objection Response`}
          description={context || "Objection handling details not provided"}
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
      alert("Failed to copy.");
    }
  };

  const handleDeleteSaved = (index: number) => {
    const updated = savedObjections.filter((_, i) => i !== index);
    refreshSavedObjections(updated);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Objection Handler Generator</h1>

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
          placeholder="Objection (e.g., Price is too high)"
          className="w-full border p-3 rounded"
          value={objection}
          onChange={(e) => setObjection(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product or Service Name"
          className="w-full border p-3 rounded"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        {/* Advanced Fields */}
        {advancedMode && (
          <div className="space-y-4 mt-4 p-4 border rounded bg-gray-50">
            <textarea
              placeholder="Context or Additional Notes"
              className="w-full border p-2 rounded"
              rows={2}
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />

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
                  onClick={() => handleDownloadPDF(outputA, `Objection-A`)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
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
                  onClick={() => handleDownloadPDF(outputB, `Objection-B`)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
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

      {/* Saved Objections */}
      {savedObjections.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Saved Objection Responses</h2>
          <ul className="space-y-3">
            {savedObjections.map((item, index) => (
              <li
                key={index}
                className="p-4 border rounded flex justify-between items-center bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{item.objection}</p>
                  <p className="text-sm text-gray-600">{item.product}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedObjection(item);
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
      {showModal && selectedObjection && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg w-11/12 max-w-2xl max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold p-4 border-b">Saved Objection Response</h3>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="whitespace-pre-line">{selectedObjection.output}</p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => handleCopy(selectedObjection.output)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Copy
              </button>
              <button
                onClick={() =>
                  handleDownloadPDF(selectedObjection.output, selectedObjection.objection)
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
