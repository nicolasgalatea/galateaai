import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Activity } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isTyping: boolean;
  onReconnect: () => void;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isTyping,
  onReconnect,
  className = ""
}) => {
  if (isTyping) {
    return (
      <Badge variant="secondary" className={`${className} bg-blue-100 text-blue-800`}>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
        Escribiendo...
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="secondary" className={`${className} bg-green-100 text-green-800`}>
        <Activity className="w-3 h-3 mr-1" />
        En línea
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        <WifiOff className="w-3 h-3 mr-1" />
        Desconectado
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReconnect}
        className="h-6 px-2 text-xs"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Reconectar
      </Button>
    </div>
  );
};