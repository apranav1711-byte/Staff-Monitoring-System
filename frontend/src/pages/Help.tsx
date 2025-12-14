import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRealtimeData } from '@/hooks/useRealtimeData';

const Help = () => {
    const { isOnline, lastUpdate, refetch } = useRealtimeData();

    return (
        <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Help & Documentation</h2>
                    <p className="text-muted-foreground">Guides and FAQs for the Staff Monitoring System.</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Definitions</CardTitle>
                            <CardDescription>Understanding the different staff statuses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <h3 className="font-semibold">Working</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Staff is present (Phone on pad) AND motion is detected.
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <h3 className="font-semibold">Idle</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Staff is present (Phone on pad) but NO motion is detected.
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <h3 className="font-semibold">Present</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Staff is present (Phone on pad).
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <h3 className="font-semibold">Not Working / Absent</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Staff is absent (Phone removed from pad).
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How do I connect the ESP32?</AccordionTrigger>
                                    <AccordionContent>
                                        Ensure the ESP32 is powered on and connected to the same WiFi network as your computer. The system uses a static IP (10.208.80.200) to communicate.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>What if the status shows "Offline"?</AccordionTrigger>
                                    <AccordionContent>
                                        Check your network connection. Ensure your computer is connected to the "Pi(10)" network. Try refreshing the page or restarting the ESP32.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How is motion detected?</AccordionTrigger>
                                    <AccordionContent>
                                        The system uses a PIR (Passive Infrared) sensor to detect motion at the desk. It has a timeout period to prevent flickering statuses.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Help;
