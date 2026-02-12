import { registerOverlay } from 'klinecharts';
import { fibonacciLine } from './fibonacci/fibonacciLine';
import { fibonacciSegment } from './fibonacci/fibonacciSegment';
import { fibonacciCircle } from './fibonacci/fibonacciCircle';
import { fibonacciSpiral } from './fibonacci/fibonacciSpiral';
import { fibonacciSpeedResistanceFan } from './fibonacci/fibonacciSpeedResistanceFan';
import { fibonacciExtension } from './fibonacci/fibonacciExtension';
import { wave3 } from './waves/wave3';
import { wave5 } from './waves/wave5';
import { wave8 } from './waves/wave8';
import { waveAny } from './waves/waveAny';
import { abcd } from './waves/abcd';
import { xabcd } from './waves/xabcd';
import { arrowOverlay } from './shapes/arrow';
import { circleOverlay } from './shapes/circle';
import { rectOverlay } from './shapes/rect';
import { triangleOverlay } from './shapes/triangle';
import { parallelogramOverlay } from './shapes/parallelogram';
import { gannBox } from './gann/gannBox';
import { longPosition } from './position/longPosition';
import { shortPosition } from './position/shortPosition';
import { longEntry } from './position/longEntry';
import { shortEntry } from './position/shortEntry';
import { priceMeasurement } from './measurement/priceMeasurement';
import { timeMeasurement } from './measurement/timeMeasurement';
import { priceTimeMeasurement } from './measurement/priceTimeMeasurement';

const ALL_OVERLAYS = [
  // Fibonacci
  fibonacciLine,
  fibonacciSegment,
  fibonacciCircle,
  fibonacciSpiral,
  fibonacciSpeedResistanceFan,
  fibonacciExtension,
  // Waves
  wave3,
  wave5,
  wave8,
  waveAny,
  abcd,
  xabcd,
  // Shapes
  arrowOverlay,
  circleOverlay,
  rectOverlay,
  triangleOverlay,
  parallelogramOverlay,
  // Gann
  gannBox,
  // Position
  longPosition,
  shortPosition,
  longEntry,
  shortEntry,
  // Measurement
  priceMeasurement,
  timeMeasurement,
  priceTimeMeasurement,
];

let registered = false;

export function registerAllOverlays(): void {
  if (registered) return;
  registered = true;
  for (const overlay of ALL_OVERLAYS) {
    registerOverlay(overlay);
  }
}
