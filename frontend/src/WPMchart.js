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

const WpmChart = ({ data }) => {
  console.log("WpmChart received:", data);
  if (!data || data.length === 0) return <p>No data available</p>;

  return (
    <div className="w-full h-64 p-4 rounded-2xl shadow" style={{background: 'rgba(15, 30, 80, 0.6)', backdropFilter: 'blur(15px)'}}>
      <h2 className="text-lg font-semibold mb-2 text-center text-cyan-300">
        Speaking Speed Over Time (WPM)
      </h2>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 200, 255, 0.2)" />
            <XAxis
              dataKey="time"
              label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }}
              tick={{ fontSize: 11, fill: "#a0d8ff" }}
            />
            <YAxis
              label={{ value: "WPM", angle: -90, position: "insideLeft", fill: "#a0d8ff" }}
              domain={[0, "auto"]}
              tick={{ fontSize: 11, fill: "#a0d8ff" }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(15, 30, 80, 0.95)", border: "2px solid rgba(138, 43, 226, 0.5)", borderRadius: "8px" }}
              labelStyle={{ color: "#64c8ff", fontWeight: "bold" }}
              itemStyle={{ color: "#00ffcc" }}
            />
            <Line
              type="monotone"
              dataKey="wpm"
              stroke="#00ffcc"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#8acb00' }}
              activeDot={{ r: 5, fill: '#00ffcc' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WpmChart;
