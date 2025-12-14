import { motion, AnimatePresence } from 'framer-motion';
import { Nfc, Clock, User, Fingerprint } from 'lucide-react';
import { NFCScanEvent } from '@/types';
import { cn } from '@/lib/utils';

interface LiveNFCScanProps {
  scan: NFCScanEvent | null;
}

const statusColors: Record<string, string> = {
  'Logged In': 'bg-success/20 text-success border-success/30',
  'Started Work': 'bg-primary/20 text-primary border-primary/30',
  'Break': 'bg-warning/20 text-warning border-warning/30',
  'Logged Out': 'bg-muted text-muted-foreground border-muted-foreground/30',
  // New statuses
  'Working': 'bg-green-500/20 text-green-500 border-green-500/30',
  'Idle': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  'Absent': 'bg-red-500/20 text-red-500 border-red-500/30',
  'Present': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  'Not Working': 'bg-red-500/20 text-red-500 border-red-500/30',
};

export const LiveNFCScan = ({ scan }: LiveNFCScanProps) => {
  return (
    <div className="glass-card gradient-border p-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Pulse effect */}
      <motion.div
        className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Nfc className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Latest NFC Scan</h3>
            <p className="text-sm text-muted-foreground">Real-time tap detection</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {scan ? (
            <motion.div
              key="scan-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">{scan.staff_name}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fingerprint className="w-4 h-4" />
                    <span className="text-sm">{scan.staff_id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Scan Time</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{scan.timestamp}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <span
                    className={cn(
                      'inline-flex px-3 py-1 rounded-full text-sm font-medium border',
                      statusColors[scan.status] || statusColors['Logged In']
                    )}
                  >
                    {scan.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Nfc className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Waiting for NFC scan...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
