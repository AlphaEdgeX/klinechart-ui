import type { OverlayTemplate } from 'klinecharts';

/**
 * Time Measurement — 2 clicks showing bar count between two points.
 */
export const timeMeasurement: OverlayTemplate = {
  name: 'timeMeasurement',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay }) => {
    if (coordinates.length < 2) return [];

    const points = overlay.points;
    const idx1 = points[0]?.dataIndex ?? 0;
    const idx2 = points[1]?.dataIndex ?? 0;
    const barCount = Math.abs(idx2 - idx1);
    const midX = (coordinates[0].x + coordinates[1].x) / 2;
    const y = coordinates[0].y;

    return [
      // Horizontal line between points
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y },
            { x: coordinates[1].x, y },
          ],
        },
        styles: { style: 'dashed' },
      },
      // Vertical ticks
      {
        type: 'line',
        ignoreEvent: true,
        attrs: [
          {
            coordinates: [
              { x: coordinates[0].x, y: y - 10 },
              { x: coordinates[0].x, y: y + 10 },
            ],
          },
          {
            coordinates: [
              { x: coordinates[1].x, y: y - 10 },
              { x: coordinates[1].x, y: y + 10 },
            ],
          },
        ],
      },
      // Label
      {
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: midX,
          y: y - 14,
          text: `${barCount} bars`,
          baseline: 'bottom',
          align: 'center',
        },
        styles: {
          backgroundColor: '#5C6BC0',
          color: '#ffffff',
          size: 11,
          paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
          borderRadius: 2,
        },
      },
    ];
  },
};
