import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  ClipboardPaste,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Music,
  ArrowRight,
} from 'lucide-react';
import { parseChordPro } from '../../utils/chordPro';
import { ALL_KEYS } from '../../utils/transposer';
import type { Song } from '../../types';

interface WebChordSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSong?: Song | null;
  onSaveChord: (result: {
    title: string;
    artist: string;
    key: string;
    bpm: number;
    chordProContent: string;
    notes?: string;
  }) => void;
}

export const WebChordSearchModal: React.FC<WebChordSearchModalProps> = ({
  isOpen,
  onClose,
  targetSong,
  onSaveChord,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'paste'>('search');
  const [searchTitle, setSearchTitle] = useState(targetSong?.title || '');
  const [searchArtist, setSearchArtist] = useState(targetSong?.artist || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search result
  const [result, setResult] = useState<{
    title: string;
    artist: string;
    suggestedKey: string;
    bpm: number;
    chordProContent: string;
    sourceUrls?: { title: string; uri: string }[];
    musicalNotes?: string;
  } | null>(null);

  // Paste mode text
  const [pastedText, setPastedText] = useState('');
  const [pasteKey, setPasteKey] = useState('G');

  if (!isOpen) return null;

  // External links
  const queryStr = `${searchTitle} ${searchArtist}`.trim();
  const cifraClubSearchUrl = `https://www.cifraclub.com.br/?q=${encodeURIComponent(queryStr || 'cifras')}`;
  const googleSearchUrl = `https://www.google.com/search?q=cifra+${encodeURIComponent(queryStr || 'cifras')}`;

  const handleSearchWeb = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTitle.trim()) {
      setErrorMessage('Digite o título da música para buscar na web.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/suggest-chords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: searchTitle.trim(),
          artist: searchArtist.trim(),
        }),
      });

      const data = await res.json();
      if (data.error && !data.chordProContent) {
        throw new Error(data.error);
      }

      setResult({
        title: data.title || searchTitle,
        artist: data.artist || searchArtist,
        suggestedKey: data.suggestedKey || 'G',
        bpm: data.bpm || 100,
        chordProContent: data.chordProContent || '',
        sourceUrls: data.sourceUrls || [],
        musicalNotes: data.musicalNotes,
      });
    } catch (err: any) {
      console.warn('Erro ao buscar na web:', err);
      setErrorMessage(
        err.message ||
          'Não foi possível obter a cifra automaticamente. Você pode abrir o link no Cifra Club abaixo e colar a cifra diretamente!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPastedChord = () => {
    if (!pastedText.trim()) return;
    const parsed = parseChordPro(pastedText);

    onSaveChord({
      title: searchTitle || parsed.title || 'Música da Web',
      artist: searchArtist || parsed.artist || '',
      key: parsed.key || pasteKey,
      bpm: parsed.tempo || 100,
      chordProContent: pastedText,
      notes: 'Cifra importada da web.',
    });
    onClose();
  };

  const handleApplyResult = () => {
    if (!result) return;
    onSaveChord({
      title: result.title,
      artist: result.artist,
      key: result.suggestedKey,
      bpm: result.bpm,
      chordProContent: result.chordProContent,
      notes: result.musicalNotes,
    });
    onClose();
  };

  const parsedPreview = result ? parseChordPro(result.chordProContent) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Buscar Cifras na Web
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                  Google & Cifra Club
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pesquisa na internet letras e acordes reais e converte para o formato ChordPro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 px-6 pt-4 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'search'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 inline mr-1.5" />
            Pesquisa Automática na Web
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5 inline mr-1.5" />
            Colar Cifra da Web (Auto-Converter)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aviso na busca: </span>
                  {errorMessage}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 pl-6">
                <a
                  href={cifraClubSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold border border-slate-700 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir no Cifra Club
                </a>
                <a
                  href={googleSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Pesquisar no Google
                </a>
              </div>
            </div>
          )}

          {/* TAB 1: SEARCH AUTOMATICALLY */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearchWeb} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Título da Música *
                  </label>
                  <input
                    type="text"
                    required
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Ex: Esperanças Perdidas, Juízo Final, Trem das Onze"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Artista / Compositor
                  </label>
                  <input
                    type="text"
                    value={searchArtist}
                    onChange={(e) => setSearchArtist(e.target.value)}
                    placeholder="Ex: Cartola, Adoniran Barbosa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex gap-2">
                    <a
                      href={cifraClubSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver no Cifra Club
                    </a>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Pesquisar no Google
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !searchTitle.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                  >
                    <Globe className="w-4 h-4" />
                    {loading ? 'Pesquisando na Web...' : 'Buscar Cifra na Web'}
                  </button>
                </div>
              </form>

              {loading && (
                <div className="py-12 text-center text-amber-400 animate-pulse text-sm">
                  Consultando Cifra Club e bases de cifras na web com busca do Google...
                </div>
              )}

              {/* SEARCH RESULT PREVIEW */}
              {result && !loading && (
                <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-700 shadow-xl space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          Cifra Encontrada na Web
                        </span>
                        <h3 className="font-bold text-base text-slate-100">{result.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.artist} • Tom: <span className="font-mono text-amber-400 font-bold">{result.suggestedKey}</span> • {result.bpm} BPM
                      </p>
                    </div>

                    {result.sourceUrls && result.sourceUrls.length > 0 && (
                      <div className="text-xs text-slate-400">
                        Fonte: <a href={result.sourceUrls[0].uri} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold">{result.sourceUrls[0].title || 'Cifra Club'} <ExternalLink className="w-3 h-3" /></a>
                      </div>
                    )}
                  </div>

                  {result.musicalNotes && (
                    <div className="text-xs text-cyan-300 bg-cyan-950/20 p-2.5 rounded-xl border border-cyan-800/30">
                      <strong>Harmonia: </strong> {result.musicalNotes}
                    </div>
                  )}

                  {/* Chord Sheet preview */}
                  <div className="bg-slate-900 p-4 rounded-xl max-h-64 overflow-y-auto space-y-2 text-xs font-sans">
                    {parsedPreview?.lines.map((line, idx) => {
                      if (line.type === 'empty') return <div key={idx} className="h-2" />;
                      if (line.type === 'section_start') {
                        return (
                          <div key={idx} className="font-bold text-amber-400 uppercase text-[11px] pt-1">
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

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyResult}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {targetSong ? 'Salvar Cifra nesta Música' : 'Adicionar ao meu Acervo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE CHORD FROM WEB */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  Copie a cifra do Cifra Club ou de qualquer site e cole abaixo. O CifraViva converterá automaticamente acordes e letras!
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Tom:</span>
                  <select
                    value={pasteKey}
                    onChange={(e) => setPasteKey(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 font-mono font-bold focus:outline-none"
                  >
                    {ALL_KEYS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Cole aqui o texto da cifra copiado da web...&#10;&#10;Exemplo:&#10;Dm         Gm       A7          Dm&#10;Quantas vezes a vida nos engana..."
                className="w-full h-72 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500 resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleApplyPastedChord}
                  disabled={!pastedText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Converter e Salvar Cifra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
