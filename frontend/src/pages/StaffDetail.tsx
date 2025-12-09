import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone, Mail, ArrowLeft, Zap, Nfc } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatSecs = (secs: number) => {
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
};

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    staff,
    motionHistory,
    nfcHistory,
    padDurations,
    isOnline,
    lastUpdate,
    refetch,
  } = useRealtimeData(2000);

  const member = useMemo(() => staff.find((s) => s.id === id) ?? staff[0], [staff, id]);

  if (!member) {
    return (
      <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <p className="text-muted-foreground">No staff member found.</p>
        </div>
      </Layout>
    );
  }

  const filteredNfc = nfcHistory.slice(0, 20);
  const filteredMotion = motionHistory.slice(0, 20);

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-primary/20">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
              <p className="text-muted-foreground">{member.id}</p>
              {member.seatNumber && (
                <p className="text-sm text-muted-foreground mt-1">Seat: {member.seatNumber}</p>
              )}
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    member.status === 'present' && 'border-success text-success',
                    member.status === 'absent' && 'border-destructive text-destructive',
                    member.status === 'working' && 'border-primary text-primary'
                  )}
                >
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{member.department}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Current State</span>
              </div>
              <p className="text-lg font-semibold">
                {member.status === 'present' ? 'On Pad' : 'Off Pad'}
              </p>
              <p className="text-muted-foreground">Total: {member.totalWorkingTime}</p>
              <p className="text-muted-foreground">
                Pad On: {formatSecs(padDurations.onSeconds)} | Pad Off: {formatSecs(padDurations.offSeconds)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motion Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>{member.motionActivity ? 'Recent Motion' : 'No Recent Motion'}</span>
              </div>
              <p className="text-muted-foreground">
                Latest motion logs below show recent activity.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Nfc className="w-4 h-4 text-primary" />
                NFC Pad History
              </CardTitle>
              <span className="text-xs text-muted-foreground">Recent events</span>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin">
              {filteredNfc.length === 0 && (
                <p className="text-sm text-muted-foreground">No NFC events yet.</p>
              )}
              {filteredNfc.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{log.description}</span>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Motion History
              </CardTitle>
              <span className="text-xs text-muted-foreground">Recent events</span>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin">
              {filteredMotion.length === 0 && (
                <p className="text-sm text-muted-foreground">No motion events yet.</p>
              )}
              {filteredMotion.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{log.description}</span>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDetail;

