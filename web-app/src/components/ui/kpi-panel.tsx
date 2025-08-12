import { Card, CardContent, CardHeader, CardTitle } from './card';
import { TrendingUp, DollarSign, Package, Activity } from 'lucide-react';

interface KPIPanelProps {
  sumExpectedProfit: number;
  turnover: number;
  gmroi: number;
  lastFeed: string;
}

export function KPIPanel({ sumExpectedProfit, turnover, gmroi, lastFeed }: KPIPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expected Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₸{sumExpectedProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total expected profit from recommendations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Turnover</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ₸{turnover.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total inventory value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GMROI</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {gmroi.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Gross Margin Return on Investment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


