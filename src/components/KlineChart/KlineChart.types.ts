import type { DeepPartial, Styles, Options as KCOptions } from 'klinecharts';
import type { KLineData } from 'klinecharts';
import type { Datafeed } from '../../types/datafeed';
import type { Period } from '../../types/period';
import type { SymbolInfo } from '../../types/symbol';

export interface KlineChartProps {
  /** Static OHLCV data (mutually exclusive with datafeed) */
  data?: KLineData[];
  /** Datafeed for dynamic data loading (mutually exclusive with data) */
  datafeed?: Datafeed;
  /** Symbol info (required when using datafeed) */
  symbol?: SymbolInfo;
  /** Period/timeframe (required when using datafeed) */
  period?: Period;
  /** Chart theme: 'dark' or 'light' */
  theme?: 'dark' | 'light';
  /** Chart locale */
  locale?: string;
  /** Chart timezone */
  timezone?: string;
  /** Custom styles */
  styles?: DeepPartial<Styles>;
  /** Additional klinecharts init options */
  options?: Omit<KCOptions, 'styles' | 'locale' | 'timezone'>;
  /** Price precision */
  pricePrecision?: number;
  /** Volume precision */
  volumePrecision?: number;
  /** CSS class name */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Children (toolbar, period bar, etc.) */
  children?: React.ReactNode;
  /** Called when chart is ready */
  onReady?: () => void;
}
