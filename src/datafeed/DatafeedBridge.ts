import type { Chart, KLineData } from 'klinecharts';
import type { Datafeed, DatafeedSubscribeCallback } from '../types/datafeed';
import type { Period } from '../types/period';
import type { SymbolInfo } from '../types/symbol';

/**
 * DatafeedBridge adapts our Datafeed interface to klinecharts' loadMore/applyNewData/updateData.
 * Uses loadMore() + applyMoreData() pattern (matching klinechart-pro reference).
 */
export class DatafeedBridge {
  private chart: Chart;
  private datafeed: Datafeed;
  private symbol: SymbolInfo;
  private period: Period;
  private disposed = false;
  private realtimeCallback: DatafeedSubscribeCallback | null = null;
  private loading = false;

  constructor(chart: Chart, datafeed: Datafeed, symbol: SymbolInfo, period: Period) {
    this.chart = chart;
    this.datafeed = datafeed;
    this.symbol = symbol;
    this.period = period;
  }

  /**
   * Connect the datafeed to the chart:
   * 1. Register loadMore callback (fires on scroll to left edge)
   * 2. Fetch initial history data and apply via applyNewData()
   * 3. Subscribe to real-time updates
   */
  connect(): void {
    const barsToLoad = 500;
    const periodMs = this.getPeriodMs();
    const to = this.alignTimestamp(Date.now(), periodMs);
    const from = to - barsToLoad * periodMs;

    // Register loadMore BEFORE loading data (matches reference repos)
    this.chart.loadMore((timestamp) => {
      if (this.disposed || this.loading) return;
      this.loading = true;

      const loadTo = timestamp ?? Date.now();
      const loadFrom = loadTo - barsToLoad * periodMs;

      this.datafeed
        .getHistoryKLineData(this.symbol, this.period, loadFrom, loadTo)
        .then((klineData: KLineData[]) => {
          if (this.disposed) return;
          this.chart.applyMoreData(klineData, klineData.length >= barsToLoad);
          this.loading = false;
        })
        .catch((err: unknown) => {
          console.error('[DatafeedBridge] Failed to load more data:', err);
          if (!this.disposed) {
            this.chart.applyMoreData([], false);
          }
          this.loading = false;
        });
    });

    // Fetch initial data
    this.loading = true;
    this.datafeed
      .getHistoryKLineData(this.symbol, this.period, from, to)
      .then((data: KLineData[]) => {
        if (this.disposed) return;
        this.chart.applyNewData(data, data.length >= barsToLoad);
        this.loading = false;
        this.subscribeRealtime();
      })
      .catch((err: unknown) => {
        console.error('[DatafeedBridge] Failed to load initial data:', err);
        if (!this.disposed) {
          this.chart.applyNewData([], false);
        }
        this.loading = false;
      });
  }

  dispose(): void {
    this.disposed = true;
    this.unsubscribeRealtime();
  }

  private subscribeRealtime(): void {
    this.realtimeCallback = (data: KLineData) => {
      if (this.disposed) return;
      this.chart.updateData(data);
    };
    this.datafeed.subscribe(this.symbol, this.period, this.realtimeCallback);
  }

  private unsubscribeRealtime(): void {
    this.datafeed.unsubscribe(this.symbol, this.period);
    this.realtimeCallback = null;
  }

  private alignTimestamp(timestamp: number, periodMs: number): number {
    return Math.floor(timestamp / periodMs) * periodMs;
  }

  private getPeriodMs(): number {
    const { multiplier, timespan } = this.period;
    const ms: Record<string, number> = {
      minute: 60_000,
      hour: 3_600_000,
      day: 86_400_000,
      week: 604_800_000,
      month: 2_592_000_000,
      year: 31_536_000_000,
    };
    return multiplier * (ms[timespan] ?? 60_000);
  }
}
