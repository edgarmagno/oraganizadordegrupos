import React, { useState, useMemo } from 'react';
import {
  Printer,
  CheckCircle2,
  Building2,
  Users,
  EyeOff,
  MessageSquare,
  Clock,
  Filter,
} from 'lucide-react';
import { GuestRow, PrintSettings } from '../types';
import { downloadPdfFromElement, triggerBrowserPrint } from '../utils/pdfExporter';
import { WhatsAppModal } from './WhatsAppModal';

interface PrintPreviewProps {
  guests: GuestRow[];
  totalApts: number;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ guests, totalApts }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Default print configuration
  const [settings, setSettings] = useState<PrintSettings>({
    title: 'ROOMLIST',
    subtitle: 'Relatório Interno de Hospedagem',
    groupName: '',
    columnsCount: 1,
    fontSize: 'md',
    showBorders: true,
    showRowNumbers: true,
    showApartmentHeader: false,
    showCheckInStatus: true, // Enabled by default as requested!
    checkInFilter: 'all',
    headerColor: '#1e293b',
    customNotes: '',
    printDate: true,
  });

  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate check-in counts
  const checkedInGuestsCount = guests.filter((g) => g.isCheckedIn).length;
  
  // Unique apartments with check-in done
  const uniqueCheckedInApts = useMemo(() => {
    const checkedApts = new Set<string>();
    guests.forEach((g) => {
      if (g.isCheckedIn && g.apto.trim()) {
        checkedApts.add(g.apto.trim());
      }
    });
    return checkedApts.size;
  }, [guests]);

  const checkInPercentage = totalApts > 0 ? Math.round((uniqueCheckedInApts / totalApts) * 100) : 0;

  // Filtered guests for printing based on settings.checkInFilter
  const printableGuests = useMemo(() => {
    if (settings.checkInFilter === 'checked_in') {
      return guests.filter((g) => g.isCheckedIn);
    }
    if (settings.checkInFilter === 'pending') {
      return guests.filter((g) => !g.isCheckedIn);
    }
    return guests;
  }, [guests, settings.checkInFilter]);

  const printableUniqueAptsCount = useMemo(() => {
    return new Set(printableGuests.map((g) => g.apto.trim()).filter(Boolean)).size;
  }, [printableGuests]);

  const handlePrint = () => {
    triggerBrowserPrint();
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await downloadPdfFromElement({
        elementId: 'pdf-print-document',
        fileName: `ROOMLIST_${settings.subtitle.replace(/\s+/g, '_') || 'Grupo'}.pdf`,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      // Fallback to native print if download failed
      triggerBrowserPrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Font size CSS & Style utility mapping
  const fontClassMap = {
    sm: 'text-[11px] leading-tight',
    md: 'text-xs sm:text-sm leading-snug',
    lg: 'text-base sm:text-lg leading-normal font-semibold',
    xl: 'text-lg sm:text-xl leading-relaxed font-bold',
  };

  const paddingClassMap = {
    sm: 'py-1 px-2',
    md: 'py-1.5 px-3',
    lg: 'py-2.5 px-4',
    xl: 'py-3.5 px-5',
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Toolbar (Hidden in print) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 no-print space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Printer className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">
                Pré-visualização do PDF com Check-in
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Status Check-in Ativo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Documento formatado para recepção: <strong className="text-white">Apto, Hóspede e Status de Check-in</strong> (datas ocultas).
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer hover:scale-102"
              title="Copiar lista de apartamentos únicos para o WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>Enviar p/ WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer hover:scale-102"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Customization Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Title & Group Name */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Título:
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="ROOMLIST"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-indigo-300 font-bold block">
              Nome do Grupo:
            </label>
            <input
              type="text"
              value={settings.groupName}
              onChange={(e) => setSettings({ ...settings, groupName: e.target.value })}
              placeholder="Digite o nome do grupo..."
              className="w-full bg-slate-800 border border-indigo-500/50 text-white font-semibold rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder:text-slate-500 placeholder:font-normal"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Subtítulo do Documento:
            </label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Columns Count */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Disposição de Colunas na Página:
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setSettings({ ...settings, columnsCount: 1 })}
                className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                  settings.columnsCount === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Coluna
              </button>
              <button
                onClick={() => setSettings({ ...settings, columnsCount: 2 })}
                className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                  settings.columnsCount === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Colunas
              </button>
              <button
                onClick={() => setSettings({ ...settings, columnsCount: 3 })}
                className={`flex-1 py-1 rounded text-center font-medium transition-all cursor-pointer ${
                  settings.columnsCount === 3 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                3 Colunas
              </button>
            </div>
          </div>

          {/* Font Size & Mode */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Tamanho do Texto:
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setSettings({ ...settings, fontSize: 'sm' })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.fontSize === 'sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pequeno
              </button>
              <button
                onClick={() => setSettings({ ...settings, fontSize: 'md' })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.fontSize === 'md' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Médio
              </button>
              <button
                onClick={() => setSettings({ ...settings, fontSize: 'lg' })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.fontSize === 'lg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Grande
              </button>
              <button
                onClick={() => setSettings({ ...settings, fontSize: 'xl' })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.fontSize === 'xl' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Muito Grande
              </button>
            </div>
          </div>

          {/* Check-In Status Column Visibility */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Coluna de Status Check-In:
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setSettings({ ...settings, showCheckInStatus: true })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.showCheckInStatus ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✓ Exibir no PDF
              </button>
              <button
                onClick={() => setSettings({ ...settings, showCheckInStatus: false })}
                className={`flex-1 py-1 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  !settings.showCheckInStatus ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ocultar
              </button>
            </div>
          </div>

          {/* Filter Rows to Print */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Filtrar Impressão:
            </label>
            <div className="flex items-center bg-slate-800 border border-slate-700 p-1 rounded-lg">
              <button
                onClick={() => setSettings({ ...settings, checkInFilter: 'all' })}
                className={`flex-1 py-1 px-1.5 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.checkInFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSettings({ ...settings, checkInFilter: 'checked_in' })}
                className={`flex-1 py-1 px-1.5 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.checkInFilter === 'checked_in' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Só Check-in
              </button>
              <button
                onClick={() => setSettings({ ...settings, checkInFilter: 'pending' })}
                className={`flex-1 py-1 px-1.5 rounded text-center text-xs font-medium transition-all cursor-pointer ${
                  settings.checkInFilter === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Só Pendentes
              </button>
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-2">
            <label className="text-slate-400 font-medium block">
              Observações no Rodapé:
            </label>
            <input
              type="text"
              value={settings.customNotes}
              onChange={(e) => setSettings({ ...settings, customNotes: e.target.value })}
              placeholder="Ex: Entregar chaves na recepção"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* PAPER CANVAS PREVIEW CONTAINER */}
      <div className="flex justify-center bg-slate-200/80 p-4 sm:p-8 rounded-2xl overflow-x-auto print:p-0 print:bg-transparent print:border-none print:shadow-none print:block">
        
        {/* Printable Document ID */}
        <div
          id="pdf-print-document"
          className="bg-white text-slate-900 shadow-xl rounded-none w-full max-w-[210mm] min-h-[297mm] p-[12mm] sm:p-[15mm] border border-slate-300 transition-all font-sans print:p-0 print:m-0 print:border-none print:shadow-none print:max-w-full print:min-h-0"
        >
          {/* Header Section */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 bg-slate-900 text-white rounded print-dark-badge flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <Building2 className="w-5 h-5 text-white" style={{ stroke: '#ffffff', color: '#ffffff' }} />
                </div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-slate-900">
                  {settings.title || 'ROOMLIST'}{settings.groupName ? ` - ${settings.groupName.toUpperCase()}` : ''}
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                {settings.subtitle}
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-500 space-y-0.5 shrink-0 font-mono">
              {settings.printDate && (
                <div>Data: <strong>{currentDateFormatted}</strong></div>
              )}
              <div>Total Apto: <strong>{printableUniqueAptsCount}</strong></div>
              <div>Total Hóspedes: <strong>{printableGuests.length}</strong></div>
              {settings.showCheckInStatus && (
                <div className="text-slate-800 font-bold">
                  Check-in: <strong>{uniqueCheckedInApts}/{totalApts} aptos ({checkInPercentage}%)</strong>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee Badge Notice in Document */}
          <div className="mb-4 px-3 py-1.5 bg-slate-100 rounded text-[11px] text-slate-600 flex items-center justify-between border border-slate-200 font-mono">
            <span>ORDENAÇÃO: POR APARTAMENTO (CRESCENTE)</span>
            <span className="font-bold text-slate-800">
              {settings.showCheckInStatus
                ? 'COM STATUS DE CHECK-IN (DATAS OCULTAS)'
                : 'SOMENTE APTO & NOME (SEM DATAS)'}
            </span>
          </div>

          {/* MAIN LIST CONTENT */}
          {printableGuests.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic text-xs">
              Nenhum hóspede correspondente ao filtro para impressão.
            </div>
          ) : (
            <div
              className={`grid gap-x-6 gap-y-4 ${
                settings.columnsCount === 1
                  ? 'grid-cols-1'
                  : settings.columnsCount === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {renderGuestTable({
                guests: printableGuests,
                settings,
                fontClass: fontClassMap[settings.fontSize],
                paddingClass: paddingClassMap[settings.fontSize],
              })}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 print-footer">
            {settings.customNotes ? (
              <p className="italic font-medium text-slate-700">
                {settings.customNotes}
              </p>
            ) : (
              <span />
            )}
            <p className="font-mono text-slate-400 shrink-0">
              Gerado por Organizador de Lista de Grupos
            </p>
          </div>

        </div>

      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        guests={guests}
        groupName={settings.groupName}
      />

    </div>
  );
};

interface RenderTableProps {
  guests: GuestRow[];
  settings: PrintSettings;
  fontClass: string;
  paddingClass: string;
}

function renderGuestTable({ guests, settings, fontClass, paddingClass }: RenderTableProps) {
  const sizeSpecMap: Record<PrintSettings['fontSize'], { tableTextPx: string; cellPaddingPx: string; headerTextPx: string; statusBadgePx: string }> = {
    sm: { tableTextPx: '11px', cellPaddingPx: '4px 6px', headerTextPx: '10px', statusBadgePx: '9px' },
    md: { tableTextPx: '13px', cellPaddingPx: '6px 8px', headerTextPx: '11px', statusBadgePx: '10px' },
    lg: { tableTextPx: '16px', cellPaddingPx: '8px 10px', headerTextPx: '13px', statusBadgePx: '12px' },
    xl: { tableTextPx: '19px', cellPaddingPx: '10px 12px', headerTextPx: '14px', statusBadgePx: '13px' },
  };
  const sizeSpec = sizeSpecMap[settings.fontSize] || sizeSpecMap.md;

  // If multi-column selected, slice the guests evenly into columns
  const numColumns = settings.columnsCount;
  const itemsPerCol = Math.ceil(guests.length / numColumns);

  const columnsData: GuestRow[][] = [];
  for (let c = 0; c < numColumns; c++) {
    const start = c * itemsPerCol;
    const end = start + itemsPerCol;
    const slice = guests.slice(start, end);
    if (slice.length > 0) {
      columnsData.push(slice);
    }
  }

  return columnsData.map((colGuests, colIdx) => (
    <div key={`col-${colIdx}`} className="break-inside-avoid-page">
      <table
        className={`w-full text-left border-collapse ${fontClass}`}
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: sizeSpec.tableTextPx }}
      >
        <thead>
          <tr
            className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]"
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: sizeSpec.headerTextPx,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {settings.showRowNumbers && (
              <th
                className="text-center w-7"
                style={{
                  padding: sizeSpec.cellPaddingPx,
                  fontSize: sizeSpec.headerTextPx,
                  textAlign: 'center',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                #
              </th>
            )}
            <th
              className="w-14 text-center border-r border-slate-700"
              style={{
                padding: sizeSpec.cellPaddingPx,
                fontSize: sizeSpec.headerTextPx,
                textAlign: 'center',
                borderRight: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              Apto
            </th>
            <th
              style={{
                padding: sizeSpec.cellPaddingPx,
                fontSize: sizeSpec.headerTextPx,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              HÓSPEDES
            </th>
            {settings.showCheckInStatus && (
              <th
                className="w-24 text-center border-l border-slate-700"
                style={{
                  padding: sizeSpec.cellPaddingPx,
                  fontSize: sizeSpec.headerTextPx,
                  textAlign: 'center',
                  borderLeft: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                CHECK-IN
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 border-b border-slate-300">
          {colGuests.map((guest, idx) => {
            const globalIdx = colIdx * itemsPerCol + idx + 1;
            const isEven = idx % 2 === 0;
            const isCheckedIn = !!guest.isCheckedIn;

            return (
              <tr
                key={guest.id}
                className={isEven ? 'bg-white' : 'bg-slate-50'}
                style={{
                  backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: sizeSpec.tableTextPx,
                }}
              >
                {settings.showRowNumbers && (
                  <td
                    className={`text-center font-mono text-slate-400 ${fontClass} ${paddingClass}`}
                    style={{
                      textAlign: 'center',
                      color: '#64748b',
                      padding: sizeSpec.cellPaddingPx,
                      fontSize: sizeSpec.tableTextPx,
                    }}
                  >
                    {globalIdx}
                  </td>
                )}

                {/* APTO COLUMN */}
                <td
                  className={`font-bold font-mono text-center text-slate-900 border-r border-slate-200 bg-slate-100/50 ${fontClass} ${paddingClass}`}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    borderRight: '1px solid #e2e8f0',
                    padding: sizeSpec.cellPaddingPx,
                    fontSize: sizeSpec.tableTextPx,
                  }}
                >
                  {guest.apto || '---'}
                </td>

                {/* GUEST NAME COLUMN (REFORMATTED NOME SOBRENOME) */}
                <td
                  className={`font-medium text-slate-800 ${fontClass} ${paddingClass}`}
                  style={{
                    fontWeight: '500',
                    color: '#1e293b',
                    padding: sizeSpec.cellPaddingPx,
                    fontSize: sizeSpec.tableTextPx,
                  }}
                >
                  {guest.formattedName || 'Sem Nome'}
                </td>

                {/* STATUS CHECK-IN COLUMN */}
                {settings.showCheckInStatus && (
                  <td
                    className={`text-center border-l border-slate-200 ${fontClass} ${paddingClass}`}
                    style={{
                      textAlign: 'center',
                      borderLeft: '1px solid #e2e8f0',
                      padding: sizeSpec.cellPaddingPx,
                      fontSize: sizeSpec.tableTextPx,
                    }}
                  >
                    {isCheckedIn ? (
                      <span
                        className="inline-block font-bold px-1.5 py-0.5 rounded text-emerald-800 border border-emerald-600 bg-emerald-50 print-dark-badge"
                        style={{
                          fontSize: sizeSpec.statusBadgePx,
                          color: '#065f46',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #059669',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        }}
                      >
                        ✓ CHECK-IN
                      </span>
                    ) : (
                      <span
                        className="inline-block text-slate-500 font-medium px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50"
                        style={{
                          fontSize: sizeSpec.statusBadgePx,
                          color: '#64748b',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          display: 'inline-block',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        }}
                      >
                        PENDENTE
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ));
}
