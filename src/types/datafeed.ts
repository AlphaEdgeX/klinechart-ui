import type { KLineData } from 'klinecharts';
import type { Period } from './period';
import type { SymbolInfo } from './symbol';

export interface Datafeed {
  searchSymbols?(query: string): Promise<SymbolInfo[]>;
  getHistoryKLineData(
    symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number
  ): Promise<KLineData[]>;
  subscribe(
    symbol: SymbolInfo,
    period: Period,
    callback: DatafeedSubscribeCallback
  ): void;
  unsubscribe(symbol: SymbolInfo, period: Period): void;
}

export type DatafeedSubscribeCallback = (data: KLineData) => void;
