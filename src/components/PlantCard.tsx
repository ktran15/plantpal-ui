import { PixelCard } from './PixelCard';
import { PlantSprite } from './PlantSprite';
import { PlantAvatar } from './PlantAvatar';
import { Trash2 } from 'lucide-react';

interface PlantCardProps {
  name: string;
  species: string;
  xp: number;
  state?: 'happy' | 'neutral' | 'sad' | 'sick' | 'evolving';
  spriteUrl?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

export function PlantCard({
  name,
  species,
  xp,
  state = 'happy',
  spriteUrl,
  onClick,
  onDelete,
}: PlantCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <PixelCard
      className="p-4 cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98] relative"
      onClick={onClick}
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-6 h-6 pixel-border bg-[var(--clay)] hover:bg-[var(--bark)] flex items-center justify-center pixel-shadow-sm transition-colors z-10"
          aria-label="Delete plant"
        >
          <Trash2 className="w-3 h-3 text-white" strokeWidth={2.5} />
        </button>
      )}
      <div className="flex flex-col items-center gap-3">
        {spriteUrl ? (
          <PlantAvatar src={spriteUrl} name={name} size="md" showLabel={false} />
        ) : (
          <PlantSprite state={state} size="md" xp={xp} />
        )}

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
