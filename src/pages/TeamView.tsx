import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Copy,
  Plus,
  Tag,
  Share2,
} from 'lucide-react';
import { db } from '../db';
import type { Member, EventSchedule, Setlist } from '../types';
import { useAppStore } from '../store';
import { DemoBadge } from '../components/common/DemoBadge';

export const TeamView: React.FC = () => {
  const { currentWorkspaceId } = useAppStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventSchedule[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'events'>('members');

  // New member modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Member['role']>('voz');
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  const loadData = async () => {
    const mems = await db.members.where('workspaceId').equals(currentWorkspaceId).toArray();
    const evs = await db.events.where('workspaceId').equals(currentWorkspaceId).toArray();
    const sets = await db.setlists.where('workspaceId').equals(currentWorkspaceId).toArray();
    setMembers(mems.length > 0 ? mems : await db.members.toArray());
    setEvents(evs.length > 0 ? evs : await db.events.toArray());
    setSetlists(sets.length > 0 ? sets : await db.setlists.toArray());
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspaceId]);

  // Create invite
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const code = `SSC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@cifraviva.app`,
      phone: '',
      role: newRole,
      status: 'convite_pendente',
      workspaceId: currentWorkspaceId,
      inviteCode: code,
      avatarColor: 'from-amber-500 to-teal-600',
    };

    await db.members.add(newMember);
    setMembers((prev) => [...prev, newMember]);
    setGeneratedInvite(code);
    setNewName('');
    setNewEmail('');
  };

  // Toggle member confirmation for an event
  const toggleConfirmation = async (event: EventSchedule, memberId: string) => {
    const isConfirmed = event.confirmedMemberIds.includes(memberId);
    const updatedConfirmed = isConfirmed
      ? event.confirmedMemberIds.filter((id: string) => id !== memberId)
      : [...event.confirmedMemberIds, memberId];

    await db.events.update(event.id, { confirmedMemberIds: updatedConfirmed });
    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, confirmedMemberIds: updatedConfirmed } : ev))
    );
  };

  const roleLabels: Record<Member['role'], string> = {
    voz: 'Voz / Vocal',
    violao: 'Violão',
    guitarra: 'Guitarra',
    baixo: 'Baixo Elétrico',
    teclado: 'Teclado / Piano',
    bateria: 'Bateria / Percussão',
    sax: 'Saxofone',
    flauta: 'Flauta Transversal',
    trompete: 'Trompete',
    trombone: 'Trombone',
    som: 'Operador de Som',
    projecao: 'Operador de Projeção',
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Equipe de Músicos & Escalas
            </h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão de integrantes, funções na banda, escalas de culto e confirmação de presença.
          </p>
        </div>

        {/* Tab switcher & Invite button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'members'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Membros ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'events'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Escalas & Eventos ({events.length})
            </button>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            Convidar Músico
          </button>
        </div>
      </div>

      {/* 1. MEMBERS LIST TAB */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${
                    member.avatarColor || 'from-amber-500 to-teal-500'
                  } flex items-center justify-center font-bold text-slate-950 text-base shadow`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-100 truncate">
                    {member.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">
                    {roleLabels[member.role] || member.role}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{member.email}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                    member.status === 'ativo'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {member.status === 'ativo' ? 'Ativo na Equipe' : 'Convite Pendente'}
                </span>

                {member.inviteCode && (
                  <span className="font-mono text-[10px] text-slate-400">
                    Código: {member.inviteCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ESCALAS & EVENTOS TAB */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((ev) => {
            const linkedSetlist = setlists.find((s) => s.id === ev.setlistId);
            return (
              <div
                key={ev.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{ev.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(ev.date).toLocaleDateString('pt-BR')} às {ev.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {ev.location}
                      </span>
                      {linkedSetlist && (
                        <span className="text-amber-400 font-semibold">
                          Repertório: {linkedSetlist.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    {ev.confirmedMemberIds.length}/{ev.assignedMemberIds.length} Confirmados
                  </span>
                </div>

                {ev.notes && (
                  <div className="p-3 bg-slate-950/70 rounded-xl text-xs text-slate-300 border border-slate-800">
                    <span className="font-semibold text-amber-400">Avisos do Ensaio / Culto: </span>
                    {ev.notes}
                  </div>
                )}

                {/* Assigned Members Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Músicos Escalados (Clique para alternar confirmação)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {ev.assignedMemberIds.map((memId: string) => {
                      const member = members.find((m) => m.id === memId);
                      if (!member) return null;
                      const isConfirmed = ev.confirmedMemberIds.includes(memId);

                      return (
                        <button
                          key={memId}
                          type="button"
                          onClick={() => toggleConfirmation(ev, memId)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                            isConfirmed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-100">{member.name}</div>
                            <div className="text-[11px] text-amber-400/90">{roleLabels[member.role]}</div>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-semibold">
                            {isConfirmed ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Confirmado
                              </span>
                            ) : (
                              <span className="text-amber-400/80 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pendente
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-1">Convidar Integrante da Banda</h3>
            <p className="text-xs text-slate-400 mb-4">
              Gera um convite com código para o músico acessar e sincronizar os repertórios.
            </p>

            {generatedInvite ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center">
                  <div className="text-xs text-emerald-300 mb-1">Convite gerado com sucesso!</div>
                  <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
                    {generatedInvite}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    O integrante foi adicionado à lista como "Convite Pendente" (Modo Demonstração Local).
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGeneratedInvite(null);
                    setShowInviteModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nome do Músico</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Lucas Tecladista"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">E-mail (Opcional no Demo)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="lucas@exemplo.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Instrumento / Função</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <option key={role} value={role}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    Gerar Convite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
