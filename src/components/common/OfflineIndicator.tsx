import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useAppStore } from '../../store';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, setIsOnline } = useAppStore();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  if (isOnline && !showToast) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl animate-bounce">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>Modo Offline — Seu acervo e ferramentas continuam 100% disponíveis via IndexedDB.</span>
    </div>
  );
};
