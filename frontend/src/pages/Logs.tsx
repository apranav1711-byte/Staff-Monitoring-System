import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Search, Filter, Nfc, Activity, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Logs = () => {
  const { logs, lastUpdate, isOnline, refetch } = useRealtimeData(2000);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Time', 'Type', 'Staff ID', 'Staff Name', 'Description', 'Location'].join(','),
      ...filteredLogs.map((log) =>
        [log.time, log.type, log.staffId, log.staffName, log.description, log.location || ''].join(
          ','
        )
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground">
              Complete history of NFC scans and motion events
            </p>
          </div>
          <Button onClick={exportLogs} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50 border-border"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="NFC">NFC Scans</SelectItem>
                <SelectItem value="MOTION">Motion</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} events
        </p>

        {/* Logs Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground w-[180px]">Time</TableHead>
                  <TableHead className="text-muted-foreground w-[100px]">Type</TableHead>
                  <TableHead className="text-muted-foreground w-[120px]">Staff ID</TableHead>
                  <TableHead className="text-muted-foreground">Staff Name</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="table-row-hover border-border"
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.time}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          log.type === 'NFC'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-accent/20 text-accent'
                        )}
                      >
                        {log.type === 'NFC' ? (
                          <Nfc className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        {log.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-foreground">
                      {log.staffId}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{log.staffName}</TableCell>
                    <TableCell className="text-muted-foreground">{log.description}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Logs;
