import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { init, dispose } from 'klinecharts';
import type { Chart, DeepPartial, Styles } from 'klinecharts';
import { KlineChartContext } from './KlineChartContext';
import { DatafeedBridge } from '../../datafeed/DatafeedBridge';
import { registerAllOverlays } from '../../overlays';
import type { KlineChartProps } from './KlineChart.types';

/** Simple deep merge for style objects. */
function deepMerge<T extends Record<string, any>>(target: T, ...sources: Array<Partial<T> | undefined>): T {
  const result = { ...target } as any;
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      const srcVal = (source as any)[key];
      const tgtVal = result[key];
      if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) && tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)) {
        result[key] = deepMerge(tgtVal, srcVal);
      } else {
        result[key] = srcVal;
      }
    }
  }
  return result;
}

// Register custom overlays once at module level
let overlaysRegistered = false;
function ensureOverlaysRegistered(): void {
  if (!overlaysRegistered) {
    registerAllOverlays();
    overlaysRegistered = true;
  }
}

const DARK_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { color: 'rgba(255,255,255,0.06)' },
    vertical: { color: 'rgba(255,255,255,0.06)' },
  },
  candle: {
    bar: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      noChangeColor: '#888888',
      upBorderColor: '#26A69A',
      downBorderColor: '#EF5350',
      noChangeBorderColor: '#888888',
      upWickColor: '#26A69A',
      downWickColor: '#EF5350',
      noChangeWickColor: '#888888',
    },
    tooltip: {
      text: { color: '#D1D4DC' },
    },
    priceMark: {
      last: {
        upColor: '#26A69A',
        downColor: '#EF5350',
        noChangeColor: '#888888',
      },
    },
  },
  indicator: {
    lastValueMark: {
      text: {
        color: '#ffffff',
      },
    },
    tooltip: {
      text: { color: '#D1D4DC' },
    },
  },
  xAxis: {
    tickText: { color: '#D1D4DC' },
  },
  yAxis: {
    tickText: { color: '#D1D4DC' },
  },
  crosshair: {
    horizontal: {
      line: { color: '#888888' },
      text: { color: '#D1D4DC', borderColor: '#555555', backgroundColor: '#373a40' },
    },
    vertical: {
      line: { color: '#888888' },
      text: { color: '#D1D4DC', borderColor: '#555555', backgroundColor: '#373a40' },
    },
  },
  overlay: {
    text: { color: '#D1D4DC' },
  },
  separator: {
    color: 'rgba(255,255,255,0.1)',
  },
};

const LIGHT_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { color: 'rgba(0,0,0,0.06)' },
    vertical: { color: 'rgba(0,0,0,0.06)' },
  },
  candle: {
    bar: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      noChangeColor: '#888888',
      upBorderColor: '#26A69A',
      downBorderColor: '#EF5350',
      noChangeBorderColor: '#888888',
      upWickColor: '#26A69A',
      downWickColor: '#EF5350',
      noChangeWickColor: '#888888',
    },
  },
};

let idCounter = 0;

export const KlineChart: React.FC<KlineChartProps> = ({
  data,
  datafeed,
  symbol,
  period,
  theme = 'dark',
  locale,
  timezone,
  styles: userStyles,
  options,
  pricePrecision,
  volumePrecision,
  className,
  style,
  children,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartState, setChartState] = useState<Chart | null>(null);
  const bridgeRef = useRef<DatafeedBridge | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [ready, setReady] = useState(false);
  const [containerId] = useState(() => `klc-chart-${++idCounter}`);

  // Memoize the background color based on theme
  const backgroundColor = theme === 'dark' ? '#1b1b1f' : '#ffffff';

  // Initialize / dispose chart (StrictMode-safe)
  useEffect(() => {
    ensureOverlaysRegistered();

    const container = containerRef.current;
    if (!container) return;

    const themeStyles = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
    const mergedStyles: DeepPartial<Styles> = deepMerge(themeStyles, userStyles);

    const chart = init(container, {
      ...options,
      locale: locale ?? 'en-US',
      timezone,
      styles: mergedStyles,
    });

    if (!chart) return;

    chartRef.current = chart;
    setChartState(chart);

    if (pricePrecision !== undefined || volumePrecision !== undefined) {
      chart.setPriceVolumePrecision(pricePrecision ?? 2, volumePrecision ?? 0);
    }

    // Create VOL indicator in a sub-pane
    chart.createIndicator('VOL', false, { id: 'klc_vol_pane', height: 80 });

    setReady(true);
    onReadyRef.current?.();

    return () => {
      setReady(false);
      setChartState(null);
      bridgeRef.current?.dispose();
      bridgeRef.current = null;
      chartRef.current = null;
      dispose(container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Handle theme/styles changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const themeStyles = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
    chart.setStyles(deepMerge(themeStyles, userStyles));
  }, [theme, userStyles]);

  // Handle locale changes
  useEffect(() => {
    if (locale && chartRef.current) {
      chartRef.current.setLocale(locale);
    }
  }, [locale]);

  // Handle timezone changes
  useEffect(() => {
    if (timezone && chartRef.current) {
      chartRef.current.setTimezone(timezone);
    }
  }, [timezone]);

  // Handle static data
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data || datafeed) return;
    chart.applyNewData(data, false);
  }, [data, datafeed]);

  // Handle datafeed mode
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !datafeed || !symbol || !period) return;

    // Dispose previous bridge
    bridgeRef.current?.dispose();

    const bridge = new DatafeedBridge(chart, datafeed, symbol, period);
    bridgeRef.current = bridge;
    bridge.connect();

    return () => {
      bridge.dispose();
      if (bridgeRef.current === bridge) {
        bridgeRef.current = null;
      }
    };
  }, [datafeed, symbol, period]);

  // Window resize handler (matching klinechart-pro pattern — no ResizeObserver)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ready]);

  // Handle precision changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (pricePrecision !== undefined || volumePrecision !== undefined) {
      chart.setPriceVolumePrecision(pricePrecision ?? 2, volumePrecision ?? 0);
    }
  }, [pricePrecision, volumePrecision]);

  const contextValue = useMemo(
    () => ({ chart: chartState, ready, containerId }),
    [chartState, ready, containerId]
  );

  return (
    <KlineChartContext.Provider value={contextValue}>
      <div
        className={`klc-root ${className ?? ''}`}
        data-klc-theme={theme}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          backgroundColor,
          ...style,
        }}
      >
        {ready && children}
        <div
          ref={containerRef}
          id={containerId}
          style={{ flex: 1, minWidth: 0, height: '100%' }}
        />
      </div>
    </KlineChartContext.Provider>
  );
};
