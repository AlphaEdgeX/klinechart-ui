/**
 * Calculate risk-reward ratio.
 */
export function calcRR(entry: number, tp: number, sl: number): number {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return 0;
  return reward / risk;
}

/**
 * Calculate PnL percentage.
 */
export function calcPnlPct(entry: number, current: number, isLong: boolean): number {
  if (entry === 0) return 0;
  return isLong
    ? ((current - entry) / entry) * 100
    : ((entry - current) / entry) * 100;
}

/**
 * Calculate pip value.
 */
export function calcPips(price1: number, price2: number, pipSize = 0.0001): number {
  return Math.abs(price1 - price2) / pipSize;
}
