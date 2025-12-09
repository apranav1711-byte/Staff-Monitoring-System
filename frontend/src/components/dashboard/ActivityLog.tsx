import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Nfc, Activity, ChevronRight } from 'lucide-react';
import { ActivityLog as ActivityLogType } from '@/types';
import { cn } from '@/lib/utils';

interface ActivityLogProps {
  logs: ActivityLogType[];
  compact?: boolean;
}

export const ActivityLog = ({ logs, compact = false }: ActivityLogProps) => {
  const displayLogs = compact ? logs.slice(0, 8) : logs;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <FileText className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Activity Log</h3>
            <p className="text-xs text-muted-foreground">Real-time events</p>
          </div>
        </div>
        {compact && (
          <a href="/logs" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="divide-y divide-border max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {displayLogs.map((log, index) => (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    log.type === 'NFC' ? 'bg-primary/20' : 'bg-accent/20'
                  )}
                >
                  {log.type === 'NFC' ? (
                    <Nfc className="w-4 h-4 text-primary" />
                  ) : (
                    <Activity className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.staffName}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 px-2 py-0.5 rounded text-xs font-medium',
                        log.type === 'NFC'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-accent/20 text-accent'
                      )}
                    >
                      {log.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{log.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {displayLogs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
