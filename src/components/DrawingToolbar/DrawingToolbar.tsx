import React, { useState, useCallback, useRef } from 'react';
import type { OverlayMode } from 'klinecharts';
import { useKlineChartContext } from '../KlineChart/KlineChartContext';
import { ToolCategoryComponent } from './ToolCategory';
import { defaultCategories } from './defaultCategories';
import type { ToolCategory, ToolDefinition } from './defaultCategories';
import { EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, TrashIcon } from './icons';

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
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const activeToolRef = useRef<string | null>(null);
  const activeOverlayIdRef = useRef<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [overlaysLocked, setOverlaysLocked] = useState(false);

  const handleToolSelect = useCallback(
    (tool: ToolDefinition) => {
      if (!chart) return;

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
        onDrawEnd: () => {
          activeToolRef.current = null;
          activeOverlayIdRef.current = null;
          setActiveTool(null);
          return true;
        },
      });
      activeOverlayIdRef.current = typeof id === 'string' ? id : null;
    },
    [chart, magnetMode]
  );

  const handleDeleteAll = useCallback(() => {
    if (!chart) return;
    chart.removeOverlay();
    activeToolRef.current = null;
    activeOverlayIdRef.current = null;
    setActiveTool(null);
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
