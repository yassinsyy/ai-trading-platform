import { Badge } from './badge';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';

interface WSIndicatorProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  onReconnect?: () => void;
}

export function WSIndicator({ status, onReconnect }: WSIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          label: 'WS Connected',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          label: 'WS Error',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer',
        };
      default:
        return {
          icon: <WifiOff className="w-3 h-3" />,
          label: 'WS Offline',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 text-xs font-medium ${config.className}`}
      onClick={status === 'disconnected' || status === 'error' ? onReconnect : undefined}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
