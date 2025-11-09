interface PlantAvatarProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PlantAvatar({
  src,
  name,
  size = 'md',
  showLabel = true,
}: PlantAvatarProps) {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-full h-full max-w-[320px] max-h-[320px]', // Constrained to 320px max
  };

  if (!src) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full h-full">
      <div
        className={`${sizeClasses[size]} ${size === 'lg' ? '' : 'pixel-border bg-[var(--wheat)]'} flex items-center justify-center ${size === 'lg' ? '' : 'pixel-shadow'} relative ${size === 'lg' ? '' : 'overflow-hidden'} plant-sprite`}
        style={{
          imageRendering: 'pixelated',
          background: 'transparent',
        }}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-contain"
          style={{
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Name label */}
      {showLabel && (
        <div className="text-center mt-1">
          <p className="text-[10px] text-[var(--soil)] uppercase font-pixel">
            {name}
          </p>
        </div>
      )}
    </div>
  );
}

