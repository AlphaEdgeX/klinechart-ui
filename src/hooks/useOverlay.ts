import { useCallback } from 'react';
import type { OverlayCreate, OverlayMode } from 'klinecharts';
import { useKlineChartContext } from '../components/KlineChart/KlineChartContext';

export function useOverlay() {
  const { chart } = useKlineChartContext();

  const createOverlay = useCallback(
    (overlay: string | OverlayCreate, paneId?: string) => {
      if (!chart) return null;
      return chart.createOverlay(overlay, paneId);
    },
    [chart]
  );

  const removeOverlay = useCallback(
    (idOrName?: string) => {
      if (!chart) return;
      chart.removeOverlay(idOrName);
    },
    [chart]
  );

  const overrideOverlay = useCallback(
    (override: Partial<OverlayCreate>) => {
      if (!chart) return;
      chart.overrideOverlay(override);
    },
    [chart]
  );

  const getOverlayById = useCallback(
    (id: string) => {
      if (!chart) return null;
      return chart.getOverlayById(id);
    },
    [chart]
  );

  return { createOverlay, removeOverlay, overrideOverlay, getOverlayById };
}
