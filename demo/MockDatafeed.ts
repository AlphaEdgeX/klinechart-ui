import type { KLineData } from 'klinecharts';
import type { Datafeed, DatafeedSubscribeCallback } from '../src/types/datafeed';
import type { Period } from '../src/types/period';
import type { SymbolInfo } from '../src/types/symbol';

/**
 * Generate realistic BTCUSDT-like OHLCV data for demo purposes.
 * Uses a seeded-style approach so the same time range produces the same data.
 */
function generateKLineData(count: number, endTimestamp: number, periodMs: number): KLineData[] {
  const data: KLineData[] = [];
  if (count <= 0) return data;

  // Seed the starting price from the timestamp so it's reproducible
  let basePrice = 42000 + ((endTimestamp % 10000) / 10000) * 5000;
  const startTs = endTimestamp - count * periodMs;

  for (let i = 0; i < count; i++) {
    const timestamp = startTs + i * periodMs;
    const volatility = 0.002 + Math.random() * 0.008;
    const trend = Math.sin(i / 50) * 0.001;
    const change = (Math.random() - 0.5 + trend) * volatility;

    const open = basePrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = 100 + Math.random() * 1000;

    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2)),
    });

    basePrice = close;
  }

  return data;
}

function getPeriodMs(period: Period): number {
  const ms: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
  };
  return period.multiplier * (ms[period.timespan] ?? 60_000);
}

export class MockDatafeed implements Datafeed {
  private subscriptions = new Map<string, number>();
  private lastPrice = 0;

  async searchSymbols(query: string): Promise<SymbolInfo[]> {
    const symbols: SymbolInfo[] = [
      { ticker: 'BTCUSDT', name: 'Bitcoin / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 4 },
      { ticker: 'ETHUSDT', name: 'Ethereum / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 4 },
      { ticker: 'SOLUSDT', name: 'Solana / USDT', exchange: 'Binance', pricePrecision: 2, volumePrecision: 2 },
    ];
    return symbols.filter(
      (s) =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getHistoryKLineData(
    _symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number
  ): Promise<KLineData[]> {
    const periodMs = getPeriodMs(period);
    const count = Math.min(Math.floor((to - from) / periodMs), 500);
    // Simulate a small API delay
    await new Promise((r) => setTimeout(r, 100));
    const data = generateKLineData(count, to, periodMs);
    // Remember the last close price for real-time updates
    if (data.length > 0) {
      this.lastPrice = data[data.length - 1].close;
    }
    return data;
  }

  subscribe(
    symbol: SymbolInfo,
    period: Period,
    callback: DatafeedSubscribeCallback
  ): void {
    const key = `${symbol.ticker}_${period.text}`;
    const periodMs = getPeriodMs(period);

    // Track the current bar's OHLC
    let currentBarTs = Math.floor(Date.now() / periodMs) * periodMs;
    let barOpen = this.lastPrice || 44000;
    let barHigh = barOpen;
    let barLow = barOpen;
    let barClose = barOpen;
    let barVolume = 0;

    // Simulate real-time tick updates every 1.5 seconds
    const interval = window.setInterval(() => {
      const now = Date.now();
      const newBarTs = Math.floor(now / periodMs) * periodMs;

      // New bar started
      if (newBarTs > currentBarTs) {
        currentBarTs = newBarTs;
        barOpen = barClose;
        barHigh = barOpen;
        barLow = barOpen;
        barVolume = 0;
      }

      // Simulate a small price movement from the last close
      const change = (Math.random() - 0.5) * 0.001;
      barClose = barClose * (1 + change);
      barHigh = Math.max(barHigh, barClose);
      barLow = Math.min(barLow, barClose);
      barVolume += Math.random() * 10;

      callback({
        timestamp: currentBarTs,
        open: parseFloat(barOpen.toFixed(2)),
        high: parseFloat(barHigh.toFixed(2)),
        low: parseFloat(barLow.toFixed(2)),
        close: parseFloat(barClose.toFixed(2)),
        volume: parseFloat(barVolume.toFixed(2)),
      });
    }, 1500);

    this.subscriptions.set(key, interval);
  }

  unsubscribe(symbol: SymbolInfo, period: Period): void {
    const key = `${symbol.ticker}_${period.text}`;
    const interval = this.subscriptions.get(key);
    if (interval !== undefined) {
      clearInterval(interval);
      this.subscriptions.delete(key);
    }
  }
}
