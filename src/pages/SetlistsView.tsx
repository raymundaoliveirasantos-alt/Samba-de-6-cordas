import React, { useState, useEffect } from 'react';
import {
  ListMusic,
  Plus,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  Play,
  Copy,
  Trash2,
  Clock,
} from 'lucide-react';
import { db } from '../db';
import type { Setlist } from '../types';
import { useAppStore } from '../store';

interface SetlistsViewProps {
  onSelectSetlist: (setlist: Setlist) => void;
  onNewSetlist: () => void;
}

export const SetlistsView: React.FC<SetlistsViewProps> = ({
  onSelectSetlist,
  onNewSetlist,
}) => {
  const { currentWorkspaceId } = useAppStore();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSetlists = async () => {
    setLoading(true);
    try {
      const all = await db.setlists.where('workspaceId').equals(currentWorkspaceId).toArray();
      if (all.length === 0) {
        const fallback = await db.setlists.toArray();
        setSetlists(fallback);
      } else {
        setSetlists(all);
      }
    } catch (e) {
      console.warn('Erro ao carregar setlists:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetlists();
  }, [currentWorkspaceId]);

  const handleDuplicateSetlist = async (setlist: Setlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: Setlist = {
      ...setlist,
      id: `setlist-${Date.now()}`,
      name: `${setlist.name} (cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.setlists.add(copy);
    setSetlists((prev) => [copy, ...prev]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Repertórios & Setlists
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal">
              {setlists.length} listas
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize a ordem das músicas, tonalidades específicas por culto e notas para a equipe.
          </p>
        </div>

        <button
          onClick={onNewSetlist}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Novo Repertório
        </button>
      </div>

      {/* Setlists Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 animate-pulse">
          Carregando repertórios...
        </div>
      ) : setlists.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 p-12 text-center my-6">
          <ListMusic className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-200">Nenhum repertório cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Crie sua primeira lista de músicas para cultos, ensaios ou apresentações.
          </p>
          <button
            onClick={onNewSetlist}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
          >
            Criar Repertório
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {setlists.map((setlist) => {
            const isMainSsc = setlist.name.includes('SSC');
            return (
              <div
                key={setlist.id}
                onClick={() => onSelectSetlist(setlist)}
                className={`group rounded-2xl p-5 border transition-all cursor-pointer relative ${
                  isMainSsc
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-xl'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {isMainSsc && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2 inline-block">
                    Repertório Oficial 2026
                  </span>
                )}

                <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-400 transition-colors">
                  {setlist.name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-3">
                  {setlist.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {new Date(setlist.date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {setlist.location && (
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {setlist.location}
                    </span>
                  )}
                </div>

                {setlist.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {setlist.notes}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80 text-xs">
                  <span className="font-mono font-bold text-amber-400">
                    {setlist.items?.length || 0} músicas
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDuplicateSetlist(setlist, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Duplicar repertório"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition">
                      Abrir <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
