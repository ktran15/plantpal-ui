interface PixelLoaderProps {
  text?: string;
}

export function PixelLoader({ text = 'LOADING...' }: PixelLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-[var(--sprout)] pixel-border animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
      <p className="text-[10px] text-[var(--khaki)] uppercase">{text}</p>
    </div>
  );
}
