import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CloudUpload } from 'lucide-react';

export default function SaveIndicator({
  hasLocalChanges,
  isSaving,
}: {
  hasLocalChanges: boolean;
  isSaving: boolean;
}) {
  return (
    <AnimatePresence>
      {hasLocalChanges && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1.5 text-xs"
        >
          {isSaving ? (
            <>
              <CloudUpload className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-primary font-medium">Guardando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">Cambio guardado localmente</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
