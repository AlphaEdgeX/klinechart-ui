import { utils, type OverlayFigure, type OverlayTemplate } from 'klinecharts';
import { formatPrice } from '../../utils/formatters';

const { calcTextWidth, isNumber } = utils;

type PointLike = {
  value?: number;
  dataIndex?: number;
};

type MeasureTextResolver = (points: Array<Partial<PointLike>>) => string[];

function getDefaultTexts(points: Array<Partial<PointLike>>, pricePrecision: number): string[] {
  if (
    !isNumber(points[0]?.value) ||
    !isNumber(points[1]?.value) ||
    !isNumber(points[0]?.dataIndex) ||
    !isNumber(points[1]?.dataIndex)
  ) {
    return [];
  }

  const price1 = points[0].value as number;
  const price2 = points[1].value as number;
  const priceDiff = price2 - price1;
  const pct = price1 !== 0 ? ((priceDiff / price1) * 100).toFixed(2) : '0.00';
  const bars = Math.abs((points[1].dataIndex as number) - (points[0].dataIndex as number));

  return [
    `${priceDiff >= 0 ? '+' : ''}${formatPrice(priceDiff, pricePrecision)} (${pct}%)`,
    `${bars} bars`,
  ];
}

function getTipTexts(overlay: any, pricePrecision: number): string[] {
  if (typeof overlay.extendData === 'function') {
    const resolver = overlay.extendData as MeasureTextResolver;
    const resolved = resolver(overlay.points as Array<Partial<PointLike>>);
    if (Array.isArray(resolved)) {
      return resolved.filter((text) => typeof text === 'string');
    }
  }
  return getDefaultTexts(overlay.points as Array<Partial<PointLike>>, pricePrecision);
}

export const measure: OverlayTemplate = {
  name: 'measure',
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
  styles: {
    backgroundColor: 'rgba(22, 119, 255, 0.25)',
    tipBackgroundColor: '#1677FF',
    lineColor: '#1677FF',
  },
  createPointFigures: ({ coordinates, overlay, bounding, precision }) => {
    if (coordinates.length < 2) {
      return [];
    }

    const styleBag = (overlay.styles ?? {}) as Record<string, unknown>;
    const backgroundColor = (styleBag.backgroundColor as string) ?? 'rgba(22, 119, 255, 0.25)';
    const tipBackgroundColor = (styleBag.tipBackgroundColor as string) ?? '#1677FF';
    const lineColor = (styleBag.lineColor as string) ?? '#1677FF';

    const leftToRight = coordinates[0].x < coordinates[1].x;
    const topToBottom = coordinates[0].y < coordinates[1].y;
    const center = {
      x: Math.round((coordinates[0].x + coordinates[1].x) / 2),
      y: Math.round((coordinates[0].y + coordinates[1].y) / 2),
    };

    const figures: OverlayFigure[] = [
      {
        type: 'polygon',
        attrs: {
          coordinates: [
            coordinates[0],
            { x: coordinates[1].x, y: coordinates[0].y },
            coordinates[1],
            { x: coordinates[0].x, y: coordinates[1].y },
          ],
        },
        styles: {
          color: backgroundColor,
        },
      },
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: coordinates[0].x, y: center.y },
            { x: coordinates[1].x, y: center.y },
          ],
        },
        styles: {
          color: lineColor,
        },
      },
      {
        type: 'line',
        attrs: {
          coordinates: [
            { x: center.x, y: coordinates[0].y },
            { x: center.x, y: coordinates[1].y },
          ],
        },
        styles: {
          color: lineColor,
        },
      },
    ];

    figures.push({
      type: 'line',
      attrs: {
        coordinates: leftToRight
          ? [
              { x: coordinates[1].x - 6, y: center.y - 4 },
              { x: coordinates[1].x, y: center.y },
              { x: coordinates[1].x - 6, y: center.y + 4 },
            ]
          : [
              { x: coordinates[1].x + 6, y: center.y - 4 },
              { x: coordinates[1].x, y: center.y },
              { x: coordinates[1].x + 6, y: center.y + 4 },
            ],
      },
      styles: { color: lineColor },
    });

    figures.push({
      type: 'line',
      attrs: {
        coordinates: topToBottom
          ? [
              { x: center.x - 4, y: coordinates[1].y - 6 },
              { x: center.x, y: coordinates[1].y },
              { x: center.x + 4, y: coordinates[1].y - 6 },
            ]
          : [
              { x: center.x - 4, y: coordinates[1].y + 6 },
              { x: center.x, y: coordinates[1].y },
              { x: center.x + 4, y: coordinates[1].y + 6 },
            ],
      },
      styles: { color: lineColor },
    });

    const texts = getTipTexts(overlay, precision.price);
    if (texts.length === 0) {
      return figures;
    }

    const tipGap = 8;
    const textGap = 4;
    const horizontalPadding = 12;
    const verticalPadding = 8;
    const lineHeight = 12;

    let width = 0;
    for (const text of texts) {
      width = Math.max(width, calcTextWidth(text, lineHeight));
    }
    width += horizontalPadding * 2;

    const height = texts.length * lineHeight + (texts.length - 1) * textGap + verticalPadding * 2;

    let y = topToBottom ? coordinates[1].y + tipGap : coordinates[1].y - tipGap - height;
    y = Math.max(0, Math.min(y, bounding.height - height));

    figures.push({
      type: 'rect',
      attrs: {
        x: center.x - width / 2,
        y,
        width,
        height,
      },
      styles: {
        borderRadius: 4,
        color: tipBackgroundColor,
      },
    });

    let textY = y + verticalPadding;
    for (const text of texts) {
      figures.push({
        type: 'text',
        attrs: {
          x: center.x,
          y: textY,
          text,
          align: 'center',
        },
        styles: {
          color: '#ffffff',
          size: lineHeight,
          paddingLeft: 0,
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 0,
          backgroundColor: 'none',
        },
      });
      textY += lineHeight + textGap;
    }

    return figures;
  },
};
