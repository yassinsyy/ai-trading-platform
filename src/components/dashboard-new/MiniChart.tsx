import { LineChart, Line, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MiniChartProps {
  data: Array<{ value: number; month?: string }>;
  type?: 'line' | 'bar';
  color?: string;
  height?: number;
}

export function MiniChart({ 
  data, 
  type = 'line', 
  color = '#0f766e', 
  height = 40 
}: MiniChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}