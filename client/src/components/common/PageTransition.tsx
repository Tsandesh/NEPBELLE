import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>{children}</motion.main>
);
