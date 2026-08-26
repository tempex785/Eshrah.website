import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b121c] p-4 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#151b23] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              عذراً، حدث خطأ غير متوقع
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              يبدو أن هناك مشكلة ما حدثت. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
              <br />
              {this.state.error?.message}
              <br />
              {this.state.error?.stack}
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
