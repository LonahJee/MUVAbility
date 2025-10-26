
// This is the new, simplified chart component

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ImprovementChartProps {
  title: string;
  data: { date: string; value: number }[];
  strokeColor: string;
  metricName?: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, metricName }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded shadow-lg">
        <p className="label">{`${label}`}</p>
        <p className="intro" style={{ color: payload[0].color }}>
          {`${payload[0].value} ${metricName || ""}`}
        </p>
      </div>
    );
  }

  return null;
};

export function ImprovementChart({
  title,
  data,
  strokeColor,
  metricName,
}: ImprovementChartProps) {
  // Don't show the chart if there's no data at all
  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip metricName={metricName} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                name=""
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
