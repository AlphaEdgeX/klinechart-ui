import type { LucideProps } from 'lucide-react';
import {
  TrendingUp,
  TrendingDown,
  Square,
  GitBranch,
  Activity,
  Crosshair,
  Ruler,
  Tag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Camera,
  // Line tools
  PenLine,
  ArrowUpRight,
  Minus,
  MoveHorizontal,
  MoveVertical,
  ArrowRight,
  ChevronsLeftRight,
  SplitSquareHorizontal,
  // Shapes
  Circle,
  Triangle,
  RectangleHorizontal,
  // Fibonacci
  Spline,
  ChartLine,
  Wind,
  // Waves
  AudioWaveform,
  // Position
  ArrowUp,
  ArrowDown,
  // Measure
  Timer,
  Clock,
  // Other
  Grid3X3,
  StickyNote,
  Tags,
} from 'lucide-react';

export type IconComponent = React.FC<LucideProps>;

export {
  TrendingUp as LineIcon,
  Square as RectIcon,
  GitBranch as FibIcon,
  Activity as WaveIcon,
  Crosshair as PositionIcon,
  Ruler as MeasureIcon,
  Tag as TagIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Trash2 as TrashIcon,
  Camera as ScreenshotIcon,
};

/** Map from category ID to lucide icon component */
export const categoryIcons: Record<string, IconComponent> = {
  lines: TrendingUp,
  shapes: Square,
  fibonacci: GitBranch,
  waves: Activity,
  position: Crosshair,
  measure: Ruler,
  other: Tag,
};

/** Map from tool name to lucide icon component */
export const toolIcons: Record<string, IconComponent> = {
  // Lines
  straightLine: PenLine,
  rayLine: ArrowUpRight,
  segment: Minus,
  horizontalStraightLine: MoveHorizontal,
  verticalStraightLine: MoveVertical,
  horizontalRayLine: ArrowRight,
  horizontalSegment: ChevronsLeftRight,
  priceChannelLine: SplitSquareHorizontal,
  parallelStraightLine: ChartLine,
  priceLine: Spline,
  arrow: ArrowUpRight,
  // Shapes
  circle: Circle,
  rect: Square,
  triangle: Triangle,
  parallelogram: RectangleHorizontal,
  // Fibonacci
  fibonacciLine: GitBranch,
  fibonacciSegment: Minus,
  fibonacciCircle: Circle,
  fibonacciSpiral: Wind,
  fibonacciSpeedResistanceFan: TrendingUp,
  fibonacciExtension: ArrowUpRight,
  // Waves
  threeWaves: AudioWaveform,
  fiveWaves: AudioWaveform,
  eightWaves: AudioWaveform,
  anyWaves: Activity,
  abcd: Spline,
  xabcd: Spline,
  // Position
  longPosition: TrendingUp,
  shortPosition: TrendingDown,
  longEntry: ArrowUp,
  shortEntry: ArrowDown,
  // Measure
  priceMeasurement: Ruler,
  timeMeasurement: Timer,
  priceTimeMeasurement: Clock,
  // Other
  gannBox: Grid3X3,
  simpleAnnotation: StickyNote,
  simpleTag: Tags,
};
