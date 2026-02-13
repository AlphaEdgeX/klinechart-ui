import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import {
  DomPosition,
  type Overlay,
  type OverlayCreate,
  type OverlayEvent,
  type OverlayMode,
} from 'klinecharts';
import { useKlineChartContext } from '../KlineChart/KlineChartContext';
import { defaultCategories } from './defaultCategories';
import type { ToolCategory, ToolDefinition } from './defaultCategories';
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  toolIcons,
  TrashIcon,
  UnlockIcon,
} from './icons';
import { useCrosshair } from '../../hooks/useCrosshair';

export type DrawingManagedOverlayEventType =
  | 'created'
  | 'updated'
  | 'removed'
  | 'selected'
  | 'deselected';

export interface DrawingManagedOverlayEvent {
  type: DrawingManagedOverlayEventType;
  overlayId: string;
  overlayName: string;
  overlay: Overlay | null;
}

export interface DrawingToolbarProps {
  position?: 'left' | 'right';
  categories?: ToolCategory[];
  magnetMode?: OverlayMode;
  onMagnetModeChange?: (mode: OverlayMode) => void;
  className?: string;
  onOverlayEvent?: (event: DrawingManagedOverlayEvent) => void;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isOneClickPresetTool(overlayName: string): boolean {
  return (
    overlayName === 'longPosition' ||
    overlayName === 'shortPosition' ||
    overlayName === 'horizontalRay'
  );
}

export const DrawingToolbar: FC<DrawingToolbarProps> = ({
  position = 'left',
  categories = defaultCategories,
  magnetMode,
  onMagnetModeChange: _onMagnetModeChange,
  className,
  onOverlayEvent,
}) => {
  const { chart } = useKlineChartContext();
  const crosshair = useCrosshair();
  const crosshairRef = useRef(crosshair);

  const selectedOverlayIdsRef = useRef<Set<string>>(new Set());
  const activeOverlayIdRef = useRef<string | null>(null);
  const activeToolRef = useRef<string | null>(null);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [overlaysLocked, setOverlaysLocked] = useState(false);
  const [pendingPresetTool, setPendingPresetTool] = useState<string | null>(
    null,
  );

  const toolbarTools = useMemo(() => {
    const tools: ToolDefinition[] = [];
    const seen = new Set<string>();

    for (const category of categories) {
      for (const tool of category.tools) {
        if (seen.has(tool.name)) continue;
        seen.add(tool.name);
        tools.push(tool);
      }
    }

    return tools;
  }, [categories]);

  useEffect(() => {
    crosshairRef.current = crosshair;
  }, [crosshair]);

  useEffect(() => {
    selectedOverlayIdsRef.current.clear();
  }, [chart]);

  const emitOverlayEvent = useCallback(
    (type: DrawingManagedOverlayEventType, overlay: Overlay | null) => {
      if (!overlay || !onOverlayEvent || !isString(overlay.id)) return;
      onOverlayEvent({
        type,
        overlayId: overlay.id,
        overlayName: overlay.name,
        overlay,
      });
    },
    [onOverlayEvent],
  );

  const handleOverlaySelected = useCallback(
    (event: OverlayEvent) => {
      const overlay = event.overlay;
      if (isString(overlay?.id)) {
        selectedOverlayIdsRef.current.add(overlay.id);
      }
      if (overlay && typeof overlay === 'object') {
        const extendData = (overlay.extendData ?? {}) as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(extendData, 'selected')) {
          extendData.selected = true;
          overlay.extendData = extendData;
        }
      }
      emitOverlayEvent('selected', overlay ?? null);
      return true;
    },
    [emitOverlayEvent],
  );

