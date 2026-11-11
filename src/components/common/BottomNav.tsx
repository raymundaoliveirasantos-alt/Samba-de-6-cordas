import React from 'react';
import { Music, ListMusic, Sliders, Users, Disc, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'library', label: 'Biblioteca', icon: Music },
    { id: 'setlists', label: 'Repertórios', icon: ListMusic },
    { id: 'tools', label: 'Ferramentas', icon: Sliders },
    { id: 'virtual_band', label: 'Banda', icon: Disc },
    { id: 'team', label: 'Equipe', icon: Users },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around py-1.5 px-2 safe-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 rounded-xl transition ${
              isActive
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
