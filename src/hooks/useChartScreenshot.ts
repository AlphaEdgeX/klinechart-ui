import { useCallback } from 'react';
import { useKlineChartContext } from '../components/KlineChart/KlineChartContext';

export function useChartScreenshot() {
  const { chart } = useKlineChartContext();

  const getScreenshotUrl = useCallback(
    (includeOverlay = true, type = 'image/png', backgroundColor?: string) => {
      if (!chart) return '';
      return chart.getConvertPictureUrl(includeOverlay, type, backgroundColor);
    },
    [chart]
  );

  const downloadScreenshot = useCallback(
    (filename = 'chart.png', includeOverlay = true) => {
      const url = getScreenshotUrl(includeOverlay);
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    },
    [getScreenshotUrl]
  );

  return { getScreenshotUrl, downloadScreenshot };
}
