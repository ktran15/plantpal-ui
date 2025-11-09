import { useState, useRef, useEffect } from "react";
import { Upload, ArrowLeft, Copy, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner@2.0.3";
import { PixelButton } from "./PixelButton";
import { PixelCard } from "./PixelCard";
import { PixelLoader } from "./PixelLoader";
import { DiagnosisPanel } from "./DiagnosisPanel";
import { generateSessionId, buildMobileUrl, getNetworkAccessHint } from "../utils/session";
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
  
  // Separate image states for identify and diagnose
  const [identifyImage, setIdentifyImage] = useState<string | null>(null);
  const [diagnoseImage, setDiagnoseImage] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Separate state for identify and diagnose results
  const [plantInfo, setPlantInfo] = useState<PlantIdentificationResult | null>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR/Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [mobileUrl, setMobileUrl] = useState<string>("");
  const [imageReceived, setImageReceived] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMobileUrl(buildMobileUrl(newSessionId));
  }, []);

  // Start polling when sessionId is set
  useEffect(() => {
    if (!sessionId) return;

    const pollForImage = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}/image`);
        const data = await response.json();

        if (data.found && data.dataUrl) {
          // Set image to current mode's state
          if (mode === "identify") {
            setIdentifyImage(data.dataUrl);
            setIdentifyError(null);
            setIsAnalyzing(true);
            try {
              const result = await identifyPlant(data.dataUrl);
              setPlantInfo(result);
            } catch (err) {
              setIdentifyError(err instanceof Error ? err.message : "Failed to identify plant");
            } finally {
              setIsAnalyzing(false);
            }
          } else {
            setDiagnoseImage(data.dataUrl);
            setDiagnosisError(null);
            setIsAnalyzing(true);
            try {
              const result = await diagnosePlant(data.dataUrl);
              setDiagnosis(result);
            } catch (err) {
              setDiagnosisError(err instanceof Error ? err.message : "Failed to diagnose plant");
            } finally {
              setIsAnalyzing(false);
            }
          }

          setImageReceived(true);

          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Error polling for image:", err);
      }
    };

    // Start polling every 2 seconds
    pollingIntervalRef.current = window.setInterval(pollForImage, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [sessionId, mode]);

  // Reset all state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      setPlantInfo(null);
      setIdentifyError(null);
      setDiagnosis(null);
      setDiagnosisError(null);
      setIdentifyImage(null);
      setDiagnoseImage(null);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Reset all results when leaving the page
  const handleBack = () => {
    setPlantInfo(null);
    setIdentifyError(null);
    setDiagnosis(null);
    setDiagnosisError(null);
    setIdentifyImage(null);
    setDiagnoseImage(null);
    onBack();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      toast.success("Link copied to clipboard!", { duration: 2000 });
    } catch (err) {
      toast.error("Failed to copy link", { duration: 2000 });
    }
  };

  const handleRegenerateSession = () => {
    // Stop current polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Generate new session
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMobileUrl(buildMobileUrl(newSessionId));
    setImageReceived(false);

    // Clear current mode's image if it was from QR upload
    if (mode === "identify") {
      setIdentifyImage(null);
      setPlantInfo(null);
      setIdentifyError(null);
    } else {
      setDiagnoseImage(null);
      setDiagnosis(null);
      setDiagnosisError(null);
    }

    toast.success("New session created!", { duration: 2000 });
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        if (mode === "identify") {
          setIdentifyImage(imageData);
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
          setDiagnoseImage(imageData);
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
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

      {/* Main content area with 75/25 split */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Left side - Upload panel (75% on md+) */}
        <PixelCard className="md:col-span-3 p-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--bark)] bg-[var(--sand)] p-12 cursor-pointer hover:bg-[var(--khaki)] transition-colors flex flex-col items-center justify-center min-h-[300px]"
          >
            {(mode === "identify" ? identifyImage : diagnoseImage) ? (
              <img
                src={mode === "identify" ? identifyImage : diagnoseImage}
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
        </PixelCard>

        {/* Right side - QR panel (25% on md+) */}
        <PixelCard className="md:col-span-1 p-4">
          <h3 className="text-[10px] text-[var(--soil)] uppercase mb-4 text-center">
            Scan to Upload from Phone
          </h3>

          {/* Network hint */}
          <div className="text-[8px] text-center text-[var(--khaki)] mb-2 px-1">
            {getNetworkAccessHint()}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4 bg-white p-2 pixel-border">
            <QRCodeSVG value={mobileUrl} size={128} includeMargin />
          </div>

          {/* Status Badge */}
          <div className={`text-center mb-3 px-2 py-1 pixel-border text-[8px] uppercase ${
            imageReceived 
              ? "bg-[var(--sprout)] text-white" 
              : "bg-[var(--sand)] text-[var(--khaki)]"
          }`}>
            {imageReceived ? "Image received ✓" : "Waiting for upload..."}
          </div>

          {/* Mobile URL */}
          <div className="mb-3">
            <input
              type="text"
              value={mobileUrl}
              readOnly
              className="w-full text-[8px] px-2 py-1 border-2 border-[var(--bark)] bg-[var(--sand)] text-[var(--soil)] mb-2"
              aria-label="Mobile upload URL"
            />
            <PixelButton
              onClick={handleCopyLink}
              variant="secondary"
              size="sm"
              className="w-full"
              aria-label="Copy link to clipboard"
            >
              <Copy className="w-3 h-3 inline mr-1" />
              Copy Link
            </PixelButton>
          </div>

          {/* Regenerate Button */}
          <PixelButton
            onClick={handleRegenerateSession}
            variant="accent"
            size="sm"
            className="w-full"
            aria-label="Generate new session"
          >
            <RefreshCw className="w-3 h-3 inline mr-1" />
            Regenerate
          </PixelButton>
        </PixelCard>
      </div>

      {/* Results area (full width below) */}
      <PixelCard className="p-6">

        {/* Analysis Results */}
        {(mode === "identify" ? identifyImage : diagnoseImage) && (
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