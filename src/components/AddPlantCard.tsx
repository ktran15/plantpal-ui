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
      className="h-[400px] flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98] relative overflow-hidden"
      onClick={onClick}
    >
      {/* Faint plant silhouette shadow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="text-[200px] select-none">🌱</div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 pixel-border bg-[var(--sprout)] flex items-center justify-center pixel-shadow hover:bg-[var(--leaf)] transition-colors">
          <Plus className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        <div className="text-center">
          <p className="text-[14px] text-[var(--soil)] uppercase mb-2">
            {isFirstPlant ? 'START YOUR' : 'ADD NEW'}<br />
            {isFirstPlant ? 'GARDEN' : 'PLANT'}
          </p>
          {isFirstPlant && (
            <p className="text-[10px] text-[var(--khaki)] max-w-xs">
              Click to add your first plant and begin your care journey!
            </p>
          )}
        </div>
      </div>
    </PixelCard>
  );
}
