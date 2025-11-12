import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-premium-lg border border-neutral-200 p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-error-100 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-error-600" />
                </div>

                <h1 className="text-3xl font-bold font-display text-neutral-900 mb-4">
                  Oops! Something went wrong
                </h1>

                <p className="text-neutral-600 mb-8 max-w-md">
                  We encountered an unexpected error. Don't worry, our team has been notified and we're working on fixing it.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="w-full mb-8 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left">
                    <p className="text-sm font-mono text-error-600 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="text-xs font-mono text-neutral-600">
                        <summary className="cursor-pointer hover:text-neutral-900">
                          Stack trace
                        </summary>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md transition-all duration-300"
                  >
                    <Home className="w-5 h-5" />
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
