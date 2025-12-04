import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const VolumeChart = ({ data }) => {
  if (!data || !data.samples || data.samples.length === 0)
    return <p>No volume data available</p>;

  const { samples, window_ms } = data;

  const cleaned = samples.map(v => (v === -Infinity ? -80 : v));
  const minDb = Math.min(...cleaned);
  const maxDb = Math.max(...cleaned);
  const paddedMin = Math.floor(minDb) - 5;
  const paddedMax = Math.ceil(maxDb) + 2;
  const mid = Math.round((paddedMin + paddedMax) / 2);
  const ticks = [paddedMin, mid, paddedMax];

  const formatted = cleaned.map((db, index) => ({
    time: (index * window_ms) / 1000,
    db,
  }));

  return (
    <div className="w-full h-64 p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2 text-center text-gray-900">
        Volume Over Time (dBFS)
      </h2>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formatted}
            margin={{ top: 10, right: 16, left: 0, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              tickFormatter={(t) => t.toFixed(1)}
              label={{
                value: "Time (s)",
                position: "insideBottom",
                offset: -5,
              }}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              tickMargin={8}
            />

            <YAxis
              domain={[paddedMin, paddedMax]}
              ticks={ticks}
              tickFormatter={(t) => `${t} dB`}
              label={{
                value: "Volume",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
              tick={{ fontSize: 11, fill: "#4b5563" }}
            />

            <Tooltip
              formatter={(v) => [`${v.toFixed(1)} dB`, "Volume"]}
              labelFormatter={(t) => `${t.toFixed(2)}s`}
            />

            <Line
              type="monotone"
              dataKey="db"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VolumeChart;