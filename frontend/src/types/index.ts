export interface Staff {
  id: string;
  name: string;
  department: string;
  seatNumber?: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'present' | 'absent' | 'working' | 'idle' | 'not_working';
  lastNFCScan: string | null;
  motionActivity: boolean;
  totalWorkingTime: string;
}

export interface NFCScanEvent {
  event: 'NFC';
  staff_id: string;
  staff_name: string;
  timestamp: string;
  status: 'Logged In' | 'Started Work' | 'Break' | 'Logged Out' | 'Working' | 'Idle' | 'Absent' | 'Present' | 'Not Working';
}

export interface MotionEvent {
  event: 'MOTION';
  motion: boolean;
  location: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  type: 'NFC' | 'MOTION';
  staffId: string;
  staffName: string;
  description: string;
  location?: string;
}

export interface RoomStatus {
  location: string;
  occupied: boolean;
  lastMovement: string;
  motionCount: number;
}
