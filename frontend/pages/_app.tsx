import type { AppProps } from 'next/app';
import { Providers } from '@/components/Providers';
import { MobileBackFab } from '@/components/common/MobileBackFab';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Providers>
        <Component {...pageProps} />
        <MobileBackFab />
      </Providers>
    </ErrorBoundary>
  );
}
