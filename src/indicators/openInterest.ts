import type { IndicatorTemplate, KLineData } from 'klinecharts';

interface OIData {
  oi: number;
}

/**
 * Open Interest indicator.
 * Expects KLineData extended with an `oi` field (number).
 * Consumers must provide `oi` in their data objects for this indicator to work.
 * Example: chart.applyNewData([{ timestamp, open, high, low, close, volume, oi: 12345 }, ...])
 */
export const openInterest: IndicatorTemplate<OIData> = {
  name: 'OI',
  shortName: 'OI',
  precision: 0,
  calcParams: [],
  figures: [
    {
      key: 'oi',
      title: 'OI: ',
      type: 'line',
    },
  ],
  calc: (dataList: KLineData[]) => {
    return dataList.map((kLineData) => ({
      oi: (kLineData as KLineData & { oi?: number }).oi ?? 0,
    }));
  },
};
