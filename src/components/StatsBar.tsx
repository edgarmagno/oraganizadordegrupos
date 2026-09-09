import React from 'react';
import { Users, DoorClosed, EyeOff, CheckCircle2, UserCheck } from 'lucide-react';

interface StatsBarProps {
  totalGuests: number;
  totalApts: number;
  checkedInApts?: number;
  checkedInGuests?: number;
  activeTab: 'manage' | 'print';
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalGuests,
  totalApts,
  checkedInApts = 0,
  checkedInGuests = 0,
}) => {
  const percentage = totalApts > 0 ? Math.round((checkedInApts / totalApts) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 no-print">
      
      {/* Total Guests */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Total de Hóspedes</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalGuests}</p>
        </div>
      </div>

      {/* Total Apartments */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
          <DoorClosed className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Apartamentos Únicos</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalApts}</p>
        </div>
      </div>

      {/* Check-ins Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Check-ins Realizados</p>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {percentage}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold text-slate-900">{checkedInApts}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalApts} aptos</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Print PDF Format Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-emerald-200 transition-colors">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <EyeOff className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Formato de Saída PDF</p>
          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Apto & Hóspede (Datas Ocultas)</span>
          </p>
        </div>
      </div>

    </div>
  );
};

