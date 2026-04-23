"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function BondingCurveChart({ data }: { data: number[] }) {
  const chartData = data.map((price, index) => ({
    supply: index + 1,
    price,
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">Bonding Curve</h3>
      <p className="text-sm text-gray-500 mb-1">
        Live on-chain price growth based on supply
      </p>
      <p className="text-sm text-gray-500 mb-4">Price (ETH) vs Supply</p>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 30, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="supply"
            tick={{ fontSize: 12 }}
            tickMargin={8}
          />

          <YAxis
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => Number(value).toFixed(6)}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            width={70}
          />

          <Tooltip
            formatter={(value: number) => [`${value.toFixed(6)} ETH`, "Price"]}
            labelFormatter={(label) => `Supply: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}