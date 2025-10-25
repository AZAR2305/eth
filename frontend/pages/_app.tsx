import type { AppProps } from 'next/app';
import { Providers } from '@/components/Providers';
import { MobileBackFab } from '@/components/common/MobileBackFab';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SiteShell from '@/components/SiteShell';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ErrorBoundary>
      <Providers>
        <SiteShell>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </SiteShell>
        <MobileBackFab />
      </Providers>
    </ErrorBoundary>
  );
}
