import { Plus } from 'lucide-react';
import { PixelCard } from './PixelCard';

interface AddPlantCardProps {
  onClick: () => void;
  isFirstPlant?: boolean;
}

export function AddPlantCard({ onClick, isFirstPlant = false }: AddPlantCardProps) {
  return (
    <PixelCard 
      variant="dark" 
      className="h-[400px] flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
      onClick={onClick}
    >
      {/* Main content */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 pixel-border bg-[var(--sprout)] flex items-center justify-center pixel-shadow hover:bg-[var(--leaf)] transition-colors">
          <Plus className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        <div className="text-center">
          <p className="text-[14px] text-[var(--soil)] uppercase">
            {isFirstPlant ? 'START YOUR' : 'ADD NEW'}<br />
            {isFirstPlant ? 'GARDEN' : 'PLANT'}
          </p>
        </div>
      </div>
    </PixelCard>
  );
}
