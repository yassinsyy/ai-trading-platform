import { useState } from 'react';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

interface DeltaBadgeProps {
  currentPrice: number;
  recommendedPrice: number;
  reason?: string;
  guardrailsApplied?: string[];
  expectedProfit?: number;
  expectedUnits?: number;
}

export function DeltaBadge({ 
  currentPrice, 
  recommendedPrice, 
  reason, 
  guardrailsApplied = [],
  expectedProfit,
  expectedUnits 
}: DeltaBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const delta = recommendedPrice - currentPrice;
  const deltaAbs = Math.abs(delta);
  const deltaPct = (delta / currentPrice) * 100;

  const getDeltaConfig = () => {
    if (delta > 0) {
      return {
        icon: <TrendingUp className="w-3 h-3" />,
        label: `+${deltaAbs.toLocaleString()}₸ (+${deltaPct.toFixed(1)}%)`,
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
      };
    } else if (delta < 0) {
      return {
        icon: <TrendingDown className="w-3 h-3" />,
        label: `-${deltaAbs.toLocaleString()}₸ (${deltaPct.toFixed(1)}%)`,
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
      };
    } else {
      return {
        icon: null,
        label: 'No change',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-600',
      };
    }
  };

  const config = getDeltaConfig();

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge
          variant={config.variant}
          className={`flex items-center gap-1 text-xs font-medium ${config.className}`}
        >
          {config.icon}
          {config.label}
        </Badge>
        
        {(reason || guardrailsApplied.length > 0 || expectedProfit !== undefined) && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Pricing Details</DialogTitle>
                <DialogDescription>
                  Detailed information about this price recommendation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {reason && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Reason</h4>
                    <p className="text-sm text-gray-600">{reason}</p>
                  </div>
                )}
                
                {guardrailsApplied.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">Guardrails Applied</h4>
                    <div className="flex flex-wrap gap-1">
                      {guardrailsApplied.map((guardrail, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {guardrail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(expectedProfit !== undefined || expectedUnits !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    {expectedProfit !== undefined && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">Expected Profit</h4>
                        <p className="text-sm text-green-600 font-medium">
                          {expectedProfit.toLocaleString()}₸
                        </p>
                      </div>
                    )}
                    {expectedUnits !== undefined && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">Expected Units</h4>
                        <p className="text-sm text-blue-600 font-medium">
                          {expectedUnits}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
