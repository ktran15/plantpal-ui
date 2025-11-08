import { useState, useRef } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { PixelCard } from "./PixelCard";
import { PixelLoader } from "./PixelLoader";
import { DiagnosisPanel } from "./DiagnosisPanel";
import {
  identifyPlant,
  diagnosePlant,
  PlantIdentificationResult,
  PlantDiagnosis,
} from "../services/geminiService";

interface CameraPageProps {
  onBack: () => void;
}

export function CameraPage({ onBack }: CameraPageProps) {
  const [mode, setMode] = useState<"diagnose" | "identify">(
    "identify",
  );
  const [selectedImage, setSelectedImage] = useState<
    string | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Separate state for identify and diagnose results
  const [plantInfo, setPlantInfo] = useState<PlantIdentificationResult | null>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset all results when leaving the page
  const handleBack = () => {
    setPlantInfo(null);
    setIdentifyError(null);
    setDiagnosis(null);
    setDiagnosisError(null);
    setSelectedImage(null);
    onBack();
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        
        if (mode === "identify") {
          // Clear only identify-related errors
          setIdentifyError(null);
          setIsAnalyzing(true);
          try {
            const result = await identifyPlant(imageData);
            setPlantInfo(result);
          } catch (err) {
            setIdentifyError(err instanceof Error ? err.message : "Failed to identify plant");
          } finally {
            setIsAnalyzing(false);
          }
        } else {
          // Clear only diagnosis-related errors
          setDiagnosisError(null);
          setIsAnalyzing(true);
          try {
            const result = await diagnosePlant(imageData);
            setDiagnosis(result);
          } catch (err) {
            setDiagnosisError(err instanceof Error ? err.message : "Failed to diagnose plant");
          } finally {
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[var(--soil)] hover:text-[var(--sprout)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={3} />
        <span className="text-[10px] uppercase">Back</span>
      </button>

      <h1 className="text-[20px] text-[var(--soil)] uppercase mb-6">
        PLANT CAMERA
      </h1>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <PixelButton
          onClick={() => setMode("identify")}
          variant={
            mode === "identify" ? "primary" : "secondary"
          }
        >
          IDENTIFY
        </PixelButton>
        <PixelButton
          onClick={() => setMode("diagnose")}
          variant={
            mode === "diagnose" ? "primary" : "secondary"
          }
        >
          DIAGNOSE
        </PixelButton>
      </div>

      <PixelCard className="p-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--bark)] bg-[var(--sand)] p-12 cursor-pointer hover:bg-[var(--khaki)] transition-colors flex flex-col items-center justify-center min-h-[300px]"
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Selected plant"
              className="max-h-[400px] object-contain"
            />
          ) : (
            <>
              <Upload
                className="w-12 h-12 text-[var(--khaki)] mb-4"
                strokeWidth={2}
              />
              <p className="text-[12px] text-[var(--soil)] uppercase mb-2">
                {mode === "identify"
                  ? "IDENTIFY PLANT"
                  : "DIAGNOSE PLANT"}
              </p>
              <p className="text-[10px] text-[var(--khaki)] text-center">
                Click to upload a photo
                <br />
                PNG or JPG (max 5MB)
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Analysis Results */}
        {selectedImage && (
          <div className="mt-6 pt-6 border-t-2 border-[var(--bark)]">
            <h3 className="text-[14px] text-[var(--soil)] uppercase mb-4">
              {mode === "identify"
                ? "IDENTIFICATION RESULTS"
                : "DIAGNOSIS RESULTS"}
            </h3>

            {mode === "identify" ? (
              <>
                {isAnalyzing ? (
                  <PixelLoader text="IDENTIFYING PLANT..." />
                ) : (
                  <div className="space-y-3">
                    {identifyError ? (
                      <div className="p-4 bg-[var(--sand)] border-2 border-[var(--bark)]">
                        <p className="text-[10px] text-[var(--soil)] uppercase mb-2">
                          Error
                        </p>
                        <p className="text-[10px] text-[var(--khaki)]">
                          {identifyError}
                        </p>
                      </div>
                    ) : plantInfo ? (
                      <>
                        <div>
                          <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                            Common Name
                          </p>
                          <p className="text-[12px] text-[var(--soil)]">
                            {plantInfo.commonName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                            Scientific Name
                          </p>
                          <p className="text-[12px] text-[var(--soil)]">
                            {plantInfo.scientificName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--bark)] uppercase mb-2">
                            Care Instructions
                          </p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-[9px] text-[var(--bark)] uppercase mb-1">
                                Light
                              </p>
                              <p className="text-[10px] text-[var(--soil)]">
                                {plantInfo.careInstructions.light || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[var(--bark)] uppercase mb-1">
                                Water
                              </p>
                              <p className="text-[10px] text-[var(--soil)]">
                                {plantInfo.careInstructions.water || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[var(--bark)] uppercase mb-1">
                                Soil
                              </p>
                              <p className="text-[10px] text-[var(--soil)]">
                                {plantInfo.careInstructions.soil || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-[var(--bark)] uppercase mb-1">
                                Temperature
                              </p>
                              <p className="text-[10px] text-[var(--soil)]">
                                {plantInfo.careInstructions.temperature || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {plantInfo.funFacts && plantInfo.funFacts.length > 0 && (
                          <div>
                            <p className="text-[10px] text-[var(--bark)] uppercase mb-2">
                              Fun Facts
                            </p>
                            <ul className="text-[10px] text-[var(--soil)] space-y-1">
                              {plantInfo.funFacts.map((fact, index) => (
                                <li key={index}>• {fact}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <DiagnosisPanel
                diagnosis={diagnosis}
                isLoading={isAnalyzing}
                error={diagnosisError}
              />
            )}
          </div>
        )}
      </PixelCard>
    </div>
  );
}