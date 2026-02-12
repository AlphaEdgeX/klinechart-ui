import type { Chart, Overlay, OverlayMode, Point } from 'klinecharts';

export interface SerializedOverlay {
  name: string;
  id: string;
  groupId: string;
  points: Array<Partial<Point>>;
  styles: Record<string, unknown> | null;
  lock: boolean;
  visible: boolean;
  zLevel: number;
  mode: OverlayMode;
  extendData: unknown;
}

/**
 * Tracks overlay IDs created on a chart instance.
 * klinecharts v9 doesn't have a getAllOverlays() method, so we track IDs
 * as overlays are created and use getOverlayById() to retrieve them.
 */
export class OverlayTracker {
  private ids = new Set<string>();

  /** Register an overlay ID (call after createOverlay). */
  add(id: string | null | undefined): void {
    if (id) this.ids.add(id);
  }

  /** Register multiple overlay IDs. */
  addAll(ids: Array<string | null | undefined>): void {
    for (const id of ids) {
      if (id) this.ids.add(id);
    }
  }

  /** Remove an overlay ID (call after removeOverlay). */
  remove(id: string): void {
    this.ids.delete(id);
  }

  /** Clear all tracked IDs. */
  clear(): void {
    this.ids.clear();
  }

  /** Get all tracked IDs. */
  getIds(): string[] {
    return Array.from(this.ids);
  }

  /**
   * Serialize all tracked overlays from the chart.
   * Overlays that no longer exist on the chart are automatically pruned.
   */
  serialize(chart: Chart): SerializedOverlay[] {
    const result: SerializedOverlay[] = [];
    const toRemove: string[] = [];
    for (const id of this.ids) {
      const overlay = chart.getOverlayById(id);
      if (overlay) {
        result.push(overlayToSerialized(overlay));
      } else {
        toRemove.push(id);
      }
    }
    // Prune stale IDs after iteration
    for (const id of toRemove) {
      this.ids.delete(id);
    }
    return result;
  }
}

/**
 * Serialize specific overlays by ID.
 */
export function serializeOverlaysByIds(
  chart: Chart,
  ids: string[]
): SerializedOverlay[] {
  const result: SerializedOverlay[] = [];
  for (const id of ids) {
    const overlay = chart.getOverlayById(id);
    if (overlay) {
      result.push(overlayToSerialized(overlay));
    }
  }
  return result;
}

/**
 * Restore overlays from serialized data.
 * Returns the IDs of newly created overlays (for use with OverlayTracker).
 */
export function restoreOverlays(
  chart: Chart,
  overlays: SerializedOverlay[],
  paneId?: string
): string[] {
  const createdIds: string[] = [];
  for (const data of overlays) {
    const id = chart.createOverlay(
      {
        name: data.name,
        id: data.id,
        groupId: data.groupId,
        points: data.points,
        styles: data.styles,
        lock: data.lock,
        visible: data.visible,
        zLevel: data.zLevel,
        mode: data.mode,
        extendData: data.extendData,
      },
      paneId
    );
    if (typeof id === 'string' && id) {
      createdIds.push(id);
    }
  }
  return createdIds;
}

function overlayToSerialized(overlay: Overlay): SerializedOverlay {
  return {
    name: overlay.name,
    id: overlay.id,
    groupId: overlay.groupId,
    points: overlay.points.map((p) => ({
      dataIndex: p.dataIndex,
      timestamp: p.timestamp,
      value: p.value,
    })),
    styles: overlay.styles,
    lock: overlay.lock,
    visible: overlay.visible,
    zLevel: overlay.zLevel,
    mode: overlay.mode,
    extendData: overlay.extendData,
  };
}
