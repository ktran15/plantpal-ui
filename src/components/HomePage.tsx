import { AddPlantCard } from './AddPlantCard';
import { DailyTasksJournal } from './DailyTasksJournal';
import { PixelCard } from './PixelCard';
import { Sprout } from 'lucide-react';

interface HomePageProps {
  onAddPlantClick: () => void;
  plantCount?: number;
}

export function HomePage({ onAddPlantClick, plantCount = 0 }: HomePageProps) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Welcome header with plant count */}
      {plantCount > 0 && (
        <PixelCard className="p-4 mb-6 bg-[var(--sprout)]">
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
            <div>
              <h2 className="text-[14px] text-white uppercase">WELCOME TO YOUR GARDEN</h2>
              <p className="text-[10px] text-[var(--eggshell)] opacity-90">
                You're caring for {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
              </p>
            </div>
          </div>
        </PixelCard>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Left Panel - Add Plant Card (60%) */}
        <div className="md:col-span-3">
          <AddPlantCard onClick={onAddPlantClick} isFirstPlant={plantCount === 0} />
        </div>
        
        {/* Right Panel - Daily Tasks Journal (40%) */}
        <div className="md:col-span-2">
          <DailyTasksJournal />
        </div>
      </div>
    </div>
  );
}
