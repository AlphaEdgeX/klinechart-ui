import React, { useState, useMemo, useCallback } from 'react';
import { KlineChart } from '../src/components/KlineChart';
import { DrawingToolbar } from '../src/components/DrawingToolbar';
import { PeriodBar } from '../src/components/PeriodBar';
import { IndicatorPanel } from '../src/components/IndicatorPanel';
import type { Period } from '../src/types/period';
import type { SymbolInfo } from '../src/types/symbol';
import { DEFAULT_PERIODS } from '../src/types/period';
import { BinanceDatafeed } from './BinanceDatafeed';
import '../src/styles/index.css';

const SYMBOLS: SymbolInfo[] = [
  { ticker: 'BTCUSDT', name: 'Bitcoin / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 5 },
  { ticker: 'ETHUSDT', name: 'Ethereum / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 4 },
  { ticker: 'SOLUSDT', name: 'Solana / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 1 },
  { ticker: 'BNBUSDT', name: 'BNB / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 3 },
  { ticker: 'XRPUSDT', name: 'XRP / USDT', exchange: 'Binance', pricePrecision: 4, volumePrecision: 1 },
  { ticker: 'DOGEUSDT', name: 'DOGE / USDT', exchange: 'Binance', pricePrecision: 5, volumePrecision: 0 },
];

export const App: React.FC = () => {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIODS[4]); // 1H
  const [symbol, setSymbol] = useState<SymbolInfo>(SYMBOLS[0]);
  const [indicatorPanelOpen, setIndicatorPanelOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const datafeed = useMemo(() => new BinanceDatafeed(), []);

  const isDark = theme === 'dark';

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.klc-root canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${symbol.ticker}_${period.text}_chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [symbol.ticker, period.text]);

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    background: isDark ? '#1e1e22' : '#f5f5f5',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    color: isDark ? '#d1d4dc' : '#333',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 13,
    flexShrink: 0,
    height: 36,
  };

  const btnStyle: React.CSSProperties = {
    padding: '3px 10px',
    background: 'transparent',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: 4,
    color: isDark ? '#d1d4dc' : '#333',
    cursor: 'pointer',
    fontSize: 12,
    lineHeight: '20px',
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Unified top bar: symbol | periods | spacer | actions */}
      <div style={topBarStyle}>
        {/* Symbol selector */}
        <select
          value={symbol.ticker}
          onChange={(e) => {
            const s = SYMBOLS.find((sym) => sym.ticker === e.target.value);
            if (s) setSymbol(s);
          }}
          style={{
            padding: '3px 8px',
            background: isDark ? '#2a2a2e' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: 4,
            color: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {SYMBOLS.map((s) => (
            <option key={s.ticker} value={s.ticker}>
              {s.ticker}
            </option>
          ))}
        </select>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', flexShrink: 0 }} />

        {/* Inline period buttons */}
        <PeriodBar activePeriod={period} onPeriodChange={setPeriod} />

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <button
          onClick={() => setIndicatorPanelOpen(!indicatorPanelOpen)}
          style={{
            ...btnStyle,
            background: indicatorPanelOpen ? '#2196F3' : 'transparent',
            borderColor: indicatorPanelOpen ? '#2196F3' : btnStyle.borderColor,
            color: indicatorPanelOpen ? '#fff' : btnStyle.color,
            fontStyle: 'italic',
            fontWeight: 600,
          }}
        >
          fx
        </button>
        <button onClick={handleScreenshot} style={btnStyle} title="Screenshot">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
            <rect x="2" y="5" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          style={btnStyle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '\u2600' : '\u263E'}
        </button>
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <KlineChart
          datafeed={datafeed}
          symbol={symbol}
          period={period}
          theme={theme}
          pricePrecision={symbol.pricePrecision}
          volumePrecision={symbol.volumePrecision}
        >
          <DrawingToolbar position="left" />
          <IndicatorPanel
            open={indicatorPanelOpen}
            onClose={() => setIndicatorPanelOpen(false)}
          />
        </KlineChart>
      </div>
    </div>
  );
};
