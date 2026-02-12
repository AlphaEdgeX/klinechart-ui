export interface Period {
  multiplier: number;
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  text: string;
}

export const DEFAULT_PERIODS: Period[] = [
  { multiplier: 1, timespan: 'minute', text: '1m' },
  { multiplier: 5, timespan: 'minute', text: '5m' },
  { multiplier: 15, timespan: 'minute', text: '15m' },
  { multiplier: 30, timespan: 'minute', text: '30m' },
  { multiplier: 1, timespan: 'hour', text: '1H' },
  { multiplier: 2, timespan: 'hour', text: '2H' },
  { multiplier: 4, timespan: 'hour', text: '4H' },
  { multiplier: 6, timespan: 'hour', text: '6H' },
  { multiplier: 12, timespan: 'hour', text: '12H' },
  { multiplier: 1, timespan: 'day', text: '1D' },
  { multiplier: 3, timespan: 'day', text: '3D' },
  { multiplier: 1, timespan: 'week', text: '1W' },
  { multiplier: 1, timespan: 'month', text: '1M' },
];
