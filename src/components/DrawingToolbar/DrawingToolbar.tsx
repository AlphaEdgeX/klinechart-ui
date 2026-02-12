import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DomPosition } from 'klinecharts';
import type { OverlayCreate, OverlayMode } from 'klinecharts';
import { useKlineChartContext } from '../KlineChart/KlineChartContext';
import { ToolCategoryComponent } from './ToolCategory';
import { defaultCategories } from './defaultCategories';
import type { ToolCategory, ToolDefinition } from './defaultCategories';
import { EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, TrashIcon } from './icons';
import { useCrosshair } from '../../hooks/useCrosshair';

const DEBUG_POSITION_TOOL = false;

export interface DrawingToolbarProps {
  position?: 'left' | 'right';
  categories?: ToolCategory[];
  magnetMode?: OverlayMode;
  onMagnetModeChange?: (mode: OverlayMode) => void;
  className?: string;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  position = 'left',
  categories = defaultCategories,
  magnetMode,
  onMagnetModeChange,
  className,
}) => {
  const { chart } = useKlineChartContext();
  const crosshair = useCrosshair();
  const selectedOverlayIdsRef = useRef<Set<string>>(new Set());
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const activeToolRef = useRef<string | null>(null);
  const activeOverlayIdRef = useRef<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [overlaysLocked, setOverlaysLocked] = useState(false);
  const [pendingPositionTool, setPendingPositionTool] = useState<string | null>(null);
  const crosshairRef = useRef(crosshair);

  useEffect(() => {
    crosshairRef.current = crosshair;
  }, [crosshair]);

  useEffect(() => {
    selectedOverlayIdsRef.current.clear();
  }, [chart]);

  const logPositionDebug = useCallback((message: string, payload?: unknown) => {
    if (!DEBUG_POSITION_TOOL) return;
    if (payload !== undefined) {
      console.log(`[DrawingToolbar][Position] ${message}`, payload);
    } else {
      console.log(`[DrawingToolbar][Position] ${message}`);
    }
  }, []);

  const handleOverlaySelected = useCallback((event: any) => {
    const overlay = event?.overlay;
    const id = overlay?.id;
    if (typeof id === 'string') {
      selectedOverlayIdsRef.current.add(id);
    }
    if (overlay && typeof overlay === 'object') {
      const extendData = (overlay.extendData ?? {}) as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(extendData, 'selected')) {
        extendData.selected = true;
        overlay.extendData = extendData;
      }
    }
    return true;
  }, []);

  const handleOverlayDeselected = useCallback((event: any) => {
    const overlay = event?.overlay;
    const id = overlay?.id;
    if (typeof id === 'string') {
      selectedOverlayIdsRef.current.delete(id);
    }
    if (overlay && typeof overlay === 'object') {
      const extendData = (overlay.extendData ?? {}) as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(extendData, 'selected')) {
        extendData.selected = false;
        overlay.extendData = extendData;
      }
    }
    return true;
  }, []);

  const handleOverlayRemoved = useCallback((event: any) => {
    const id = event?.overlay?.id;
    if (typeof id === 'string') {
      selectedOverlayIdsRef.current.delete(id);
    }
    return true;
  }, []);

  const createPresetPositionOverlay = useCallback((
    overlayName: string,
    seedPoint?: Partial<{ dataIndex: number; value: number }>,
    paneId?: string,
    seedPixel?: Partial<{ x: number; y: number }>
  ): boolean => {
    const latestCrosshair = crosshairRef.current;
    logPositionDebug('createPresetPositionOverlay:start', {
      overlayName,
      hasChart: !!chart,
      crosshair: latestCrosshair,
      seedPoint,
      paneId,
      seedPixel,
    });
    if (!chart) {
      console.warn('[DrawingToolbar][Position] createPresetPositionOverlay:abort no chart');
      return false;
    }

    const dataList = chart.getDataList();
    logPositionDebug('createPresetPositionOverlay:dataList', { length: dataList.length });
    if (!dataList.length) {
      console.warn('[DrawingToolbar][Position] createPresetPositionOverlay:abort no data');
      return false;
    }

    const maxIndex = dataList.length - 1;
    let centerIndex = typeof seedPoint?.dataIndex === 'number'
      ? Math.round(seedPoint.dataIndex)
      : typeof latestCrosshair?.dataIndex === 'number'
        ? Math.round(latestCrosshair.dataIndex)
        : maxIndex;
    centerIndex = Math.max(0, Math.min(maxIndex, centerIndex));

    const halfWidth = 10;
    let leftIndex = Math.max(0, centerIndex - halfWidth);
    let rightIndex = Math.min(maxIndex, centerIndex + halfWidth);
    if (leftIndex === rightIndex && rightIndex < maxIndex) rightIndex += 1;
    if (leftIndex === rightIndex && leftIndex > 0) leftIndex -= 1;

    const rightCandle = dataList[rightIndex];
    const leftCandle = dataList[leftIndex];
    if (!rightCandle || !leftCandle) {
      console.warn('[DrawingToolbar][Position] createPresetPositionOverlay:abort candle missing', {
        leftIndex,
        rightIndex,
      });
      return false;
    }

    let entryValue = typeof seedPoint?.value === 'number' ? seedPoint.value : rightCandle.close;

    if (typeof latestCrosshair?.x === 'number' && typeof latestCrosshair?.y === 'number') {
      const finder = latestCrosshair.paneId ? { paneId: latestCrosshair.paneId } : {};
      const converted = chart.convertFromPixel([{ x: latestCrosshair.x, y: latestCrosshair.y }], finder);
      const point = Array.isArray(converted) ? converted[0] : converted;
      logPositionDebug('createPresetPositionOverlay:convertFromPixel', { finder, converted, point });
      if (point && typeof point.value === 'number') {
        entryValue = point.value;
      }
    } else if (latestCrosshair?.kLineData?.close !== undefined) {
      entryValue = latestCrosshair.kLineData.close;
    }

    const pricePrecision = chart.getPriceVolumePrecision().price;
    const tickSize = Math.pow(10, -Math.max(0, pricePrecision));
    const valueDelta = Math.max(Math.abs(entryValue) * 0.01, tickSize * 20, 1e-8);

    const targetPaneId = paneId || 'candle_pane';

    const pointsByIndexAndTimestamp: OverlayCreate['points'] = [
      {
        timestamp: leftCandle.timestamp,
        dataIndex: leftIndex,
        value: entryValue + valueDelta,
      },
      {
        timestamp: rightCandle.timestamp,
        dataIndex: rightIndex,
        value: entryValue,
      },
      {
        timestamp: leftCandle.timestamp,
        dataIndex: leftIndex,
        value: entryValue - valueDelta,
      },
    ];

    const pointsByTimestampOnly: OverlayCreate['points'] = [
      {
        timestamp: leftCandle.timestamp,
        value: entryValue + valueDelta,
      },
      {
        timestamp: rightCandle.timestamp,
        value: entryValue,
      },
      {
        timestamp: leftCandle.timestamp,
        value: entryValue - valueDelta,
      },
    ];

    const centerCandle = dataList[centerIndex];
    const nextTimestamp = dataList[Math.min(maxIndex, centerIndex + 1)]?.timestamp ?? centerCandle?.timestamp ?? 0;
    const prevTimestamp = dataList[Math.max(0, centerIndex - 1)]?.timestamp ?? centerCandle?.timestamp ?? 0;
    const inferredStepMs = Math.max(60_000, Math.abs(nextTimestamp - prevTimestamp) || 60_000);
    const centerTimestamp = centerCandle?.timestamp ?? rightCandle.timestamp;
    const syntheticLeftTs = centerTimestamp - inferredStepMs * 10;
    const syntheticRightTs = centerTimestamp + inferredStepMs * 10;

    const pointsBySyntheticTimestamp: OverlayCreate['points'] = [
      {
        timestamp: syntheticLeftTs,
        value: entryValue + valueDelta,
      },
      {
        timestamp: syntheticRightTs,
        value: entryValue,
      },
      {
        timestamp: syntheticLeftTs,
        value: entryValue - valueDelta,
      },
    ];

    let pointsByPixelAnchors: OverlayCreate['points'] = [];
    if (typeof seedPixel?.x === 'number' && typeof seedPixel?.y === 'number') {
      const leftX = Math.max(0, seedPixel.x - 120);
      const rightX = seedPixel.x + 120;
      const anchorFinder = { paneId: targetPaneId };
      const converted = chart.convertFromPixel(
        [
          { x: leftX, y: seedPixel.y },
          { x: rightX, y: seedPixel.y },
        ],
        anchorFinder
      );
      const anchorPoints = Array.isArray(converted) ? converted : [converted];
      const leftPoint = anchorPoints[0];
      const rightPoint = anchorPoints[1];
      if (leftPoint && rightPoint) {
        pointsByPixelAnchors = [
          {
            timestamp: typeof leftPoint.timestamp === 'number' ? leftPoint.timestamp : undefined,
            dataIndex: typeof leftPoint.dataIndex === 'number' ? leftPoint.dataIndex : undefined,
            value: entryValue + valueDelta,
          },
          {
            timestamp: typeof rightPoint.timestamp === 'number' ? rightPoint.timestamp : undefined,
            dataIndex: typeof rightPoint.dataIndex === 'number' ? rightPoint.dataIndex : undefined,
            value: entryValue,
          },
          {
            timestamp: typeof leftPoint.timestamp === 'number' ? leftPoint.timestamp : undefined,
            dataIndex: typeof leftPoint.dataIndex === 'number' ? leftPoint.dataIndex : undefined,
            value: entryValue - valueDelta,
          },
        ];
      }
      logPositionDebug('createPresetPositionOverlay:pixelAnchors', {
        leftX,
        rightX,
        anchorFinder,
        converted,
        pointsByPixelAnchors,
      });
    }

    const calcWidth = (candidate: OverlayCreate['points']): number => {
      const pixels = chart.convertToPixel(candidate ?? [], { paneId: targetPaneId });
      const px = Array.isArray(pixels) ? pixels : [pixels];
      if (px.length < 2 || typeof px[0]?.x !== 'number' || typeof px[1]?.x !== 'number') {
        return 0;
      }
      return Math.abs(px[1].x - px[0].x);
    };

    const candidateWidths = [
      { key: 'index+timestamp', points: pointsByIndexAndTimestamp, width: calcWidth(pointsByIndexAndTimestamp) },
      { key: 'timestamp-only', points: pointsByTimestampOnly, width: calcWidth(pointsByTimestampOnly) },
      { key: 'synthetic-timestamp', points: pointsBySyntheticTimestamp, width: calcWidth(pointsBySyntheticTimestamp) },
      { key: 'pixel-anchors', points: pointsByPixelAnchors, width: calcWidth(pointsByPixelAnchors) },
    ];

    candidateWidths.sort((a, b) => b.width - a.width);
    const bestCandidate = candidateWidths[0];
    const points = bestCandidate.points;

    logPositionDebug('createPresetPositionOverlay:computed', {
      leftIndex,
      rightIndex,
      leftTimestamp: leftCandle.timestamp,
      rightTimestamp: rightCandle.timestamp,
      entryValue,
      pricePrecision,
      tickSize,
      valueDelta,
      inferredStepMs,
      candidateWidths: candidateWidths.map((c) => ({ key: c.key, width: c.width })),
      selectedCandidate: bestCandidate.key,
      points,
    });

    const createdId = chart.createOverlay({
      name: overlayName,
      mode: magnetMode,
      zLevel: 20,
      points,
      onSelected: handleOverlaySelected,
      onDeselected: handleOverlayDeselected,
      onRemoved: handleOverlayRemoved,
    }, targetPaneId);
    logPositionDebug('createPresetPositionOverlay:createOverlay result', { createdId, targetPaneId });

    const visibleRange = chart.getVisibleRange();
    logPositionDebug('createPresetPositionOverlay:visibleRange', visibleRange);
    if (centerIndex < visibleRange.from || centerIndex > visibleRange.to) {
      chart.scrollToDataIndex(centerIndex);
      logPositionDebug('createPresetPositionOverlay:scrolledToDataIndex', { centerIndex });
    }

    if (typeof createdId === 'string') {
      const createdOverlay = chart.getOverlayById(createdId);
      const pixels = chart.convertToPixel(points ?? [], { paneId: targetPaneId });
      const px = Array.isArray(pixels) ? pixels : [pixels];
      const pxSummary = px.map((p) => ({
        x: typeof p?.x === 'number' ? Number(p.x.toFixed(2)) : null,
        y: typeof p?.y === 'number' ? Number(p.y.toFixed(2)) : null,
      }));
      const width =
        pxSummary.length >= 2 &&
        pxSummary[0].x !== null &&
        pxSummary[1].x !== null
          ? Math.abs((pxSummary[1].x as number) - (pxSummary[0].x as number))
          : null;
      const upperHeight =
        pxSummary.length >= 2 &&
        pxSummary[0].y !== null &&
        pxSummary[1].y !== null
          ? Math.abs((pxSummary[1].y as number) - (pxSummary[0].y as number))
          : null;
      const lowerHeight =
        pxSummary.length >= 3 &&
        pxSummary[1].y !== null &&
        pxSummary[2].y !== null
          ? Math.abs((pxSummary[2].y as number) - (pxSummary[1].y as number))
          : null;

      logPositionDebug('createPresetPositionOverlay:createdOverlay', createdOverlay);
      logPositionDebug('createPresetPositionOverlay:pointsPixels', {
        pxSummary,
        width,
        upperHeight,
        lowerHeight,
        selectedCandidate: bestCandidate.key,
      });
      if (width !== null && width < 3) {
        console.warn('[DrawingToolbar][Position] pointsPixels width is near zero', { width, pxSummary });
      }
    }

    if (typeof createdId === 'string') {
      return true;
    }

    console.warn('[DrawingToolbar][Position] createPresetPositionOverlay:fallback to normal drawing mode');
    const fallbackId = chart.createOverlay({
      name: overlayName,
      mode: magnetMode,
      zLevel: 20,
      onSelected: handleOverlaySelected,
      onDeselected: handleOverlayDeselected,
      onRemoved: handleOverlayRemoved,
    });
    logPositionDebug('createPresetPositionOverlay:fallback result', { fallbackId });
    return typeof fallbackId === 'string';
  }, [
    chart,
    handleOverlayDeselected,
    handleOverlayRemoved,
    handleOverlaySelected,
    logPositionDebug,
    magnetMode,
  ]);

  useEffect(() => {
    if (!chart || !pendingPositionTool) return;
    const main = chart.getDom(undefined, DomPosition.Main);
    if (!main) return;

    logPositionDebug('pendingPositionTool:armed', { pendingPositionTool });

    const handleMainMouseDown = (event: MouseEvent) => {
      const rect = main.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const latestCrosshair = crosshairRef.current;
      const paneId = latestCrosshair?.paneId;
      const finder =
        paneId && paneId.toLowerCase().includes('candle')
          ? { paneId }
          : {};
      const converted = chart.convertFromPixel([{ x, y }], finder);
      const point = Array.isArray(converted) ? converted[0] : converted;

      logPositionDebug('pendingPositionTool:click', {
        pendingPositionTool,
        x,
        y,
        paneId,
        finder,
        converted,
        point,
      });

      const created = createPresetPositionOverlay(
        pendingPositionTool,
        point && typeof point === 'object'
          ? {
              dataIndex: typeof point.dataIndex === 'number' ? point.dataIndex : undefined,
              value: typeof point.value === 'number' ? point.value : undefined,
            }
          : undefined,
        paneId && paneId.toLowerCase().includes('candle') ? paneId : 'candle_pane',
        { x, y }
      );

      if (created) {
        logPositionDebug('pendingPositionTool:placed');
        setPendingPositionTool(null);
        activeToolRef.current = null;
        activeOverlayIdRef.current = null;
        setActiveTool(null);
      }
    };

    main.addEventListener('mousedown', handleMainMouseDown);
    return () => {
      main.removeEventListener('mousedown', handleMainMouseDown);
    };
  }, [chart, createPresetPositionOverlay, logPositionDebug, pendingPositionTool]);

  const handleToolSelect = useCallback(
    (tool: ToolDefinition) => {
      logPositionDebug('handleToolSelect', {
        toolName: tool.name,
        overlayName: tool.overlayName,
        hasChart: !!chart,
      });
      if (!chart) return;

      const isPositionTool =
        tool.name === 'longPosition' || tool.name === 'shortPosition';
      logPositionDebug('handleToolSelect:isPositionTool', { isPositionTool });
      if (isPositionTool) {
        setPendingPositionTool(tool.overlayName);
        setActiveTool(tool.name);
        logPositionDebug('handleToolSelect:position pending placement');
        return;
      }

      if (activeToolRef.current === tool.name) {
        if (activeOverlayIdRef.current) {
          chart.removeOverlay({ id: activeOverlayIdRef.current });
        }
        activeToolRef.current = null;
        activeOverlayIdRef.current = null;
        setActiveTool(null);
        return;
      }

      activeToolRef.current = tool.name;
      setActiveTool(tool.name);
      const id = chart.createOverlay({
        name: tool.overlayName,
        mode: magnetMode,
        onSelected: handleOverlaySelected,
        onDeselected: handleOverlayDeselected,
        onRemoved: handleOverlayRemoved,
        onDrawEnd: () => {
          activeToolRef.current = null;
          activeOverlayIdRef.current = null;
          setActiveTool(null);
          return true;
        },
      });
      logPositionDebug('handleToolSelect:default createOverlay result', { id, toolName: tool.name });
      activeOverlayIdRef.current = typeof id === 'string' ? id : null;
    },
    [
      chart,
      createPresetPositionOverlay,
      handleOverlayDeselected,
      handleOverlayRemoved,
      handleOverlaySelected,
      logPositionDebug,
      magnetMode,
    ]
  );

  const handleDeleteAll = useCallback(() => {
    if (!chart) return;
    chart.removeOverlay();
    selectedOverlayIdsRef.current.clear();
    activeToolRef.current = null;
    activeOverlayIdRef.current = null;
    setActiveTool(null);
  }, [chart]);

  useEffect(() => {
    if (!chart) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace') return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      const selectedIds = Array.from(selectedOverlayIdsRef.current);
      if (selectedIds.length === 0) return;

      event.preventDefault();
      for (const id of selectedIds) {
        chart.removeOverlay({ id });
        selectedOverlayIdsRef.current.delete(id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chart]);

  const handleToggleVisibility = useCallback(() => {
    if (!chart) return;
    const next = !overlaysVisible;
    setOverlaysVisible(next);
    chart.overrideOverlay({ visible: next });
  }, [chart, overlaysVisible]);

  const handleToggleLock = useCallback(() => {
    if (!chart) return;
    const next = !overlaysLocked;
    setOverlaysLocked(next);
    chart.overrideOverlay({ lock: next });
  }, [chart, overlaysLocked]);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  return (
    <div
      className={`klc-drawing-toolbar klc-drawing-toolbar--${position} ${className ?? ''}`}
    >
      <div className="klc-toolbar-categories">
        {categories.map((category) => (
          <ToolCategoryComponent
            key={category.id}
            category={category}
            activeTool={activeTool}
            isOpen={openCategory === category.id}
            onToggle={handleCategoryToggle}
            onToolSelect={handleToolSelect}
          />
        ))}
      </div>

      <div className="klc-toolbar-actions">
        <button
          className={`klc-toolbar-icon klc-toolbar-action ${!overlaysVisible ? 'klc-toolbar-icon--active' : ''}`}
          title={overlaysVisible ? 'Hide all drawings' : 'Show all drawings'}
          onClick={handleToggleVisibility}
        >
          {overlaysVisible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
        <button
          className={`klc-toolbar-icon klc-toolbar-action ${overlaysLocked ? 'klc-toolbar-icon--active' : ''}`}
          title={overlaysLocked ? 'Unlock all drawings' : 'Lock all drawings'}
          onClick={handleToggleLock}
        >
          {overlaysLocked ? <LockIcon size={18} /> : <UnlockIcon size={18} />}
        </button>
        <button
          className="klc-toolbar-icon klc-toolbar-action klc-toolbar-action--danger"
          title="Delete all drawings"
          onClick={handleDeleteAll}
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  );
};
