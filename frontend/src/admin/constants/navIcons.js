import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  ChevronRight,
  ExternalLink,
  Star,
  RefreshCw,
  Car,
  MapPin,
  Ship,
  Mail,
  UserCircle,
  ChevronUp,
} from 'lucide-react';

/** Mapa centralizado icono → componente Lucide */
export const NAV_ICON_MAP = {
  LayoutDashboard,
  ExternalLink,
  Users,
  ClipboardList,
  Ship,
  Star,
  MapPin,
  Car,
  RefreshCw,
  Mail,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronUp,
};

export function getNavIcon(name, fallback = LayoutDashboard) {
  return NAV_ICON_MAP[name] || fallback;
}
