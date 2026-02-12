import { createPositionOverlay } from './positionOverlay';

/**
 * Long Position overlay.
 * Draw order: target (top), entry (middle), loss (bottom).
 */
export const longPosition = createPositionOverlay('longPosition', true);
