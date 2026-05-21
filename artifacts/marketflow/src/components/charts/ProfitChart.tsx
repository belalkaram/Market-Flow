import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ProfitChartProps {
  data: any[];
  height?: number;
}

export function ProfitChart({ data, height = 300 }: ProfitChartProps) {
  const salesColor = "hsl(var(--primary))";
  const costColor = "hsl(var(--muted-foreground))";
  const profitColor = "hsl(var(--warning))";

  return (
    <div style={{ height, width: '100%' }} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" name="المبيعات" dataKey="sales" stroke={salesColor} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" name="التكلفة" dataKey="cost" stroke={costColor} strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" name="الربح" dataKey="profit" stroke={profitColor} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
