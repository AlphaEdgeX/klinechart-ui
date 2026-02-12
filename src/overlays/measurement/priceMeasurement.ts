import type { OverlayTemplate } from 'klinecharts';
import { formatPrice } from '../../utils/formatters';

/**
 * Price Measurement — 2 clicks showing price range and percentage change.
 */
export const priceMeasurement: OverlayTemplate = {
  name: 'priceMeasurement',
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
    const midY = (coordinates[0].y + coordinates[1].y) / 2;
    const x = Math.max(coordinates[0].x, coordinates[1].x) + 10;

    return [
      // Vertical connecting line
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: coordinates[0].y },
            { x: coordinates[0].x, y: coordinates[1].y },
          ],
        },
        styles: { style: 'dashed' },
      },
      // Horizontal ticks
      {
        type: 'line',
        ignoreEvent: true,
        attrs: [
          {
            coordinates: [
              { x: coordinates[0].x - 10, y: coordinates[0].y },
              { x: coordinates[0].x + 10, y: coordinates[0].y },
            ],
          },
          {
            coordinates: [
              { x: coordinates[0].x - 10, y: coordinates[1].y },
              { x: coordinates[0].x + 10, y: coordinates[1].y },
            ],
          },
        ],
      },
      // Label
      {
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: coordinates[0].x + 14,
          y: midY,
          text: `${priceDiff >= 0 ? '+' : ''}${formatPrice(priceDiff, precision.price)} (${pctChange}%)`,
          baseline: 'middle',
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
