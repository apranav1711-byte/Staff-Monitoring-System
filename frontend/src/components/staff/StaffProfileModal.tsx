import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Clock, Briefcase, MapPin, Activity, Zap, Nfc } from 'lucide-react';
import { Staff, ActivityLog } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StaffProfileModalProps {
  staff: Staff | null;
  onClose: () => void;
  motionHistory: ActivityLog[];
  nfcHistory: ActivityLog[];
  padDurations: { onSeconds: number; offSeconds: number };
}

const statusConfig = {
  present: { label: 'Present', color: 'bg-success/20 text-success border-success/30' },
  absent: { label: 'Absent', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  working: { label: 'Working', color: 'bg-primary/20 text-primary border-primary/30' },
};

export const StaffProfileModal = ({ staff, onClose, motionHistory, nfcHistory, padDurations }: StaffProfileModalProps) => {
  if (!staff) return null;

  const formatSecs = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="glass-card gradient-border w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-0">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={staff.avatar} />
                <AvatarFallback className="text-2xl">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold text-foreground">{staff.name}</h2>
              <p className="text-muted-foreground">{staff.id}</p>
              {staff.seatNumber && (
                <p className="text-xs text-muted-foreground mt-1">Seat: {staff.seatNumber}</p>
              )}
              <span
                className={cn(
                  'mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium border',
                  statusConfig[staff.status].color
                )}
              >
                {statusConfig[staff.status].label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Working Time</span>
              </div>
              <p className="text-lg font-bold text-foreground">{staff.totalWorkingTime}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Motion Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'status-dot',
                    staff.motionActivity ? 'status-motion' : 'status-offline'
                  )}
                />
                <span className={cn(
                  'text-sm font-medium',
                  staff.motionActivity ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {staff.motionActivity ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium text-foreground">{staff.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{staff.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">{staff.phone}</p>
              </div>
            </div>
            {staff.lastNFCScan && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last NFC Scan</p>
                  <p className="text-sm font-medium text-foreground">{staff.lastNFCScan}</p>
                </div>
              </div>
            )}

            {/* NFC / Motion history */}
            <div className="grid gap-3">
              <div className="bg-secondary/40 rounded-lg p-4 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Nfc className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">NFC Pad Time</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    On: {formatSecs(padDurations.onSeconds)} • Off: {formatSecs(padDurations.offSeconds)}
                  </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                  {nfcHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground">No NFC events yet.</p>
                  )}
                  {nfcHistory.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm bg-background/40 rounded-md px-2 py-1">
                      <span className="text-foreground">{log.description}</span>
                      <span className="text-xs text-muted-foreground">{log.time.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/40 rounded-lg p-4 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">Motion History</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Recent motion events</div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                  {motionHistory.length === 0 && (
                    <p className="text-xs text-muted-foreground">No motion events yet.</p>
                  )}
                  {motionHistory.slice(0, 8).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm bg-background/40 rounded-md px-2 py-1">
                      <span className="text-foreground">{log.description}</span>
                      <span className="text-xs text-muted-foreground">{log.time.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
