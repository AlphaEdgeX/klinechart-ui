import type { OverlayTemplate } from 'klinecharts';
import { measure } from './measure';

/**
 * Ruler alias for compatibility with issue #714 naming.
 */
export const ruler: OverlayTemplate = {
  ...measure,
  name: 'ruler',
};
