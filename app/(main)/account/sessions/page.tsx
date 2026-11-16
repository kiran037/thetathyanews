
///app/(main)/account/sessions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastActivityAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/account/sessions");
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);

    try {
      const response = await fetch(`/api/account/sessions?id=${sessionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      await fetchSessions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTerminating(null);
    }
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android")) return Smartphone;
    if (ua.includes("tablet") || ua.includes("ipad")) return Tablet;
    return Monitor;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Active Sessions</h2>
        <p className="text-muted-foreground">
          Manage your active sessions across devices
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.userAgent);

          return (
            <div
              key={session.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    session.isCurrent ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <DeviceIcon className={`h-5 w-5 ${
                      session.isCurrent ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {session.deviceName || session.userAgent || "Unknown Device"}
                      </h4>
                      {session.isCurrent && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.ipAddress} • Last active {new Date(session.lastActivityAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                    disabled={terminating === session.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {terminating === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No active sessions found
          </div>
        )}
      </div>
    </div>
  );
}