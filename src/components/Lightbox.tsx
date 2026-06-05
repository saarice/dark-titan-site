import { AnimatePresence, motion } from "framer-motion";
import CardVisual from "./CardVisual";

type Props = { open: boolean; variant: number; onClose: () => void };

export default function Lightbox({ open, variant, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-bg/80 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="relative aspect-square w-full max-w-xl overflow-hidden rounded-3xl border border-stroke"
            onClick={(e) => e.stopPropagation()}
          >
            <CardVisual variant={variant} />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-surface text-text-primary backdrop-blur-md"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
