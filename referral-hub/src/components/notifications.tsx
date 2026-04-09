"use client";

import { useState } from "react";
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  UserPlus,
  MessageSquare,
  MoreVertical,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "urgent" | "success" | "info" | "message" | "system";
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Urgent Referral",
    message: "New critical referral received from St. Paul Hospital for Pt. Sarah Chen.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    type: "urgent",
    isRead: false,
  },
  {
    id: "2",
    title: "Referral Accepted",
    message: "Your referral for Pt. John Doe (ID: #4401-CP) has been accepted by cardiology.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: "success",
    isRead: false,
  },
  {
    id: "3",
    title: "New Message",
    message: "Dr. Julian Vane added a comment to the referral log for Pt. Elena Ricci.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    type: "message",
    isRead: true,
  },
  {
    id: "4",
    title: "Appointment Fixed",
    message: "An appointment has been scheduled for Pt. Benny Kingston on Oct 25th.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    type: "info",
    isRead: true,
  },
  {
    id: "5",
    title: "Account Created",
    message: "New staff member account created for Marcus Aris (Liaison Officer).",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: "system",
    isRead: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "info":
      return <Calendar className="h-4 w-4 text-blue-600" />;
    case "message":
      return <MessageSquare className="h-4 w-4 text-indigo-600" />;
    default:
      return <Bell className="h-4 w-4 text-slate-600" />;
  }
};

const getNotificationBg = (type: Notification["type"]) => {
  switch (type) {
    case "urgent":
      return "bg-red-50 dark:bg-red-900/20";
    case "success":
      return "bg-green-50 dark:bg-green-900/20";
    case "info":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "message":
      return "bg-indigo-50 dark:bg-indigo-900/20";
    default:
      return "bg-slate-50 dark:bg-slate-900/20";
  }
};

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          
          <Card className="absolute right-0 mt-4 w-[380px] z-50 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">Notifications</CardTitle>
                <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold scale-90">
                  {unreadCount} NEW
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative flex items-start gap-4 p-5 transition-colors duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                    >
                      {!notification.isRead && (
                        <span className="absolute left-2 top-6 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                      
                      <div className={`mt-1 h-9 w-9 flex items-center justify-center rounded-xl shrink-0 ${getNotificationBg(notification.type)} shadow-sm`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-bold leading-none ${!notification.isRead ? 'text-slate-950 dark:text-slate-50' : 'text-slate-600 dark:text-slate-400'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${!notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <Link 
                  href="/referring-admin/notifications" 
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
                >
                  VIEW ALL NOTIFICATIONS
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
