import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MonitorStatus {
  anomalies: number;
  systemsNormal: boolean;
  lastUpdated: Date;
}

const OperationsMonitor = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState<MonitorStatus>({
    anomalies: 0,
    systemsNormal: true,
    lastUpdated: new Date()
  });
  const [countdown, setCountdown] = useState(30);
  
  // Simulate real-time updates
  useEffect(() => {
    const generateRandomStatus = () => {
      const anomalies = Math.floor(Math.random() * 5);
      return {
        anomalies,
        systemsNormal: anomalies === 0,
        lastUpdated: new Date()
      };
    };
    
    // Initial status
    setStatus(generateRandomStatus());
    
    // Update status every 30 seconds
    const statusInterval = setInterval(() => {
      setStatus(generateRandomStatus());
      setCountdown(30);
    }, 30000);
    
    // Update countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(countdownInterval);
    };
  }, []);
  
  const handleRefresh = () => {
    setStatus({
      anomalies: Math.floor(Math.random() * 5),
      systemsNormal: Math.random() > 0.3,
      lastUpdated: new Date()
    });
    setCountdown(30);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`w-full bg-${status.systemsNormal ? 'green-50' : 'amber-50'} border-b border-${status.systemsNormal ? 'green-200' : 'amber-200'} py-2 px-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {status.systemsNormal ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="text-sm font-medium">
              {status.systemsNormal ? 'All Systems Normal' : 'Attention Required'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={status.anomalies > 0 ? "destructive" : "outline"}>
              {status.anomalies} {status.anomalies === 1 ? 'Anomaly' : 'Anomalies'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>{countdown}s</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OperationsMonitor;