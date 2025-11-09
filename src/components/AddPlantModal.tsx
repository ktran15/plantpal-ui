import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelInput } from './PixelInput';
import { PixelCard } from './PixelCard';
import { PixelLoader } from './PixelLoader';
import { generateSpeciesSprite } from '../services/speciesSprites';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plant: { name: string; species: string; spriteUrl: string }) => void;
}

export function AddPlantModal({ isOpen, onClose, onAdd }: AddPlantModalProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isGenerating) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isGenerating]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSpecies('');
      setError(null);
      setRetryCount(0);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name || !species) {
      setError('Please fill in both name and species');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate sprite from species
      const { dataUrl } = await generateSpeciesSprite(species);

      // Call onAdd with data
      onAdd({ name, species, spriteUrl: dataUrl });

      // Reset and close
      setName('');
      setSpecies('');
      onClose();
    } catch (err) {
      console.error('Failed to generate sprites:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate plant avatar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <PixelCard className="w-full max-w-md bg-[var(--eggshell)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] text-[var(--soil)] uppercase">ADD PLANT</h2>
          <button 
            onClick={onClose}
            className="text-[var(--soil)] hover:text-[var(--clay)] transition-colors"
            disabled={isGenerating}
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {isGenerating ? (
          <div className="py-8">
            <PixelLoader text="GENERATING AVATAR..." />
            <p className="text-[10px] text-[var(--khaki)] text-center mt-4">
              Creating your plant's pixel avatar...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[var(--bark)] mb-2 uppercase">
                Plant Name
              </label>
              <PixelInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monstera"
                className="w-full"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[var(--bark)] mb-2 uppercase">
                Species
              </label>
              <PixelInput
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g., Boston Fern, Monstera deliciosa"
                className="w-full"
                disabled={isGenerating}
              />
              <p className="text-[8px] text-[var(--khaki)] mt-1">
                The avatar will be generated from the species name
              </p>
            </div>

            {error && (
              <div className="p-3 bg-[var(--sand)] border-2 border-[var(--clay)]">
                <p className="text-[10px] text-[var(--clay)] uppercase mb-2">{error}</p>
                <PixelButton
                  onClick={handleRetry}
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={isGenerating}
                >
                  RETRY
                </PixelButton>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <PixelButton 
                onClick={handleSubmit} 
                variant="primary" 
                className="flex-1"
                disabled={!name || !species || isGenerating}
              >
                {isGenerating ? 'GENERATING...' : 'ADD PLANT'}
              </PixelButton>
              <PixelButton 
                onClick={onClose} 
                variant="secondary"
                disabled={isGenerating}
              >
                CANCEL
              </PixelButton>
            </div>
          </div>
        )}
      </PixelCard>
    </div>
  );
}
