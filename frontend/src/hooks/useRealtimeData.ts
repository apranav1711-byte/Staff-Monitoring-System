import { useState, useEffect, useCallback, useRef } from 'react';
import { Staff, NFCScanEvent, ActivityLog, RoomStatus } from '@/types';

// Single-device ESP32 endpoint (static IP configured on the board)
// Updated default to your 10.244.230.x network; override with VITE_ESP32_BASE_URL if needed.
const ESP32_BASE_URL = import.meta.env.VITE_ESP32_BASE_URL ?? 'http://10.244.230.50';
const BACKEND_URL = 'http://localhost:3000';

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
    idleStaff: 0,
    notWorkingStaff: 0,
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

  // Bot State
  const [bots, setBots] = useState<any[]>([]);

  // Fetch initial bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/bots`);
        if (res.ok) {
          const data = await res.json();
          setBots(data);
        }
      } catch (error) {
        console.error('Failed to fetch bots:', error);
      }
    };
    fetchBots();
  }, []);

  const toggleBot = async (id: string, type: 'nfc' | 'motion') => {
    // Optimistic update
    const updatedBots = bots.map(bot => {
      if (bot.id === id) {
        return { ...bot, [type]: !bot[type] };
      }
      return bot;
    });
    setBots(updatedBots);

    // Sync to backend
    const botToUpdate = updatedBots.find(b => b.id === id);
    if (botToUpdate) {
      try {
        await fetch(`${BACKEND_URL}/api/bots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(botToUpdate),
        });
      } catch (error) {
        console.error('Failed to update bot:', error);
      }
    }
  };

  const addBot = async (name: string, avatar: string) => {
    const newId = `BOT-${Date.now()}`; // Simple ID generation
    const newBot = {
      id: newId,
      name,
      department: 'Simulation',
      nfc: false,
      motion: false,
      avatar,
    };

    setBots(prev => [...prev, newBot]);

    try {
      await fetch(`${BACKEND_URL}/api/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBot),
      });
    } catch (error) {
      console.error('Failed to add bot:', error);
    }
  };

  const deleteBot = async (id: string) => {
    setBots(prev => prev.filter(b => b.id !== id));
    try {
      await fetch(`${BACKEND_URL}/api/bots/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete bot:', error);
    }
  };

  const resetBot = async (id: string) => {
    const updatedBots = bots.map(bot => {
      if (bot.id === id) {
        return { ...bot, nfc: false, motion: false };
      }
      return bot;
    });
    setBots(updatedBots);

    const botToUpdate = updatedBots.find(b => b.id === id);
    if (botToUpdate) {
      try {
        await fetch(`${BACKEND_URL}/api/bots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(botToUpdate),
        });
      } catch (error) {
        console.error('Failed to reset bot:', error);
      }
    }
  };

  // Helper to sync staff status to backend
  const syncStaffToBackend = async (staffMember: Staff) => {
    try {
      await fetch(`${BACKEND_URL}/api/staff/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffMember),
      });
    } catch (error) {
      console.error('Failed to sync staff to backend:', error);
    }
  };

  // Helper to save log to backend
  const saveLogToBackend = async (log: ActivityLog) => {
    try {
      await fetch(`${BACKEND_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to save log to backend:', error);
    }
  };

  // Fetch initial history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/logs`);
        if (res.ok) {
          const history = await res.json();
          setLogs(history);
          logsRef.current = history;
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };
    fetchHistory();
  }, []);

  const markOffline = () => {
    setIsOnline(false);
    setLatestScan(null);
    setRoomStatuses([]);
    setStaff([]);
    setStats({
      totalStaff: 0,
      presentStaff: 0,
      workingStaff: 0,
      idleStaff: 0,
      notWorkingStaff: 0,
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
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch(`${ESP32_BASE_URL}/status`, {
        cache: 'no-store',
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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

      // Determine status based on user rules:
      // - Present: NFC ON
      // - Working: NFC ON + Motion
      // - Idle: NFC ON + No Motion
      // - Not Working: NFC OFF

      let computedStatus: Staff['status'] = 'not_working';
      if (phoneOnPad) {
        if (motionRecent) {
          computedStatus = 'working';
        } else {
          computedStatus = 'idle';
        }
      } else {
        computedStatus = 'not_working'; // "Not Working"
      }

      // Latest scan (single device). Update timestamp every fetch, status only on change.
      const stateChanged = prevPhoneOnPad.current === null || prevPhoneOnPad.current !== phoneOnPad;

      // Map computedStatus to NFCScanEvent status
      let scanStatus: NFCScanEvent['status'] = 'Absent';
      if (computedStatus === 'working') scanStatus = 'Working';
      else if (computedStatus === 'idle') scanStatus = 'Idle';
      else if (computedStatus === 'present') scanStatus = 'Present';
      else scanStatus = 'Not Working';

      setLatestScan(prev => ({
        event: 'NFC',
        staff_id: 'DEVICE-1',
        staff_name: 'ESP32 Pad',
        timestamp: nowStr,
        status: scanStatus,
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

      // computedStatus is already calculated above

      // Single staff/device presence
      const staffEntry: Staff = {
        id: 'DEVICE-1',
        name: 'ESP32 Pad',
        department: 'IoT',
        seatNumber: 'Seat 01',
        email: 'esp32@local',
        phone: 'N/A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ESP32',
        status: computedStatus,
        lastNFCScan: phoneAgo ? `${phoneAgo}s ago` : 'just now',
        motionActivity: motionRecent,
        totalWorkingTime: phoneOnPad ? 'active now' : 'inactive',
      };

      // Sync to backend if status changed
      if (stateChanged || (prevMotionRecent.current !== null && prevMotionRecent.current !== motionRecent)) {
        syncStaffToBackend(staffEntry);
      }

      // Convert Bots to Staff objects
      const botEntries: Staff[] = bots.map(bot => {
        let botStatus: Staff['status'] = 'not_working';
        if (bot.nfc) {
          if (bot.motion) {
            botStatus = 'working';
          } else {
            botStatus = 'idle';
          }
        } else {
          botStatus = 'not_working';
        }

        return {
          id: bot.id,
          name: bot.name,
          department: bot.department,
          seatNumber: 'Simulated',
          email: `${bot.id.toLowerCase()}@local`,
          phone: 'N/A',
          avatar: bot.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${bot.id}`,
          status: botStatus,
          lastNFCScan: bot.nfc ? 'active' : null,
          motionActivity: bot.motion,
          totalWorkingTime: bot.nfc ? 'active' : 'inactive',
        };
      });

      const allStaff = [staffEntry, ...botEntries];
      setStaff(allStaff);

      // Calculate Stats including Bots
      const totalStaffCount = allStaff.length;
      const presentCount = allStaff.filter(s => s.status !== 'not_working' && s.status !== 'absent').length;
      const workingCount = allStaff.filter(s => s.status === 'working').length;
      const idleCount = allStaff.filter(s => s.status === 'idle').length;
      const notWorkingCount = allStaff.filter(s => s.status === 'not_working' || s.status === 'absent').length;
      const activeRoomsCount = (motionRecent ? 1 : 0) + bots.filter(b => b.motion).length;

      setStats({
        totalStaff: totalStaffCount,
        presentStaff: presentCount,
        workingStaff: workingCount,
        idleStaff: idleCount,
        notWorkingStaff: notWorkingCount,
        absentStaff: notWorkingCount,
        activeRooms: activeRoomsCount,
        totalRooms: 1 + bots.length,
        todayScans: (phoneOnPad ? 1 : 0) + bots.filter(b => b.nfc).length, // simplified
        todayMotions: (motionRecent ? 1 : 0) + bots.filter(b => b.motion).length,
      });

      // Activity logs: append when state changes
      const newLogs: ActivityLog[] = [];
      if (prevPhoneOnPad.current !== null && prevPhoneOnPad.current !== phoneOnPad) {
        // Reset change anchor
        lastChangeMs.current = nowMs;
        const log: ActivityLog = {
          id: `${Date.now()}-phone`,
          time: nowStr,
          type: 'NFC',
          staffId: 'DEVICE-1',
          staffName: 'ESP32 Pad',
          description: phoneOnPad ? 'Phone/tag placed on pad' : 'Phone/tag removed from pad',
        };
        newLogs.push(log);
        saveLogToBackend(log);
      }
      if (prevMotionRecent.current !== null && prevMotionRecent.current !== motionRecent) {
        const log: ActivityLog = {
          id: `${Date.now()}-motion`,
          time: nowStr,
          type: 'MOTION',
          staffId: 'DEVICE-1',
          staffName: 'ESP32 Pad',
          description: motionRecent ? 'Recent motion detected' : 'No motion in last 10s',
          location: 'ESP32 Zone',
        };
        newLogs.push(log);
        saveLogToBackend(log);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const isNetworkError = errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('ERR_');

      console.error('Error fetching data from ESP32:', {
        error: errorMessage,
        url: `${ESP32_BASE_URL}/status`,
        isTimeout,
        isNetworkError,
        timestamp: new Date().toISOString(),
      });

      // Provide more helpful error messages
      if (isTimeout) {
        console.warn(`⚠️ Request to ESP32 timed out after 5 seconds. Check if ESP32 is reachable at ${ESP32_BASE_URL}`);
      } else if (isNetworkError) {
        console.warn(`⚠️ Network error connecting to ESP32 at ${ESP32_BASE_URL}. Possible causes:`);
        console.warn('  1. ESP32 is not on the same network as this computer');
        console.warn('  2. ESP32 static IP might be incorrect (check Serial Monitor)');
        console.warn('  3. Windows Firewall might be blocking the connection');
        console.warn('  4. ESP32 might not be connected to WiFi');
      }

      markOffline();
      setLastUpdate(new Date());
      setIsLoading(false);
    }
  }, [bots]); // Add bots to dependency array so changes trigger re-calc

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
    bots,
    toggleBot,
    addBot,
    deleteBot,
    resetBot,
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
