import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Zap,
  Sparkles,
  RotateCcw,
  Download,
  Info,
  Sliders,
  Tv,
} from 'lucide-react';
import { useAppStore } from '../store';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { syncLocalSongsToSupabase, pullSongsFromSupabase, checkSupabaseStatus } from '../utils/supabaseSync';
import { isSupabaseConfigured } from '../utils/supabaseClient';


export const SettingsView: React.FC = () => {
  const { userPlan, setUserPlan, preferences, updatePreferences } = useAppStore();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [sbStatus, setSbStatus] = useState<string>('');
  const [sbLoading, setSbLoading] = useState(false);

  const handleSyncToSupabase = async () => {
    setSbLoading(true);
    setSbStatus('Enviando...');
    const r = await syncLocalSongsToSupabase();
    setSbStatus(r.message);
    setSbLoading(false);
  };
  const handlePullFromSupabase = async () => {
    setSbLoading(true);
    setSbStatus('Baixando...');
    const r = await pullSongsFromSupabase();
    setSbStatus(r.message);
    setSbLoading(false);
  };



  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          Ajustes & Planos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie seu plano de assinatura, preferências de exibição de acordes e banco de dados local.
        </p>
      </div>

      {/* 1. PLAN SWITCHER (Section 7) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Seletor de Plano de Acesso
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Alterne entre os planos para testar os recursos do CifraViva.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Plano Atual: {userPlan === 'pro_stage' ? 'PRO STAGE' : 'FREE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Plan */}
          <div
            onClick={() => setUserPlan('free')}
            className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              userPlan === 'free'
                ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-400/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-base text-slate-100">Plano Gratuito (Free)</h3>
                {userPlan === 'free' && <Check className="w-5 h-5 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Para músicos individuais e bandas em início de formação.
              </p>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Biblioteca de cifras ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Transposição e diagramas em SVG
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Metrônomo, Afinador e Pads
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  ✕ Limite de 1 workspace e 2 setlists
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  ✕ Sem Projeção sincronizada e Insights de IA
                </li>
              </ul>
            </div>
            <button
              onClick={() => setUserPlan('free')}
              className={`w-full py-2 rounded-xl text-xs font-bold mt-5 transition ${
                userPlan === 'free'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {userPlan === 'free' ? 'Plano Ativo' : 'Escolher Free'}
            </button>
          </div>

          {/* Pro Stage Plan */}
          <div
            onClick={() => setUserPlan('pro_stage')}
            className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              userPlan === 'pro_stage'
                ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-500 ring-2 ring-amber-400/40 shadow-xl'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-amber-400">Plano Pro Stage</h3>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                    COMPLETO
                  </span>
                </div>
                {userPlan === 'pro_stage' && <Check className="w-5 h-5 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Para equipes de louvor, ministérios e bandas profissionais no palco.
              </p>
              <ul className="text-xs space-y-2 text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Tudo do plano Free
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> <strong>Workspaces e Setlists ilimitados</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> <strong>Insights Pro de IA</strong> (Duração, tessitura, transições)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> <strong>Tela de Projeção em 2ª janela</strong> (BroadcastChannel)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> <strong>Modo Palco avançado</strong> com trava de toques acidentais
                </li>
              </ul>
            </div>
            <button
              onClick={() => setUserPlan('pro_stage')}
              className={`w-full py-2 rounded-xl text-xs font-bold mt-5 transition ${
                userPlan === 'pro_stage'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {userPlan === 'pro_stage' ? 'Plano Ativo' : 'Ativar Pro Stage'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. PREFERENCES */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" /> Preferências de Visualização
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Instrumento Principal Padrão</label>
            <select
              value={preferences.instrument}
              onChange={(e) => updatePreferences({ instrument: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            >
              <option value="violao">Violão / Guitarra</option>
              <option value="teclado">Teclado / Piano</option>
              <option value="baixo">Baixo (Cifra + Fundamental)</option>
              <option value="ukulele">Ukulele</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Espaçamento Entre Linhas</label>
            <select
              value={preferences.lineHeight}
              onChange={(e) => updatePreferences({ lineHeight: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            >
              <option value="compact">Compacto</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Espaçado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. PWA AND APP INSTALLATION */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" /> Instalação no Dispositivo (PWA)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Instale o CifraViva na tela inicial do seu tablet ou celular para usar como aplicativo nativo no palco.
          </p>
        </div>
        <PWAInstallButton />
      </div>

      {/* 4. SUPABASE SYNC */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" /> Sincronização com Supabase
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSupabaseConfigured
              ? 'Supabase configurado. Envie suas músicas para a nuvem ou baixe de lá.'
              : 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (local) e na Vercel.'}
          </p>
        </div>
        {isSupabaseConfigured && (
          <div className="flex flex-wrap gap-3">
            <button
              disabled={sbLoading}
              onClick={handleSyncToSupabase}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 disabled:opacity-50"
            >
              Enviar para Supabase
            </button>
            <button
              disabled={sbLoading}
              onClick={handlePullFromSupabase}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-100 font-bold text-sm hover:bg-slate-700 disabled:opacity-50"
            >
              Baixar do Supabase
            </button>
          </div>
        )}
        {sbStatus && (
          <p className="text-xs text-slate-300 mt-2">{sbStatus}</p>
        )}
      </div>

    </div>
  );
};
