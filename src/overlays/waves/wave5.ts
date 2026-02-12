import type { OverlayTemplate } from 'klinecharts';

export const wave5: OverlayTemplate = {
  name: 'fiveWaves',
  totalStep: 7,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates }) => {
    const texts = coordinates.map((coordinate, i) => ({
      ...coordinate,
      text: `(${i})`,
      baseline: 'bottom' as const,
    }));
    return [
      { type: 'line', attrs: { coordinates } },
      { type: 'text', ignoreEvent: true, attrs: texts },
    ];
  },
};
