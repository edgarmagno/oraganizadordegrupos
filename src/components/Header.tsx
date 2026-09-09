import React from 'react';
import { Printer, Table, Sparkles, Plus, FolderKanban } from 'lucide-react';

interface HeaderProps {
  activeTab: 'manage' | 'print';
  setActiveTab: (tab: 'manage' | 'print') => void;
  totalGuests: number;
  totalApts: number;
  onAddGuest: () => void;
  onLoadSample: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalGuests,
  totalApts,
  onAddGuest,
  onLoadSample,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md no-print">
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                isSidebarOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title={isSidebarOpen ? 'Fechar painel de listas' : 'Abrir painel de listas salvas'}
            >
              <FolderKanban className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Listas Salvas</span>
            </button>

            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Organizador de Grupos
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Formatador & PDF
              </span>
            </div>
          </div>

          {/* Quick Stats & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Tab Navigation */}
            <div className="bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-700/80">
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'manage'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Gerenciar Dados ({totalGuests})</span>
              </button>

              <button
                onClick={() => setActiveTab('print')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'print'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Impresso (Sem Datas)</span>
                {totalGuests > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAddGuest}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Adicionar hóspede manualmente"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Hóspede</span>
              </button>

              <button
                onClick={onLoadSample}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-200 border border-indigo-700/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Carregar dados de exemplo com formatação SOBRENOME;NOME"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dados Exemplo</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
