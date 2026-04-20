import { formatPercent } from '@/utils/format';

interface ProbBarProps {
  label: string;
  value: number;
  color: string;
}

export function ProbBar({ label, value, color }: ProbBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-medium">{formatPercent(value)}</span>
    </div>
  );
}
