import { cn } from '@/utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 p-4', className)}>
      {children}
    </div>
  );
}
