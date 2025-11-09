import React, { Component, ReactNode } from 'react';
import { PixelCard } from './PixelCard';
import { PixelButton } from './PixelButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <PixelCard className="p-6">
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">
              Something went wrong
            </h2>
            <p className="text-[10px] text-[var(--khaki)] mb-4">
              {this.state.error?.message || 'An error occurred'}
            </p>
            <p className="text-[8px] text-[var(--khaki)] mb-4">
              Check the browser console (F12) for more details.
            </p>
            <PixelButton
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              variant="primary"
            >
              RELOAD APP
            </PixelButton>
          </PixelCard>
        </div>
      );
    }

    return this.props.children;
  }
}

