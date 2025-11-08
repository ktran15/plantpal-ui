import { ButtonHTMLAttributes, forwardRef } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'pixel-border pixel-shadow transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase';
    
    const variantStyles = {
      primary: 'bg-[var(--sprout)] text-white hover:bg-[var(--fern)]',
      secondary: 'bg-[var(--wheat)] text-[var(--soil)] hover:bg-[var(--khaki)]',
      accent: 'bg-[var(--leaf)] text-white hover:bg-[var(--sprout)]',
      danger: 'bg-[var(--clay)] text-white hover:bg-[var(--bark)]'
    };
    
    const sizeStyles = {
      sm: 'px-3 py-2 text-[10px]',
      md: 'px-4 py-3 text-[12px]',
      lg: 'px-6 py-4 text-[14px]'
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
