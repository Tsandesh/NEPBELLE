import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';

// Figma: Overlay/Cookie-Banner (mobile 9:431, PDP 1:3346)
export const CookieBanner = () => {
  const { cookieAccepted, acceptCookies } = useUiStore();
  return (
    <AnimatePresence>
      {!cookieAccepted && (
        <motion.aside initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} role="dialog" aria-label="Cookie notice"
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center justify-between gap-3 border-t border-line bg-white px-6 py-4 shadow-nav md:flex-row">
          <p className="text-sm text-muted-foreground">We use cookies to improve your shopping experience.</p>
          <Button size="sm" onClick={acceptCookies}>Accept</Button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
