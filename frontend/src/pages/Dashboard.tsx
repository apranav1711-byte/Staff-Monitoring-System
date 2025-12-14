import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LiveNFCScan } from '@/components/dashboard/LiveNFCScan';
import { RoomActivityPanel } from '@/components/dashboard/RoomActivityPanel';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { StaffTable } from '@/components/dashboard/StaffTable';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { StaffProfileModal } from '@/components/staff/StaffProfileModal';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Staff } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { BotControlPanel } from '@/components/dashboard/BotControlPanel';

const Dashboard = () => {
  const {
    latestScan,
    roomStatuses,
    staff,
    logs,
    motionHistory,
    nfcHistory,
    padDurations,
    stats,
    isLoading,
    isOnline,
    lastUpdate,
    refetch,
    bots,
    toggleBot
  } =
    useRealtimeData(2000);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  if (isLoading) {
    return (
      <Layout lastUpdate={new Date()} onRefresh={() => { }} isOnline={isOnline}>
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  const ESP32_BASE_URL = import.meta.env.VITE_ESP32_BASE_URL ?? 'http://10.244.230.50';

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        {/* Connection Diagnostic Alert */}
        {!isOnline && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>ESP32 Unreachable - Network Mismatch Detected</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Unable to connect to ESP32 at <code className="px-1.5 py-0.5 bg-destructive/20 rounded text-xs">{ESP32_BASE_URL}/status</code></p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3">
                <p className="font-semibold text-sm mb-2">⚠️ Network Connectivity Issue</p>
                <p className="text-sm mb-2">
                  Your ESP32 is on network <strong>10.244.230.x</strong> (connected to "Pi(10)" WiFi),
                  but connectivity tests are failing.
                </p>
                <p className="text-sm font-medium mb-2">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                  <li><strong>Verify you're on the same WiFi:</strong> Check your WiFi connection - it should be "Pi(10)"</li>
                  <li><strong>Check your IP address:</strong> Open Command Prompt and run <code className="px-1.5 py-0.5 bg-destructive/20 rounded text-xs">ipconfig</code></li>
                  <li><strong>Your IP should be in 10.244.230.x range</strong> - if it's not (e.g., 10.208.80.x), you're on a different network</li>
                  <li><strong>Disconnect and reconnect:</strong> Disconnect from WiFi, wait 5 seconds, then reconnect to "Pi(10)"</li>
                  <li><strong>Check AP Isolation:</strong> If your router has "AP Isolation" or "Client Isolation" enabled, disable it - this prevents devices from communicating</li>
                  <li><strong>Test ping:</strong> Run <code className="px-1.5 py-0.5 bg-destructive/20 rounded text-xs">ping 10.244.230.50</code> - you should get replies</li>
                  <li><strong>Check ESP32 Serial Monitor:</strong> After uploading the updated code, you'll see request logs when connections are attempted</li>
                  <li><strong>Try test endpoint:</strong> Open <code className="px-1.5 py-0.5 bg-destructive/20 rounded text-xs">http://10.244.230.50/test</code> in your browser</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  <strong>Note:</strong> If multiple access points have the same SSID "Pi(10)", make sure both devices connect to the same physical access point.
                </p>
              </div>
              <div className="text-sm space-y-1 mt-3">
                <p className="font-medium">Additional troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check ESP32 Serial Monitor - verify it shows "WiFi connected!" and IP: 10.244.230.50</li>
                  <li>If ping still fails after connecting to same WiFi, check Windows Firewall settings</li>
                  <li>Some routers have "AP Isolation" enabled - disable it if devices still can't communicate</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Row */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <LiveNFCScan scan={latestScan} />
              <RoomActivityPanel rooms={roomStatuses} />
            </div>
            <StaffTable staff={staff} onSelectStaff={setSelectedStaff} compact />
          </div>
          <div className="space-y-6">
            <ActivityLog logs={logs} compact />
          </div>
        </div>
      </div>

      {/* Staff Profile Modal */}
      <StaffProfileModal
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
        motionHistory={motionHistory}
        nfcHistory={nfcHistory}
        padDurations={padDurations}
      />
    </Layout>
  );
};

export default Dashboard;
