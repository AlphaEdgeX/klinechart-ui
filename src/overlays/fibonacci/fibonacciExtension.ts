import type { OverlayTemplate, LineAttrs, TextAttrs } from 'klinecharts';

export const fibonacciExtension: OverlayTemplate = {
  name: 'fibonacciExtension',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, precision }) => {
    const fbLines: LineAttrs[] = [];
    const texts: TextAttrs[] = [];
    if (coordinates.length > 2) {
      const points = overlay.points;
      const v0 = points[0]?.value ?? 0;
      const v1 = points[1]?.value ?? 0;
      const v2 = points[2]?.value ?? 0;
      const valueDif = v1 - v0;
      const yDif = coordinates[1].y - coordinates[0].y;
      const percents = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const textX =
        coordinates[2].x > coordinates[1].x
          ? coordinates[1].x
          : coordinates[2].x;
      percents.forEach((percent) => {
        const y = coordinates[2].y + yDif * percent;
        const price = (v2 + valueDif * percent).toFixed(precision.price);
        fbLines.push({
          coordinates: [
            { x: coordinates[1].x, y },
            { x: coordinates[2].x, y },
          ],
        });
        texts.push({
          x: textX,
          y,
          text: `${price} (${(percent * 100).toFixed(1)}%)`,
          baseline: 'bottom',
        });
      });
    }
    return [
      { type: 'line', attrs: { coordinates }, styles: { style: 'dashed' } },
      { type: 'line', attrs: fbLines },
      { type: 'text', ignoreEvent: true, attrs: texts },
    ];
  },
};
