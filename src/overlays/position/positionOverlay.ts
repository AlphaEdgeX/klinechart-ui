import { utils, type OverlayFigure, type OverlayPerformEventParams, type OverlayTemplate, type YAxis } from 'klinecharts';
import { calcRR } from '../../utils/calculations';
import { formatPrice } from '../../utils/formatters';

const { isNumber } = utils;

type ConstraintType = 'top' | 'bottom' | 'vertical' | 'horizontal';

type PointLike = {
  value?: number;
  timestamp?: number;
  dataIndex?: number;
};

type PositionExtendData = {
  hovered: boolean;
  selected: boolean;
};

type PositionOverlayStyle = {
  target: Record<string, unknown>;
  loss: Record<string, unknown>;
  targetText: Record<string, unknown>;
  lossText: Record<string, unknown>;
  midLine: Record<string, unknown>;
};

function constrainPointPosition(
  perform: Partial<PointLike>,
  anchor: Partial<PointLike>,
  constraint: ConstraintType
): void {
  if (constraint === 'top') {
    if (!isNumber(perform.value) || !isNumber(anchor.value)) return;
    if (perform.value < anchor.value) {
      perform.value = anchor.value;
    }
    return;
  }

  if (constraint === 'bottom') {
    if (!isNumber(perform.value) || !isNumber(anchor.value)) return;
    if (perform.value > anchor.value) {
      perform.value = anchor.value;
    }
    return;
  }

  if (constraint === 'vertical') {
    perform.timestamp = anchor.timestamp;
    perform.dataIndex = anchor.dataIndex;
    return;
  }

  perform.value = anchor.value;
}

function createRect(start: { x: number; y: number }, end: { x: number; y: number }) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y),
  };
}

function getStyleBag(overlayStyles: unknown): Partial<PositionOverlayStyle> {
  if (!overlayStyles || typeof overlayStyles !== 'object') {
    return {};
  }
  return overlayStyles as Partial<PositionOverlayStyle>;
}

function buildInfoFigures(
  isLong: boolean,
  overlay: any,
  coordinates: Array<{ x: number; y: number }>,
  pricePrecision: number,
  yAxis?: YAxis | null
): OverlayFigure[] {
  if (coordinates.length < 3) {
    return [];
  }

  const extendData = (overlay.extendData ?? {}) as Partial<PositionExtendData>;
  if (!extendData.hovered && !extendData.selected) {
    return [];
  }

  const points = overlay.points;
  if (
    !isNumber(points?.[0]?.value) ||
    !isNumber(points?.[1]?.value) ||
    !isNumber(points?.[2]?.value)
  ) {
    return [];
  }

  const pointTopValue = points[0].value as number;
  const pointEntryValue = points[1].value as number;
  const pointBottomValue = points[2].value as number;
  const topValue = yAxis ? yAxis.convertFromPixel(coordinates[0].y) : pointTopValue;
  const entryValue = yAxis ? yAxis.convertFromPixel(coordinates[1].y) : pointEntryValue;
  const bottomValue = yAxis ? yAxis.convertFromPixel(coordinates[2].y) : pointBottomValue;

  const targetPrice = isLong ? topValue : bottomValue;
  const lossPrice = isLong ? bottomValue : topValue;
  const targetPct = entryValue !== 0 ? Math.abs(((targetPrice - entryValue) / entryValue) * 100) : 0;
  const lossPct = entryValue !== 0 ? Math.abs(((entryValue - lossPrice) / entryValue) * 100) : 0;
  const targetDelta = Math.abs(targetPrice - entryValue);
  const lossDelta = Math.abs(entryValue - lossPrice);
  const deltaPrecision = Math.min(8, Math.max(pricePrecision, 5));

  let rr = calcRR(entryValue, targetPrice, lossPrice);
  if (!Number.isFinite(rr) || rr <= 0) {
    const topDist = Math.abs(coordinates[0].y - coordinates[1].y);
    const bottomDist = Math.abs(coordinates[2].y - coordinates[1].y);
    const rewardDist = isLong ? topDist : bottomDist;
    const riskDist = isLong ? bottomDist : topDist;
    rr = riskDist > 0 ? rewardDist / riskDist : 0;
  }

  const xText = Math.round((coordinates[0].x + coordinates[1].x) / 2);
  const topLabelStyle = {
    style: 'stroke_fill',
    backgroundColor: '#2dc9e5',
    color: '#ffffff',
    borderRadius: 4,
    size: 11,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
  };
  const bottomLabelStyle = {
    style: 'stroke_fill',
    backgroundColor: '#f5a623',
    color: '#ffffff',
    borderRadius: 4,
    size: 11,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
  };
  const centerLabelStyle = {
    style: 'stroke_fill',
    backgroundColor: '#f5a623',
    color: '#ffffff',
    borderRadius: 8,
    size: 11,
    borderColor: '#ffffff',
    borderSize: 1,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
  };

  return [
    {
      type: 'text',
      ignoreEvent: true,
      attrs: {
        x: xText,
        y: coordinates[0].y,
        text: `+${formatPrice(targetDelta, deltaPrecision)} (${targetPct.toFixed(3)}%) ${formatPrice(targetPrice, pricePrecision)}`,
        baseline: 'bottom',
        align: 'center',
      },
      styles: topLabelStyle,
    },
    {
      type: 'text',
      ignoreEvent: true,
      attrs: {
        x: xText,
        y: coordinates[1].y,
        text: `RR 1:${rr.toFixed(2)}`,
        baseline: 'middle',
        align: 'center',
      },
      styles: centerLabelStyle,
    },
    {
      type: 'text',
      ignoreEvent: true,
      attrs: {
        x: xText,
        y: coordinates[2].y,
        text: `-${formatPrice(lossDelta, deltaPrecision)} (${lossPct.toFixed(3)}%) ${formatPrice(lossPrice, pricePrecision)}`,
        baseline: 'top',
        align: 'center',
      },
      styles: bottomLabelStyle,
    },
  ];
}

