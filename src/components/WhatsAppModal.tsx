import React, { useState, useMemo } from 'react';
import { MessageSquare, X, Copy, Check, ExternalLink, Building2 } from 'lucide-react';
import { GuestRow } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: GuestRow[];
  groupName?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  guests,
  groupName = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [titleText, setTitleText] = useState(
    groupName ? `Entrada de Grupo - ${groupName}` : 'Entrada de Grupo'
  );

  // Extract unique apartments without duplicates
  const uniqueApartments = useMemo(() => {
    const aptos = guests
      .map((g) => (g.apto || '').trim())
      .filter((apto) => apto !== '' && apto !== '---');

    // Remove duplicates preserving order
    return Array.from(new Set(aptos));
  }, [guests]);

  // Generate complete message text
  const messageText = useMemo(() => {
    const header = titleText.trim() ? titleText.trim() : 'Entrada de Grupo';
    return `${header}\n${uniqueApartments.join('\n')}`;
  }, [titleText, uniqueApartments]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar mensagem:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Enviar Lista para WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Apenas apartamentos únicos (sem duplicatas)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title customization */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Título da Mensagem:
          </label>
          <input
            type="text"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            placeholder="Entrada de Grupo"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Stats badge */}
        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-4 h-4 text-emerald-600" />
            {uniqueApartments.length} Apartamento{uniqueApartments.length !== 1 ? 's' : ''} Único{uniqueApartments.length !== 1 ? 's' : ''}
          </span>
          <span className="text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
            Sem repetições
          </span>
        </div>

        {/* Text Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Pré-visualização do Texto Copiado:
          </label>
          <textarea
            readOnly
            rows={8}
            value={messageText}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copiar Mensagem</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-102"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
