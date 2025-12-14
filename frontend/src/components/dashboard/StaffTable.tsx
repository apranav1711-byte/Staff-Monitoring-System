import { motion } from 'framer-motion';
import { Users, Activity, Clock, ChevronRight } from 'lucide-react';
import { Staff } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StaffTableProps {
  staff: Staff[];
  onSelectStaff: (staff: Staff) => void;
  compact?: boolean;
}

const statusConfig = {
  present: { label: 'Present', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  absent: { label: 'Not Working', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  working: { label: 'Working', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
  idle: { label: 'Idle', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  not_working: { label: 'Not Working', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
};

export const StaffTable = ({ staff, onSelectStaff, compact = false }: StaffTableProps) => {
  const displayStaff = compact ? staff.slice(0, 5) : staff;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Users className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Staff Directory</h3>
            <p className="text-xs text-muted-foreground">{staff.length} members</p>
          </div>
        </div>
        {compact && (
          <a href="/staff" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Staff</TableHead>
              <TableHead className="text-muted-foreground">Department</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Last NFC Scan</TableHead>
              <TableHead className="text-muted-foreground">Motion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStaff.map((member, index) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="table-row-hover border-border"
                onClick={() => onSelectStaff(member)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{member.department}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex px-2.5 py-1 rounded-full text-xs font-medium border',
                      statusConfig[member.status].color
                    )}
                  >
                    {statusConfig[member.status].label}
                  </span>
                </TableCell>
                <TableCell>
                  {member.lastNFCScan ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{member.lastNFCScan.split(' ')[1]}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'status-dot',
                        member.motionActivity ? 'status-motion' : 'status-offline'
                      )}
                    />
                    <span className={cn(
                      'text-xs',
                      member.motionActivity ? 'text-accent' : 'text-muted-foreground'
                    )}>
                      {member.motionActivity ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
