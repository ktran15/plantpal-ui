import { PixelButton } from './PixelButton';
import { AddPlantButton } from './AddPlantButton';
import { Sprout, Camera, MessageSquare, Palette } from 'lucide-react';

interface HeaderProps {
  onCameraClick: () => void;
  onMyPlantsClick: () => void;
  onAgentClick: () => void;
  onAddPlantClick?: () => void;
  onShowcaseClick?: () => void;
}

export function Header({
  onCameraClick,
  onMyPlantsClick,
  onAgentClick,
  onAddPlantClick,
  onShowcaseClick,
}: HeaderProps) {
  return (
    <header className="border-b-2 border-[var(--bark)] bg-[var(--wheat)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <div className="w-8 h-8 bg-[var(--sprout)] pixel-border pixel-shadow-sm flex items-center justify-center hover:bg-[var(--fern)] transition-colors">
            <Sprout className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[16px] text-[var(--soil)]">PLANT PALS</h1>
        </button>

        <nav className="flex items-center gap-2">
          {onShowcaseClick && (
            <button
              onClick={onShowcaseClick}
              className="text-[var(--khaki)] hover:text-[var(--sprout)] transition-colors mr-2"
              title="View Design System"
            >
              <Palette className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
          {onAddPlantClick && (
            <AddPlantButton onClick={onAddPlantClick} />
          )}
          <PixelButton onClick={onMyPlantsClick} variant="secondary" size="sm">
            MY PLANTS
          </PixelButton>
          <PixelButton onClick={onCameraClick} variant="secondary" size="sm">
            <Camera className="w-4 h-4" strokeWidth={2.5} />
          </PixelButton>
          <PixelButton onClick={onAgentClick} variant="accent" size="sm">
            <MessageSquare className="w-4 h-4" strokeWidth={2.5} />
          </PixelButton>
        </nav>
      </div>
    </header>
  );
}
