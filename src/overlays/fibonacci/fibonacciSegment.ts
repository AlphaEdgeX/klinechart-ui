import type { OverlayTemplate, LineAttrs, TextAttrs } from 'klinecharts';

export const fibonacciSegment: OverlayTemplate = {
  name: 'fibonacciSegment',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, precision }) => {
    const lines: LineAttrs[] = [];
    const texts: TextAttrs[] = [];
    if (coordinates.length > 1) {
      const textX =
        coordinates[1].x > coordinates[0].x
          ? coordinates[0].x
          : coordinates[1].x;
      const percents = [1, 0.786, 0.618, 0.5, 0.382, 0.236, 0];
      const yDif = coordinates[0].y - coordinates[1].y;
      const points = overlay.points;
      const v0 = points[0]?.value ?? 0;
      const v1 = points[1]?.value ?? 0;
      const valueDif = v0 - v1;
      percents.forEach((percent) => {
        const y = coordinates[1].y + yDif * percent;
        const price = (v1 + valueDif * percent).toFixed(precision.price);
        lines.push({
          coordinates: [
            { x: coordinates[0].x, y },
            { x: coordinates[1].x, y },
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
      { type: 'line', attrs: lines },
      { type: 'text', ignoreEvent: true, attrs: texts },
    ];
  },
};