  const handleOverlayDeselected = useCallback(
    (event: OverlayEvent) => {
      const overlay = event.overlay;
      if (isString(overlay?.id)) {
        selectedOverlayIdsRef.current.delete(overlay.id);
      }
      if (overlay && typeof overlay === 'object') {
        const extendData = (overlay.extendData ?? {}) as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(extendData, 'selected')) {
          extendData.selected = false;
          overlay.extendData = extendData;
        }
      }
      emitOverlayEvent('deselected', overlay ?? null);
      return true;
    },
    [emitOverlayEvent],
  );

  const handleOverlayRemoved = useCallback(
    (event: OverlayEvent) => {
      const overlay = event.overlay;
      if (isString(overlay?.id)) {
        selectedOverlayIdsRef.current.delete(overlay.id);
      }
      emitOverlayEvent('removed', overlay ?? null);
      return true;
    },
    [emitOverlayEvent],
  );

  const handleOverlayMoving = useCallback((event: OverlayEvent) => {
    if (!event.overlay || !isString(event.overlay.id)) return false;
    return false;
  }, []);

  const handleOverlayDrawing = useCallback(
    (event: OverlayEvent) => {
      const overlay = event.overlay;
      if (!overlay || !isString(overlay.id)) return true;
      emitOverlayEvent('updated', overlay);
      return true;
    },
    [emitOverlayEvent],
  );

  const handleOverlayMoveEnd = useCallback(
    (event: OverlayEvent) => {
      const overlay = event.overlay;
      if (!overlay || !isString(overlay.id)) return true;
      const latest = chart?.getOverlayById(overlay.id) ?? overlay;
      emitOverlayEvent('updated', latest);
      return true;
    },
    [chart, emitOverlayEvent],
  );

  const clearActiveToolState = useCallback(() => {
    activeToolRef.current = null;
    activeOverlayIdRef.current = null;
    setPendingPresetTool(null);
    setActiveTool(null);
  }, []);

  const createPresetPositionOverlay = useCallback(
    (
      overlayName: string,
      seedPoint?: Partial<{ dataIndex: number; value: number }>,
      paneId?: string,
    ): boolean => {
      if (!chart) return false;

      const dataList = chart.getDataList();
      if (!dataList.length) return false;

      const maxIndex = dataList.length - 1;
      let centerIndex =
        typeof seedPoint?.dataIndex === 'number'
          ? Math.round(seedPoint.dataIndex)
          : typeof crosshairRef.current?.dataIndex === 'number'
            ? Math.round(crosshairRef.current.dataIndex)
            : maxIndex;
      centerIndex = Math.max(0, Math.min(maxIndex, centerIndex));

      const leftIndex = Math.max(0, centerIndex - 10);
      const rightIndex = Math.min(maxIndex, centerIndex + 10);
      const leftCandle = dataList[leftIndex];
      const rightCandle = dataList[rightIndex];
      if (!leftCandle || !rightCandle) return false;

      const entryValue =
        typeof seedPoint?.value === 'number' ? seedPoint.value : rightCandle.close;

      const pricePrecision = chart.getPriceVolumePrecision().price;
      const tickSize = Math.pow(10, -Math.max(0, pricePrecision));
      const valueDelta = Math.max(Math.abs(entryValue) * 0.01, tickSize * 20);

      const points: OverlayCreate['points'] = [
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

      const createdId = chart.createOverlay(
        {
          name: overlayName,
          mode: magnetMode,
          zLevel: 20,
          points,
          onSelected: handleOverlaySelected,
          onDeselected: handleOverlayDeselected,
          onRemoved: handleOverlayRemoved,
          onPressedMoving: handleOverlayMoving,
          onPressedMoveEnd: handleOverlayMoveEnd,
        },
        paneId || 'candle_pane',
      );

      if (!isString(createdId)) {
        return false;
      }

      const overlay = chart.getOverlayById(createdId);
      emitOverlayEvent('created', overlay);
      return true;
    },
    [
      chart,
      emitOverlayEvent,
      handleOverlayDeselected,
      handleOverlayRemoved,
      handleOverlaySelected,
      handleOverlayMoveEnd,
      handleOverlayMoving,
      magnetMode,
    ],
  );

  const createPresetHorizontalRayOverlay = useCallback(
    (
      seedPoint?: Partial<{ dataIndex: number; value: number }>,
      paneId?: string,
    ): boolean => {
      if (!chart) return false;

      const dataList = chart.getDataList();
      if (!dataList.length) return false;

      const maxIndex = dataList.length - 1;
      let startIndex =
        typeof seedPoint?.dataIndex === 'number'
          ? Math.round(seedPoint.dataIndex)
          : typeof crosshairRef.current?.dataIndex === 'number'
            ? Math.round(crosshairRef.current.dataIndex)
            : maxIndex;
      startIndex = Math.max(0, Math.min(maxIndex, startIndex));

      const startCandle = dataList[startIndex];
      if (!startCandle) return false;

      const entryValue =
        typeof seedPoint?.value === 'number' ? seedPoint.value : startCandle.close;

      const points: OverlayCreate['points'] = [
        {
          timestamp: startCandle.timestamp,
          dataIndex: startIndex,
          value: entryValue,
        },
      ];

      const createdId = chart.createOverlay(
        {
          name: 'horizontalRay',
          mode: magnetMode,
          zLevel: 20,
          points,
          onSelected: handleOverlaySelected,
          onDeselected: handleOverlayDeselected,
          onRemoved: handleOverlayRemoved,
          onPressedMoving: handleOverlayMoving,
          onPressedMoveEnd: handleOverlayMoveEnd,
        },
        paneId || 'candle_pane',
      );

      if (!isString(createdId)) {
        return false;
      }

      const overlay = chart.getOverlayById(createdId);
      emitOverlayEvent('created', overlay);
      return true;
    },
    [
      chart,
      emitOverlayEvent,
      handleOverlayDeselected,
      handleOverlayRemoved,
      handleOverlaySelected,
      handleOverlayMoveEnd,
      handleOverlayMoving,
      magnetMode,
    ],
  );

  useEffect(() => {
    if (!chart || !pendingPresetTool) return;

    const main = chart.getDom(undefined, DomPosition.Main);
    if (!main) return;

    const handleMainMouseDown = (event: MouseEvent) => {
      const overlayName = pendingPresetTool;
      if (!overlayName) return;

      setPendingPresetTool(null);
      clearActiveToolState();

      const rect = main.getBoundingClientRect();
      const point = chart.convertFromPixel(
        [
          {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
        ],
        { paneId: 'candle_pane' },
      );
      const first = Array.isArray(point) ? point[0] : point;

      const seedPoint =
        first && typeof first === 'object'
          ? {
              dataIndex:
                typeof first.dataIndex === 'number' ? first.dataIndex : undefined,
              value: typeof first.value === 'number' ? first.value : undefined,
            }
          : undefined;

      if (overlayName === 'horizontalRay') {
        createPresetHorizontalRayOverlay(seedPoint, 'candle_pane');
      } else {
        createPresetPositionOverlay(overlayName, seedPoint, 'candle_pane');
      }
    };

    main.addEventListener('mousedown', handleMainMouseDown);
    return () => {
      main.removeEventListener('mousedown', handleMainMouseDown);
    };
  }, [
    chart,
    clearActiveToolState,
    createPresetHorizontalRayOverlay,
    createPresetPositionOverlay,
    pendingPresetTool,
  ]);

  const handleToolSelect = useCallback(
    (tool: ToolDefinition) => {
      if (!chart) return;

      if (isOneClickPresetTool(tool.overlayName)) {
        setPendingPresetTool(tool.overlayName);
        setActiveTool(tool.name);
        return;
      }

      setPendingPresetTool(null);

      if (activeToolRef.current === tool.name) {
        if (activeOverlayIdRef.current) {
          chart.removeOverlay({ id: activeOverlayIdRef.current });
        }
        clearActiveToolState();
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
        onDrawing: handleOverlayDrawing,
        onPressedMoving: handleOverlayMoving,
        onPressedMoveEnd: handleOverlayMoveEnd,
        onDrawEnd: (event) => {
          emitOverlayEvent('created', event.overlay ?? null);
          clearActiveToolState();
          return true;
        },
      });

      activeOverlayIdRef.current = isString(id) ? id : null;
    },
    [
      chart,
      clearActiveToolState,
      emitOverlayEvent,
      handleOverlayDeselected,
      handleOverlayRemoved,
      handleOverlaySelected,
      handleOverlayDrawing,
      handleOverlayMoveEnd,
      handleOverlayMoving,
      magnetMode,
    ],
  );

  const handleDeleteAll = useCallback(() => {
    if (!chart) return;
    chart.removeOverlay();
    selectedOverlayIdsRef.current.clear();
    clearActiveToolState();
  }, [chart, clearActiveToolState]);

  useEffect(() => {
    if (!chart) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName.toLowerCase();
      const isTyping =
        tagName === 'input' ||
        tagName === 'textarea' ||
        Boolean(target?.isContentEditable);
      if (isTyping) return;

      const selectedIds = Array.from(selectedOverlayIdsRef.current);
      if (selectedIds.length === 0) return;

      event.preventDefault();
      for (const id of selectedIds) {
        chart.removeOverlay({ id });
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

  return (
    <div
      className={`klc-drawing-toolbar klc-drawing-toolbar--${position} ${className ?? ''}`}
    >
      <div className="klc-toolbar-categories">
        {toolbarTools.map((tool) => {
          const Icon = toolIcons[tool.name];
          return (
            <button
              key={tool.name}
              type="button"
              className={`klc-toolbar-icon ${activeTool === tool.name ? 'klc-toolbar-icon--active' : ''}`}
              title={tool.label}
              onClick={() => handleToolSelect(tool)}
            >
              {Icon ? <Icon size={18} /> : <span>{tool.label[0]}</span>}
            </button>
          );
        })}
      </div>

      <div className="klc-toolbar-actions">
        <button
          type="button"
          className={`klc-toolbar-icon klc-toolbar-action ${overlaysVisible ? '' : 'klc-toolbar-icon--active'}`}
          title={overlaysVisible ? 'Hide all drawings' : 'Show all drawings'}
          onClick={handleToggleVisibility}
        >
          {overlaysVisible ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
        </button>
        <button
          type="button"
          className={`klc-toolbar-icon klc-toolbar-action ${overlaysLocked ? 'klc-toolbar-icon--active' : ''}`}
          title={overlaysLocked ? 'Unlock all drawings' : 'Lock all drawings'}
          onClick={handleToggleLock}
        >
          {overlaysLocked ? <LockIcon size={18} /> : <UnlockIcon size={18} />}
        </button>
        <button
          type="button"
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
