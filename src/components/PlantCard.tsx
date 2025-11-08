import { PixelCard } from './PixelCard';
import { PlantSprite } from './PlantSprite';

interface PlantCardProps {
  name: string;
  species: string;
  xp: number;
  state?: 'happy' | 'neutral' | 'sad' | 'sick' | 'evolving';
  onClick?: () => void;
}

export function PlantCard({ name, species, xp, state = 'happy', onClick }: PlantCardProps) {
  return (
    <PixelCard 
      className="p-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3">
        <PlantSprite state={state} size="md" xp={xp} />
        
        <div className="text-center w-full">
          <h3 className="text-[12px] text-[var(--soil)] uppercase truncate">{name}</h3>
          <p className="text-[8px] text-[var(--khaki)] truncate">{species}</p>
        </div>
        
        {/* Care meter - hearts */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-[12px] ${i < Math.floor(xp / 20) ? 'opacity-100' : 'opacity-30'}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>
    </PixelCard>
  );
}
