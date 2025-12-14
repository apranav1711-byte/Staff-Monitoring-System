import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BotControlPanel } from '@/components/dashboard/BotControlPanel';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Bot } from 'lucide-react';

const Simulation = () => {
    const {
        bots,
        toggleBot,
        addBot,
        deleteBot,
        resetBot,
        isOnline,
        lastUpdate,
        refetch
    } = useRealtimeData(2000);

    return (
        <Layout lastUpdate={lastUpdate} onRefresh={refetch} isOnline={isOnline}>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Simulation Control</h1>
                        <p className="text-muted-foreground">Manage simulated staff activity</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <BotControlPanel
                        bots={bots}
                        onToggle={toggleBot}
                        onAdd={addBot}
                        onDelete={deleteBot}
                        onReset={resetBot}
                    />

                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4">Simulation Guide</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">1.</span>
                                <span>Toggle <strong>NFC</strong> to simulate a staff member placing their phone on the desk.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">2.</span>
                                <span>Toggle <strong>Motion</strong> to simulate movement at the desk.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">3.</span>
                                <span><strong>Working:</strong> NFC ON + Motion ON</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">4.</span>
                                <span><strong>Idle:</strong> NFC ON + Motion OFF</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-primary">5.</span>
                                <span><strong>Not Working:</strong> NFC OFF</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Simulation;
