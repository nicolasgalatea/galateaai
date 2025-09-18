import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Heart,
  Activity,
  Brain,
  Thermometer
} from 'lucide-react';

interface RiskFactor {
  name: string;
  level: 'low' | 'medium' | 'high';
  description: string;
}

interface MedicalInsight {
  category: string;
  icon: React.ElementType;
  insights: string[];
  riskFactors?: RiskFactor[];
  trend?: 'up' | 'down' | 'stable';
}

interface MedicalInsightsProps {
  insights: MedicalInsight[];
  className?: string;
}

const riskLevelConfig = {
  low: { color: 'bg-green-100 text-green-800', value: 25 },
  medium: { color: 'bg-yellow-100 text-yellow-800', value: 65 },
  high: { color: 'bg-red-100 text-red-800', value: 90 }
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Activity
};

export const MedicalInsights: React.FC<MedicalInsightsProps> = ({ 
  insights, 
  className 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {insights.map((insight, index) => {
        const IconComponent = insight.icon;
        const TrendIcon = insight.trend ? trendIcons[insight.trend] : null;
        
        return (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                  {insight.category}
                </div>
                {TrendIcon && (
                  <TrendIcon className={`w-4 h-4 ${
                    insight.trend === 'up' ? 'text-red-500' : 
                    insight.trend === 'down' ? 'text-green-500' : 
                    'text-gray-500'
                  }`} />
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Insights */}
              <div className="space-y-2">
                {insight.insights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              
              {/* Risk Factors */}
              {insight.riskFactors && insight.riskFactors.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h5 className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Factores de Riesgo
                  </h5>
                  {insight.riskFactors.map((risk, riskIdx) => (
                    <div key={riskIdx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{risk.name}</span>
                        <Badge 
                          className={`${riskLevelConfig[risk.level].color} text-xs`}
                          variant="secondary"
                        >
                          {risk.level === 'low' ? 'Bajo' : 
                           risk.level === 'medium' ? 'Medio' : 'Alto'}
                        </Badge>
                      </div>
                      <Progress 
                        value={riskLevelConfig[risk.level].value} 
                        className="h-1"
                      />
                      <p className="text-xs text-gray-600">{risk.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Predefined medical insights for common cardiovascular conditions
export const generateCardiovascularInsights = (symptoms: string[]): MedicalInsight[] => {
  const insights: MedicalInsight[] = [
    {
      category: "Evaluación Cardiovascular",
      icon: Heart,
      insights: [
        "Análisis de síntomas cardiovasculares en curso",
        "Evaluación de factores de riesgo identificados",
        "Correlación clínica con presentación actual"
      ],
      riskFactors: [
        {
          name: "Hipertensión Arterial",
          level: "medium",
          description: "Factor de riesgo modificable para enfermedad cardiovascular"
        },
        {
          name: "Dislipidemia",
          level: "medium", 
          description: "Requiere manejo farmacológico y cambios de estilo de vida"
        }
      ],
      trend: "stable"
    }
  ];

  // Add specific insights based on symptoms
  if (symptoms.some(s => s.toLowerCase().includes('dolor'))) {
    insights.push({
      category: "Dolor Torácico",
      icon: AlertTriangle,
      insights: [
        "Caracterización del dolor torácico esencial",
        "Descarte de síndrome coronario agudo prioritario",
        "Evaluación de causas no cardiovasculares"
      ],
      trend: "up"
    });
  }

  if (symptoms.some(s => s.toLowerCase().includes('disnea'))) {
    insights.push({
      category: "Función Respiratoria",
      icon: Activity,
      insights: [
        "Evaluación de disnea y su relación cardiovascular",
        "Análisis de capacidad funcional",
        "Consideración de insuficiencia cardíaca"
      ],
      trend: "stable"
    });
  }

  return insights;
};