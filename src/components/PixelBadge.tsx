interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export function PixelBadge({ children, variant = 'neutral', className = '' }: PixelBadgeProps) {
  const variantStyles = {
    success: 'bg-[var(--leaf)] text-white',
    warning: 'bg-[var(--clay)] text-white',
    info: 'bg-[var(--sprout)] text-white',
    neutral: 'bg-[var(--khaki)] text-[var(--soil)]'
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-[8px] uppercase pixel-border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
