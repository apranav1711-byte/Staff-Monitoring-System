import { useState } from 'react';
import { Bot, Plus, Trash2, RotateCcw, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BotControlPanelProps {
    bots: {
        id: string;
        name: string;
        nfc: boolean;
        motion: boolean;
        avatar?: string;
    }[];
    onToggle: (id: string, type: 'nfc' | 'motion') => void;
    onAdd: (name: string, avatar: string) => void;
    onDelete: (id: string) => void;
    onReset: (id: string) => void;
}

export const BotControlPanel = ({ bots, onToggle, onAdd, onDelete, onReset }: BotControlPanelProps) => {
    const [newBotName, setNewBotName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('bottts'); // Default style
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddBot = () => {
        if (!newBotName.trim()) return;
        const seed = Math.random().toString(36).substring(7);
        const avatarUrl = `https://api.dicebear.com/7.x/${selectedAvatar}/svg?seed=${seed}`;
        onAdd(newBotName, avatarUrl);
        setNewBotName('');
        setIsDialogOpen(false);
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Bot Controls</h3>
                        <p className="text-xs text-muted-foreground">Simulate staff activity</p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Add Bot
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Bot</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Bot Name</Label>
                                <Input
                                    placeholder="e.g., Simulation Bot 6"
                                    value={newBotName}
                                    onChange={(e) => setNewBotName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Avatar Style</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['bottts', 'avataaars', 'micah'].map((style) => (
                                        <div
                                            key={style}
                                            className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center gap-2 ${selectedAvatar === style ? 'border-primary bg-primary/10' : 'border-border'}`}
                                            onClick={() => setSelectedAvatar(style)}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/${style}/svg?seed=preview`}
                                                className="w-12 h-12 rounded-full"
                                                alt={style}
                                            />
                                            <span className="text-xs capitalize">{style}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleAddBot} className="w-full">Create Bot</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {bots.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border group">
                        <div className="flex items-center gap-3">
                            <img
                                src={bot.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${bot.id}`}
                                alt={bot.name}
                                className="w-8 h-8 rounded-full bg-background"
                            />
                            <div>
                                <div className="text-sm font-medium">{bot.name}</div>
                                <div className="text-xs text-muted-foreground">{bot.id}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id={`nfc-${bot.id}`}
                                    checked={bot.nfc}
                                    onCheckedChange={() => onToggle(bot.id, 'nfc')}
                                />
                                <Label htmlFor={`nfc-${bot.id}`} className="text-xs text-muted-foreground">NFC</Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id={`motion-${bot.id}`}
                                    checked={bot.motion}
                                    onCheckedChange={() => onToggle(bot.id, 'motion')}
                                />
                                <Label htmlFor={`motion-${bot.id}`} className="text-xs text-muted-foreground">Motion</Label>
                            </div>

                            <div className="flex items-center gap-1 border-l pl-2 ml-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => onReset(bot.id)}
                                    title="Reset Activity"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                    onClick={() => onDelete(bot.id)}
                                    title="Delete Bot"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
