import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  Layers,
  Sparkles,
  ArrowRight,
  Music,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  extractTextFromFile,
  isRepertoireList,
  parseRepertoireList,
  parseFullSongDocument,
  matchDuplicates,
  type ParsedImportedSong,
} from '../../utils/fileImporter';
import { db } from '../../db';
import type { Song } from '../../types';
import { ALL_KEYS } from '../../utils/transposer';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  targetSongIdToUpdate?: string; // If opening from an existing skeleton song to attach file
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  targetSongIdToUpdate,
}) => {
  const [step, setStep] = useState<'upload' | 'review' | 'summary'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [parsedSongs, setParsedSongs] = useState<ParsedImportedSong[]>([]);
  const [fileName, setFileName] = useState('');
  const [isSongList, setIsSongList] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedSummary, setImportedSummary] = useState<{ total: number; replaced: number; created: number }>({
    total: 0,
    replaced: 0,
    created: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);
    setFileName(file.name);
    setProgressMsg(`Lendo arquivo ${file.name}...`);

    try {
      // 1. Text extraction
      const { text, isScanned: scannedFlag } = await extractTextFromFile(file);
      setIsScanned(scannedFlag);

      if (scannedFlag && (!text || text.length < 30)) {
        // Scanned PDF or Image
        setProgressMsg('Documento digitalizado/imagem detectado. Convertendo para análise visual...');
        // We can offer OCR directly
        setIsScanned(true);
      }

      // 2. Format detection: is it a setlist of song titles or a full chord song?
      const isList = isRepertoireList(text);
      setIsSongList(isList);

      let extractedList: ParsedImportedSong[] = [];
      if (isList) {
        setProgressMsg('Identificada lista de repertório com títulos. Criando entradas esqueleto...');
        extractedList = parseRepertoireList(text);
      } else {
        setProgressMsg('Extraindo acordes e estrutura ChordPro...');
        extractedList = parseFullSongDocument(text, file.name);
      }

      // 3. Duplicate check against existing library
      const existingSongs = await db.songs.toArray();
      const duplicateChecked = matchDuplicates(extractedList, existingSongs);

      // If targeted to an existing song
      if (targetSongIdToUpdate && duplicateChecked.length === 1) {
        duplicateChecked[0].isDuplicateOfId = targetSongIdToUpdate;
        duplicateChecked[0].action = 'replace';
      }

      setParsedSongs(duplicateChecked);
      setStep('review');
    } catch (err: any) {
      console.error('Erro na importação:', err);
      setErrorMessage(err.message || 'Erro ao processar o arquivo.');
    } finally {
      setLoading(false);
    }
  };

  // OCR Scan using Gemini server endpoint
  const handleOcrScan = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);
    setFileName(file.name);
    setProgressMsg('Enviando imagem para reconhecimento visual de acordes (Gemini Vision OCR)...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/gemini/parse-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Image: base64,
              mimeType: file.type || 'image/jpeg',
            }),
          });
          const data = await res.json();
          if (data.error) {
            throw new Error(data.error);
          }

          const ocrSong: ParsedImportedSong = {
            id: `ocr-${Date.now()}`,
            title: data.title || 'Música Escaneada',
            artist: data.artist || '',
            key: data.key || 'G',
            bpm: data.bpm || 100,
            capo: data.capo || 0,
            type: 'repertorio',
            status: 'rascunho',
            chordProContent: data.chordProContent || '',
            rawText: data.chordProContent || '',
            confidence: (data.confidence as any) || 'alta',
            warnings: data.warnings || [],
            action: 'create',
          };

          const existingSongs = await db.songs.toArray();
          const matched = matchDuplicates([ocrSong], existingSongs);
          setParsedSongs(matched);
          setStep('review');
        } catch (e: any) {
          setErrorMessage(e.message || 'Falha ao processar OCR com IA.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao ler arquivo de imagem.');
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleOcrScan(file);
      } else {
        handleProcessFile(file);
      }
    }
  };

  // Commit songs to database
  const handleSaveToDatabase = async () => {
    setLoading(true);
    setProgressMsg('Salvando no banco de dados local...');
    let created = 0;
    let replaced = 0;

    try {
      for (const item of parsedSongs) {
        if (item.action === 'ignore') continue;

        if (item.action === 'replace' && item.isDuplicateOfId) {
          // Update existing song
          await db.songs.update(item.isDuplicateOfId, {
            title: item.title,
            artist: item.artist,
            originalKey: item.key,
            currentKey: item.key,
            bpm: item.bpm,
            capo: item.capo,
            instrument: item.instrument,
            chordProContent: item.chordProContent,
            status: item.chordProContent.trim().length > 0 ? 'rascunho' : 'pendente',
            updatedAt: new Date().toISOString(),
          });
          replaced++;
        } else {
          // Create new song
          const newSong: Song = {
            id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: item.title,
            artist: item.artist,
            originalKey: item.key,
            currentKey: item.key,
            mode: item.key.includes('m') ? 'minor' : 'major',
            bpm: item.bpm,
            timeSignature: '4/4',
            capo: item.capo,
            instrument: item.instrument,
            chordProContent: item.chordProContent,
            tags: item.block ? [`Bloco ${item.block}`] : ['Importado'],
            origin: 'file',
            type: item.type,
            status: item.status,
            block: item.block,
            orderInBlock: item.orderInBlock,
            notes: item.notes,
            isFavorite: false,
            workspaceId: 'ws-ss-clarinetes',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.songs.add(newSong);
          created++;
        }
      }

      setImportedSummary({ total: created + replaced, created, replaced });
      setStep('summary');
    } catch (e: any) {
      console.error('Erro ao salvar no banco:', e);
      setErrorMessage(e.message || 'Erro ao persistir músicas importadas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {step === 'upload' && 'Importar Arquivos de Cifras e Repertórios'}
                {step === 'review' && (isSongList ? 'Revisar Lista de Repertório Extraída' : 'Revisar Cifra Extraída')}
                {step === 'summary' && 'Importação Concluída com Sucesso'}
              </h2>
              <p className="text-xs text-slate-400">
                Formatos aceitos: Word (.docx), PDF (.pdf), ChordPro (.cho, .pro, .txt) e Fotos (.jpg, .png)
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Aviso de Importação</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* STEP 1: UPLOAD AREA */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt,.cho,.chordpro,.pro,image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.type.startsWith('image/')) {
                        handleOcrScan(file);
                      } else {
                        handleProcessFile(file);
                      }
                    }
                  }}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  Arraste e solte o arquivo aqui, ou clique para selecionar
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Suporta arquivos .docx gerados no Word, partituras/cifras em .pdf, arquivos .txt e folhas de repertório.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">Word .docx</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">PDF .pdf</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">ChordPro .cho</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">Texto .txt</span>
                </div>
              </div>

              {/* Photo / Camera Scanner Alternative */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-500/15 text-teal-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Foto da folha de cifra (Scanner OCR)</div>
                    <div className="text-xs text-slate-400">Tire foto com o celular ou envie uma imagem impressa da cifra.</div>
                  </div>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleOcrScan(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  Escanear Cifra
                </button>
              </div>

              {loading && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-center animate-pulse">
                  <div className="text-sm font-semibold text-amber-400">{progressMsg}</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW TABLE / SIDE-BY-SIDE */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="text-sm text-slate-300">
                  Arquivo: <span className="font-mono font-bold text-amber-400">{fileName}</span>
                  <span className="ml-3 text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {parsedSongs.length} {parsedSongs.length === 1 ? 'música detectada' : 'músicas detectadas'}
                  </span>
                </div>
              </div>

              {/* SECTION 5.8: LIST REVIEW TABLE */}
              {isSongList ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Título Extraído</th>
                        <th className="p-3">Artista / Referência</th>
                        <th className="p-3">Tom</th>
                        <th className="p-3">Instrumento</th>
                        <th className="p-3">Classificação</th>
                        <th className="p-3">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {parsedSongs.map((song, idx) => (
                        <tr key={song.id} className={song.isDuplicateOfId ? 'bg-amber-500/5' : ''}>
                          <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={song.title}
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].title = e.target.value;
                                setParsedSongs(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-semibold w-full focus:outline-none"
                            />
                            {song.warnings.length > 0 && (
                              <span className="text-[10px] text-amber-400 block mt-0.5">
                                {song.warnings[0]}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={song.artist}
                              placeholder="Opcional"
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].artist = e.target.value;
                                setParsedSongs(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300 w-full focus:outline-none"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={song.key}
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].key = e.target.value;
                                setParsedSongs(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-amber-400 font-mono font-bold focus:outline-none"
                            >
                              <option value="??">??</option>
                              {ALL_KEYS.map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={song.instrument || ''}
                              placeholder="Ex: Saxofone"
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].instrument = e.target.value;
                                setParsedSongs(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 w-28 focus:outline-none"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={song.type}
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].type = e.target.value as any;
                                setParsedSongs(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none text-xs"
                            >
                              <option value="autoral">Autoral</option>
                              <option value="repertorio">Repertório</option>
                              <option value="instrumental">Instrumental</option>
                              <option value="a_definir">A Definir</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={song.action}
                              onChange={(e) => {
                                const updated = [...parsedSongs];
                                updated[idx].action = e.target.value as any;
                                setParsedSongs(updated);
                              }}
                              className={`border rounded px-2 py-1 text-xs font-semibold focus:outline-none ${
                                song.action === 'replace'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                  : song.action === 'create'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <option value="create">Criar Novo</option>
                              {song.isDuplicateOfId && <option value="replace">Substituir Existente</option>}
                              <option value="ignore">Ignorar</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* SINGLE SONG REVIEW (SIDE-BY-SIDE OR FORM) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Metadata edit & Duplicate handling */}
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                      Dados Identificados
                    </h4>

                    {parsedSongs[0]?.isDuplicateOfId && (
                      <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs">
                        <strong>Música já existente no acervo:</strong> Escolha se deseja atualizar o registro existente com esta cifra ou criar uma cópia.
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...parsedSongs];
                              updated[0].action = 'replace';
                              setParsedSongs(updated);
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold ${
                              parsedSongs[0].action === 'replace'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            Substituir Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...parsedSongs];
                              updated[0].action = 'create';
                              setParsedSongs(updated);
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold ${
                              parsedSongs[0].action === 'create'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            Criar Cópia
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Título</label>
                      <input
                        type="text"
                        value={parsedSongs[0]?.title || ''}
                        onChange={(e) => {
                          const updated = [...parsedSongs];
                          updated[0].title = e.target.value;
                          setParsedSongs(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Artista</label>
                      <input
                        type="text"
                        value={parsedSongs[0]?.artist || ''}
                        onChange={(e) => {
                          const updated = [...parsedSongs];
                          updated[0].artist = e.target.value;
                          setParsedSongs(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">Tom</label>
                        <select
                          value={parsedSongs[0]?.key || 'G'}
                          onChange={(e) => {
                            const updated = [...parsedSongs];
                            updated[0].key = e.target.value;
                            setParsedSongs(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-400 font-mono font-bold focus:outline-none"
                        >
                          {ALL_KEYS.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">BPM</label>
                        <input
                          type="number"
                          value={parsedSongs[0]?.bpm || 100}
                          onChange={(e) => {
                            const updated = [...parsedSongs];
                            updated[0].bpm = parseInt(e.target.value, 10) || 100;
                            setParsedSongs(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: ChordPro text output preview */}
                  <div className="flex flex-col bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">
                      Cifra Convertida (ChordPro)
                    </h4>
                    <textarea
                      value={parsedSongs[0]?.chordProContent || ''}
                      onChange={(e) => {
                        const updated = [...parsedSongs];
                        updated[0].chordProContent = e.target.value;
                        setParsedSongs(updated);
                      }}
                      className="flex-1 w-full h-64 bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUMMARY */}
          {step === 'summary' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Importação Finalizada!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                {importedSummary.total} músicas processadas com sucesso.
                {importedSummary.created > 0 && ` (${importedSummary.created} novas criadas)`}
                {importedSummary.replaced > 0 && ` (${importedSummary.replaced} existentes atualizadas)`}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onImportComplete();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition"
                >
                  Ver no Acervo / Setlist
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step === 'review' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Voltar ao Envio
            </button>
            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar e Salvar no Acervo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
