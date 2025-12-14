import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRealtimeData } from '@/hooks/useRealtimeData';

const Settings = () => {
  const { isOnline, lastUpdate, refetch } = useRealtimeData();

  return (
    <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your application preferences.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the interface.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for staff activity.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Settings</CardTitle>
              <CardDescription>Configure connection to ESP32 device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>ESP32 IP Address</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 rounded border bg-muted font-mono text-sm">
                    {import.meta.env.VITE_ESP32_BASE_URL || 'http://10.208.80.200'}
                  </code>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defined in .env file. Restart application to apply changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
