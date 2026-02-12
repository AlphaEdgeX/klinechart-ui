export interface ToolDefinition {
  name: string;
  label: string;
  overlayName: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  tools: ToolDefinition[];
}

export const defaultCategories: ToolCategory[] = [
  {
    id: 'lines',
    label: 'Lines',
    tools: [
      { name: 'straightLine', label: 'Straight Line', overlayName: 'straightLine' },
      { name: 'rayLine', label: 'Ray Line', overlayName: 'rayLine' },
      { name: 'segment', label: 'Segment', overlayName: 'segment' },
      { name: 'horizontalStraightLine', label: 'Horizontal Line', overlayName: 'horizontalStraightLine' },
      { name: 'verticalStraightLine', label: 'Vertical Line', overlayName: 'verticalStraightLine' },
      { name: 'horizontalRayLine', label: 'Horizontal Ray', overlayName: 'horizontalRayLine' },
      { name: 'horizontalSegment', label: 'Horizontal Segment', overlayName: 'horizontalSegment' },
      { name: 'priceChannelLine', label: 'Price Channel', overlayName: 'priceChannelLine' },
      { name: 'parallelStraightLine', label: 'Parallel Line', overlayName: 'parallelStraightLine' },
      { name: 'priceLine', label: 'Price Line', overlayName: 'priceLine' },
      { name: 'arrow', label: 'Arrow', overlayName: 'arrow' },
    ],
  },
  {
    id: 'shapes',
    label: 'Shapes',
    tools: [
      { name: 'circle', label: 'Circle', overlayName: 'circle' },
      { name: 'rect', label: 'Rectangle', overlayName: 'rect' },
      { name: 'triangle', label: 'Triangle', overlayName: 'triangle' },
      { name: 'parallelogram', label: 'Parallelogram', overlayName: 'parallelogram' },
    ],
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    tools: [
      { name: 'fibonacciLine', label: 'Fib Retracement', overlayName: 'fibonacciLine' },
      { name: 'fibonacciSegment', label: 'Fib Segment', overlayName: 'fibonacciSegment' },
      { name: 'fibonacciCircle', label: 'Fib Circle', overlayName: 'fibonacciCircle' },
      { name: 'fibonacciSpiral', label: 'Fib Spiral', overlayName: 'fibonacciSpiral' },
      { name: 'fibonacciSpeedResistanceFan', label: 'Fib Fan', overlayName: 'fibonacciSpeedResistanceFan' },
      { name: 'fibonacciExtension', label: 'Fib Extension', overlayName: 'fibonacciExtension' },
    ],
  },
  {
    id: 'waves',
    label: 'Waves',
    tools: [
      { name: 'threeWaves', label: '3 Wave', overlayName: 'threeWaves' },
      { name: 'fiveWaves', label: '5 Wave', overlayName: 'fiveWaves' },
      { name: 'eightWaves', label: '8 Wave', overlayName: 'eightWaves' },
      { name: 'anyWaves', label: 'Any Wave', overlayName: 'anyWaves' },
      { name: 'abcd', label: 'ABCD', overlayName: 'abcd' },
      { name: 'xabcd', label: 'XABCD', overlayName: 'xabcd' },
    ],
  },
  {
    id: 'position',
    label: 'Position',
    tools: [
      { name: 'longPosition', label: 'Long Position', overlayName: 'longPosition' },
      { name: 'shortPosition', label: 'Short Position', overlayName: 'shortPosition' },
      { name: 'longEntry', label: 'Long Entry', overlayName: 'longEntry' },
      { name: 'shortEntry', label: 'Short Entry', overlayName: 'shortEntry' },
    ],
  },
  {
    id: 'measure',
    label: 'Measure',
    tools: [
      { name: 'priceMeasurement', label: 'Price', overlayName: 'priceMeasurement' },
      { name: 'timeMeasurement', label: 'Time', overlayName: 'timeMeasurement' },
      { name: 'priceTimeMeasurement', label: 'Price + Time', overlayName: 'priceTimeMeasurement' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    tools: [
      { name: 'gannBox', label: 'Gann Box', overlayName: 'gannBox' },
      { name: 'simpleAnnotation', label: 'Annotation', overlayName: 'simpleAnnotation' },
      { name: 'simpleTag', label: 'Tag', overlayName: 'simpleTag' },
    ],
  },
];
