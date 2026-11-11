import React, { useState, useRef } from 'react';
import { Save, X, Eye, Code, Music, Plus, Check } from 'lucide-react';
import type { Song } from '../../types';
import { parseChordPro } from '../../utils/chordPro';
import { ALL_KEYS } from '../../utils/transposer';

interface SongEditorProps {
  song: Song;
  onSave: (updated: Partial<Song>) => void;
  onCancel: () => void;
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, onSave, onCancel }) => {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [originalKey, setOriginalKey] = useState(song.originalKey || 'G');
  const [bpm, setBpm] = useState(song.bpm || 95);
  const [timeSignature, setTimeSignature] = useState(song.timeSignature || '4/4');
  const [capo, setCapo] = useState(song.capo || 0);
  const [instrument, setInstrument] = useState(song.instrument || '');
  const [notes, setNotes] = useState(song.notes || '');
  const [content, setContent] = useState(song.chordProContent || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [customChord, setCustomChord] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick insertion into textarea at cursor position
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const commonChords = ['C', 'D', 'Dm', 'E', 'Em', 'F', 'G', 'A', 'Am', 'B7', 'Bm'];

  const parsedPreview = parseChordPro(content);

  const handleSave = () => {
    onSave({
      title: title.trim() || 'Sem título',
      artist: artist.trim(),
      originalKey,
      currentKey: originalKey,
      bpm,
      timeSignature,
      capo,
      instrument: instrument.trim() || undefined,
      notes: notes.trim() || undefined,
      chordProContent: content,
      status: content.trim().length > 0 ? 'rascunho' : 'pendente',
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-100">Editor de Cifra (ChordPro)</h2>
        </div>

        {/* Tab switcher on mobile */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'editor' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5 inline mr-1" />
            Código
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            Visualizar
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`hidden md:block px-3 py-1 rounded-lg font-medium transition ${
              activeTab === 'split' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lado a Lado
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition"
          >
            <Save className="w-4 h-4" /> Salvar Cifra
          </button>
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-slate-900/60 border-b border-slate-800 text-xs">
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">Artista</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">Tom Original</label>
          <select
            value={originalKey}
            onChange={(e) => setOriginalKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
          >
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">BPM / Andamento</label>
          <input
            type="number"
            min="30"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10) || 100)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">Instrumento Solista</label>
          <input
            type="text"
            value={instrument}
            placeholder="Ex: Saxofone, Flauta"
            onChange={(e) => setInstrument(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-0.5 font-medium">Capotraste</label>
          <select
            value={capo}
            onChange={(e) => setCapo(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="0">Sem capo</option>
            <option value="1">1ª casa</option>
            <option value="2">2ª casa</option>
            <option value="3">3ª casa</option>
            <option value="4">4ª casa</option>
            <option value="5">5ª casa</option>
          </select>
        </div>
      </div>

      {/* Quick Chord Insertion Bar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs overflow-x-auto">
        <span className="text-slate-400 font-medium mr-1 text-[11px]">Inserir Acorde:</span>
        {commonChords.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => insertAtCursor(`[${ch}]`)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-mono font-bold transition"
          >
            {ch}
          </button>
        ))}

        {/* Custom chord input */}
        <div className="flex items-center ml-2">
          <input
            type="text"
            placeholder="Acorde..."
            value={customChord}
            onChange={(e) => setCustomChord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customChord.trim()) {
                e.preventDefault();
                insertAtCursor(`[${customChord.trim()}]`);
                setCustomChord('');
              }
            }}
            className="w-16 bg-slate-950 border border-slate-700 rounded-l px-1.5 py-1 text-amber-400 font-mono text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (customChord.trim()) {
                insertAtCursor(`[${customChord.trim()}]`);
                setCustomChord('');
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-1 rounded-r border border-l-0 border-slate-700"
          >
            +
          </button>
        </div>

        <span className="text-slate-600 mx-1">|</span>

        {/* Section Tags */}
        <button
          type="button"
          onClick={() => insertAtCursor('\n{soc}\n{comment: Refrão}\n\n{eoc}\n')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium"
        >
          + Refrão
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n{comment: Intro: [G] [D] [Em] [C]}\n')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium"
        >
          + Intro
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n{comment: Solo}\n')}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium"
        >
          + Solo
        </button>
      </div>

      {/* Editor & Preview Panes */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Editor Code Pane */}
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="flex flex-col h-full bg-slate-950 p-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite a letra com acordes entre colchetes, ex:&#10;[G]Amazing [G7]grace how [C]sweet the [G]sound&#10;That saved a [Em]wretch like [D]me!&#10;&#10;Ou cole a cifra tradicional com acordes acima da letra!"
              className="flex-1 w-full bg-transparent text-slate-100 font-mono text-sm leading-relaxed p-2 focus:outline-none resize-none selection:bg-amber-500/30"
              spellCheck={false}
            />
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Caracteres: {content.length} | Linhas: {content.split('\n').length}</span>
              <span>Acordes detectados: {parsedPreview.uniqueChords.length}</span>
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="flex flex-col h-full bg-slate-900/40 p-6 overflow-y-auto">
            <div className="mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Prévia em Tempo Real
              </span>
            </div>
            {parsedPreview.lines.length === 0 ? (
              <div className="text-slate-500 text-sm italic">
                A prévia da cifra aparecerá aqui conforme você digita.
              </div>
            ) : (
              <div className="space-y-3 font-sans text-sm">
                {parsedPreview.lines.map((line, idx) => {
                  if (line.type === 'empty') return <div key={idx} className="h-3" />;
                  if (line.type === 'section_start') {
                    return (
                      <div key={idx} className="pt-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold text-xs uppercase border border-amber-500/30">
                          {line.sectionName}
                        </span>
                      </div>
                    );
                  }
                  if (line.type === 'section_end') {
                    return <div key={idx} className="border-b border-slate-800 pb-1" />;
                  }
                  if (line.type === 'comment') {
                    return (
                      <div key={idx} className="text-xs text-cyan-400 italic bg-cyan-950/20 px-2 py-0.5 rounded">
                        {line.comment}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex flex-wrap items-end">
                      {line.tokens?.map((token, tIdx) => (
                        <span key={tIdx} className="inline-flex flex-col mr-1">
                          {token.chord ? (
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              {token.chord}
                            </span>
                          ) : (
                            <span className="h-4" />
                          )}
                          <span className="whitespace-pre">{token.lyric || ' '}</span>
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
