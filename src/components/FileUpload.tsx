import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Settings2, Download, ArrowRight } from 'lucide-react';
import { ColumnMapping } from '../types';
import { downloadSampleExcel } from '../utils/sampleData';

interface FileUploadProps {
  onFileUpload: (file: File, customMapping?: Partial<ColumnMapping>) => Promise<void>;
  fileName?: string;
  totalRows?: number;
  availableHeaders?: string[];
  currentMapping?: ColumnMapping;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  fileName,
  totalRows = 0,
  availableHeaders = [],
  currentMapping,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mapping state for manual configuration
  const [tempMapping, setTempMapping] = useState<ColumnMapping>({
    aptoCol: '',
    nameCol: '',
    checkInCol: '',
    checkOutCol: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Por favor envie um arquivo válido do Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    try {
      setSelectedFile(file);
      await onFileUpload(file);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Erro ao processar o arquivo Excel.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const openMappingModal = () => {
    if (currentMapping) {
      setTempMapping(currentMapping);
    }
    setShowMappingModal(true);
  };

  const applyCustomMapping = async () => {
    if (selectedFile) {
      setShowMappingModal(false);
      await onFileUpload(selectedFile, tempMapping);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all no-print">
      
      {/* File Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`file-upload-zone relative cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.005]'
            : fileName
            ? 'border-emerald-400 bg-emerald-50/20 hover:border-emerald-500'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3.5">
          
          {/* Icon Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs transition-transform ${
              fileName
                ? 'bg-emerald-100 text-emerald-700'
                : isDragging
                ? 'bg-indigo-600 text-white scale-110'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : fileName ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-1.5 max-w-lg mx-auto">
            {fileName ? (
              <>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-base">
                    {fileName}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                    {totalRows} hóspedes processados
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Clique para carregar outra planilha e substituir a atual
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-slate-900 text-base">
                  Arraste e solte sua planilha <span className="text-indigo-600 font-bold">Excel (.xlsx, .xls)</span> aqui
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Reconhecimento automático de colunas: <strong className="text-slate-700">Apto / Quarto / UH</strong>, <strong className="text-slate-700">Hóspede (Sobrenome;Nome)</strong>, <strong className="text-slate-700">Chegada</strong> e <strong className="text-slate-700">Partida</strong>.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{fileName ? 'Substituir Planilha' : 'Selecionar Arquivo Excel'}</span>
            </button>

            {fileName && availableHeaders.length > 0 && (
              <button
                type="button"
                onClick={openMappingModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4 text-slate-600" />
                <span>Mapear Colunas Manuais</span>
              </button>
            )}

            {!fileName && (
              <button
                type="button"
                onClick={downloadSampleExcel}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Baixar Modelo Excel Exemplo</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Column Mapping Status Badge */}
      {currentMapping && fileName && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800">Colunas Identificadas:</span>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-md font-mono text-[11px]">
              Apto: <strong>{currentMapping.aptoCol || 'Não detectado'}</strong>
            </span>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-md font-mono text-[11px]">
              Nome: <strong>{currentMapping.nameCol || 'Não detectado'}</strong>
            </span>
            {currentMapping.checkInCol && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-mono text-[11px]">
                Chegada: <strong>{currentMapping.checkInCol}</strong>
              </span>
            )}
            {currentMapping.checkOutCol && (
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-mono text-[11px]">
                Partida: <strong>{currentMapping.checkOutCol}</strong>
              </span>
            )}
          </div>

          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span>Organizado por Apto & Formato NOME SOBRENOME</span>
          </span>
        </div>
      )}

      {/* Manual Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-base">
                  Mapear Colunas da Planilha
                </h3>
              </div>
              <button
                onClick={() => setShowMappingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Caso as colunas do seu arquivo Excel tenham nomes diferentes dos padrões, selecione manualmente qual coluna corresponde a cada dado abaixo:
            </p>

            <div className="space-y-3">
              {/* Apt Column */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coluna do Número do Apartamento (Apto/Quarto):
                </label>
                <select
                  value={tempMapping.aptoCol}
                  onChange={(e) => setTempMapping({ ...tempMapping, aptoCol: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Selecionar Coluna --</option>
                  {availableHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Column */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coluna do Nome do Hóspede (Sobrenome;Nome):
                </label>
                <select
                  value={tempMapping.nameCol}
                  onChange={(e) => setTempMapping({ ...tempMapping, nameCol: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Selecionar Coluna --</option>
                  {availableHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* CheckIn Column */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coluna de Data de Check-In:
                </label>
                <select
                  value={tempMapping.checkInCol}
                  onChange={(e) => setTempMapping({ ...tempMapping, checkInCol: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Opcional / Nenhuma --</option>
                  {availableHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* CheckOut Column */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coluna de Data de Check-Out:
                </label>
                <select
                  value={tempMapping.checkOutCol}
                  onChange={(e) => setTempMapping({ ...tempMapping, checkOutCol: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Opcional / Nenhuma --</option>
                  {availableHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyCustomMapping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Aplicar e Reorganizar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
