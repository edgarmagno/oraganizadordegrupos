import React, { useState } from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { GuestRow } from '../types';
import { reformatGuestName } from '../utils/nameFormatter';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Omit<GuestRow, 'id'>) => void;
  nameCasing: 'uppercase' | 'titlecase';
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nameCasing,
}) => {
  const [apto, setApto] = useState('');
  const [rawName, setRawName] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apto.trim() && !rawName.trim()) return;

    const formattedName = reformatGuestName(rawName, nameCasing);

    onSave({
      apto: apto.trim(),
      originalName: rawName.trim(),
      formattedName,
      checkIn: checkIn.trim(),
      checkOut: checkOut.trim(),
      status: apto.trim() && rawName.trim() ? 'valid' : 'missing_apto',
      isCheckedIn,
    });

    // Reset fields & close
    setApto('');
    setRawName('');
    setCheckIn('');
    setCheckOut('');
    setIsCheckedIn(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">
              Adicionar Hóspede
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Número do Apartamento / Quarto*:
            </label>
            <input
              type="text"
              required
              value={apto}
              onChange={(e) => setApto(e.target.value)}
              placeholder="Ex: 101, 202A, 305"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nome do Hóspede*:
            </label>
            <input
              type="text"
              required
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
              placeholder="Ex: SILVA; JOAO CARLOS ou JOAO CARLOS SILVA"
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Aceita formato <code className="bg-slate-100 px-1 rounded">SOBRENOME; NOME</code> que será reorganizado automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data Check-In (Opcional):
              </label>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="Ex: 10/08/2026"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data Check-Out (Opcional):
              </label>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="Ex: 15/08/2026"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isCheckedIn}
                onChange={(e) => setIsCheckedIn(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Marcar Check-in como Realizado (OK)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Identifica que este hóspede/apto já entrou na acomodação
                </span>
              </div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Hóspede</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
