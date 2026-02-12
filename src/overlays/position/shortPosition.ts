import type { OverlayTemplate, OverlayFigure } from 'klinecharts';
import { calcRR } from '../../utils/calculations';
import { formatPrice } from '../../utils/formatters';

/**
 * Short Position overlay — 3 clicks: entry, take profit (below), stop loss (above).
 * Mirror of longPosition with inverted TP/SL directions.
 */
export const shortPosition: OverlayTemplate = {
  name: 'shortPosition',
  totalStep: 4,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  createPointFigures: ({ coordinates, overlay, precision }) => {
    const result: OverlayFigure[] = [];
    const points = overlay.points;
    if (coordinates.length < 2) return [];

    const entryY = coordinates[0].y;
    const tpY = coordinates[1].y;
    const leftX = Math.min(coordinates[0].x, coordinates[1].x);
    const rightX = Math.max(coordinates[0].x, coordinates[1].x);
    const width = rightX - leftX || 200;

    // TP zone (green) — entry to TP (TP is below for short)
    result.push({
      type: 'polygon',
      attrs: {
        coordinates: [
          { x: leftX, y: entryY },
          { x: leftX + width, y: entryY },
          { x: leftX + width, y: tpY },
          { x: leftX, y: tpY },
        ],
      },
      styles: {
        style: 'stroke_fill',
        color: 'rgba(38, 166, 154, 0.2)',
        borderColor: '#26A69A',
        borderSize: 1,
      },
    });

    // Entry line
    result.push({
      type: 'line',
      attrs: {
        coordinates: [
          { x: leftX, y: entryY },
          { x: leftX + width, y: entryY },
        ],
      },
      styles: { color: '#FF9800', size: 2 },
    });

    // TP line
    result.push({
      type: 'line',
      ignoreEvent: true,
      attrs: {
        coordinates: [
          { x: leftX, y: tpY },
          { x: leftX + width, y: tpY },
        ],
      },
      styles: { color: '#26A69A', size: 1, style: 'dashed' },
    });

    if (coordinates.length > 2) {
      const slY = coordinates[2].y;

      // SL zone (red) — entry to SL (SL is above for short)
      result.push({
        type: 'polygon',
        attrs: {
          coordinates: [
            { x: leftX, y: entryY },
            { x: leftX + width, y: entryY },
            { x: leftX + width, y: slY },
            { x: leftX, y: slY },
          ],
        },
        styles: {
          style: 'stroke_fill',
          color: 'rgba(239, 83, 80, 0.2)',
          borderColor: '#EF5350',
          borderSize: 1,
        },
      });

      // SL line
      result.push({
        type: 'line',
        ignoreEvent: true,
        attrs: {
          coordinates: [
            { x: leftX, y: slY },
            { x: leftX + width, y: slY },
          ],
        },
        styles: { color: '#EF5350', size: 1, style: 'dashed' },
      });

      const entryPrice = points[0]?.value ?? 0;
      const tpPrice = points[1]?.value ?? 0;
      const slPrice = points[2]?.value ?? 0;
      const rr = calcRR(entryPrice, tpPrice, slPrice);
      const tpPct = entryPrice ? (((entryPrice - tpPrice) / entryPrice) * 100).toFixed(2) : '0';
      const slPct = entryPrice ? (((slPrice - entryPrice) / entryPrice) * 100).toFixed(2) : '0';

      result.push({
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: leftX + 4,
          y: tpY - 2,
          text: `TP: ${formatPrice(tpPrice, precision.price)} (${tpPct}%)`,
          baseline: 'bottom',
        },
        styles: {
          backgroundColor: '#26A69A',
          color: '#ffffff',
          size: 11,
          paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4,
          borderRadius: 2,
        },
      });

      result.push({
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: leftX + 4,
          y: entryY + 2,
          text: `Entry: ${formatPrice(entryPrice, precision.price)} | RR: ${rr.toFixed(2)}`,
          baseline: 'top',
        },
        styles: {
          backgroundColor: '#FF9800',
          color: '#ffffff',
          size: 11,
          paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4,
          borderRadius: 2,
        },
      });

      result.push({
        type: 'rectText',
        ignoreEvent: true,
        attrs: {
          x: leftX + 4,
          y: slY + 2,
          text: `SL: ${formatPrice(slPrice, precision.price)} (${slPct}%)`,
          baseline: 'top',
        },
        styles: {
          backgroundColor: '#EF5350',
          color: '#ffffff',
          size: 11,
          paddingTop: 2, paddingBottom: 2, paddingLeft: 4, paddingRight: 4,
          borderRadius: 2,
        },
      });
    }

    return result;
  },
};
