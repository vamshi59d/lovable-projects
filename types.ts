
export enum WaterLevelStatus {
  CRITICAL = 'Critical',
  WARNING = 'Warning',
  NORMAL = 'Normal',
  UNKNOWN = 'Unknown',
}

export interface HistoricalDataPoint {
  date: string;
  level: number;
}

export interface DWLRStation {
  id: number;
  name: string;
  state: string;
  lat: number;
  lng: number;
  currentWaterLevel: number; // in meters below ground level
  lastUpdated: string;
  status: WaterLevelStatus;
  historicalData: HistoricalDataPoint[];
  rechargeRate: number; // in mm/year
  aquiferType: string;
}
