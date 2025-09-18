
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoricalDataPoint } from '../types';

interface WaterLevelChartProps {
  data: HistoricalDataPoint[];
}

const WaterLevelChart: React.FC<WaterLevelChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis 
            label={{ value: 'Meters Below Ground', angle: -90, position: 'insideLeft', fill: '#6b7280', dy: 40 }} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            reversed={true}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(2px)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              color: '#1f2937'
            }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value: number) => [`${value} m`, 'Water Level']}
          />
          <Legend />
          <Line type="monotone" dataKey="level" name="Water Level" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterLevelChart;
