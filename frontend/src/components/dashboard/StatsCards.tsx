import { motion } from 'framer-motion';
import { Users, UserCheck, Briefcase, AlertCircle, Nfc, Activity } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalStaff: number;
    presentStaff: number;
    workingStaff: number;
    absentStaff: number;
    todayScans: number;
    todayMotions: number;
  };
}

const statItems = [
  {
    key: 'presentStaff',
    label: 'Present',
    icon: UserCheck,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    key: 'workingStaff',
    label: 'Working',
    icon: Briefcase,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'absentStaff',
    label: 'Absent',
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    key: 'todayScans',
    label: 'NFC Scans',
    icon: Nfc,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    key: 'todayMotions',
    label: 'Motions',
    icon: Activity,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats[item.key as keyof typeof stats]}
              </p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
