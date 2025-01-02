import React from 'react';

interface HoursChartProps {
  consumedHours: number;
  estimatedHours: number;
}

export function HoursChart({ consumedHours, estimatedHours }: HoursChartProps) {
  const percentage = Math.min(100, Math.round((consumedHours / estimatedHours) * 100)) || 0;
  const strokeWidth = 6;
  const size = 90;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percent: number) => {
    if (percent <= 75) return 'text-emerald-500';
    if (percent <= 90) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative mb-2">
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            className="text-slate-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className={`${getColor(percentage)} transition-all duration-500 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-700">{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500 mb-1">Horas Consumidas</p>
        <p className="text-base font-bold text-slate-700">{consumedHours}h / {estimatedHours}h</p>
      </div>
    </div>
  );
}