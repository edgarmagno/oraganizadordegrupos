import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('roomlist_saved_lists_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Ops! Ocorreu um erro ao carregar a página
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {this.state.error?.message || 'Houve uma falha inesperada na renderização da interface.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Limpar Cache & Recarregar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
