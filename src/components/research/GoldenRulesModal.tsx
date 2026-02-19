/**
 * GoldenRulesModal
 * ─────────────────────────────────────────────────────────────
 * Modal de Fase 0: muestra las 5 Reglas de Oro de investigación.
 * Al aceptar, envía { message: "Acepto", project_id, current_phase: 0 }
 * al webhook de n8n para despertar al Agente 1.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FlaskConical, Loader2, ShieldCheck } from 'lucide-react';

const N8N_CHAT_URL =
  'https://nicolasgalatea.app.n8n.cloud/webhook/7e71e911-5f56-42cf-8785-fb9aa063e2f3/chat';

const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

const RULES = [
  {
    number: 1,
    title: 'Formato PICOT',
    description: 'Toda pregunta de investigación debe seguir el formato PICOT (Población, Intervención, Comparación, Outcome, Tiempo).',
  },
  {
    number: 2,
    title: 'Fuentes verificadas',
    description: 'Las fuentes bibliográficas deben ser verificadas en bases de datos indexadas: PubMed, Cochrane Library y EMBASE.',
  },
  {
    number: 3,
    title: 'Criterios previos a la búsqueda',
    description: 'Los criterios de inclusión y exclusión (I/E) deben definirse antes de iniciar la búsqueda bibliográfica.',
  },
  {
    number: 4,
    title: 'Registro en PROSPERO',
    description: 'El protocolo de revisión sistemática debe registrarse en PROSPERO antes de comenzar la extracción de datos.',
  },
  {
    number: 5,
    title: 'Documentación de decisiones',
    description: 'Toda decisión metodológica relevante debe documentarse con su justificación para garantizar la reproducibilidad.',
  },
];

interface GoldenRulesModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function GoldenRulesModal({ isOpen, onAccept }: GoldenRulesModalProps) {
  const [isSending, setIsSending] = useState(false);

  const handleAccept = async () => {
    setIsSending(true);
    try {
      await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Acepto',
          project_id: FIXED_PROJECT_ID,
          current_phase: 0,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log('[GoldenRulesModal] Acepto enviado a n8n ✓');
    } catch (err) {
      console.warn('[GoldenRulesModal] No se pudo notificar a n8n:', err);
      // No bloqueamos al usuario si n8n falla — el flujo continúa igual
    } finally {
      setIsSending(false);
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-lg"
        // Evitar que el usuario cierre el modal sin aceptar
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              5 Reglas de Oro de Investigación
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Antes de comenzar, debes comprometerte con los estándares internacionales del{' '}
            <span className="font-semibold text-primary">Galatea Research Lab</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {RULES.map((rule) => (
            <div
              key={rule.number}
              className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {rule.number}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1">
            <FlaskConical className="w-3.5 h-3.5 text-primary" />
            Al aceptar, se iniciará el protocolo de 10 fases con 14 agentes de IA.
          </div>
          <Button
            onClick={handleAccept}
            disabled={isSending}
            className="gap-2 min-w-[160px]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Iniciando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Acepto y Comenzar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
