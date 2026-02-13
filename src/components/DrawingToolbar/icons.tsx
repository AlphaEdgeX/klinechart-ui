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
  PenLine,
  ArrowUpRight,
  Minus,
  MoveHorizontal,
  MoveVertical,
  ArrowRight,
  ChevronsLeftRight,
  SplitSquareHorizontal,
  Circle,
  Triangle,
  RectangleHorizontal,
  Spline,
  ChartLine,
  Wind,
  AudioWaveform,
  ArrowUp,
  ArrowDown,
  Timer,
  Clock,
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

export const categoryIcons: Record<string, IconComponent> = {
  lines: TrendingUp,
  shapes: Square,
  fibonacci: GitBranch,
  waves: Activity,
  position: Crosshair,
  measure: Ruler,
  other: Tag,
};

function resolveStrokeWidth({
  size = 24,
  strokeWidth = 2,
  absoluteStrokeWidth = false,
}: Pick<LucideProps, 'size' | 'strokeWidth' | 'absoluteStrokeWidth'>): number {
  const iconSize = typeof size === 'number' ? size : Number.parseFloat(size);
  const width =
    typeof strokeWidth === 'number'
      ? strokeWidth
      : Number.parseFloat(strokeWidth);
  if (
    !absoluteStrokeWidth ||
    !Number.isFinite(iconSize) ||
    iconSize === 0 ||
    !Number.isFinite(width)
  ) {
    return Number.isFinite(width) ? width : 2;
  }
  return (width * 24) / iconSize;
}

function getSvgStrokeProps(props: LucideProps) {
  const { size = 24, strokeWidth = 2, absoluteStrokeWidth = false } = props;
  return {
    size,
    strokeWidth: resolveStrokeWidth({ size, strokeWidth, absoluteStrokeWidth }),
  };
}

const RectangleIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <rect x='5.5' y='5.5' width='13' height='13' rx='1.5' />
      <circle cx='5.5' cy='5.5' r='1.4' />
      <circle cx='18.5' cy='5.5' r='1.4' />
      <circle cx='5.5' cy='18.5' r='1.4' />
      <circle cx='18.5' cy='18.5' r='1.4' />
    </svg>
  );
};

const TrendLineIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='6' cy='17' r='1.4' />
      <circle cx='18' cy='7' r='1.4' />
      <path d='M7.3 15.8 16.7 8.2' />
    </svg>
  );
};

const HorizontalRayIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='5.5' cy='12' r='1.4' />
      <path d='M7.2 12H21' />
    </svg>
  );
};

const HorizontalLineIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='5.5' cy='12' r='1.3' />
      <circle cx='18.5' cy='12' r='1.3' />
      <path d='M7.2 12H16.8' />
    </svg>
  );
};

const PositionUpIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='6' cy='17' r='1.3' />
      <circle cx='14.2' cy='12.2' r='1.3' />
      <path d='M7.2 16.2 16 11' />
      <path d='M14.4 9.2h3.7v3.7' />
    </svg>
  );
};

const PositionDownIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <circle cx='6' cy='7' r='1.3' />
      <circle cx='14.2' cy='11.8' r='1.3' />
      <path d='M7.2 7.8 16 13' />
      <path d='M14.4 14.8h3.7v-3.7' />
    </svg>
  );
};

const FibonacciIcon: IconComponent = ({
  color = 'currentColor',
  className,
  ...props
}) => {
  const { size, strokeWidth } = getSvgStrokeProps(props);
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <path d='M4.5 17.5h15' />
      <path d='M7.5 14.5h12' />
      <path d='M10 11.5h9.5' />
      <path d='M12.2 8.5h7.3' />
      <path d='M4.5 17.5C8 17.5 9 13.7 10.7 11.5C12.6 9.1 14.6 8.5 19.5 8.5' />
    </svg>
  );
};

export const toolIcons: Record<string, IconComponent> = {
  straightLine: PenLine,
  rayLine: ArrowUpRight,
  segment: TrendLineIcon,
  trendLine: TrendLineIcon,
  horizontalStraightLine: HorizontalLineIcon,
  verticalStraightLine: MoveVertical,
  horizontalRayLine: HorizontalRayIcon,
  horizontalRay: HorizontalRayIcon,
  horizontalSegment: ChevronsLeftRight,
  priceChannelLine: SplitSquareHorizontal,
  parallelStraightLine: ChartLine,
  priceLine: Spline,
  arrow: ArrowUpRight,

  circle: Circle,
  rect: RectangleIcon,
  triangle: Triangle,
  parallelogram: RectangleHorizontal,

  fibonacciLine: FibonacciIcon,
  fibonacciSegment: Minus,
  fibonacciCircle: Circle,
  fibonacciSpiral: Wind,
  fibonacciSpeedResistanceFan: TrendingUp,
  fibonacciExtension: ArrowUpRight,

  threeWaves: AudioWaveform,
  fiveWaves: AudioWaveform,
  eightWaves: AudioWaveform,
  anyWaves: Activity,
  abcd: Spline,
  xabcd: Spline,

  longPosition: PositionUpIcon,
  shortPosition: PositionDownIcon,
  longEntry: ArrowUp,
  shortEntry: ArrowDown,

  measure: Ruler,
  ruler: Ruler,
  priceMeasurement: Ruler,
  timeMeasurement: Timer,
  priceTimeMeasurement: Clock,

  gannBox: Grid3X3,
  simpleAnnotation: StickyNote,
  simpleTag: Tags,
};
