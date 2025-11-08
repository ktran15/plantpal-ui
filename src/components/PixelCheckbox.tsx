import { InputHTMLAttributes, forwardRef } from 'react';

interface PixelCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const PixelCheckbox = forwardRef<HTMLInputElement, PixelCheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 pixel-border bg-[var(--sand)] peer-checked:bg-[var(--leaf)] peer-focus:ring-2 peer-focus:ring-[var(--sprout)] flex items-center justify-center transition-colors">
            {/* Pixel leaf icon when checked */}
            <svg
              className="w-3 h-3 opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6L2 8L4 8L4 10L6 10L6 8L8 8L8 6L10 6L10 4L8 4L8 2L6 2L6 4L4 4L4 6L2 6Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        {label && <span className="text-[12px]">{label}</span>}
      </label>
    );
  }
);

PixelCheckbox.displayName = 'PixelCheckbox';
