import type { OverlayPerformEventParams, OverlayTemplate } from 'klinecharts';

export const horizontalRay: OverlayTemplate = {
  name: 'horizontalRay',
  totalStep: 1,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, bounding }) => {
    if (coordinates.length === 0) {
      return [];
    }

    return [
      {
        type: 'line',
        attrs: {
          coordinates: [
            {
              x: coordinates[0].x,
              y: coordinates[0].y,
            },
            {
              x: bounding.width,
              y: coordinates[0].y,
            },
          ],
        },
      },
    ];
  },
  performEventPressedMove: ({ points, performPoint }: OverlayPerformEventParams) => {
    if (!points[0]) return;
    points[0].value = performPoint.value;
  },
  performEventMoveForDrawing: ({ points, performPoint }: OverlayPerformEventParams) => {
    if (!points[0]) return;
    points[0].value = performPoint.value;
  },
};
