import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelInput } from './PixelInput';
import { PixelCard } from './PixelCard';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plant: { name: string; species: string }) => void;
}

export function AddPlantModal({ isOpen, onClose, onAdd }: AddPlantModalProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (name && species) {
      onAdd({ name, species });
      setName('');
      setSpecies('');
      onClose();
    }
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
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

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
            />
          </div>

          <div>
            <label className="block text-[10px] text-[var(--bark)] mb-2 uppercase">
              Species
            </label>
            <PixelInput
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g., Monstera deliciosa"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <PixelButton 
              onClick={handleSubmit} 
              variant="primary" 
              className="flex-1"
              disabled={!name || !species}
            >
              ADD PLANT
            </PixelButton>
            <PixelButton onClick={onClose} variant="secondary">
              CANCEL
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}
