import { useCallback } from 'react';
import type { IndicatorCreate, PaneOptions } from 'klinecharts';
import { useKlineChartContext } from '../components/KlineChart/KlineChartContext';

export function useIndicator() {
  const { chart } = useKlineChartContext();

  const createIndicator = useCallback(
    (
      indicator: string | IndicatorCreate,
      isStack?: boolean,
      paneOptions?: PaneOptions
    ) => {
      if (!chart) return null;
      return chart.createIndicator(indicator, isStack, paneOptions);
    },
    [chart]
  );

  const removeIndicator = useCallback(
    (paneId: string, name?: string) => {
      if (!chart) return;
      chart.removeIndicator(paneId, name);
    },
    [chart]
  );

  return { createIndicator, removeIndicator };
}
