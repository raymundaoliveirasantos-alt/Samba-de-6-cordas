import React, { useState, useEffect } from 'react';
import {
  Music,
  ListMusic,
  Sliders,
  Users,
  Maximize2,
  Tv,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  ChevronDown,
  Plus,
  Upload,
  Globe,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { DemoBadge } from './DemoBadge';
import { db } from '../../db';
import type { Workspace } from '../../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenStageMode: () => void;
  onOpenImport: () => void;
  onNewSong: () => void;
  onOpenWebSearch?: () => void;
  onOpenBatchSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenStageMode,
  onOpenImport,
  onNewSong,
  onOpenWebSearch,
  onOpenBatchSync,
}) => {
  const { currentWorkspaceId, setWorkspaceId, userPlan, isOnline } = useAppStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showWsMenu, setShowWsMenu] = useState(false);

  useEffect(() => {
    db.workspaces.toArray().then(setWorkspaces);
  }, []);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* App Logo & Workspace Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('library')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-slate-100 flex items-center gap-1.5">
                CifraViva
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {userPlan === 'pro_stage' ? 'PRO STAGE' : 'FREE'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5 truncate max-w-[140px] sm:max-w-[200px]">
                {currentWorkspace?.name || 'SS Clarinetes'}
              </div>
            </div>
          </button>

          {/* Workspace Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWsMenu(!showWsMenu)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Trocar Espaço de Trabalho (Workspace)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {showWsMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Espaços de Trabalho
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWorkspaceId(ws.id);
                      setShowWsMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      ws.id === currentWorkspaceId
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">
                      {ws.plan}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => onTabChange('library')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'library'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Biblioteca
          </button>
          <button
            onClick={() => onTabChange('setlists')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'setlists'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Repertórios (Setlists)
          </button>
          <button
            onClick={() => onTabChange('tools')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'tools'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ferramentas
          </button>
          <button
            onClick={() => onTabChange('virtual_band')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'virtual_band'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Banda Virtual
          </button>
          <button
            onClick={() => onTabChange('team')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'team'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Equipe & Escalas
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ajustes
          </button>
        </nav>

        {/* Right Actions: Demo badge, Import, New Song, Stage Mode */}
        <div className="flex items-center gap-2">
          {/* Demo Local Badge */}
          <DemoBadge className="hidden sm:inline-flex" />

          {/* Quick Web Search Button */}
          {onOpenWebSearch && (
            <button
              onClick={onOpenWebSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 hover:border-amber-500/40 transition"
              title="Buscar cifras na web (Google & Cifra Club)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Buscar na Web</span>
            </button>
          )}

          {/* Quick Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Importar arquivos (.docx, .pdf, fotos)"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Importar</span>
          </button>

          {/* New Song Button */}
          <button
            onClick={onNewSong}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Cadastrar nova música manualmente"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Nova Música</span>
          </button>

          {/* Enter Stage Mode Button */}
          <button
            onClick={onOpenStageMode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            title="Entrar no Modo Palco para Músicos"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modo Palco</span>
          </button>
        </div>
      </div>
    </header>
  );
};
