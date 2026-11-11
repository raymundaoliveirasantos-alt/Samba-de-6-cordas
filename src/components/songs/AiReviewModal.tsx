import React, { useState } from 'react';
import { Sparkles, Check, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { parseChordPro } from '../../utils/chordPro';

interface AiReviewModalProps {
  isOpen: boolean;
  title: string;
  artist: string;
  suggestedKey: string;
  originalContent: string;
  aiGeneratedContent: string;
  confidence?: string;
  notes?: string;
  onAccept: (finalContent: string, key: string) => void;
  onDiscard: () => void;
}

export const AiReviewModal: React.FC<AiReviewModalProps> = ({
  isOpen,
  title,
  artist,
  suggestedKey,
  originalContent,
  aiGeneratedContent,
  confidence = 'alta',
  notes,
  onAccept,
  onDiscard,
}) => {
  const [editedContent, setEditedContent] = useState(aiGeneratedContent);
  const [isEditing, setIsEditing] = useState(false);
  const [finalKey, setFinalKey] = useState(suggestedKey);

  if (!isOpen) return null;

  const parsedAi = parseChordPro(editedContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-teal-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Revisar Cifra Sugerida por IA
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                  Gerado por IA (Gemini)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {title} — {artist || 'Tradicional'} (Confiança: <span className="text-amber-400 font-bold">{confidence}</span>)
              </p>
            </div>
          </div>

          <button
            onClick={onDiscard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Descartar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notes && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-400">Harmonia & Andamento: </span>
                {notes}
              </div>
            </div>
          )}

          {isEditing ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Editar Código ChordPro antes de Aceitar:
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Content */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Conteúdo Anterior
                </div>
                <div className="text-xs font-mono text-slate-400 whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {originalContent.trim() || '(Nenhuma cifra cadastrada anteriormente)'}
                </div>
              </div>

              {/* AI Generated Preview */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Nova Cifra Sugerida (Tom: {suggestedKey})
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar Texto
                  </button>
                </div>
                <div className="space-y-2 text-xs font-sans max-h-80 overflow-y-auto pr-2">
                  {parsedAi.lines.map((line, idx) => {
                    if (line.type === 'empty') return <div key={idx} className="h-2" />;
                    if (line.type === 'section_start') {
                      return (
                        <div key={idx} className="font-bold text-amber-400 uppercase text-[11px]">
                          [{line.sectionName}]
                        </div>
                      );
                    }
                    if (line.type === 'comment') {
                      return (
                        <div key={idx} className="text-cyan-400 text-[11px] italic">
                          {line.comment}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex flex-wrap items-end">
                        {line.tokens?.map((tok, tIdx) => (
                          <span key={tIdx} className="inline-flex flex-col mr-1">
                            {tok.chord && (
                              <span className="font-mono font-bold text-amber-400 text-[11px]">
                                {tok.chord}
                              </span>
                            )}
                            <span className="whitespace-pre">{tok.lyric || ' '}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-bold transition border border-slate-700"
          >
            <Trash2 className="w-4 h-4" /> Descartar Sugestão
          </button>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                <Edit3 className="w-4 h-4" /> Editar Antes de Aceitar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                Ver Prévia
              </button>
            )}

            <button
              onClick={() => onAccept(editedContent, finalKey)}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
            >
              <Check className="w-4 h-4" /> Aceitar e Salvar Cifra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
