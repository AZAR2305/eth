import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Suppress common wallet connection errors
    const suppressedErrors = [
      'Failed to connect to MetaMask',
      'Proposal expired',
      'User rejected',
      'User denied',
      'Connection request reset',
    ];

    const shouldSuppress = suppressedErrors.some(msg => 
      error.message?.includes(msg)
    );

    if (!shouldSuppress) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a wallet connection error we can safely ignore
      const walletErrors = [
        'Failed to connect to MetaMask',
        'Proposal expired',
        'User rejected',
      ];

      const isWalletError = walletErrors.some(msg =>
        this.state.error?.message?.includes(msg)
      );

      if (isWalletError) {
        // Don't show error UI for wallet connection issues
        return this.props.children;
      }

      // For other errors, show fallback or default message
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">⚠️ Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
