import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Heart, 
  Activity,
  FileText,
  Stethoscope
} from 'lucide-react';

interface DiagnosisData {
  primaryDiagnosis: string;
  confidence: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  differentialDiagnoses: string[];
  recommendations: string[];
  studiesRequested?: string[];
  followUp?: string;
}

interface MedicalDiagnosisProps {
  diagnosis: DiagnosisData;
  className?: string;
}

const urgencyConfig = {
  low: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Baja Urgencia'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: 'Urgencia Moderada'
  },
  high: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    label: 'Alta Urgencia'
  },
  critical: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    label: 'Urgencia Crítica'
  }
};

export const MedicalDiagnosis: React.FC<MedicalDiagnosisProps> = ({ 
  diagnosis, 
  className 
}) => {
  const urgencyInfo = urgencyConfig[diagnosis.urgencyLevel];
  const UrgencyIcon = urgencyInfo.icon;

  return (
    <Card className={`border-l-4 border-l-red-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Evaluación Diagnóstica
          </CardTitle>
          <Badge className={urgencyInfo.color}>
            <UrgencyIcon className="w-3 h-3 mr-1" />
            {urgencyInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Diagnosis */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            Diagnóstico Principal
          </h4>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">{diagnosis.primaryDiagnosis}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-blue-700">Confianza:</span>
              <div className="flex-1 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${diagnosis.confidence}%` }}
                />
              </div>
              <span className="text-xs font-medium text-blue-700">
                {diagnosis.confidence}%
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Differential Diagnoses */}
        {diagnosis.differentialDiagnoses.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              Diagnósticos Diferenciales
            </h4>
            <div className="space-y-2">
              {diagnosis.differentialDiagnoses.map((diff, index) => (
                <div key={index} className="bg-orange-50 p-2 rounded border-l-2 border-orange-200">
                  <p className="text-sm text-orange-900">{diff}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            Recomendaciones
          </h4>
          <div className="space-y-2">
            {diagnosis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Studies Requested */}
        {diagnosis.studiesRequested && diagnosis.studiesRequested.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Estudios Complementarios</h4>
              <div className="flex flex-wrap gap-2">
                {diagnosis.studiesRequested.map((study, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {study}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Follow Up */}
        {diagnosis.followUp && (
          <>
            <Separator />
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-1 text-blue-900">
                Seguimiento
              </h4>
              <p className="text-sm text-blue-800">{diagnosis.followUp}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};