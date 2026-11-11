import React, { useState, useEffect } from 'react';
import { User, LogIn, UserPlus, Lock, Mail, AlertCircle, CheckCircle2, LogOut, Cloud } from 'lucide-react';
import { supabaseAuthService } from '../../utils/supabaseAuth';
import { isSupabaseConfigured } from '../../utils/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    supabaseAuthService.getSession().then(({ user }) => {
      setCurrentUser(user);
    });

    const { subscription } = supabaseAuthService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase não configurado. Verifique SUPABASE_URL e SUPABASE_ANON_KEY nos secrets.');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { user, error } = await supabaseAuthService.signUp(email, password);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage('Cadastro realizado com sucesso! Verifique seu e-mail ou faça login.');
        setIsSignUp(false);
      }
    } else {
      const { user, error } = await supabaseAuthService.signIn(email, password);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage('Login efetuado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabaseAuthService.signOut();
    setCurrentUser(null);
    setSuccessMessage('Sessão encerrada.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Cloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Autenticação Supabase</h3>
              <p className="text-xs text-slate-400">Sessões e vinculação de dados por usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {currentUser ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">Usuário Conectado</h4>
              <p className="text-xs text-amber-400 font-mono mt-1">{currentUser.email}</p>
            </div>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Seus dados sincronizados no Supabase agora estão vinculados ao seu ID de usuário autenticado.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs border border-red-500/40 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Supabase não configurado. Adicione SUPABASE_URL e SUPABASE_ANON_KEY aos segredos.</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">E-mail</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@banda.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Senha</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar na Conta'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
