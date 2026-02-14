import { motion } from 'framer-motion';
import { Brain, BookOpen, Stethoscope, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface IdeadorPhaseProps {
  data: Record<string, unknown> | null;
  isProcessing: boolean;
}

interface AnalysisCard {
  icon: React.ReactNode;
  title: string;
  key: string;
  color: string;
}

const CARDS: AnalysisCard[] = [
  { icon: <Stethoscope className="w-5 h-5" />, title: 'Análisis Clínico', key: 'clinical_analysis', color: 'hsl(207, 60%, 45%)' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Revisión de Literatura', key: 'literature_review', color: 'hsl(207, 50%, 55%)' },
  { icon: <Brain className="w-5 h-5" />, title: 'Contexto Científico', key: 'scientific_context', color: 'hsl(207, 45%, 50%)' },
  { icon: <Lightbulb className="w-5 h-5" />, title: 'Hipótesis Generada', key: 'hypothesis', color: 'hsl(207, 55%, 40%)' },
];

export function IdeadorPhase({ data, isProcessing }: IdeadorPhaseProps) {
  if (isProcessing && !data) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: 'hsl(207, 60%, 35%)' }}>
          Fase 1 — Ideador
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CARDS.map((card) => (
            <Card key={card.key} className="border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5 mb-2" />
                <Skeleton className="h-3 w-3/5" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(207, 60%, 45%)' }} />
          Procesando con IA...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: 'hsl(207, 60%, 35%)' }}>
        Fase 1 — Ideador
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARDS.map((card, index) => {
          const content = (data[card.key] as string) ?? '';
          if (!content) return null;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              <Card className="border border-border hover:shadow-medium transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span style={{ color: card.color }}>{card.icon}</span>
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
