
import React, { useState, useEffect, useMemo } from 'react';
import { DWLRStation, WaterLevelStatus } from './types';
import { fetchStations } from './services/dataService';
import WaterLevelChart from './components/WaterLevelChart';
import { MapPinIcon, CloseIcon } from './components/icons';

const INDIA_BOUNDS = { latMin: 8.4, latMax: 37.6, lngMin: 68.7, lngMax: 97.25 };

const STATUS_COLORS: Record<WaterLevelStatus, { dot: string; text: string; bg: string }> = {
  [WaterLevelStatus.NORMAL]: { dot: 'bg-green-500', text: 'text-green-800', bg: 'bg-green-100' },
  [WaterLevelStatus.WARNING]: { dot: 'bg-yellow-500', text: 'text-yellow-800', bg: 'bg-yellow-100' },
  [WaterLevelStatus.CRITICAL]: { dot: 'bg-red-500', text: 'text-red-800', bg: 'bg-red-100' },
  [WaterLevelStatus.UNKNOWN]: { dot: 'bg-gray-500', text: 'text-gray-800', bg: 'bg-gray-100' },
};

// --- Helper Components defined outside App to prevent re-creation on re-renders ---

const Header: React.FC = () => (
    <header className="bg-white shadow-md z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">India Groundwater Watch</h1>
                    <p className="text-sm text-gray-500">Real-time DWLR Monitoring Dashboard</p>
                </div>
            </div>
        </div>
    </header>
);

interface StatCardProps {
    label: string;
    value: string | number;
    unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => (
    <div className="bg-slate-100 p-3 rounded-lg text-center">
        <p className="text-xs text-slate-500 font-medium uppercase">{label}</p>
        <p className="text-xl font-semibold text-slate-800">{value} <span className="text-sm font-normal text-slate-600">{unit}</span></p>
    </div>
);

interface IndiaMapProps {
    stations: DWLRStation[];
    onSelectStation: (station: DWLRStation) => void;
    selectedStationId: number | null;
}

const IndiaMap: React.FC<IndiaMapProps> = ({ stations, onSelectStation, selectedStationId }) => {
    const convertCoordsToPercent = (lat: number, lng: number) => {
        const top = 100 - ((lat - INDIA_BOUNDS.latMin) / (INDIA_BOUNDS.latMax - INDIA_BOUNDS.latMin)) * 100;
        const left = ((lng - INDIA_BOUNDS.lngMin) / (INDIA_BOUNDS.lngMax - INDIA_BOUNDS.lngMin)) * 100;
        return { top: `${top}%`, left: `${left}%` };
    };

    return (
        <div className="relative w-full h-full bg-blue-100 rounded-lg overflow-hidden shadow-inner border border-blue-200">
            {/* Simplified map background */}
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1200/800?grayscale&blur=1')"}}></div>
            <div className="absolute inset-0 bg-blue-100 opacity-80"></div>

            {stations.map(station => {
                const { top, left } = convertCoordsToPercent(station.lat, station.lng);
                const color = STATUS_COLORS[station.status]?.dot || 'bg-gray-500';
                const isSelected = station.id === selectedStationId;

                return (
                    <button
                        key={station.id}
                        className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out cursor-pointer hover:scale-150 hover:z-10 focus:outline-none ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        style={{ top, left }}
                        onClick={() => onSelectStation(station)}
                        title={station.name}
                    >
                        <span className={`block w-full h-full rounded-full ${color}`}></span>
                    </button>
                );
            })}
        </div>
    );
};

const Legend: React.FC = () => (
    <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-md">
        <h3 className="font-bold text-sm mb-2 text-gray-700">Water Level Status</h3>
        <div className="space-y-1">
            {Object.entries(STATUS_COLORS).map(([status, { dot, text }]) => (
                status !== 'Unknown' && (
                    <div key={status} className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${dot}`}></span>
                        <span className="text-xs text-gray-600">{status}</span>
                    </div>
                )
            ))}
        </div>
    </div>
);

interface StationDetailsProps {
    station: DWLRStation | null;
    onClose: () => void;
}

const StationDetails: React.FC<StationDetailsProps> = ({ station, onClose }) => {
    if (!station) return null;

    const { dot, text, bg } = STATUS_COLORS[station.status];
    const lastUpdatedDate = new Date(station.lastUpdated);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-full overflow-y-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{station.name}</h2>
                    <p className="text-sm text-gray-500">{station.state}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>

            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-4 ${bg} ${text}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${dot}`}></span>
                {station.status}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <StatCard label="Current Level" value={station.currentWaterLevel} unit="m" />
                <StatCard label="Recharge Rate" value={station.rechargeRate} unit="mm/yr" />
                <StatCard label="Aquifer Type" value={station.aquiferType} />
                <StatCard label="Last Updated" value={lastUpdatedDate.toLocaleDateString()} />
            </div>

            <div className="mt-6">
                <h3 className="font-semibold text-gray-700">Historical Water Levels (24 Months)</h3>
                <WaterLevelChart data={station.historicalData} />
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [stations, setStations] = useState<DWLRStation[]>([]);
    const [selectedStation, setSelectedStation] = useState<DWLRStation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const stationData = await fetchStations();
            setStations(stationData);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const summaryStats = useMemo(() => {
        if (stations.length === 0) {
            return { count: 0, critical: 0, warning: 0, normal: 0 };
        }
        return {
            count: stations.length,
            critical: stations.filter(s => s.status === WaterLevelStatus.CRITICAL).length,
            warning: stations.filter(s => s.status === WaterLevelStatus.WARNING).length,
            normal: stations.filter(s => s.status === WaterLevelStatus.NORMAL).length,
        };
    }, [stations]);

    return (
        <div className="h-screen w-screen flex flex-col font-sans text-gray-900">
            <Header />
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Stations" value={isLoading ? '...' : summaryStats.count} />
                    <StatCard label="Normal" value={isLoading ? '...' : summaryStats.normal} />
                    <StatCard label="Warning" value={isLoading ? '...' : summaryStats.warning} />
                    <StatCard label="Critical" value={isLoading ? '...' : summaryStats.critical} />
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    <div className="lg:col-span-2 relative h-full min-h-[400px]">
                        {isLoading ? (
                             <div className="flex items-center justify-center h-full bg-slate-200 rounded-lg">
                                <p className="text-slate-500">Loading Map Data...</p>
                            </div>
                        ) : (
                            <>
                                <IndiaMap 
                                    stations={stations} 
                                    onSelectStation={setSelectedStation}
                                    selectedStationId={selectedStation?.id || null}
                                />
                                <Legend />
                            </>
                        )}
                    </div>
                    <div className={`transition-transform duration-500 ease-in-out ${selectedStation ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} lg:relative fixed inset-y-0 right-0 w-full max-w-md lg:max-w-none lg:w-auto z-30 lg:z-0`}>
                        <StationDetails station={selectedStation} onClose={() => setSelectedStation(null)} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
