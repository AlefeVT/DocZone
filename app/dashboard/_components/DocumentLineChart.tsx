import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface LineChartProps {
  data: { name: string; visualizacoes: number }[];
}

export function DocumentLineChart({ data }: LineChartProps) {
  return (
    <div className="w-full h-34">
      <LineChart width={450} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="visualizacoes" stroke="#576389" />
      </LineChart>
    </div>
  );
}