function handlePressedMove({ points, performPoint, performPointIndex }: OverlayPerformEventParams): void {
  if (performPointIndex === 0) {
    if (points[1]) {
      constrainPointPosition(performPoint, points[1], 'top');
    }
    if (points[2]) {
      constrainPointPosition(points[2], performPoint, 'vertical');
    }
    return;
  }

  if (performPointIndex === 1) {
    if (points[0]) {
      constrainPointPosition(performPoint, points[0], 'bottom');
    }
    if (points[2]) {
      constrainPointPosition(performPoint, points[2], 'top');
    }
    return;
  }

  if (performPointIndex === 2) {
    if (points[1]) {
      constrainPointPosition(performPoint, points[1], 'bottom');
    }
    if (points[0]) {
      constrainPointPosition(points[0], performPoint, 'vertical');
    }
  }
}

function handleMoveForDrawing({ points, performPoint, currentStep, performPointIndex }: OverlayPerformEventParams): void {
  if (currentStep === 2) {
    if (performPointIndex !== 1) {
      return;
    }
    if (points[0]) {
      constrainPointPosition(performPoint, points[0], 'bottom');
    }
    return;
  }

  if (currentStep !== 3) {
    return;
  }
  if (performPointIndex !== 2) {
    return;
  }

  if (points[1]) {
    constrainPointPosition(performPoint, points[1], 'bottom');
  }

  if (!points[0] || !points[1]) {
    return;
  }

  if (points[1].timestamp === performPoint.timestamp) {
    constrainPointPosition(performPoint, points[0], 'vertical');
  } else {
    constrainPointPosition(points[0], performPoint, 'vertical');
  }
}

export function createPositionOverlay(name: 'longPosition' | 'shortPosition', isLong: boolean): OverlayTemplate {
  return {
    name,
    totalStep: 4,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    styles: {
      target: { color: '#279d8233' },
      loss: { color: '#f2385a33' },
      midLine: { color: '#76808F80', size: 1 },
      targetText: {
        backgroundColor: '#279d82',
        color: '#ffffff',
        borderRadius: 2,
        size: 11,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4,
      },
      lossText: {
        backgroundColor: '#f2385a',
        color: '#ffffff',
        borderRadius: 2,
        size: 11,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4,
      },
    },
    extendData: { hovered: false, selected: false },
    createPointFigures: ({ coordinates, overlay, precision, yAxis }) => {
      if (coordinates.length < 2) {
        return [];
      }

      const styleBag = getStyleBag(overlay.styles);
      const leftX = Math.min(coordinates[0].x, coordinates[1].x);
      const rightX = Math.max(coordinates[0].x, coordinates[1].x);
      const topY = coordinates[0].y;
      const midY = coordinates[1].y;

      const figures: OverlayFigure[] = [
        {
          type: 'polygon',
          attrs: {
            coordinates: [
              { x: leftX, y: topY },
              { x: rightX, y: topY },
              { x: rightX, y: midY },
              { x: leftX, y: midY },
            ],
          },
          styles: {
            style: 'stroke_fill',
            color: isLong ? 'rgba(39, 157, 130, 0.2)' : 'rgba(242, 56, 90, 0.2)',
            borderColor: isLong ? '#279d82' : '#f2385a',
            borderSize: 1,
          },
        },
        {
          type: 'line',
          attrs: {
            coordinates: [{ x: leftX, y: midY }, { x: rightX, y: midY }],
          },
          styles: {
            color: '#7ea0bf',
            size: 1,
          },
        },
      ];

      if (coordinates.length > 2) {
        const bottomY = coordinates[2].y;
        figures.push({
          type: 'polygon',
          attrs: {
            coordinates: [
              { x: leftX, y: midY },
              { x: rightX, y: midY },
              { x: rightX, y: bottomY },
              { x: leftX, y: bottomY },
            ],
          },
          styles: {
            style: 'stroke_fill',
            color: isLong ? 'rgba(242, 56, 90, 0.2)' : 'rgba(39, 157, 130, 0.2)',
            borderColor: isLong ? '#f2385a' : '#279d82',
            borderSize: 1,
          },
        });
      }

      return [...figures, ...buildInfoFigures(isLong, overlay, coordinates, precision.price, yAxis)];
    },
    performEventPressedMove: handlePressedMove,
    performEventMoveForDrawing: handleMoveForDrawing,
    onMouseEnter: ({ overlay }) => {
      const extendData = (overlay.extendData ?? {}) as PositionExtendData;
      extendData.hovered = true;
      overlay.extendData = extendData;
      return true;
    },
    onMouseLeave: ({ overlay }) => {
      const extendData = (overlay.extendData ?? {}) as PositionExtendData;
      extendData.hovered = false;
      overlay.extendData = extendData;
      return true;
    },
    onSelected: ({ overlay }) => {
      const extendData = (overlay.extendData ?? {}) as PositionExtendData;
      extendData.selected = true;
      overlay.extendData = extendData;
      return true;
    },
    onDeselected: ({ overlay }) => {
      const extendData = (overlay.extendData ?? {}) as PositionExtendData;
      extendData.selected = false;
      overlay.extendData = extendData;
      return true;
    },
  };
}
