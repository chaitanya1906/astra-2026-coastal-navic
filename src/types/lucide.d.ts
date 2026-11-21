declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;

  export const Globe: Icon;
  export const Waves: Icon;
  export const Satellite: Icon;
  export const Radio: Icon;
  export const Signal: Icon;
  export const SignalZero: Icon;
  export const ShieldAlert: Icon;
  export const AlertTriangle: Icon;
  export const Users: Icon;
  export const Navigation: Icon;
  export const MapPin: Icon;
  export const Send: Icon;
  export const Eye: Icon;
  export const Play: Icon;
  export const Pause: Icon;
  export const RotateCcw: Icon;
  export const CheckCircle2: Icon;
  export const XCircle: Icon;
  export const HelpCircle: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronRight: Icon;
  export const ChevronLeft: Icon;
  export const LifeBuoy: Icon;
  export const WifiOff: Icon;
  export const Wifi: Icon;
  export const Smartphone: Icon;
  export const Info: Icon;
  export const ShieldCheck: Icon;
  export const MousePointer: Icon;
  export const Compass: Icon;
  export const Cpu: Icon;
  export const Search: Icon;
  export const Activity: Icon;
  export const Layers: Icon;
  export const Zap: Icon;
  export const Anchor: Icon;
  export const TrendingUp: Icon;
  export const SlidersHorizontal: Icon;
}
