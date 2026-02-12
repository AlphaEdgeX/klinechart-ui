import type { OverlayTemplate } from 'klinecharts';
import { formatPrice } from '../../utils/formatters';

/**
 * Price + Time Measurement — 2 clicks showing price range, percentage, and bar count.
 */
export const priceTimeMeasurement: OverlayTemplate = {
  name: 'priceTimeMeasurement',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, precision }) => {
    if (coordinates.length < 2) return [];

    const points = overlay.points;
    const price1 = points[0]?.value ?? 0;
    const price2 = points[1]?.value ?? 0;
    const priceDiff = price2 - price1;
    const pctChange = price1 !== 0 ? ((priceDiff / price1) * 100).toFixed(2) : '0';
    const idx1 = points[0]?.dataIndex ?? 0;
    const idx2 = points[1]?.dataIndex ?? 0;
    const barCount = Math.abs(idx2 - idx1);

    const midX = (coordinates[0].x + coordinates[1].x) / 2;
    const midY = (coordinates[0].y + coordinates[1].y) / 2;

    return [
      // Diagonal line
      {
        type: 'line',
        attrs: { coordinates },
      },
      // Box connecting start/end
      {
        type: 'polygon',
        ignoreEvent: true,
        attrs: {
          coordinates: [
            coordinates[0],
            { x: coordinates[1].x, y: coordinates[0].y },
            coordinates[1],
            { x: coordinates[0].x, y: coordinates[1].y },
          ],
        },
        styles: {
          style: 'stroke',
          borderStyle: 'dashed',
        },
      },
      // Label
      {
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: midX,
          y: midY - 10,
          text: `${priceDiff >= 0 ? '+' : ''}${formatPrice(priceDiff, precision.price)} (${pctChange}%) | ${barCount} bars`,
          baseline: 'bottom',
          align: 'center',
        },
        styles: {
          backgroundColor: priceDiff >= 0 ? '#26A69A' : '#EF5350',
          color: '#ffffff',
          size: 11,
          paddingTop: 3, paddingBottom: 3, paddingLeft: 6, paddingRight: 6,
          borderRadius: 2,
        },
      },
    ];
  },
};
