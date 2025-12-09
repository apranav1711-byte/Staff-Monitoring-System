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
    refetch
  } =
    useRealtimeData(2000);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  if (isLoading) {
    return (
      <Layout lastUpdate={new Date()} onRefresh={() => {}} isOnline={isOnline}>
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

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        {/* Stats Row */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <LiveNFCScan scan={latestScan} />
          <RoomActivityPanel rooms={roomStatuses} />
        </div>

        {/* Staff & Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StaffTable staff={staff} onSelectStaff={setSelectedStaff} compact />
          </div>
          <ActivityLog logs={logs} compact />
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
