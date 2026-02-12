import type { OverlayTemplate } from 'klinecharts';
import { formatPrice } from '../../utils/formatters';

/**
 * Short Entry — single horizontal line marking a sell entry level.
 */
export const shortEntry: OverlayTemplate = {
  name: 'shortEntry',
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, precision, bounding }) => {
    if (coordinates.length < 1) return [];
    const y = coordinates[0].y;
    const price = overlay.points[0]?.value ?? 0;
    return [
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: 0, y },
            { x: bounding.width, y },
          ],
        },
        styles: { color: '#EF5350', size: 1, style: 'dashed' },
      },
      {
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: bounding.width - 4,
          y: y - 2,
          text: `Short ${formatPrice(price, precision.price)}`,
          baseline: 'bottom',
          align: 'right',
        },
        styles: {
          backgroundColor: '#EF5350',
          color: '#ffffff',
          size: 11,
          paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4,
          borderRadius: 2,
        },
      },
    ];
  },
};
