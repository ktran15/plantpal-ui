import { PlantDiagnosis } from "../services/geminiService";
import { PixelLoader } from "./PixelLoader";

interface DiagnosisPanelProps {
  diagnosis: PlantDiagnosis | null;
  isLoading: boolean;
  error: string | null;
}

export function DiagnosisPanel({
  diagnosis,
  isLoading,
  error,
}: DiagnosisPanelProps) {
  if (isLoading) {
    return <PixelLoader text="ANALYZING PLANT..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-[var(--sand)] border-2 border-[var(--bark)]">
        <p className="text-[10px] text-[var(--soil)] uppercase mb-2">
          Error
        </p>
        <p className="text-[10px] text-[var(--khaki)]">{error}</p>
      </div>
    );
  }

  if (!diagnosis) {
    return null;
  }

  // Determine if plant is healthy based on summary
  const isHealthy = diagnosis.summary.toLowerCase().includes("healthy") &&
    diagnosis.issues.length === 0;

  return (
    <div className="space-y-3">
      {/* Health Status */}
      <div>
        <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
          Health Status
        </p>
        <p
          className={`text-[12px] ${
            isHealthy ? "text-[var(--sprout)]" : "text-[var(--soil)]"
          }`}
        >
          {isHealthy ? "HEALTHY" : "NEEDS ATTENTION"}
        </p>
      </div>

      {/* Summary */}
      <div>
        <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
          Summary
        </p>
        <p className="text-[10px] text-[var(--soil)]">{diagnosis.summary}</p>
      </div>

      {/* Issues */}
      {diagnosis.issues.length > 0 && (
        <div>
          <p className="text-[10px] text-[var(--bark)] uppercase mb-2">
            Issues Detected
          </p>
          <ul className="text-[10px] text-[var(--soil)] space-y-1">
            {diagnosis.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      <div>
        <p className="text-[10px] text-[var(--bark)] uppercase mb-2">
          Suggested Care Tasks
        </p>
        <ul className="text-[10px] text-[var(--soil)] space-y-1">
          {diagnosis.suggestions.map((suggestion, index) => (
            <li key={index}>• {suggestion}</li>
          ))}
        </ul>
      </div>

      {/* Confidence Score */}
      <div>
        <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
          Confidence
        </p>
        <p className="text-[10px] text-[var(--khaki)]">
          {Math.round(diagnosis.confidence * 100)}%
        </p>
      </div>
    </div>
  );
}

