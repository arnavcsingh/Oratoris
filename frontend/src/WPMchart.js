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
    <div className="w-full h-64 p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2 text-center text-gray-900">
        Speaking Speed Over Time (WPM)
      </h2>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 50 }}   // ← add this
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }}
            />
            <YAxis
              label={{ value: "WPM", angle: -90, position: "insideLeft" }}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #d1d5db" }}
              labelStyle={{ color: "#1e3a8a", fontWeight: "bold" }}
              itemStyle={{ color: "#4f46e5" }}
            />
            <Line
              type="monotone"
              dataKey="wpm"
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

export default WpmChart;
