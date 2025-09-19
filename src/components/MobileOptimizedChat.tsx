import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Upload, 
  Wifi, 
  WifiOff,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { useState } from 'react';

interface MobileHeaderProps {
  isConnected: boolean;
  isTyping: boolean;
  onVitalSigns: () => void;
  onFileUpload: () => void;
  onReconnect: () => void;
  sofiaAvatar: string;
  doctorName?: string;
}

export const MobileOptimizedHeader: React.FC<MobileHeaderProps> = ({
  isConnected,
  isTyping,
  onVitalSigns,
  onFileUpload,
  onReconnect,
  sofiaAvatar,
  doctorName
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="lg:hidden">
      <Card className="mb-4">
        <div className="p-4">
          {/* Main Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-red-200">
                  <AvatarImage src={sofiaAvatar} alt="Dra. Sofía" />
                  <AvatarFallback className="bg-red-100 text-red-700 text-sm">DS</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
              
              <div>
                <h2 className="font-bold text-lg">Dra. Sofía</h2>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                    <Heart className="w-2 h-2 mr-1" />
                    Cardióloga
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              {showActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isTyping ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-600">Escribiendo...</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Desconectado</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReconnect}
                    className="p-1 h-6 w-6 ml-2"
                  >
                    <Activity className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
            
            {doctorName && (
              <span className="text-muted-foreground text-xs">Dr. {doctorName}</span>
            )}
          </div>

          {/* Collapsible Actions */}
          {showActions && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onVitalSigns}
                  className="flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Vitales</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFileUpload}
                  className="flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

interface MobileChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceRecord: () => void;
  disabled: boolean;
  isConnected: boolean;
}

export const MobileChatInput: React.FC<MobileChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceRecord,
  disabled,
  isConnected
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Describa los síntomas..."
              disabled={disabled || !isConnected}
              className="w-full p-3 border rounded-lg resize-none min-h-[44px] max-h-32 text-sm"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <Button
              onClick={onVoiceRecord}
              disabled={disabled || !isConnected}
              size="sm"
              variant="outline"
              className="w-10 h-10 p-0"
            >
              <Activity className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={onSubmit}
              disabled={!value.trim() || disabled || !isConnected}
              size="sm"
              className="w-10 h-10 p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {!isConnected && (
          <div className="mt-2 text-center">
            <Badge variant="destructive" className="text-xs">
              Sin conexión - Los mensajes no se enviarán
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};