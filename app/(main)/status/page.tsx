///app/(main)/status/page.tsx
import { CheckCircle2, XCircle, AlertCircle, Activity, Clock } from "lucide-react";

export const metadata = {
  title: "System Status - TheTathyaNews",
  description: "Real-time status of all TheTathyaNews services",
};

export const revalidate = 60; // Revalidate every minute

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime?: number;
  uptime?: string;
  lastChecked: Date;
}

async function checkSystemStatus(): Promise<ServiceStatus[]> {
  // In production, this would check actual services
  // For now, returning mock data
  return [
    {
      name: "Website",
      status: "operational",
      responseTime: 120,
      uptime: "99.99%",
      lastChecked: new Date(),
    },
    {
      name: "API",
      status: "operational",
      responseTime: 85,
      uptime: "99.98%",
      lastChecked: new Date(),
    },
    {
      name: "Database",
      status: "operational",
      responseTime: 45,
      uptime: "100%",
      lastChecked: new Date(),
    },
    {
      name: "CDN",
      status: "operational",
      responseTime: 30,
      uptime: "99.95%",
      lastChecked: new Date(),
    },
    {
      name: "Email Service",
      status: "operational",
      responseTime: 200,
      uptime: "99.90%",
      lastChecked: new Date(),
    },
    {
      name: "Search",
      status: "operational",
      responseTime: 150,
      uptime: "99.97%",
      lastChecked: new Date(),
    },
  ];
}

function getStatusIcon(status: ServiceStatus["status"]) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "down":
      return <XCircle className="h-5 w-5 text-destructive" />;
  }
}

function getStatusBadge(status: ServiceStatus["status"]) {
  switch (status) {
    case "operational":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Operational
        </span>
      );
    case "degraded":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
          <AlertCircle className="h-3 w-3" />
          Degraded
        </span>
      );
    case "down":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <XCircle className="h-3 w-3" />
          Down
        </span>
      );
  }
}

export default async function StatusPage() {
  const services = await checkSystemStatus();
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2">System Status</h1>
        <p className="text-muted-foreground">
          Real-time status and uptime monitoring for all services
        </p>
      </div>

      {/* Overall Status */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {allOperational ? "All Systems Operational" : "Service Issues Detected"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            allOperational ? "bg-green-500/10" : "bg-yellow-500/10"
          }`}>
            {allOperational ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Services</h2>
        
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <h3 className="font-semibold">{service.name}</h3>
                </div>
                {getStatusBadge(service.status)}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                {service.responseTime && (
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">{service.responseTime}ms</p>
                  </div>
                )}
                
                {service.uptime && (
                  <div>
                    <p className="text-muted-foreground">Uptime (30d)</p>
                    <p className="font-medium">{service.uptime}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-muted-foreground">Last Checked</p>
                  <p className="font-medium">
                    {service.lastChecked.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident History */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Incidents
        </h2>
        
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No incidents reported in the last 30 days</p>
            <p className="text-sm mt-1">All systems running smoothly!</p>
          </div>
        </div>
      </div>

      {/* Subscribe to Updates */}
      <div className="rounded-lg border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h3 className="font-semibold mb-2">Subscribe to Status Updates</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get notified when service status changes or incidents occur
        </p>
        
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="newsletter-input flex-1"
          />
          <button className="btn-primary px-6 py-2">
            Subscribe
          </button>
        </div>
      </div>

      {/* Auto-refresh Notice */}
      <p className="text-xs text-center text-muted-foreground">
        This page automatically refreshes every minute
      </p>
    </div>
  );
}