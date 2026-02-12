import type { KLineData } from 'klinecharts';
import type { Datafeed, DatafeedSubscribeCallback } from '../src/types/datafeed';
import type { Period } from '../src/types/period';
import type { SymbolInfo } from '../src/types/symbol';

const BASE_URL = 'https://api.binance.com';
const WS_URL = 'wss://stream.binance.com:9443/ws';

/** Map our Period type to Binance interval string. */
function toBinanceInterval(period: Period): string {
  const { multiplier, timespan } = period;
  const map: Record<string, string> = {
    minute: 'm',
    hour: 'h',
    day: 'd',
    week: 'w',
    month: 'M',
  };
  return `${multiplier}${map[timespan] ?? 'm'}`;
}

/** Parse Binance kline array to KLineData. */
function parseKline(k: any[]): KLineData {
  return {
    timestamp: k[0] as number,
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    turnover: parseFloat(k[7]), // quote asset volume
  };
}

/** Parse Binance WebSocket kline event to KLineData. */
function parseWsKline(k: any): KLineData {
  return {
    timestamp: k.t as number,
    open: parseFloat(k.o),
    high: parseFloat(k.h),
    low: parseFloat(k.l),
    close: parseFloat(k.c),
    volume: parseFloat(k.v),
    turnover: parseFloat(k.q),
  };
}

interface WsSubscription {
  ws: WebSocket;
  callback: DatafeedSubscribeCallback;
  reconnectTimer?: number;
  throttleTimer?: number;
  pendingData?: KLineData;
}

export class BinanceDatafeed implements Datafeed {
  private subscriptions = new Map<string, WsSubscription>();

  async searchSymbols(query: string): Promise<SymbolInfo[]> {
    try {
      const resp = await fetch(`${BASE_URL}/api/v3/exchangeInfo`);
      const data = await resp.json();
      const q = query.toUpperCase();
      return (data.symbols as any[])
        .filter(
          (s: any) =>
            s.status === 'TRADING' &&
            s.quoteAsset === 'USDT' &&
            s.symbol.includes(q)
        )
        .slice(0, 20)
        .map((s: any) => ({
          ticker: s.symbol,
          name: `${s.baseAsset} / ${s.quoteAsset}`,
          exchange: 'Binance',
          pricePrecision: s.quotePrecision,
          volumePrecision: s.baseAssetPrecision,
        }));
    } catch {
      return [];
    }
  }

  async getHistoryKLineData(
    symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number
  ): Promise<KLineData[]> {
    const interval = toBinanceInterval(period);
    const ticker = symbol.ticker.toUpperCase();
    const limit = 1000; // Binance max

    const url = new URL(`${BASE_URL}/api/v3/klines`);
    url.searchParams.set('symbol', ticker);
    url.searchParams.set('interval', interval);
    url.searchParams.set('startTime', String(from));
    url.searchParams.set('endTime', String(to));
    url.searchParams.set('limit', String(limit));

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      console.error('[BinanceDatafeed] HTTP error:', resp.status, await resp.text());
      return [];
    }

    const klines = await resp.json();
    return (klines as any[][]).map(parseKline);
  }

  subscribe(
    symbol: SymbolInfo,
    period: Period,
    callback: DatafeedSubscribeCallback
  ): void {
    const key = `${symbol.ticker}_${period.text}`;

    // Clean up existing subscription
    this.cleanupSubscription(key);

    const interval = toBinanceInterval(period);
    const ticker = symbol.ticker.toLowerCase();
    const streamName = `${ticker}@kline_${interval}`;

    // Throttle interval: buffer WS updates and flush at most once per 500ms
    const THROTTLE_MS = 500;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/${streamName}`);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.e === 'kline' && msg.k) {
            const klineData = parseWsKline(msg.k);
            const sub = this.subscriptions.get(key);
            if (!sub) return;

            // Buffer the latest data and flush on a throttle timer
            sub.pendingData = klineData;
            if (!sub.throttleTimer) {
              sub.throttleTimer = window.setTimeout(() => {
                const current = this.subscriptions.get(key);
                if (current?.pendingData) {
                  callback(current.pendingData);
                  current.pendingData = undefined;
                }
                if (current) {
                  current.throttleTimer = undefined;
                }
              }, THROTTLE_MS);
            }
          }
        } catch (err) {
          console.error('[BinanceDatafeed] WS parse error:', err);
        }
      };

      ws.onclose = () => {
        const sub = this.subscriptions.get(key);
        if (sub && sub.ws === ws) {
          // Reconnect after 3 seconds
          sub.reconnectTimer = window.setTimeout(() => {
            const current = this.subscriptions.get(key);
            if (current) {
              console.log('[BinanceDatafeed] Reconnecting WebSocket...');
              connect();
            }
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('[BinanceDatafeed] WS error:', err);
        ws.close();
      };

      this.subscriptions.set(key, { ws, callback });
    };

    connect();
  }

  unsubscribe(symbol: SymbolInfo, period: Period): void {
    const key = `${symbol.ticker}_${period.text}`;
    this.cleanupSubscription(key);
  }

  private cleanupSubscription(key: string): void {
    const sub = this.subscriptions.get(key);
    if (sub) {
      if (sub.reconnectTimer) {
        clearTimeout(sub.reconnectTimer);
      }
      if (sub.throttleTimer) {
        clearTimeout(sub.throttleTimer);
      }
      sub.ws.onmessage = null;
      sub.ws.onclose = null;
      sub.ws.onerror = null;
      sub.ws.close();
      this.subscriptions.delete(key);
    }
  }
}
