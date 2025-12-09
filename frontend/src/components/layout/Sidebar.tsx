import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Wifi,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOnline: boolean;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staff', label: 'Staff', icon: Users },
  { path: '/logs', label: 'Activity Logs', icon: FileText },
];

export const Sidebar = ({ isOnline }: SidebarProps) => {
  const location = useLocation();
  const statusColor = isOnline ? 'text-success' : 'text-destructive';
  const statusBg = isOnline ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20';
  const statusText = isOnline ? 'System Online' : 'System Offline';
  const statusSub = isOnline ? 'ESP32 Connected' : 'ESP32 Unreachable';
  const StatusIcon = isOnline ? Wifi : AlertTriangle;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">IoT Monitor</h1>
          <p className="text-xs text-muted-foreground">Staff Tracking System</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`px-4 py-3 mx-4 mt-4 rounded-lg ${statusBg}`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{statusSub}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className="nav-item text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>
        <div className="mt-3 px-4 text-xs text-muted-foreground">
          v1.0.0 • ESP32 + PN532
        </div>
      </div>
    </aside>
  );
};
