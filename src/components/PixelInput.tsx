import { InputHTMLAttributes, forwardRef } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`pixel-border bg-[var(--sand)] px-3 py-2 text-[var(--soil)] focus:outline-none focus:ring-2 focus:ring-[var(--sprout)] ${className}`}
        {...props}
      />
    );
  }
);

PixelInput.displayName = 'PixelInput';
