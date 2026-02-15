import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Article {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  included: boolean;
}

export default function PhaseArticles({
  data,
  userEdits,
  phaseKey,
  onSave,
  onLocalChange,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  onLocalChange: () => void;
}) {
  const merged = { ...data, ...userEdits };
  const rawArticles = (merged.articles || []) as Article[];

  const [localArticles, setLocalArticles] = useState<Article[]>(rawArticles);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    setLocalArticles(rawArticles);
  }, [JSON.stringify(rawArticles)]);

  const toggleArticle = (id: string) => {
    setLocalArticles(prev =>
      prev.map(a => a.id === id ? { ...a, included: !a.included } : a)
    );
    setHasUnsaved(true);
    onLocalChange();
  };

  const handleSave = async () => {
    await onSave(phaseKey, 'articles', localArticles);
    setHasUnsaved(false);
  };

  const included = localArticles.filter(a => a.included).length;
  const excluded = localArticles.length - included;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-primary">Artículos Identificados</h4>
          <Badge variant="outline" className="text-xs">
            {included} incluidos
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {excluded} excluidos
          </Badge>
        </div>
        <Button
          size="sm"
          variant={hasUnsaved ? 'default' : 'outline'}
          onClick={handleSave}
          className="gap-1"
        >
          {hasUnsaved ? <Save className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {hasUnsaved ? 'Guardar Selección' : 'Guardado'}
        </Button>
      </div>

      {/* Article table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="w-10">✓</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Autores</TableHead>
              <TableHead className="w-16">Año</TableHead>
              <TableHead>Revista</TableHead>
              <TableHead className="w-20">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  Sin artículos — esperando resultados de búsqueda de la IA.
                </TableCell>
              </TableRow>
            ) : (
              localArticles.map((article) => (
                <TableRow
                  key={article.id}
                  className={`transition-opacity ${!article.included ? 'opacity-50' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={article.included}
                      onCheckedChange={() => toggleArticle(article.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium max-w-xs truncate">{article.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{article.authors}</TableCell>
                  <TableCell className="text-sm">{article.year}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{article.journal}</TableCell>
                  <TableCell>
                    <Badge variant={article.included ? 'default' : 'secondary'} className="text-[10px]">
                      {article.included ? 'Incluido' : 'Excluido'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        {included}/{localArticles.length} artículos incluidos en la revisión
      </p>
    </div>
  );
}
