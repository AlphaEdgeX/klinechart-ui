import React, { useState, useCallback } from 'react';
import type { PaneOptions } from 'klinecharts';
import { useKlineChartContext } from '../KlineChart/KlineChartContext';

export interface IndicatorDefinition {
  name: string;
  label: string;
  paneId?: string;
  isStack?: boolean;
  paneOptions?: PaneOptions;
}

const DEFAULT_INDICATORS: IndicatorDefinition[] = [
  { name: 'MA', label: 'MA', paneId: 'candle_pane', isStack: true },
  { name: 'EMA', label: 'EMA', paneId: 'candle_pane', isStack: true },
  { name: 'SMA', label: 'SMA', paneId: 'candle_pane', isStack: true },
  { name: 'BOLL', label: 'BOLL', paneId: 'candle_pane', isStack: true },
  { name: 'SAR', label: 'SAR', paneId: 'candle_pane', isStack: true },
  { name: 'VOL', label: 'Volume' },
  { name: 'MACD', label: 'MACD' },
  { name: 'KDJ', label: 'KDJ' },
  { name: 'RSI', label: 'RSI' },
  { name: 'CCI', label: 'CCI' },
  { name: 'DMI', label: 'DMI' },
  { name: 'OBV', label: 'OBV' },
  { name: 'WR', label: 'Williams %R' },
  { name: 'CR', label: 'CR' },
  { name: 'PSY', label: 'PSY' },
  { name: 'DMA', label: 'DMA' },
  { name: 'TRIX', label: 'TRIX' },
  { name: 'BBI', label: 'BBI', paneId: 'candle_pane', isStack: true },
  { name: 'AO', label: 'AO' },
  { name: 'ROC', label: 'ROC' },
  { name: 'PVT', label: 'PVT' },
  { name: 'AVP', label: 'AVP', paneId: 'candle_pane', isStack: true },
  { name: 'BIAS', label: 'BIAS' },
  { name: 'BRAR', label: 'BRAR' },
  { name: 'VR', label: 'VR' },
  { name: 'MTM', label: 'MTM' },
  { name: 'EMV', label: 'EMV' },
];

export interface IndicatorPanelProps {
  indicators?: IndicatorDefinition[];
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export const IndicatorPanel: React.FC<IndicatorPanelProps> = ({
  indicators = DEFAULT_INDICATORS,
  open = false,
  onClose,
  className,
}) => {
  const { chart } = useKlineChartContext();
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(
    new Set(['VOL'])
  );

  const toggleIndicator = useCallback(
    (ind: IndicatorDefinition) => {
      if (!chart) return;

      setActiveIndicators((prev) => {
        const newActive = new Set(prev);

        if (newActive.has(ind.name)) {
          // Remove
          newActive.delete(ind.name);
          if (ind.paneId) {
            chart.removeIndicator(ind.paneId, ind.name);
          } else {
            chart.removeIndicator(`klc_${ind.name.toLowerCase()}_pane`, ind.name);
          }
        } else {
          // Add
          newActive.add(ind.name);
          if (ind.paneId) {
            chart.createIndicator(ind.name, ind.isStack ?? false, {
              id: ind.paneId,
            });
          } else {
            chart.createIndicator(ind.name, ind.isStack ?? false, {
              id: `klc_${ind.name.toLowerCase()}_pane`,
              height: 80,
              ...ind.paneOptions,
            });
          }
        }
        return newActive;
      });
    },
    [chart]
  );

  if (!open) return null;

  return (
    <div className={`klc-indicator-panel ${className ?? ''}`}>
      <div className="klc-indicator-panel-header">
        <span className="klc-indicator-panel-title">Indicators</span>
        <button className="klc-indicator-panel-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="klc-indicator-panel-list">
        {indicators.map((ind) => {
          const isActive = activeIndicators.has(ind.name);
          return (
            <button
              key={ind.name}
              className={`klc-indicator-item ${isActive ? 'klc-indicator-item--active' : ''}`}
              onClick={() => toggleIndicator(ind)}
            >
              {ind.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
