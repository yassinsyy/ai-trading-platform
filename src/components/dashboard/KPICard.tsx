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
    <div className="bg-card border border-border-secondary rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground font-gilroy uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <span className="text-muted-foreground flex-shrink-0">
            {icon}
          </span>
        )}
      </div>
      
      <div className="text-2xl font-bold text-foreground font-gilroy mb-2">
        {value}
      </div>
      
      {subtitle && (
        <div className="text-sm text-muted-foreground leading-relaxed mb-3">
          {subtitle}
        </div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
          trend.isPositive 
            ? 'text-primary bg-primary/10 border border-primary/20' 
            : 'text-red-400 bg-red-500/10 border border-red-500/20'
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
    <div className={`bg-card border border-border-secondary rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow ${
      variant === 'default' ? 'border-primary/30' : ''
    }`}>
      <div className="flex items-center justify-between mb-6">
        {icon && (
          <span className="text-muted-foreground flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="text-sm font-medium text-muted-foreground font-gilroy uppercase tracking-wide">
          {title}
        </span>
      </div>
      
      <div className={`text-foreground font-bold font-gilroy mb-3 ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}>
        {value}
      </div>
      
      {subtitle && (
        <div className="text-sm text-muted-foreground leading-relaxed mb-4">
          {subtitle}
        </div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
          trend.isPositive 
            ? 'text-primary bg-primary/10 border border-primary/20' 
            : 'text-red-400 bg-red-500/10 border border-red-500/20'
        }`}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
    </div>
  );
}