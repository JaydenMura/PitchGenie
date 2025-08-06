"use client";

interface FormFooterProps {
  loading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onSave?: () => void;
}

export default function FormFooter({
  loading,
  onGenerate,
  onReset,
  onSave,
}: FormFooterProps) {
  return (
    <div className="flex gap-4 justify-end mt-4">
      <button
        type="button"
        onClick={onReset}
        className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
      >
        Reset
      </button>
      {onSave && (
        <button
          type="button"
          onClick={onSave}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
        >
          Save
        </button>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
