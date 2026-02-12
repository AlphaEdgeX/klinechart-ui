import { createContext, useContext } from 'react';
import type { Chart } from 'klinecharts';

export interface KlineChartContextValue {
  chart: Chart | null;
  ready: boolean;
  containerId: string;
}

export const KlineChartContext = createContext<KlineChartContextValue>({
  chart: null,
  ready: false,
  containerId: '',
});

export function useKlineChartContext(): KlineChartContextValue {
  const ctx = useContext(KlineChartContext);
  if (!ctx.containerId) {
    throw new Error('useKlineChartContext must be used within a <KlineChart> component');
  }
  return ctx;
}
