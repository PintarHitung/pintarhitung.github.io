import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '2px' }}>
          {payload[0]?.payload?.label || label}
        </p>
        <p style={{ color: '#22d3ee', fontWeight: '700', fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif' }}>
          {payload[0]?.value}
        </p>
      </div>
    );
  }
  return null;
};

const SemesterTrendChart = ({ trendData, grandAvg }) => {
  if (!trendData || trendData.length < 2) return null;

  const minVal = Math.max(0, Math.min(...trendData.map((d) => d.avg)) - 5);
  const maxVal = Math.min(100, Math.max(...trendData.map((d) => d.avg)) + 5);

  return (
    <div style={{ height: 200, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minVal, maxVal]}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} />
          {grandAvg && (
            <ReferenceLine
              y={grandAvg}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
              label={{ value: `Avg ${grandAvg}`, fill: 'rgba(255,255,255,0.3)', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="avg"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={{ r: 4, fill: '#080a0f', stroke: '#22d3ee', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#080a0f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SemesterTrendChart;
