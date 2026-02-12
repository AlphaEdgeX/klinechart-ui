import { createPositionOverlay } from './positionOverlay';

/**
 * Short Position overlay.
 * Draw order: loss (top), entry (middle), target (bottom).
 */
export const shortPosition = createPositionOverlay('shortPosition', false);
