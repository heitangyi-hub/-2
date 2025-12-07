
import React, { useState, useEffect } from 'react';
import { DEATH_TAUNTS } from '../../services/gameLogic';
import { Skull, Repeat, Sword, AlertTriangle } from 'lucide-react';

interface DeathModalProps {
  maxStage: number;
  currentStage: number;
  onRevive: (stage: number, loop: boolean) => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ maxStage, currentStage, onRevive }) => {
  const [taunt, setTaunt] = useState('');
  const [selectedLoopStage, setSelectedLoopStage] = useState(Math.max(1, maxStage - 1));

  useEffect(() => {
    // Randomize taunt on mount
    setTaunt(DEATH_TAUNTS[Math.floor(Math.random() * DEATH_TAUNTS.length)]);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-pop-in select-none">
      <div className="w-full max-w-md border-4 border-red-900 bg-[#0f0505] shadow-[0_0_50px_rgba(220,38,38,0.3)] relative overflow-hidden flex flex-col items-center p-6 gap-6">
        
        {/* Background Glitch Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }}>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-2 animate-shake">
            <Skull size={64} className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
            <h1 className="text-4xl md:text-5xl font-black text-red-600 tracking-widest uppercase drop-shadow-[4px_4px_0_#000]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                YOU DIED
            </h1>
        </div>

        {/* Taunt Text */}
        <div className="text-center px-4 py-2 border-y border-red-900/50 w-full">
            <p className="text-gray-400 italic text-sm md:text-base leading-relaxed">
                "{taunt}"
            </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4 z-10">
            
            {/* Main Action: Continue Pushing */}
            <button 
                onClick={() => onRevive(maxStage, true)}
                className="w-full group relative overflow-hidden bg-red-900 hover:bg-red-800 border-2 border-red-600 p-4 transition-all active:translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <div className="flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base uppercase tracking-wider">
                    <Sword size={20} />
                    <span>挑战最高关卡 (Lv.{maxStage})</span>
                </div>
                <div className="text-[10px] text-red-300 mt-1">复活并尝试突破极限</div>
            </button>

            {/* Secondary Action: Loop/Grind */}
            <div className="bg-[#1a0a0a] border border-red-900/30 p-4 rounded-sm">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-3 uppercase tracking-wider border-b border-red-900/30 pb-2">
                    <Repeat size={14} /> 循环历练 (挂机模式)
                </div>
                
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 mb-1">选择关卡</label>
                        <select 
                            value={selectedLoopStage}
                            onChange={(e) => setSelectedLoopStage(Number(e.target.value))}
                            className="w-full bg-[#0a0a0a] border border-red-900/50 text-white text-sm p-2 outline-none focus:border-red-500"
                        >
                            {Array.from({ length: maxStage }).map((_, i) => {
                                const stage = maxStage - i; // Reverse order, max first
                                return (
                                    <option key={stage} value={stage}>
                                        关卡 {stage} {stage === maxStage ? '(当前最高)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button 
                        onClick={() => onRevive(selectedLoopStage, false)}
                        className="flex-1 bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 text-gray-300 flex flex-col items-center justify-center p-2 transition-colors active:translate-y-0.5"
                    >
                        <span className="font-bold text-xs">开始挂机</span>
                        <span className="text-[9px] text-gray-500">不自动进阶</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="text-[10px] text-red-900/50 uppercase tracking-widest mt-2 animate-pulse">
            PRESS START TO CONTINUE...
        </div>
      </div>
    </div>
  );
};
