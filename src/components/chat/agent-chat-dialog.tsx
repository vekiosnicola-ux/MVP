
'use client';

import * as React from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AgentChatDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated?: () => void;
}

export function AgentChatDialog({ isOpen, onClose, onTaskCreated }: AgentChatDialogProps) {
    const [messages, setMessages] = React.useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am Aura. What task would you like to build today?' }
    ]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Auto-scroll to bottom
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    React.useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/agent/interact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await response.json();

            if (data.task) {
                // Extract title from description (format: "Title: X\n\nDescription")
                const desc = data.task.description || '';
                const titleMatch = desc.match(/^Title:\s*(.+?)(?:\n|$)/);
                const title = titleMatch ? titleMatch[1] : desc.slice(0, 50);

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `I've created a new task: "${title}". You can see it on the board.`
                }]);
                if (onTaskCreated) onTaskCreated();
            } else if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'I am sorry, I could not understand that request.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl border-accent-primary/20 bg-background/95 backdrop-blur-xl overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
                    <div className="flex items-center gap-2 text-accent-primary">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="font-semibold">Talk to Aura</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-accent-danger/10 hover:text-accent-danger">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user'
                                    ? 'bg-accent-primary text-white'
                                    : 'bg-accent-secondary/20 text-accent-secondary'
                                    }`}
                            >
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div
                                className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-accent-primary text-white'
                                    : 'bg-muted text-text-primary border border-border'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-secondary/20 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 animate-pulse" />
                            </div>
                            <div className="bg-muted rounded-2xl px-4 py-2 text-sm text-text-secondary italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe a new task..."
                            className="flex-1 bg-background/50 focus-visible:ring-accent-primary"
                            disabled={loading}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || !input.trim()}
                            className="bg-accent-primary hover:bg-accent-primary/90 text-white shadow-lg shadow-accent-primary/20 h-10 w-10 p-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
