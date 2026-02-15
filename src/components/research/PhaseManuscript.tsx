import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { Download, Maximize2, Minimize2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PhaseManuscript({
  data,
  userEdits,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const merged = { ...data, ...userEdits };

  const content = (merged.manuscript || merged.content || merged.dossier || '') as string;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = (merged.title || 'Manuscrito - Revisión Sistemática') as string;
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(content.replace(/[#*_`]/g, ''), 170);
    let y = 35;
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 5;
    }

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  if (!content) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm italic">Manuscrito pendiente — se generará al completar todas las fases.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${fullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Borrador del Manuscrito
        </h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setFullscreen(!fullscreen)} className="gap-1">
            {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {fullscreen ? 'Salir' : 'Pantalla Completa'}
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="gap-1">
            <Download className="w-3 h-3" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Manuscript body */}
      <div className="prose prose-sm max-w-none text-foreground bg-card p-6 rounded-lg border min-h-[400px]">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
