import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Save,
  FileSpreadsheet,
} from 'lucide-react';
import { GuestRow, SavedList } from '../types';

interface SavedListsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentGuests: GuestRow[];
  currentFileName?: string;
  activeSavedListId: string | null;
  onLoadList: (savedList: SavedList) => void;
  onSaveCurrentList: (title: string) => void;
}

const STORAGE_KEY = 'roomlist_saved_lists_v1';

export const getStoredLists = (): SavedList[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler listas salvas do localStorage:', err);
    return [];
  }
};

export const setStoredLists = (lists: SavedList[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.error('Erro ao salvar listas no localStorage:', err);
  }
};

export const SavedListsSidebar: React.FC<SavedListsSidebarProps> = ({
  isOpen,
  onToggle,
  currentGuests,
  currentFileName,
  activeSavedListId,
  onLoadList,
  onSaveCurrentList,
}) => {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load lists on mount
  useEffect(() => {
    const loaded = getStoredLists();
    setLists(loaded);
  }, []);

  // Update lists in state and storage
  const updateLists = (newList: SavedList[]) => {
    setLists(newList);
    setStoredLists(newList);
  };

  // Open save modal
  const handleOpenSaveModal = () => {
    if (currentGuests.length === 0) {
      alert('Não há hóspedes na lista atual para salvar.');
      return;
    }
    const defaultName = currentFileName
      ? currentFileName.replace(/\.[^/.]+$/, '')
      : `Grupo ${new Date().toLocaleDateString('pt-BR')}`;
    setNewTitle(defaultName);
    setIsSaveModalOpen(true);
  };

  // Confirm Save
  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onSaveCurrentList(newTitle.trim());
    setIsSaveModalOpen(false);

    // Refresh local state
    setTimeout(() => {
      setLists(getStoredLists());
    }, 100);
  };

  // Start Rename
  const handleStartRename = (list: SavedList, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(list.id);
    setEditingTitle(list.title);
  };

  // Confirm Rename
  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTitle.trim()) return;
    const updated = lists.map((l) =>
      l.id === id ? { ...l, title: editingTitle.trim(), updatedAt: new Date().toISOString() } : l
    );
    updateLists(updated);
    setEditingId(null);
  };

  // Cancel Rename
  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Delete List
  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a lista "${title}"?`)) {
      const filtered = lists.filter((l) => l.id !== id);
      updateLists(filtered);
    }
  };

  // Filtered lists
  const filteredLists = lists.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Overlay backdrop when sidebar is open */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-[110px] md:top-[68px] left-0 bottom-0 h-[calc(100vh-110px)] md:h-[calc(100vh-68px)] z-40 bg-white border-r border-slate-200/90 shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden no-print shrink-0 ${
          isOpen
            ? 'w-80 translate-x-0'
            : 'w-80 -translate-x-full lg:translate-x-0 lg:w-12'
        }`}
      >
        {/* Toggle Bar / Header */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-800 text-sm truncate">
                  Listas Salvas
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {lists.length} {lists.length === 1 ? 'lista guardada' : 'listas guardadas'}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center w-full py-1 text-slate-500">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isOpen ? 'Recolher painel de listas' : 'Expandir painel de listas salvas'}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Content (only visible when expanded) */}
        {isOpen && (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 bg-slate-50/50">
            {/* Action: Save Current List Button */}
            <button
              type="button"
              onClick={handleOpenSaveModal}
              disabled={currentGuests.length === 0}
              className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                currentGuests.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:scale-101'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Salvar a lista atual do editor no sistema"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Lista Atual ({currentGuests.length})</span>
            </button>

            {/* Search Input */}
            {lists.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar lista salva..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Lists Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredLists.length === 0 ? (
                <div className="text-center py-8 px-3 bg-white border border-dashed border-slate-200 rounded-xl space-y-2">
                  <div className="p-3 bg-slate-100 text-slate-400 rounded-full w-10 h-10 mx-auto flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Nenhuma lista salva
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Importe ou crie uma lista e clique em <b>"Salvar Lista Atual"</b> para rever mais tarde.
                  </p>
                </div>
              ) : (
                filteredLists.map((item) => {
                  const isActive = activeSavedListId === item.id;
                  const dateFormatted = new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                    'pt-BR',
                    { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <div
                      key={item.id}
                      onClick={() => onLoadList(item)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-indigo-50/90 border-indigo-300 shadow-xs'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />
                      )}

                      {/* Title / Edit Mode */}
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs font-semibold bg-white border border-indigo-400 rounded-lg focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveRename(item.id, e)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <h3
                            className={`font-bold text-xs leading-snug truncate ${
                              isActive ? 'text-indigo-950' : 'text-slate-800'
                            }`}
                          >
                            {item.title}
                          </h3>

                          {/* Item hover actions */}
                          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(item, e)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Renomear lista"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id, item.title, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir lista"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Badges & Stats */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md" title="Total de Hóspedes">
                            <Users className="w-3 h-3 text-indigo-500" />
                            {item.totalGuests}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md" title="Total de Apartamentos">
                            <Building2 className="w-3 h-3 text-blue-500" />
                            {item.uniqueAptsCount}
                          </span>
                          {item.guests && item.guests.some((g) => g.isCheckedIn) && (
                            <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md" title="Check-ins realizados">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {item.guests.filter((g) => g.isCheckedIn).length} In
                            </span>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {dateFormatted}
                        </span>
                      </div>

                      {/* Load action label */}
                      <div className="mt-2 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                          }`}
                        >
                          {isActive ? 'Lista Ativa' : 'Abrir Lista'}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
          <form
            onSubmit={handleConfirmSave}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Salvar Lista de Grupo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nome do Grupo / Identificação da Lista:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Grupo Casamento Silva - Ago/2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Resumo da Lista:</p>
              <p>• <b>{currentGuests.length}</b> Hóspedes registrados</p>
              <p>• <b>{new Set(currentGuests.map((g) => g.apto.trim()).filter(Boolean)).size}</b> Apartamentos únicos</p>
              <p>• <b>{currentGuests.filter((g) => g.isCheckedIn).length}</b> Check-ins já confirmados</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Agora</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
