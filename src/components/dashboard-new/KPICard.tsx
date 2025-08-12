import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  size?: 'normal' | 'large';
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'error';
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  size = 'normal',
  variant = 'default' 
}: KPICardProps) {


  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-light-gray text-small font-medium uppercase tracking-wide">{title}</span>
        {icon && <span className="text-light-gray">{icon}</span>}
      </div>
      
      <div className="text-white font-semibold text-lg mb-1">{value}</div>
      {subtitle && <div className="text-light-gray text-small">{subtitle}</div>}
      
      {trend && (
        <div className={`inline-flex items-center px-2 py-1 rounded text-small font-medium mt-2 ${
          trend.isPositive ? 'text-cyan bg-cyan bg-opacity-20' : 'text-red-400 bg-red-500 bg-opacity-20'
        }`}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  );
}

export function KPICardLarge({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  size = 'normal',
  variant = 'default' 
}: KPICardProps) {
  return (
    <div className={`card p-4 ${
      variant === 'default' ? 'border-cyan border-opacity-30' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        {icon && <span className="text-light-gray">{icon}</span>}
        <span className="text-light-gray text-small font-medium uppercase tracking-wide">{title}</span>
      </div>
      
      <div className={`text-white font-semibold mb-1 ${size === 'large' ? 'text-2xl' : 'text-xl'}`}>
        {value}
      </div>
      
      {subtitle && (
        <div className="text-light-gray text-small">{subtitle}</div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center px-2 py-1 rounded text-small font-medium mt-2 ${
          trend.isPositive ? 'text-cyan bg-cyan bg-opacity-20' : 'text-red-400 bg-red-500 bg-opacity-20'
        }`}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  );
}