import { useState, useRef } from "react";
import { Upload, ArrowLeft } from "lucide-react";
import { PixelButton } from "./PixelButton";
import { PixelCard } from "./PixelCard";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // Simulate analysis
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <button
        onClick={onBack}
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
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-[var(--sprout)] mb-3">
                  <span className="text-[40px]">🔍</span>
                </div>
                <p className="text-[10px] text-[var(--khaki)] uppercase">
                  Analyzing...
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-[14px] text-[var(--soil)] uppercase mb-4">
                  {mode === "identify"
                    ? "IDENTIFICATION RESULTS"
                    : "DIAGNOSIS RESULTS"}
                </h3>

                {mode === "identify" ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                        Common Name
                      </p>
                      <p className="text-[12px] text-[var(--soil)]">
                        Monstera
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                        Latin Name
                      </p>
                      <p className="text-[12px] text-[var(--soil)]">
                        Monstera deliciosa
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                        Quick Facts
                      </p>
                      <p className="text-[10px] text-[var(--soil)]">
                        Native to tropical forests of Central
                        America. Loves bright indirect light and
                        regular watering.
                      </p>
                    </div>
                    <PixelButton
                      variant="primary"
                      className="w-full mt-4"
                    >
                      ADD TO MY PLANTS
                    </PixelButton>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                        Health Status
                      </p>
                      <p className="text-[12px] text-[var(--sprout)]">
                        HEALTHY
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">
                        Suggested Tasks
                      </p>
                      <ul className="text-[10px] text-[var(--soil)] space-y-1">
                        <li>• Water within 2-3 days</li>
                        <li>• Wipe leaves to remove dust</li>
                        <li>
                          • Consider repotting if root-bound
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </PixelCard>
    </div>
  );
}