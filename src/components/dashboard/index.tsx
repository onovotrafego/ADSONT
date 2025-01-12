import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const data = [
  { month: "Jan", spending: 4000, impressions: 2400 },
  { month: "Feb", spending: 3000, impressions: 1398 },
  { month: "Mar", spending: 2000, impressions: 9800 },
  { month: "Apr", spending: 2780, impressions: 3908 },
  { month: "May", spending: 1890, impressions: 4800 },
  { month: "Jun", spending: 2390, impressions: 3800 },
];

export default function Dashboard() {
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your campaign performance and spending
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Spending</h3>
          <p className="text-3xl font-bold">$16,060</p>
          <p className="text-sm text-muted-foreground">Across all campaigns</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Active Campaigns</h3>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Currently running</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Impressions</h3>
          <p className="text-3xl font-bold">26,104</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Monthly Spending</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spending" fill="#8884d8" name="Spending ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Campaign Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#82ca9d"
                  name="Impressions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
