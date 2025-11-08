import { PixelCard } from './PixelCard';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '🌱', title, description, action }: EmptyStateProps) {
  return (
    <PixelCard className="p-12 flex flex-col items-center justify-center text-center">
      <div className="text-[80px] opacity-30 mb-4">{icon}</div>
      <h3 className="text-[14px] text-[var(--soil)] uppercase mb-2">{title}</h3>
      {description && (
        <p className="text-[10px] text-[var(--khaki)] mb-6 max-w-xs">{description}</p>
      )}
      {action}
    </PixelCard>
  );
}
