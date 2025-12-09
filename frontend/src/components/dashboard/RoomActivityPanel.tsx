import { motion } from 'framer-motion';
import { Activity, MapPin, Clock, Zap } from 'lucide-react';
import { RoomStatus } from '@/types';
import { cn } from '@/lib/utils';

interface RoomActivityPanelProps {
  rooms: RoomStatus[];
}

export const RoomActivityPanel = ({ rooms }: RoomActivityPanelProps) => {
  const occupiedRooms = rooms.filter(r => r.occupied).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center glow-accent">
            <Activity className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Room Activity</h3>
            <p className="text-sm text-muted-foreground">PIR Motion Detection</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{occupiedRooms}/{rooms.length}</p>
          <p className="text-xs text-muted-foreground">Active Rooms</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rooms.map((room, index) => (
          <motion.div
            key={room.location}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'rounded-lg p-4 border transition-all duration-300',
              room.occupied
                ? 'bg-accent/10 border-accent/30'
                : 'bg-secondary/30 border-border/50'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className={cn(
                  'w-4 h-4',
                  room.occupied ? 'text-accent' : 'text-muted-foreground'
                )} />
                <span className="text-sm font-medium text-foreground">{room.location}</span>
              </div>
              <div className={cn(
                'status-dot',
                room.occupied ? 'status-motion' : 'status-offline'
              )} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className={cn(
                  'w-3 h-3',
                  room.occupied ? 'text-accent' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  room.occupied ? 'text-accent' : 'text-muted-foreground'
                )}>
                  {room.occupied ? 'OCCUPIED' : 'NO MOTION'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{room.lastMovement.split(' ')[1]}</span>
              </div>
            </div>

            {room.occupied && (
              <motion.div
                className="mt-2 h-1 bg-accent/20 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
              >
                <motion.div
                  className="h-full bg-accent rounded-full"
                  animate={{ width: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
