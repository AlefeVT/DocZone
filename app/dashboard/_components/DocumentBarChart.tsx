'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface BarChartProps {
  data: { name: string; documentos: number }[];
}

export function DocumentBarChart({ data }: BarChartProps) {
  return (
    <div className="w-full h-34">
      <BarChart width={450} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="documentos" fill="#576389" />
      </BarChart>
    </div>
  );
}
