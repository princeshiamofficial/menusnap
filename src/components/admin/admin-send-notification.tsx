"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { io, Socket } from 'socket.io-client';
import { Send, Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminSendNotification() {
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:1234`
      : 'http://localhost:1234';

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });
    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to broadcast.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Emit to the server
    socket?.emit('admin-broadcast', {
      title: title || "Global Admin Alert",
      message: message,
      type: 'info'
    });

    // Simulate delay for feedback
    setTimeout(() => {
      setIsSending(false);
      setMessage('');
      setTitle('');
      toast({
        title: "Notification Sent",
        description: "Your message has been broadcast to all logged-in admins.",
      });
    }, 800);
  };

  return (
    <Card className="rounded-2xl border-0 bg-white/50 backdrop-blur-md shadow-lg overflow-hidden border border-white/20">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Broadcast Announcement</CardTitle>
            <CardDescription className="text-slate-500">Send a real-time popup to all active administrators.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Notification Title</label>
          <Input 
            placeholder="e.g. System Maintenance, New Order Alert" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/50 border-slate-200 focus-visible:ring-orange-500 rounded-xl max-w-md h-11"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Your Message</label>
          <Textarea 
            placeholder="Type your message here..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-white/50 border-slate-200 focus-visible:ring-orange-500 rounded-xl min-h-[100px] resize-none"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleSend}
            disabled={isSending}
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {isSending ? "Broadcasting..." : "Send Notification"}
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              setTitle("System Maintenance");
              setMessage("The system will be undergoing scheduled maintenance shortly. Please save your work to avoid any data loss.");
            }}
            className="w-full sm:w-auto px-6 h-12 rounded-xl border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 font-semibold transition-all"
          >
            System Maintenance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
