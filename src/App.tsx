import React, { useState, useEffect } from 'react';
import { initializeDatabase, db } from './db';
import type { Song, Setlist } from './types';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { LibraryView } from './pages/LibraryView';
import { SetlistsView } from './pages/SetlistsView';
import { SetlistDetailView } from './pages/SetlistDetailView';
import { ToolsView } from './pages/ToolsView';
import { VirtualBand } from './components/tools/VirtualBand';
import { TeamView } from './pages/TeamView';
import { SettingsView } from './pages/SettingsView';
import { ChordViewer } from './components/songs/ChordViewer';
import { SongEditor } from './components/songs/SongEditor';
import { FileImportModal } from './components/import/FileImportModal';
import { AiReviewModal } from './components/songs/AiReviewModal';
import { StageModeView } from './pages/StageModeView';
import { ProjectionView } from './pages/ProjectionView';
import { liveSync } from './utils/syncChannel';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('library');

  // Selected song / setlist navigation
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);

  // Modals & Subviews
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetSongIdForImport, setTargetSongIdForImport] = useState<string | undefined>(undefined);

  // Stage Mode
  const [stageModeData, setStageModeData] = useState<{
    isActive: boolean;
    songs: Song[];
    startIndex: number;
    setlistName?: string;
  }>({
    isActive: false,
    songs: [],
    startIndex: 0,
  });

  // AI Suggestion review state
  const [aiReviewData, setAiReviewData] = useState<{
    isOpen: boolean;
    song: Song | null;
    suggestedContent: string;
    suggestedKey: string;
    confidence: string;
    notes?: string;
  }>({
    isOpen: false,
    song: null,
    suggestedContent: '',
    suggestedKey: 'G',
    confidence: 'alta',
  });

  // Check if current URL is dedicated projection window
  const isProjectionWindow = typeof window !== 'undefined' && window.location.pathname.includes('/projection');

  useEffect(() => {
    initializeDatabase().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Open separate window for projection (Section 4.6)
  const handleOpenProjection = () => {
    const url = window.location.origin + '/projection';
    window.open(url, 'CifraVivaProjecao', 'width=1280,height=720,menubar=no,toolbar=no');
  };

  // Trigger AI Suggestion for chordpro content
  const handleAiSuggestForSong = async (song: Song) => {
    if (song.type === 'autoral') {
      alert('Esta é uma música autoral da banda. Conforme as diretrizes, músicas autorais aguardam o arquivo ou inserção manual da banda.');
      return;
    }

    try {
      const res = await fetch('/api/gemini/suggest-chords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          artist: song.artist,
          isAutoral: false,
        }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiReviewData({
        isOpen: true,
        song,
        suggestedContent: data.chordProContent || '',
        suggestedKey: data.suggestedKey || song.originalKey || 'G',
        confidence: data.confidence || 'alta',
        notes: data.musicalNotes,
      });
    } catch (e: any) {
      alert(`Erro na busca com IA: ${e.message || 'Verifique a conexão ou digite a cifra manualmente.'}`);
    }
  };

  // Accept AI suggestion
  const handleAcceptAiSuggestion = async (finalContent: string, key: string) => {
    if (!aiReviewData.song) return;

    await db.songs.update(aiReviewData.song.id, {
      chordProContent: finalContent,
      originalKey: key,
      currentKey: key,
      status: 'rascunho',
      origin: 'sugestao_ia',
      updatedAt: new Date().toISOString(),
    });

    const updated = await db.songs.get(aiReviewData.song.id);
    if (updated) setSelectedSong(updated);

    setAiReviewData({
      isOpen: false,
      song: null,
      suggestedContent: '',
      suggestedKey: 'G',
      confidence: 'alta',
    });
  };

  // Save edited song
  const handleSaveSongEdits = async (updatedFields: Partial<Song>) => {
    if (!selectedSong) return;
    await db.songs.update(selectedSong.id, updatedFields);
    const updated = await db.songs.get(selectedSong.id);
    if (updated) setSelectedSong(updated);
    setIsEditingSong(false);
  };

  // Handle create new song manually
  const handleCreateNewSong = async () => {
    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: 'Nova Música',
      artist: '',
      originalKey: 'G',
      currentKey: 'G',
      mode: 'major',
      bpm: 100,
      timeSignature: '4/4',
      capo: 0,
      chordProContent: '',
      tags: ['Nova'],
      origin: 'manual',
      type: 'repertorio',
      status: 'pendente',
      isFavorite: false,
      workspaceId: 'ws-ss-clarinetes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.songs.add(newSong);
    setSelectedSong(newSong);
    setIsEditingSong(true);
  };

  // Create new setlist
  const handleCreateNewSetlist = async () => {
    const newSet: Setlist = {
      id: `setlist-${Date.now()}`,
      name: 'Novo Repertório de Louvor',
      date: new Date().toISOString().split('T')[0],
      location: 'Templo / Ensaio',
      notes: '',
      items: [],
      workspaceId: 'ws-ss-clarinetes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.setlists.add(newSet);
    setSelectedSetlist(newSet);
  };

  // Start Stage Mode
  const handleStartStageMode = (setlist: Setlist, startIdx: number) => {
    db.songs.toArray().then((all) => {
      const map: Record<string, Song> = {};
      all.forEach((s) => (map[s.id] = s));
      const orderedSongs = setlist.items.map((it) => map[it.songId]).filter(Boolean);

      setStageModeData({
        isActive: true,
        songs: orderedSongs.length > 0 ? orderedSongs : all.slice(0, 5),
        startIndex: startIdx,
        setlistName: setlist.name,
      });
    });
  };

  // If projection route is opened
  if (isProjectionWindow) {
    return <ProjectionView />;
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-amber-400 font-mono text-sm">
        Carregando CifraViva...
      </div>
    );
  }

  // STAGE MODE FULLSCREEN OVERLAY
  if (stageModeData.isActive) {
    return (
      <StageModeView
        songs={stageModeData.songs}
        initialSongIndex={stageModeData.startIndex}
        setlistName={stageModeData.setlistName}
        onExit={() => setStageModeData({ isActive: false, songs: [], startIndex: 0 })}
        onOpenProjection={handleOpenProjection}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 md:pb-0">
      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedSong(null);
          setSelectedSetlist(null);
          setIsEditingSong(false);
          setCurrentTab(tab);
        }}
        onOpenStageMode={() => {
          db.songs.toArray().then((songs) => {
            setStageModeData({
              isActive: true,
              songs,
              startIndex: 0,
              setlistName: 'Modo Palco Livre',
            });
          });
        }}
        onOpenImport={() => {
          setTargetSongIdForImport(undefined);
          setIsImportModalOpen(true);
        }}
        onNewSong={handleCreateNewSong}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {selectedSong ? (
          isEditingSong ? (
            <SongEditor
              song={selectedSong}
              onSave={handleSaveSongEdits}
              onCancel={() => setIsEditingSong(false)}
            />
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Back to list bar */}
              <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedSong(null)}
                  className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  ← Voltar para {selectedSetlist ? 'o Repertório' : 'a Biblioteca'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingSong(true)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                  >
                    Editar Cifra
                  </button>
                  <button
                    onClick={() => {
                      setStageModeData({
                        isActive: true,
                        songs: [selectedSong],
                        startIndex: 0,
                      });
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold"
                  >
                    Tocar no Palco
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <ChordViewer
                  song={selectedSong}
                  onEditSong={() => setIsEditingSong(true)}
                  onImportForSong={() => {
                    setTargetSongIdForImport(selectedSong.id);
                    setIsImportModalOpen(true);
                  }}
                  onAiSuggest={() => handleAiSuggestForSong(selectedSong)}
                  onOpenStageMode={() => {
                    setStageModeData({
                      isActive: true,
                      songs: [selectedSong],
                      startIndex: 0,
                    });
                  }}
                  onOpenProjection={handleOpenProjection}
                />
              </div>
            </div>
          )
        ) : selectedSetlist ? (
          <SetlistDetailView
            setlist={selectedSetlist}
            onBack={() => setSelectedSetlist(null)}
            onSelectSong={(song) => setSelectedSong(song)}
            onStartStageMode={handleStartStageMode}
          />
        ) : (
          <>
            {currentTab === 'library' && (
              <LibraryView
                onSelectSong={(song) => setSelectedSong(song)}
                onOpenImport={() => {
                  setTargetSongIdForImport(undefined);
                  setIsImportModalOpen(true);
                }}
                onNewSong={handleCreateNewSong}
              />
            )}
            {currentTab === 'setlists' && (
              <SetlistsView
                onSelectSetlist={(setlist) => setSelectedSetlist(setlist)}
                onNewSetlist={handleCreateNewSetlist}
              />
            )}
            {currentTab === 'tools' && <ToolsView />}
            {currentTab === 'virtual_band' && (
              <div className="p-4 md:p-8">
                <VirtualBand />
              </div>
            )}
            {currentTab === 'team' && <TeamView />}
            {currentTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedSong(null);
          setSelectedSetlist(null);
          setIsEditingSong(false);
          setCurrentTab(tab);
        }}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Import Modal */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetSongIdToUpdate={targetSongIdForImport}
        onImportComplete={() => {
          if (selectedSong && targetSongIdForImport) {
            db.songs.get(targetSongIdForImport).then((s) => {
              if (s) setSelectedSong(s);
            });
          }
        }}
      />

      {/* AI Suggestion Review Modal */}
      {aiReviewData.song && (
        <AiReviewModal
          isOpen={aiReviewData.isOpen}
          title={aiReviewData.song.title}
          artist={aiReviewData.song.artist}
          suggestedKey={aiReviewData.suggestedKey}
          originalContent={aiReviewData.song.chordProContent}
          aiGeneratedContent={aiReviewData.suggestedContent}
          confidence={aiReviewData.confidence}
          notes={aiReviewData.notes}
          onAccept={handleAcceptAiSuggestion}
          onDiscard={() =>
            setAiReviewData({
              isOpen: false,
              song: null,
              suggestedContent: '',
              suggestedKey: 'G',
              confidence: 'alta',
            })
          }
        />
      )}
    </div>
  );
}
