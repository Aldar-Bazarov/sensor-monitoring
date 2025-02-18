import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingSpinner = ({ loading, children, className }: LoadingSpinnerProps) => {
  if (!loading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
      <div className="opacity-50">{children}</div>
    </div>
  );
};
