import type { OverlayTemplate } from 'klinecharts';
import { fibonacciSegment } from './fibonacciSegment';

/**
 * Fibonacci retracement lines — alias of fibonacciSegment with a different name.
 */
export const fibonacciLine: OverlayTemplate = {
  ...fibonacciSegment,
  name: 'fibonacciLine',
};
