
import { DWLRStation, WaterLevelStatus, HistoricalDataPoint } from '../types';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const AQUIFER_TYPES = ["Alluvial", "Hard Rock", "Coastal Sedimentary", "Volcanic Rock", "Mountainous"];

// Bounding box for India
const LAT_MIN = 8.4;
const LAT_MAX = 37.6;
const LNG_MIN = 68.7;
const LNG_MAX = 97.25;

const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;

const getStatus = (level: number): WaterLevelStatus => {
  if (level > 20) return WaterLevelStatus.CRITICAL;
  if (level > 10) return WaterLevelStatus.WARNING;
  return WaterLevelStatus.NORMAL;
};

const generateHistoricalData = (initialLevel: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const today = new Date();
  for (let i = 24; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const fluctuation = (Math.random() - 0.5) * 4;
    const level = Math.max(0, initialLevel + fluctuation + Math.sin(i / 4) * 5);
    data.push({
      date: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
      level: parseFloat(level.toFixed(2)),
    });
  }
  return data;
};

export const fetchStations = async (): Promise<DWLRStation[]> => {
  const stations: DWLRStation[] = [];
  for (let i = 1; i <= 250; i++) {
    const currentWaterLevel = getRandomNumber(2, 35);
    const lastUpdated = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7); // within last 7 days

    stations.push({
      id: i,
      name: `DWLR-${1000 + i}`,
      state: INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)],
      lat: getRandomNumber(LAT_MIN, LAT_MAX),
      lng: getRandomNumber(LNG_MIN, LNG_MAX),
      currentWaterLevel: parseFloat(currentWaterLevel.toFixed(2)),
      lastUpdated: lastUpdated.toISOString(),
      status: getStatus(currentWaterLevel),
      historicalData: generateHistoricalData(currentWaterLevel),
      rechargeRate: parseFloat(getRandomNumber(50, 400).toFixed(1)),
      aquiferType: AQUIFER_TYPES[Math.floor(Math.random() * AQUIFER_TYPES.length)],
    });
  }

  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(stations), 500));
};
