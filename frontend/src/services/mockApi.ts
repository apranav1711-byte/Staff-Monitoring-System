import { Staff, NFCScanEvent, MotionEvent, ActivityLog, RoomStatus } from '@/types';

// Mock staff data
const staffMembers: Staff[] = [
  {
    id: 'EMP001',
    name: 'Sarah Chen',
    department: 'Engineering',
    email: 'sarah.chen@company.com',
    phone: '+1 555-0101',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'working',
    lastNFCScan: '2025-12-09 08:45:22',
    motionActivity: true,
    totalWorkingTime: '4h 32m',
  },
  {
    id: 'EMP002',
    name: 'Michael Rodriguez',
    department: 'Operations',
    email: 'michael.r@company.com',
    phone: '+1 555-0102',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    status: 'present',
    lastNFCScan: '2025-12-09 09:12:45',
    motionActivity: false,
    totalWorkingTime: '3h 15m',
  },
  {
    id: 'EMP003',
    name: 'Emily Watson',
    department: 'Research',
    email: 'emily.watson@company.com',
    phone: '+1 555-0103',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    status: 'working',
    lastNFCScan: '2025-12-09 07:58:10',
    motionActivity: true,
    totalWorkingTime: '5h 18m',
  },
  {
    id: 'EMP004',
    name: 'James Park',
    department: 'Security',
    email: 'james.park@company.com',
    phone: '+1 555-0104',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    status: 'absent',
    lastNFCScan: null,
    motionActivity: false,
    totalWorkingTime: '0h 0m',
  },
  {
    id: 'EMP005',
    name: 'Anna Kowalski',
    department: 'HR',
    email: 'anna.k@company.com',
    phone: '+1 555-0105',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    status: 'present',
    lastNFCScan: '2025-12-09 10:30:00',
    motionActivity: true,
    totalWorkingTime: '2h 45m',
  },
  {
    id: 'EMP006',
    name: 'David Kim',
    department: 'Engineering',
    email: 'david.kim@company.com',
    phone: '+1 555-0106',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'working',
    lastNFCScan: '2025-12-09 08:15:33',
    motionActivity: true,
    totalWorkingTime: '4h 58m',
  },
];

const locations = ['Lab 1', 'Lab 2', 'Office A', 'Office B', 'Meeting Room', 'Server Room'];
const statuses: NFCScanEvent['status'][] = ['Logged In', 'Started Work', 'Break', 'Logged Out'];

let activityLogs: ActivityLog[] = [
  {
    id: '1',
    time: '2025-12-09 11:30:15',
    type: 'NFC',
    staffId: 'EMP001',
    staffName: 'Sarah Chen',
    description: 'Started Work - Lab 1',
  },
  {
    id: '2',
    time: '2025-12-09 11:28:45',
    type: 'MOTION',
    staffId: 'EMP003',
    staffName: 'Emily Watson',
    description: 'Motion detected in Lab 2',
    location: 'Lab 2',
  },
  {
    id: '3',
    time: '2025-12-09 11:25:00',
    type: 'NFC',
    staffId: 'EMP005',
    staffName: 'Anna Kowalski',
    description: 'Logged In - Office A',
  },
  {
    id: '4',
    time: '2025-12-09 11:20:30',
    type: 'MOTION',
    staffId: 'EMP006',
    staffName: 'David Kim',
    description: 'Motion detected in Server Room',
    location: 'Server Room',
  },
  {
    id: '5',
    time: '2025-12-09 11:15:22',
    type: 'NFC',
    staffId: 'EMP002',
    staffName: 'Michael Rodriguez',
    description: 'Break - Meeting Room',
  },
];

let latestNFCScan: NFCScanEvent = {
  event: 'NFC',
  staff_id: 'EMP001',
  staff_name: 'Sarah Chen',
  timestamp: '2025-12-09 11:30:15',
  status: 'Started Work',
};

let roomStatuses: RoomStatus[] = [
  { location: 'Lab 1', occupied: true, lastMovement: '2025-12-09 11:30:45', motionCount: 24 },
  { location: 'Lab 2', occupied: true, lastMovement: '2025-12-09 11:28:45', motionCount: 18 },
  { location: 'Office A', occupied: false, lastMovement: '2025-12-09 10:45:00', motionCount: 8 },
  { location: 'Server Room', occupied: true, lastMovement: '2025-12-09 11:20:30', motionCount: 5 },
];

// Simulate random events
const generateRandomEvent = (): { nfc?: NFCScanEvent; motion?: MotionEvent; log?: ActivityLog } => {
  const random = Math.random();
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  
  if (random < 0.3) {
    // Generate NFC event
    const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const nfcEvent: NFCScanEvent = {
      event: 'NFC',
      staff_id: staff.id,
      staff_name: staff.name,
      timestamp,
      status,
    };
    
    const log: ActivityLog = {
      id: Date.now().toString(),
      time: timestamp,
      type: 'NFC',
      staffId: staff.id,
      staffName: staff.name,
      description: `${status} - ${location}`,
    };
    
    return { nfc: nfcEvent, log };
  } else if (random < 0.6) {
    // Generate motion event
    const location = locations[Math.floor(Math.random() * locations.length)];
    const staff = staffMembers.filter(s => s.status !== 'absent')[
      Math.floor(Math.random() * staffMembers.filter(s => s.status !== 'absent').length)
    ];
    
    const motionEvent: MotionEvent = {
      event: 'MOTION',
      motion: true,
      location,
      timestamp,
    };
    
    const log: ActivityLog = {
      id: Date.now().toString(),
      time: timestamp,
      type: 'MOTION',
      staffId: staff?.id || 'Unknown',
      staffName: staff?.name || 'Unknown',
      description: `Motion detected in ${location}`,
      location,
    };
    
    return { motion: motionEvent, log };
  }
  
  return {};
};

// API functions
export const api = {
  getLatestScan: async (): Promise<NFCScanEvent> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const event = generateRandomEvent();
    if (event.nfc) {
      latestNFCScan = event.nfc;
      if (event.log) {
        activityLogs = [event.log, ...activityLogs].slice(0, 50);
      }
    }
    return latestNFCScan;
  },

  getMotionStatus: async (): Promise<RoomStatus[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const event = generateRandomEvent();
    if (event.motion) {
      const roomIndex = roomStatuses.findIndex(r => r.location === event.motion!.location);
      if (roomIndex >= 0) {
        roomStatuses[roomIndex] = {
          ...roomStatuses[roomIndex],
          occupied: event.motion.motion,
          lastMovement: event.motion.timestamp,
          motionCount: roomStatuses[roomIndex].motionCount + 1,
        };
      }
      if (event.log) {
        activityLogs = [event.log, ...activityLogs].slice(0, 50);
      }
    }
    return roomStatuses;
  },

  getStaff: async (): Promise<Staff[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return staffMembers;
  },

  getStaffById: async (id: string): Promise<Staff | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return staffMembers.find(s => s.id === id);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return activityLogs;
  },

  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const presentCount = staffMembers.filter(s => s.status !== 'absent').length;
    const workingCount = staffMembers.filter(s => s.status === 'working').length;
    const activeRooms = roomStatuses.filter(r => r.occupied).length;
    
    return {
      totalStaff: staffMembers.length,
      presentStaff: presentCount,
      workingStaff: workingCount,
      absentStaff: staffMembers.length - presentCount,
      activeRooms,
      totalRooms: roomStatuses.length,
      todayScans: activityLogs.filter(l => l.type === 'NFC').length,
      todayMotions: activityLogs.filter(l => l.type === 'MOTION').length,
    };
  },
};
