import React from 'react';
import type { Period } from '../../types/period';
import { DEFAULT_PERIODS } from '../../types/period';

export interface PeriodBarProps {
  periods?: Period[];
  activePeriod?: Period;
  onPeriodChange?: (period: Period) => void;
  className?: string;
}

export const PeriodBar: React.FC<PeriodBarProps> = ({
  periods = DEFAULT_PERIODS,
  activePeriod,
  onPeriodChange,
  className,
}) => {
  return (
    <div className={`klc-period-bar ${className ?? ''}`}>
      {periods.map((period) => {
        const isActive =
          activePeriod?.multiplier === period.multiplier &&
          activePeriod?.timespan === period.timespan;
        return (
          <button
            key={period.text}
            className={`klc-period-btn ${isActive ? 'klc-period-btn--active' : ''}`}
            onClick={() => onPeriodChange?.(period)}
          >
            {period.text}
          </button>
        );
      })}
    </div>
  );
};
