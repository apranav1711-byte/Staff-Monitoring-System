import { useState, useEffect, useCallback, useRef } from 'react';
import { Staff, NFCScanEvent, ActivityLog, RoomStatus } from '@/types';

// Single-device ESP32 endpoint (static IP configured on the board)
// Updated default to your 10.244.230.x network; override with VITE_ESP32_BASE_URL if needed.
const ESP32_BASE_URL = import.meta.env.VITE_ESP32_BASE_URL ?? 'http://10.244.230.50';

export const useRealtimeData = (pollingInterval = 2000) => {
  const [latestScan, setLatestScan] = useState<NFCScanEvent | null>(null);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [padDurations, setPadDurations] = useState({ onSeconds: 0, offSeconds: 0 });
  const [stats, setStats] = useState({
    totalStaff: 0,
    presentStaff: 0,
    workingStaff: 0,
    absentStaff: 0,
    activeRooms: 0,
    totalRooms: 0,
    todayScans: 0,
    todayMotions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(false);
  const prevPhoneOnPad = useRef<boolean | null>(null);
  const prevMotionRecent = useRef<boolean | null>(null);
  const logsRef = useRef<ActivityLog[]>([]);
  const totalOnMs = useRef<number>(0);
  const totalOffMs = useRef<number>(0);
  const lastChangeMs = useRef<number | null>(null);

  const markOffline = () => {
    setIsOnline(false);
    setLatestScan(null);
    setRoomStatuses([]);
    setStaff([]);
    setStats({
      totalStaff: 0,
      presentStaff: 0,
      workingStaff: 0,
      absentStaff: 0,
      activeRooms: 0,
      totalRooms: 0,
      todayScans: 0,
      todayMotions: 0,
    });
    totalOnMs.current = 0;
    totalOffMs.current = 0;
    lastChangeMs.current = null;
    setPadDurations({ onSeconds: 0, offSeconds: 0 });
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    logsRef.current = [
      {
        id: `${Date.now()}-offline`,
        time: nowStr,
        type: 'NFC' as const,
        staffId: 'DEVICE-1',
        staffName: 'ESP32 Pad',
        description: 'ESP32 unreachable (offline)',
      },
      ...logsRef.current,
    ].slice(0, 50);
    setLogs(logsRef.current);
    prevPhoneOnPad.current = null;
    prevMotionRecent.current = null;
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${ESP32_BASE_URL}/status`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const phoneOnPad = Boolean(data.phoneOnPad);
      const phoneAgo = Number(data.lastPhoneChangeAgoSec ?? 0);
      const lastMotionAgo = Number(data.lastMotionAgoSec ?? 999999);
      const motionRecent = lastMotionAgo <= 10;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const nowMs = Date.now();

      // Track on/off durations
      if (lastChangeMs.current === null) {
        lastChangeMs.current = nowMs;
      }
      const elapsedSinceLast = nowMs - (lastChangeMs.current ?? nowMs);
      if (phoneOnPad) {
        totalOnMs.current += elapsedSinceLast;
      } else {
        totalOffMs.current += elapsedSinceLast;
      }
      // reset anchor for next tick
      lastChangeMs.current = nowMs;

      // Latest scan (single device). Update timestamp every fetch, status only on change.
      const stateChanged = prevPhoneOnPad.current === null || prevPhoneOnPad.current !== phoneOnPad;
      setLatestScan(prev => ({
        event: 'NFC',
        staff_id: 'DEVICE-1',
        staff_name: 'ESP32 Pad',
        timestamp: nowStr,
        status: stateChanged ? (phoneOnPad ? 'Logged In' : 'Logged Out') : (prev?.status ?? (phoneOnPad ? 'Logged In' : 'Logged Out')),
      }));

      // Room/motion status for a single zone
      setRoomStatuses([
        {
          location: 'ESP32 Zone',
          occupied: motionRecent,
          lastMovement: lastMotionAgo === 999999 ? 'No recent motion' : `${lastMotionAgo}s ago`,
          motionCount: motionRecent ? 1 : 0,
        },
      ]);

      // Single staff/device presence
      const staffEntry: Staff = {
        id: 'DEVICE-1',
        name: 'ESP32 Pad',
        department: 'IoT',
        seatNumber: 'Seat 01',
        email: 'esp32@local',
        phone: 'N/A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ESP32',
        status: phoneOnPad ? 'present' : 'absent',
        lastNFCScan: phoneAgo ? `${phoneAgo}s ago` : 'just now',
        motionActivity: motionRecent,
        totalWorkingTime: phoneOnPad ? 'active now' : 'inactive',
      };
      setStaff([staffEntry]);

      // Basic stats derived from single device
      setStats({
        totalStaff: 1,
        presentStaff: phoneOnPad ? 1 : 0,
        workingStaff: phoneOnPad ? 1 : 0,
        absentStaff: phoneOnPad ? 0 : 1,
        activeRooms: motionRecent ? 1 : 0,
        totalRooms: 1,
        todayScans: phoneOnPad ? 1 : 0,
        todayMotions: motionRecent ? 1 : 0,
      });

      // Activity logs: append when state changes
      const newLogs: ActivityLog[] = [];
      if (prevPhoneOnPad.current !== null && prevPhoneOnPad.current !== phoneOnPad) {
        // Reset change anchor
        lastChangeMs.current = nowMs;
        newLogs.push({
          id: `${Date.now()}-phone`,
          time: nowStr,
          type: 'NFC',
          staffId: 'DEVICE-1',
          staffName: 'ESP32 Pad',
          description: phoneOnPad ? 'Phone/tag placed on pad' : 'Phone/tag removed from pad',
        });
      }
      if (prevMotionRecent.current !== null && prevMotionRecent.current !== motionRecent) {
        newLogs.push({
          id: `${Date.now()}-motion`,
          time: nowStr,
          type: 'MOTION',
          staffId: 'DEVICE-1',
          staffName: 'ESP32 Pad',
          description: motionRecent ? 'Recent motion detected' : 'No motion in last 10s',
          location: 'ESP32 Zone',
        });
      }
      prevPhoneOnPad.current = phoneOnPad;
      prevMotionRecent.current = motionRecent;
      if (newLogs.length) {
        logsRef.current = [...newLogs, ...logsRef.current].slice(0, 50);
      }
      setLogs(logsRef.current);
      setPadDurations({
        onSeconds: Math.round(totalOnMs.current / 1000),
        offSeconds: Math.round(totalOffMs.current / 1000),
      });

      setIsOnline(true);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      markOffline();
      setLastUpdate(new Date());
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollingInterval]);

  return {
    latestScan,
    roomStatuses,
    staff,
    logs,
    motionHistory: logsRef.current.filter(log => log.type === 'MOTION'),
    nfcHistory: logsRef.current.filter(log => log.type === 'NFC'),
    padDurations,
    stats,
    isLoading,
    isOnline,
    lastUpdate,
    refetch: fetchData,
  };
};

export const useStaffDetail = (staffId: string | null) => {
  const [staffDetail, setStaffDetail] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!staffId) {
      setStaffDetail(null);
      return;
    }

    const fetchStaff = async () => {
      setIsLoading(true);
      // No per-staff details from backend; return the single device entry as-is.
      setStaffDetail({
        id: 'DEVICE-1',
        name: 'ESP32 Pad',
        department: 'IoT',
        email: 'esp32@local',
        phone: 'N/A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ESP32',
        status: 'present',
        lastNFCScan: null,
        motionActivity: false,
        totalWorkingTime: 'n/a',
      });
      setIsLoading(false);
    };

    fetchStaff();
  }, [staffId]);

  return { staffDetail, isLoading };
};
