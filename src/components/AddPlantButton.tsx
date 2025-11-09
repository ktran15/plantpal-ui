import { Plus } from 'lucide-react';
import { PixelButton } from './PixelButton';

interface AddPlantButtonProps {
  onClick: () => void;
}

export function AddPlantButton({ onClick }: AddPlantButtonProps) {
  return (
    <PixelButton onClick={onClick} variant="primary" size="sm" className="flex items-center gap-2">
      <Plus className="w-4 h-4" strokeWidth={2.5} />
      <span>ADD PLANT</span>
    </PixelButton>
  );
}

