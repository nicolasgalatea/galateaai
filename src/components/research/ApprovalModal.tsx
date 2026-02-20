import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FileText, CheckCircle, AlertTriangle, Loader2, Database, Search, Shield } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => Promise<void>;
  projectTitle: string;
}

export function ApprovalModal({
  isOpen,
  onClose,
  onApprove,
  projectTitle,
}: ApprovalModalProps) {
  const [hasReviewed, setHasReviewed] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!hasReviewed) return;

    setIsApproving(true);
    try {
      await onApprove(approvalNotes || undefined);
      onClose();
    } finally {
      setIsApproving(false);
    }
  };

  const handleClose = () => {
    setHasReviewed(false);
    setApprovalNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-blue-500" />
            Aprobar Protocolo de Investigacion
          </DialogTitle>
          <DialogDescription>
            Revisa el protocolo generado antes de continuar con la ejecucion de la revision sistematica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info del proyecto */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">{projectTitle}</h4>
          </div>

          <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">Agent output coming soon</span>
          </div>

          {/* Mensaje PRISMA */}
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 text-lg">
                  Este protocolo cumple con los estandares PRISMA 2020
                </p>
                <p className="text-sm text-green-700 mt-2">
                  El protocolo ha sido generado siguiendo las directrices PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) y esta listo para registro en PROSPERO.
                </p>
              </div>
            </div>
          </div>

          {/* Bases de datos */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800">Bases de Datos Institucionales</p>
                <p className="text-sm text-blue-700 mt-1">
                  La busqueda se ejecutara automaticamente en las siguientes 5 bases de datos:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-600">
                  <li className="flex items-center gap-2">
                    <Search className="w-3 h-3" /> PubMed/MEDLINE
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="w-3 h-3" /> Cochrane Library
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="w-3 h-3" /> Embase
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="w-3 h-3" /> Web of Science
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="w-3 h-3" /> Scopus
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Proceso Automatizado</p>
                <p className="text-sm text-amber-700 mt-1">
                  Una vez aprobado, la Fase 2 iniciara automaticamente e incluira:
                  eliminacion de duplicados, cribado por titulo/abstract, evaluacion de texto completo,
                  extraccion de datos y sintesis con meta-analisis (RR, IC95%, Forest plots).
                </p>
              </div>
            </div>
          </div>

          {/* Notas de aprobacion */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Notas de aprobacion (opcional)
            </label>
            <Textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Agrega comentarios o instrucciones adicionales para la ejecucion..."
              className="min-h-[80px]"
            />
          </div>

          {/* Checkbox de confirmacion */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="reviewed"
              checked={hasReviewed}
              onCheckedChange={(checked) => setHasReviewed(checked as boolean)}
            />
            <label
              htmlFor="reviewed"
              className="text-sm font-medium leading-tight cursor-pointer"
            >
              He revisado el protocolo de investigacion y confirmo que los criterios de inclusion/exclusion,
              estrategias de busqueda y objetivos son correctos para proceder con la revision sistematica.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isApproving}>
            Cancelar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!hasReviewed || isApproving}
            className="bg-[#89BA17] hover:bg-[#78A315]"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando busqueda en 5 bases de datos...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Ejecutar Busqueda en 5 Bases de Datos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalModal;
