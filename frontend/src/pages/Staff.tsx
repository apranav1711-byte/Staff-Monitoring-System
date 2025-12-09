import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StaffTable } from '@/components/dashboard/StaffTable';
import { StaffProfileModal } from '@/components/staff/StaffProfileModal';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Staff as StaffType } from '@/types';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Staff = () => {
  const navigate = useNavigate();
  const { staff, lastUpdate, isOnline, refetch, motionHistory, nfcHistory, padDurations } = useRealtimeData(5000);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = [...new Set(staff.map((s) => s.department))];

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || member.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Directory</h1>
          <p className="text-muted-foreground">
            Manage and monitor all staff members
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredStaff.length} of {staff.length} staff members
        </p>

        {/* Staff Table */}
        <StaffTable
          staff={filteredStaff}
          onSelectStaff={(member) => {
            setSelectedStaff(member);
            navigate(`/staff/${member.id}`);
          }}
        />
      </div>

      {/* Staff Profile Modal */}
      <StaffProfileModal
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
        motionHistory={motionHistory}
        nfcHistory={nfcHistory}
        padDurations={padDurations}
      />
    </Layout>
  );
};

export default Staff;
