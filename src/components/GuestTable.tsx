import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ArrowUpDown,
  Calendar,
  UserCheck,
  Building2,
  CaseSensitive,
  Check,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { GuestRow } from '../types';
import * as XLSX from 'xlsx';
import { WhatsAppModal } from './WhatsAppModal';
import { Sparkles, Upload } from 'lucide-react';

interface GuestTableProps {
  guests: GuestRow[];
  onUpdateGuest: (id: string, updated: Partial<GuestRow>) => void;
  onDeleteGuest: (id: string) => void;
  onAddGuest: () => void;
  onClearAll: () => void;
  nameCasing: 'uppercase' | 'titlecase';
  onChangeNameCasing: (casing: 'uppercase' | 'titlecase') => void;
  onGoToPrint: () => void;
  onToggleCheckIn?: (id: string) => void;
  onToggleAptoCheckIn?: (apto: string, targetState?: boolean) => void;
  onBatchSetCheckIn?: (checked: boolean) => void;
  onLoadSample?: () => void;
}

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  onUpdateGuest,
  onDeleteGuest,
  onAddGuest,
  onClearAll,
  nameCasing,
  onChangeNameCasing,
  onGoToPrint,
  onToggleCheckIn,
  onToggleAptoCheckIn,
  onBatchSetCheckIn,
  onLoadSample,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GuestRow>>({});
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Quick stats
  const checkedInGuestsCount = guests.filter((g) => g.isCheckedIn).length;
  const pendingGuestsCount = guests.length - checkedInGuestsCount;

  // Filter guests based on search and status filter
  const filteredGuests = guests.filter((g) => {
    // Status filter
    if (statusFilter === 'checked_in' && !g.isCheckedIn) return false;
    if (statusFilter === 'pending' && g.isCheckedIn) return false;

    // Search term
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    if (term === 'checkin' || term === 'check-in' || term === 'ok') {
      return !!g.isCheckedIn;
    }
    if (term === 'pendente' || term === 'aguardando') {
      return !g.isCheckedIn;
    }

    return (
      g.apto.toLowerCase().includes(term) ||
      g.formattedName.toLowerCase().includes(term) ||
      g.originalName.toLowerCase().includes(term) ||
      (g.checkIn && g.checkIn.includes(term)) ||
      (g.checkOut && g.checkOut.includes(term))
    );
  });

  const handleToggleRowCheckIn = (guest: GuestRow) => {
    if (onToggleCheckIn) {
      onToggleCheckIn(guest.id);
    } else {
      onUpdateGuest(guest.id, { isCheckedIn: !guest.isCheckedIn });
    }
  };

  const handleToggleApto = (apto: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleAptoCheckIn) {
      onToggleAptoCheckIn(apto, !currentStatus);
    } else {
      const nextVal = !currentStatus;
      guests
        .filter((g) => g.apto.trim() === apto.trim())
        .forEach((g) => onUpdateGuest(g.id, { isCheckedIn: nextVal }));
    }
  };

  const startEdit = (guest: GuestRow) => {
    setEditingId(guest.id);
    setEditForm({
      apto: guest.apto,
      formattedName: guest.formattedName,
      checkIn: guest.checkIn || '',
      checkOut: guest.checkOut || '',
      isCheckedIn: !!guest.isCheckedIn,
    });
  };

  const saveEdit = (id: string) => {
    onUpdateGuest(id, editForm);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const exportCurrentToExcel = () => {
    const dataToExport = guests.map((g) => ({
      'Apto / Quarto': g.apto,
      'Nome do Hóspede (Formatado)': g.formattedName,
      'Status Check-In': g.isCheckedIn ? 'Check-in OK' : 'Pendente',
      'Nome Original Excel': g.originalName,
      'Check-In': g.checkIn || '',
      'Check-Out': g.checkOut || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista Processada');

    ws['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 35 }, { wch: 15 }, { wch: 15 }];

    XLSX.writeFile(wb, 'Lista_Grupos_Processada.xlsx');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden no-print">
      
      {/* Table Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/70 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por apto, nome ou status..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Casing Switcher */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs text-xs">
              <span className="px-2 text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
                <CaseSensitive className="w-3.5 h-3.5" /> Caixas:
              </span>
              <button
                onClick={() => onChangeNameCasing('uppercase')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  nameCasing === 'uppercase'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CAIXA ALTA
              </button>
              <button
                onClick={() => onChangeNameCasing('titlecase')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  nameCasing === 'titlecase'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nome Próprio
              </button>
            </div>

            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copiar lista de apartamentos sem repetições para o WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>Lista WhatsApp</span>
            </button>

            <button
              onClick={onAddGuest}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Hóspede</span>
            </button>

            {guests.length > 0 && (
              <button
                onClick={exportCurrentToExcel}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Exportar dados processados para Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            )}

            {guests.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                title="Limpar todos os hóspedes da tabela"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

        {/* Second Row: Check-in Status Filter & Batch Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
          
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Todos ({guests.length})
            </button>
            <button
              onClick={() => setStatusFilter('checked_in')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                statusFilter === 'checked_in'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check-in OK ({checkedInGuestsCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendentes ({pendingGuestsCount})</span>
            </button>
          </div>

          {/* Batch Check-in Operations */}
          {guests.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onBatchSetCheckIn) {
                    onBatchSetCheckIn(true);
                  } else {
                    guests.forEach((g) => onUpdateGuest(g.id, { isCheckedIn: true }));
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Marcar todos os hóspedes/apartamentos como Check-in Realizado"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Marcar Todos Check-in</span>
              </button>

              <button
                onClick={() => {
                  if (onBatchSetCheckIn) {
                    onBatchSetCheckIn(false);
                  } else {
                    guests.forEach((g) => onUpdateGuest(g.id, { isCheckedIn: false }));
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Desmarcar todos os check-ins"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Desmarcar Todos</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Main Screen Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 w-32">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Apto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 w-40">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status Check-In</span>
                </div>
              </th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nome Reorganizado (NOME SOBRENOME)</span>
                </div>
              </th>
              <th className="py-3.5 px-4 text-slate-400 font-normal hidden lg:table-cell">
                Original Excel (Sobrenome;Nome)
              </th>
              <th className="py-3.5 px-4 w-32">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chegada</span>
                </div>
              </th>
              <th className="py-3.5 px-4 w-32">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Partida</span>
                </div>
              </th>
              <th className="py-3.5 px-4 w-28 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 px-6 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {searchTerm
                          ? 'Nenhum hóspede encontrado para a busca'
                          : statusFilter !== 'all'
                          ? 'Nenhum hóspede com o status selecionado'
                          : 'Nenhum hóspede carregado no momento'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {searchTerm
                          ? 'Tente buscar por outro nome de hóspede ou número de apartamento.'
                          : 'Envie sua planilha Excel (.xlsx) na área superior ou utilize as ações rápidas abaixo.'}
                      </p>
                    </div>

                    {!searchTerm && statusFilter === 'all' && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={onAddGuest}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar Hóspede</span>
                        </button>
                        {onLoadSample && (
                          <button
                            type="button"
                            onClick={onLoadSample}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Carregar Dados de Exemplo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest, index) => {
                const isEditing = editingId === guest.id;
                const isCheckedIn = !!guest.isCheckedIn;

                return (
                  <tr
                    key={guest.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isCheckedIn
                        ? 'bg-emerald-50/20'
                        : guest.status !== 'valid'
                        ? 'bg-amber-50/40'
                        : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/30'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-4 text-center text-slate-400 text-xs font-mono">
                      {index + 1}
                    </td>

                    {/* Apartment */}
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.apto || ''}
                          onChange={(e) => setEditForm({ ...editForm, apto: e.target.value })}
                          className="w-20 p-1 border border-blue-400 rounded bg-white text-xs font-bold"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={(e) => handleToggleApto(guest.apto, isCheckedIn, e)}
                            className={`inline-block px-2 py-0.5 rounded font-mono border text-xs font-bold cursor-pointer transition-all ${
                              isCheckedIn
                                ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={`Apto ${guest.apto || '---'} (Clique para alternar check-in de todos no apto)`}
                          >
                            {guest.apto || '---'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Check-In Status Toggle Button */}
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editForm.isCheckedIn}
                            onChange={(e) => setEditForm({ ...editForm, isCheckedIn: e.target.checked })}
                            className="w-3.5 h-3.5 text-emerald-600 rounded"
                          />
                          <span className="text-xs font-medium text-slate-700">Check-in OK</span>
                        </label>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleRowCheckIn(guest)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border ${
                            isCheckedIn
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                          }`}
                          title={
                            isCheckedIn
                              ? 'Check-in Realizado. Clique para marcar como Pendente'
                              : 'Pendente. Clique para marcar como Check-in Realizado'
                          }
                        >
                          {isCheckedIn ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Check-in OK</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Formatted Name */}
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.formattedName || ''}
                          onChange={(e) => setEditForm({ ...editForm, formattedName: e.target.value })}
                          className="w-full p-1 border border-blue-400 rounded bg-white text-xs font-semibold"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={isCheckedIn ? 'text-slate-900 font-bold' : 'text-slate-800'}>
                            {guest.formattedName || 'Sem nome'}
                          </span>
                          {guest.status !== 'valid' && (
                            <span
                              className="p-0.5 bg-amber-100 text-amber-700 rounded text-[10px] flex items-center gap-1"
                              title="Informação pendente"
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Original Excel Name */}
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-xs hidden lg:table-cell truncate max-w-xs">
                      {guest.originalName || '---'}
                    </td>

                    {/* Check-In */}
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.checkIn || ''}
                          onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                          className="w-24 p-1 border border-blue-400 rounded bg-white text-xs"
                        />
                      ) : (
                        guest.checkIn || '---'
                      )}
                    </td>

                    {/* Check-Out */}
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.checkOut || ''}
                          onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                          className="w-24 p-1 border border-blue-400 rounded bg-white text-xs"
                        />
                      ) : (
                        guest.checkOut || '---'
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-2.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(guest.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Salvar alterações"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                            title="Cancelar"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(guest)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar este hóspede"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteGuest(guest.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir este hóspede"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar pointing user to PDF print preview */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Exibindo <strong>{filteredGuests.length}</strong> de <strong>{guests.length}</strong> hóspedes.
          </span>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {checkedInGuestsCount} Check-ins OK
          </span>
        </div>

        <button
          onClick={onGoToPrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>Visualizar e Imprimir PDF (Com Status de Check-in)</span>
          <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[10px]">A4</span>
        </button>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        guests={guests}
      />

    </div>
  );
};
