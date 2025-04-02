"use client";

import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/components/ui/tooltip';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'failed';
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  retryCount,
  maxRetries,
  onRetry
}) => {
  // Connected state - show subtle green indicator
  if (status === 'connected') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-green-500 px-2 py-1 bg-green-500/10 rounded-full">
              <Wifi className="h-3.5 w-3.5" />
              <span>Connected</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Real-time connection is active</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Connecting state - show spinner
  if (status === 'connecting') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded-full">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Connecting...</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Establishing connection to server</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Disconnected state - show reconnection attempts
  if (status === 'disconnected') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded-full">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Reconnecting {retryCount}/{maxRetries}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Connection lost. Automatically attempting to reconnect.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Failed state - show retry button
  return (
    <div className="flex items-center gap-2 text-xs">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-red-500 px-2 py-1 bg-red-500/10 rounded-full">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Connection failed</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Unable to connect after multiple attempts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button 
        variant="secondary" 
        size="sm" 
        className="h-7 px-2 text-xs rounded-full"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
};

export default ConnectionStatus; 