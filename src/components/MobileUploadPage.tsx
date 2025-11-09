import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, Check } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';

export function MobileUploadPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        setError('Please select a PNG or JPG image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !sessionId) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(`/api/session/${sessionId}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataUrl: selectedImage }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--eggshell)] pixel-grid-bg flex items-center justify-center p-4">
      <PixelCard className="w-full max-w-md p-6">
        <h1 className="text-[16px] text-[var(--soil)] uppercase mb-6 text-center">
          Upload from Phone
        </h1>

        {uploadSuccess ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-[var(--sprout)] p-4 pixel-border">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <p className="text-[12px] text-[var(--soil)] uppercase">
              Image Uploaded!
            </p>
            <p className="text-[10px] text-[var(--khaki)]">
              You can return to your desktop now.
            </p>
          </div>
        ) : (
          <>
            {/* File Input Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--bark)] bg-[var(--sand)] p-8 cursor-pointer hover:bg-[var(--khaki)] transition-colors flex flex-col items-center justify-center min-h-[200px] mb-4"
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected plant"
                  className="max-h-[300px] object-contain"
                />
              ) : (
                <>
                  <Upload
                    className="w-16 h-16 text-[var(--khaki)] mb-4"
                    strokeWidth={2}
                  />
                  <p className="text-[12px] text-[var(--soil)] uppercase mb-2">
                    Select Photo
                  </p>
                  <p className="text-[10px] text-[var(--khaki)] text-center">
                    Tap to choose from gallery
                    <br />
                    PNG or JPG (max 5MB)
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="mb-4 p-3 bg-[var(--clay)] border-2 border-[var(--bark)] text-white">
                <p className="text-[10px] uppercase">{error}</p>
              </div>
            )}

            {selectedImage && (
              <div className="space-y-3">
                <PixelButton
                  onClick={handleUpload}
                  disabled={isUploading}
                  variant="primary"
                  className="w-full"
                >
                  {isUploading ? 'Uploading...' : 'Upload to Desktop'}
                </PixelButton>
                <PixelButton
                  onClick={() => {
                    setSelectedImage(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Choose Different Photo
                </PixelButton>
              </div>
            )}
          </>
        )}
      </PixelCard>
    </div>
  );
}

