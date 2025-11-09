import { AddPlantCard } from './AddPlantCard';
import { DailyTasksJournal } from './DailyTasksJournal';
import { PlantAvatar } from './PlantAvatar';
import { PixelCard } from './PixelCard';
import { Sprout, ChevronLeft, ChevronRight } from 'lucide-react';
import { Plant } from '../types/plant';

interface HomePageProps {
  onAddPlantClick: () => void;
  plants: Plant[];
  selectedPlantIndex: number;
  onSelectPlant: (direction: 'prev' | 'next') => void;
  plantCount?: number;
}

export function HomePage({
  onAddPlantClick,
  plants,
  selectedPlantIndex,
  onSelectPlant,
  plantCount = 0,
}: HomePageProps) {
  const selectedPlant = plants.length > 0 && selectedPlantIndex >= 0 && selectedPlantIndex < plants.length
    ? plants[selectedPlantIndex]
    : null;
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Welcome header with plant count */}
      <PixelCard className="p-4 mb-6 bg-[var(--sprout)]">
        <div className="flex items-center gap-3">
          <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
          <div>
            <h2 className="text-[14px] text-white uppercase">WELCOME TO YOUR GARDEN</h2>
            <p className="text-[10px] text-[var(--eggshell)] opacity-90">
              {plantCount > 0 
                ? `You're caring for ${plantCount} ${plantCount === 1 ? 'plant' : 'plants'}`
                : 'Start by adding your first plant'}
            </p>
          </div>
        </div>
      </PixelCard>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Left Panel - Plant Avatar or Add Plant Card (60%) */}
        <div className="md:col-span-3">
          {selectedPlant && selectedPlant.spriteUrl ? (
            <PixelCard className="h-[400px] flex flex-col p-6">
              {/* Row: arrows + sprite */}
              <div className="flex items-center gap-3 flex-1">
                {/* Left column: arrow or spacer */}
                {plants.length > 1 ? (
                  <button
                    onClick={() => onSelectPlant('prev')}
                    className="w-10 h-10 pixel-border bg-[var(--wheat)] hover:bg-[var(--khaki)] flex items-center justify-center pixel-shadow transition-colors"
                    aria-label="Previous plant"
                  >
                    <ChevronLeft className="w-5 h-5 text-[var(--soil)]" strokeWidth={3} />
                  </button>
                ) : (
                  <div className="w-10 h-10" />
                )}

                {/* Middle column: sprite ALWAYS centered; never overlapped */}
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className="plant-sprite mx-auto"
                    style={{ 
                      width: 'min(320px, 95%)', 
                      height: 'min(320px, 95%)',
                      imageRendering: 'pixelated' as any 
                    }}
                  >
                    <PlantAvatar
                      src={selectedPlant.spriteUrl}
                      name={selectedPlant.name}
                      size="lg"
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Right column: arrow or spacer */}
                {plants.length > 1 ? (
                  <button
                    onClick={() => onSelectPlant('next')}
                    className="w-10 h-10 pixel-border bg-[var(--wheat)] hover:bg-[var(--khaki)] flex items-center justify-center pixel-shadow transition-colors"
                    aria-label="Next plant"
                  >
                    <ChevronRight className="w-5 h-5 text-[var(--soil)]" strokeWidth={3} />
                  </button>
                ) : (
                  <div className="w-10 h-10" />
                )}
              </div>

              {/* Bottom row: name + counter */}
              <div className="mt-2 w-full flex items-end justify-between">
                {/* Name slightly larger than before (one size step up) */}
                <p className="text-[14px] text-[var(--soil)] uppercase font-pixel text-center w-full">
                  {selectedPlant.name}
                </p>

                {plants.length > 1 && (
                  <p className="text-[8px] text-[var(--khaki)] uppercase ml-2">
                    {selectedPlantIndex + 1} / {plants.length}
                  </p>
                )}
              </div>
            </PixelCard>
          ) : (
            <AddPlantCard onClick={onAddPlantClick} isFirstPlant={plantCount === 0} />
          )}
        </div>
        
        {/* Right Panel - Daily Tasks Journal (40%) */}
        <div className="md:col-span-2">
          <DailyTasksJournal />
        </div>
      </div>
    </div>
  );
}
