import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '8px 12px',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>{payload[0]?.payload?.fullName}</p>
        <p style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
          {payload[0]?.value}
        </p>
      </div>
    );
  }
  return null;
};

const SubjectRadarChart = ({ radarData }) => {
  if (!radarData || radarData.length < 3) return null;

  return (
    <div style={{ height: 220, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Nilai"
            dataKey="nilai"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.2}
            dot={{ r: 3, fill: '#8b5cf6' }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectRadarChart;
