import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { GuestTable } from './components/GuestTable';
import { PrintPreview } from './components/PrintPreview';
import { StatsBar } from './components/StatsBar';
import { GuestModal } from './components/GuestModal';
import { SavedListsSidebar, getStoredLists, setStoredLists } from './components/SavedListsSidebar';
import { GuestRow, ParseResult, ColumnMapping, SavedList } from './types';
import { parseExcelFile } from './utils/excelParser';
import { reformatGuestName, compareApartments } from './utils/nameFormatter';
import { getInitialGuestList } from './utils/sampleData';
import { triggerBrowserPrint } from './utils/pdfExporter';
import { Printer } from 'lucide-react';

export default function App() {
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [currentMapping, setCurrentMapping] = useState<ColumnMapping | undefined>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [nameCasing, setNameCasing] = useState<'uppercase' | 'titlecase'>('uppercase');
  const [activeTab, setActiveTab] = useState<'manage' | 'print'>('manage');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Saved lists state (default closed for wide spacious view)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeSavedListId, setActiveSavedListId] = useState<string | null>(null);

  // Compute unique apartment count
  const uniqueAptsCount = useMemo(() => {
    const apts = new Set(guests.map((g) => g.apto.trim()).filter(Boolean));
    return apts.size;
  }, [guests]);

  // Compute checked-in counts
  const checkedInGuestsCount = useMemo(() => {
    return guests.filter((g) => g.isCheckedIn).length;
  }, [guests]);

  const checkedInAptsCount = useMemo(() => {
    const checkedApts = new Set<string>();
    guests.forEach((g) => {
      if (g.isCheckedIn && g.apto.trim()) {
        checkedApts.add(g.apto.trim());
      }
    });
    return checkedApts.size;
  }, [guests]);

  // Handle uploaded file
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result: ParseResult = await parseExcelFile(file, undefined, nameCasing);
      setGuests(result.rows);
      setFileName(result.fileName);
      setAvailableHeaders(result.headers);
      setCurrentMapping(result.mapping);
      setActiveSavedListId(null);
    } catch (err: any) {
      alert(err?.message || 'Erro ao processar a planilha. Verifique o formato do arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reformat all current guests when casing option changes
  const handleNameCasingChange = (newCasing: 'uppercase' | 'titlecase') => {
    setNameCasing(newCasing);
    setGuests((prev) =>
      prev.map((g) => ({
        ...g,
        formattedName: reformatGuestName(g.originalName || g.formattedName, newCasing),
      }))
    );
  };

  // Add new guest manually
  const handleAddGuest = (newGuest: Omit<GuestRow, 'id'>) => {
    const id = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullGuest: GuestRow = { ...newGuest, id };

    setGuests((prev) => {
      const updated = [...prev, fullGuest];
      updated.sort((a, b) => {
        const cmp = compareApartments(a.apto, b.apto);
        if (cmp !== 0) return cmp;
        return a.formattedName.localeCompare(b.formattedName);
      });
      return updated;
    });
  };

  // Update existing guest
  const handleUpdateGuest = (id: string, updated: Partial<GuestRow>) => {
    setGuests((prev) => {
      const nextList = prev.map((g) => {
        if (g.id !== id) return g;
        const newApto = updated.apto !== undefined ? updated.apto : g.apto;
        const newFormattedName =
          updated.formattedName !== undefined
            ? reformatGuestName(updated.formattedName, nameCasing)
            : g.formattedName;

        return {
          ...g,
          ...updated,
          apto: newApto,
          formattedName: newFormattedName,
          status: newApto && newFormattedName ? 'valid' : 'missing_apto',
        };
      });

      nextList.sort((a, b) => {
        const cmp = compareApartments(a.apto, b.apto);
        if (cmp !== 0) return cmp;
        return a.formattedName.localeCompare(b.formattedName);
      });

      return nextList;
    });
  };

  // Toggle single guest check-in
  const handleToggleCheckIn = (id: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isCheckedIn: !g.isCheckedIn } : g))
    );
  };

  // Toggle all guests in an apartment
  const handleToggleAptoCheckIn = (apto: string, targetState?: boolean) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.apto.trim() === apto.trim()) {
          const nextVal = targetState !== undefined ? targetState : !g.isCheckedIn;
          return { ...g, isCheckedIn: nextVal };
        }
        return g;
      })
    );
  };

  // Set all guests check-in state
  const handleBatchSetCheckIn = (checked: boolean) => {
    setGuests((prev) => prev.map((g) => ({ ...g, isCheckedIn: checked })));
  };

  // Delete guest
  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os hóspedes da lista?')) {
      setGuests([]);
      setFileName('');
      setActiveSavedListId(null);
    }
  };

  // Load sample data
  const handleLoadSample = () => {
    setGuests(getInitialGuestList());
    setFileName('Exemplo_Grupo_Inicial.xlsx');
    setActiveSavedListId('sample-group-1');
  };

  // Save current list
  const handleSaveCurrentList = (title: string) => {
    if (guests.length === 0) return;

    const existingLists = getStoredLists();
    const newId = `list-${Date.now()}`;
    const newListObj: SavedList = {
      id: newId,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileName: fileName || title,
      guests,
      totalGuests: guests.length,
      uniqueAptsCount,
      checkedInAptsCount,
    };

    const updated = [newListObj, ...existingLists];
    setStoredLists(updated);
    setActiveSavedListId(newId);
    setFileName(title);
  };

  // Load a saved list into state
  const handleLoadSavedList = (savedList: SavedList) => {
    setGuests(savedList.guests);
    setFileName(savedList.fileName || savedList.title);
    setActiveSavedListId(savedList.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalGuests={guests.length}
        totalApts={uniqueAptsCount}
        onAddGuest={() => setIsAddModalOpen(true)}
        onLoadSample={handleLoadSample}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main App Layout: Sidebar + Main Content */}
      <div
        className={`flex-1 flex w-full max-w-[1680px] mx-auto items-start px-4 sm:px-6 lg:px-8 py-5 sm:py-7 gap-6 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-84' : 'lg:pl-14'
        }`}
      >
        {/* Left Sidebar for Saved Lists */}
        <SavedListsSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentGuests={guests}
          currentFileName={fileName}
          activeSavedListId={activeSavedListId}
          onLoadList={handleLoadSavedList}
          onSaveCurrentList={handleSaveCurrentList}
        />

        {/* Main Workspace */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Upload & Stats Section (hidden in print) */}
          {activeTab === 'manage' && (
            <div className="space-y-6 no-print">
              <FileUpload
                onFileUpload={handleFileUpload}
                fileName={fileName}
                totalRows={guests.length}
                availableHeaders={availableHeaders}
                currentMapping={currentMapping}
                isProcessing={isProcessing}
              />

              <StatsBar
                totalGuests={guests.length}
                totalApts={uniqueAptsCount}
                checkedInApts={checkedInAptsCount}
                checkedInGuests={checkedInGuestsCount}
                activeTab={activeTab}
              />

              <GuestTable
                guests={guests}
                onUpdateGuest={handleUpdateGuest}
                onDeleteGuest={handleDeleteGuest}
                onAddGuest={() => setIsAddModalOpen(true)}
                onClearAll={handleClearAll}
                nameCasing={nameCasing}
                onChangeNameCasing={handleNameCasingChange}
                onGoToPrint={() => setActiveTab('print')}
                onToggleCheckIn={handleToggleCheckIn}
                onToggleAptoCheckIn={handleToggleAptoCheckIn}
                onBatchSetCheckIn={handleBatchSetCheckIn}
                onLoadSample={handleLoadSample}
              />
            </div>
          )}

          {/* Dedicated PDF Print Preview */}
          {activeTab === 'print' ? (
            <PrintPreview guests={guests} totalApts={uniqueAptsCount} />
          ) : (
            <div className="hidden print:block">
              <PrintPreview guests={guests} totalApts={uniqueAptsCount} />
            </div>
          )}

        </main>
      </div>

      {/* Add Guest Modal */}
      <GuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddGuest}
        nameCasing={nameCasing}
      />

      {/* Screen-only Footer */}
      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400 no-print mt-auto bg-white">
        <p>Organizador de Lista de Grupos • Processamento de planilhas Excel e Impressão de PDF para Hotelaria</p>
      </footer>

      {/* Floating Sticky Print Action Button (Always visible on screen bottom-right) */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <button
          type="button"
          onClick={() => {
            if (activeTab !== 'print') {
              setActiveTab('print');
              setTimeout(() => {
                triggerBrowserPrint();
              }, 150);
            } else {
              triggerBrowserPrint();
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl rounded-full px-5 py-3.5 font-bold text-sm flex items-center gap-2.5 border-2 border-white/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Imprimir ou Gerar PDF ROOMLIST"
        >
          <Printer className="w-5 h-5 text-indigo-100 group-hover:animate-bounce" />
          <span className="font-semibold tracking-wide">Imprimir ROOMLIST</span>
        </button>
      </div>

    </div>
  );
}
