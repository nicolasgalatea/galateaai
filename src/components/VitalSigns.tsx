import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Gauge,
  Plus,
  Save
} from 'lucide-react';

interface VitalSign {
  name: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
}

interface VitalSignsProps {
  onVitalSignsUpdate?: (vitals: VitalSign[]) => void;
  className?: string;
}

const defaultVitals: VitalSign[] = [
  {
    name: 'Presión Arterial',
    value: '',
    unit: 'mmHg',
    icon: Heart,
    normalRange: '120/80',
    status: 'normal'
  },
  {
    name: 'Frecuencia Cardíaca',
    value: '',
    unit: 'lpm',
    icon: Activity,
    normalRange: '60-100',
    status: 'normal'
  },
  {
    name: 'Temperatura',
    value: '',
    unit: '°C',
    icon: Thermometer,
    normalRange: '36.1-37.2',
    status: 'normal'
  },
  {
    name: 'Saturación O2',
    value: '',
    unit: '%',
    icon: Gauge,
    normalRange: '95-100',
    status: 'normal'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'bg-green-100 text-green-800 border-green-200';
    case 'abnormal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const evaluateVitalSign = (name: string, value: string): 'normal' | 'abnormal' | 'critical' => {
  if (!value) return 'normal';
  
  const numValue = parseFloat(value);
  
  switch (name) {
    case 'Frecuencia Cardíaca':
      if (numValue < 50 || numValue > 120) return 'critical';
      if (numValue < 60 || numValue > 100) return 'abnormal';
      return 'normal';
    
    case 'Temperatura':
      if (numValue < 35 || numValue > 39) return 'critical';
      if (numValue < 36.1 || numValue > 37.2) return 'abnormal';
      return 'normal';
    
    case 'Saturación O2':
      if (numValue < 90) return 'critical';
      if (numValue < 95) return 'abnormal';
      return 'normal';
    
    default:
      return 'normal';
  }
};

export const VitalSigns: React.FC<VitalSignsProps> = ({ 
  onVitalSignsUpdate, 
  className 
}) => {
  const [vitals, setVitals] = useState<VitalSign[]>(defaultVitals);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateVital = (index: number, value: string) => {
    const newVitals = [...vitals];
    newVitals[index] = {
      ...newVitals[index],
      value,
      status: evaluateVitalSign(newVitals[index].name, value)
    };
    setVitals(newVitals);
  };

  const handleSave = () => {
    if (onVitalSignsUpdate) {
      onVitalSignsUpdate(vitals);
    }
    setIsExpanded(false);
  };

  const hasValues = vitals.some(vital => vital.value);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Signos Vitales
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isExpanded ? 'Ocultar' : 'Agregar'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!isExpanded && !hasValues && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Haga clic en "Agregar" para registrar signos vitales
          </p>
        )}
        
        {!isExpanded && hasValues && (
          <div className="grid grid-cols-2 gap-3">
            {vitals.filter(vital => vital.value).map((vital, index) => {
              const IconComponent = vital.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">{vital.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {vital.value} {vital.unit}
                      </span>
                      <Badge className={`${getStatusColor(vital.status)} text-xs`}>
                        {vital.status === 'normal' ? 'Normal' : 
                         vital.status === 'abnormal' ? 'Anormal' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isExpanded && (
          <div className="space-y-4">
            {vitals.map((vital, index) => {
              const IconComponent = vital.icon;
              return (
                <div key={index} className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                    {vital.name}
                    <Badge variant="outline" className="text-xs ml-auto">
                      Normal: {vital.normalRange}
                    </Badge>
                  </Label>
                  
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Ej: ${vital.normalRange.split('-')[0] || vital.normalRange}`}
                      value={vital.value}
                      onChange={(e) => updateVital(index, e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{vital.unit}</span>
                      {vital.value && (
                        <Badge className={getStatusColor(vital.status)}>
                          {vital.status === 'normal' ? 'Normal' : 
                           vital.status === 'abnormal' ? 'Anormal' : 'Crítico'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <Button onClick={handleSave} className="w-full mt-4">
              <Save className="w-4 h-4 mr-2" />
              Guardar Signos Vitales
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};