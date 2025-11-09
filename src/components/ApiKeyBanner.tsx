import { X } from 'lucide-react';
import { PixelCard } from './PixelCard';

interface ApiKeyBannerProps {
  onDismiss?: () => void;
}

export function ApiKeyBanner({ onDismiss }: ApiKeyBannerProps) {
  return (
    <PixelCard className="p-4 mb-4 bg-[var(--clay)] border-2 border-[var(--bark)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-[12px] text-white uppercase mb-2">
            ⚠️ GEMINI API KEY MISSING
          </p>
          <p className="text-[10px] text-[var(--eggshell)] mb-2">
            Please set VITE_GEMINI_API_KEY in your .env file to enable live sprite generation.
            Fallback sprites will be used until the key is configured.
          </p>
          <p className="text-[8px] text-[var(--eggshell)] opacity-80">
            The app will work with fallback sprites, but live Gemini generation requires an API key.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white hover:text-[var(--eggshell)] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        )}
      </div>
    </PixelCard>
  );
}

