import { PlantCard } from './PlantCard';
import { Plant } from '../types/plant';

interface MyPlantsPageProps {
  plants: Plant[];
  onPlantClick: (plantId: string) => void;
  onDeletePlant: (plantId: string) => void;
}

export function MyPlantsPage({ plants, onPlantClick, onDeletePlant }: MyPlantsPageProps) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-[20px] text-[var(--soil)] uppercase mb-2">MY PLANTS</h1>
        <p className="text-[10px] text-[var(--khaki)]">
          {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your garden
        </p>
      </div>

      {plants.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="text-[80px] opacity-30">🌱</span>
            <p className="text-[12px] text-[var(--khaki)] uppercase mt-4">
              No plants yet<br />
              Add your first plant to get started!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              name={plant.name}
              species={plant.species}
              xp={plant.xp}
              state={plant.state}
              spriteUrl={plant.spriteUrl}
              onClick={() => onPlantClick(plant.id)}
              onDelete={() => onDeletePlant(plant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
