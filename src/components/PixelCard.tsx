import { HTMLAttributes } from 'react';

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'light';
}

export function PixelCard({ variant = 'default', className = '', children, ...props }: PixelCardProps) {
  const variantStyles = {
    default: 'bg-[var(--sand-2)]',
    dark: 'bg-[var(--wheat)]',
    light: 'bg-[var(--sand)]'
  };
  
  return (
    <div
      className={`pixel-border pixel-shadow ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
