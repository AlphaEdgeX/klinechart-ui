export interface SymbolInfo {
  ticker: string;
  name: string;
  shortName?: string;
  exchange?: string;
  market?: string;
  pricePrecision?: number;
  volumePrecision?: number;
  priceCurrency?: string;
  type?: string;
  logo?: string;
}
