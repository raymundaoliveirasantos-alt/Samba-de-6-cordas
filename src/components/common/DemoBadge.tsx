import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  tooltip?: string;
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'Demo local',
  tooltip = 'Os dados estão salvos no seu navegador (IndexedDB) e sincronizam em tempo real entre abas via BroadcastChannel. Em produção com backend na nuvem, múltiplos aparelhos sincronizam automaticamente.',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
        aria-label="Informações sobre o modo demonstração local"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {label}
        <Info className="w-3 h-3 text-amber-400" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg shadow-xl z-50 text-center leading-relaxed">
          <div className="font-semibold text-amber-300 mb-1">Modo Demonstração Local</div>
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
