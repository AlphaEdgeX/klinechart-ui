import { useEffect, useState } from 'react';
import { ActionType } from 'klinecharts';
import type { Crosshair } from 'klinecharts';
import { useKlineChartContext } from '../components/KlineChart/KlineChartContext';

export function useCrosshair() {
  const { chart, ready } = useKlineChartContext();
  const [crosshair, setCrosshair] = useState<Crosshair | null>(null);

  useEffect(() => {
    if (!chart || !ready) return;

    const handler = (data: Crosshair) => {
      setCrosshair(data);
    };

    chart.subscribeAction(ActionType.OnCrosshairChange, handler);
    return () => {
      chart.unsubscribeAction(ActionType.OnCrosshairChange, handler);
    };
  }, [chart, ready]);

  return crosshair;
}
